import React, { useCallback, useRef, useTransition, useState } from 'react';
import { useStore } from '../useStore';
import * as THREE from 'three';

export const Uploader: React.FC = () => {
  const { chapters, addChapter, loadProject, setEngineError } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadError, setLocalError] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const mainFile = fileList.find(f => f.name.toLowerCase().endsWith('.glb') || f.name.toLowerCase().endsWith('.gltf'));

    if (!mainFile) {
      setLocalError("No valid 3D model file (.glb or .gltf) detected.");
      return;
    }

    // Three.js LoadingManager for multi-file support
    const manager = new THREE.LoadingManager();
    const objectURLs: string[] = [];
    
    // Map of filenames to Blob URLs
    const fileMap = new Map<string, string>();
    fileList.forEach(file => {
      const url = URL.createObjectURL(file);
      objectURLs.push(url);
      fileMap.set(file.name, url);
    });

    manager.setURLModifier((url) => {
      const fileName = url.split('/').pop() || '';
      const blobUrl = fileMap.get(fileName);
      if (blobUrl) return blobUrl;
      return url;
    });

    const extension = mainFile.name.split('.').pop()?.toLowerCase() || 'glb';
    const mainUrl = fileMap.get(mainFile.name) + `#.${extension}`;
    
    startTransition(() => {
      setLocalError(null);
      setEngineError(null);
      addChapter(mainUrl, mainFile.name.split('.')[0].toUpperCase());
    });

    if (inputRef.current) inputRef.current.value = '';
  }, [addChapter, setEngineError]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files);

  const onProjectImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target?.result as string);
          if (projectData.manifest && projectData.chapters) {
            startTransition(() => {
              setLocalError(null);
              setEngineError(null);
              loadProject(projectData);
            });
          } else {
            setLocalError("Invalid Project Schema: Missing manifest or chapters.");
          }
        } catch (err) {
          console.error("Parse Error:", err);
          setLocalError("Could not parse Project JSON. Ensure you are uploading a valid export.");
        }
      };
      reader.readAsText(file);
      if (projectInputRef.current) projectInputRef.current.value = '';
    }
  }, [loadProject, setEngineError]);

  const trySample = () => {
    startTransition(() => {
      setLocalError(null);
      setEngineError(null);
      // Using a guaranteed working sample from Khronos Group
      const sampleUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';
      addChapter(sampleUrl, 'DAMAGED_HELMET_SAMPLE');
    });
  };

  if (chapters.length > 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] backdrop-blur-3xl pointer-events-auto">
      <div className="max-w-md w-full p-12 glass-panel rounded-[3rem] text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative mx-auto w-24 h-24 group">
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors"></div>
          <div className="relative w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl transition-transform group-hover:scale-110 duration-500">
            <i className="fa-solid fa-cube text-4xl text-black"></i>
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight text-white italic uppercase text-balance leading-none">Initialize<br/>Engine</h2>
          <p className="text-white/40 text-[10px] leading-relaxed px-4 font-mono uppercase tracking-[0.2em]">
            Connect a high-fidelity model or restore a saved sequence.
          </p>
        </div>

        {uploadError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] text-red-400 font-bold uppercase tracking-wider animate-pulse">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            {uploadError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <label 
            htmlFor="file-upload"
            className={`group flex flex-col items-center justify-center w-full py-10 px-6 bg-white hover:bg-emerald-400 text-black rounded-[2rem] cursor-pointer transition-all duration-500 shadow-xl ${isPending ? 'opacity-50 cursor-wait' : ''}`}
          >
            <i className={`fa-solid ${isPending ? 'fa-dna animate-spin' : 'fa-bolt-lightning'} text-2xl mb-3`}></i>
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
              {isPending ? 'Linking Sectors...' : 'Connect Model'}
            </span>
            <span className="text-[8px] opacity-40 uppercase font-bold tracking-widest mt-2">Supports .glb / .gltf</span>
            <input
              ref={inputRef}
              id="file-upload"
              type="file"
              accept=".glb,.gltf,.bin,image/*"
              multiple
              onChange={onFileChange}
              className="hidden"
              disabled={isPending}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => projectInputRef.current?.click()}
              className="py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-file-import text-xs"></i>
              Restore
              <input 
                ref={projectInputRef}
                type="file" 
                accept=".json" 
                onChange={onProjectImport} 
                className="hidden" 
              />
            </button>

            <button 
              onClick={trySample}
              className="py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-vial text-xs"></i>
              Try Sample
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-[9px] text-white/20 font-mono uppercase tracking-[0.3em]">
           <div className="flex items-center gap-2">
             <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
             Direct VRAM Pipe Ready
           </div>
           <p className="opacity-40 italic">Note: Use .GLB for best results with external assets.</p>
        </div>
      </div>
    </div>
  );
};
import React, { useCallback, useRef, useTransition } from 'react';
import { useStore } from '../useStore';

export const Uploader: React.FC = () => {
  const { chapters, addChapter, loadProject } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // FIX: Add extension hint to blob URL for Three.js loader identification.
      // This prevents the "Unexpected token P" error which occurs when a binary GLB is parsed as JSON.
      const extension = file.name.split('.').pop()?.toLowerCase() || 'glb';
      const url = URL.createObjectURL(file) + `#.${extension}`;
      
      startTransition(() => {
        addChapter(url, file.name.split('.')[0].toUpperCase());
      });
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [addChapter]);

  const onProjectImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const project = JSON.parse(event.target?.result as string);
          if (project.manifest && project.chapters) {
            startTransition(() => {
              loadProject(project);
            });
          } else {
            alert("Invalid Project Schema: Missing manifest or chapters.");
          }
        } catch (err) {
          alert("Could not parse Project JSON. Ensure you are uploading a valid export.");
        }
      };
      reader.readAsText(file);
      if (projectInputRef.current) projectInputRef.current.value = '';
    }
  }, [loadProject]);

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

        <div className="flex flex-col gap-4">
          <label 
            htmlFor="file-upload"
            className={`group flex flex-col items-center justify-center w-full py-10 px-6 bg-white hover:bg-emerald-400 text-black rounded-[2rem] cursor-pointer transition-all duration-500 shadow-xl ${isPending ? 'opacity-50 cursor-wait' : ''}`}
          >
            <i className={`fa-solid ${isPending ? 'fa-dna animate-spin' : 'fa-bolt-lightning'} text-2xl mb-3`}></i>
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">
              {isPending ? 'Linking Sectors...' : 'Connect Model'}
            </span>
            <input
              ref={inputRef}
              id="file-upload"
              type="file"
              accept=".glb,.gltf"
              onChange={onFileChange}
              className="hidden"
              disabled={isPending}
            />
          </label>

          <button 
            onClick={() => projectInputRef.current?.click()}
            className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-file-import text-xs"></i>
            Restore Project JSON
            <input 
              ref={projectInputRef}
              type="file" 
              accept=".json" 
              onChange={onProjectImport} 
              className="hidden" 
            />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 text-[9px] text-white/20 font-mono uppercase tracking-[0.3em]">
           <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
           Direct VRAM Pipe Ready
        </div>
      </div>
    </div>
  );
};
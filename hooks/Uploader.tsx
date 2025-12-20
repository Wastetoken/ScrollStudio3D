import React, { useCallback, useRef, useTransition } from 'react';
import { useStore } from '../useStore';

export const Uploader: React.FC = () => {
  const { setModelUrl, modelUrl } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      // We wrap this in a transition because the Scene component will suspend 
      // when useGLTF starts loading this new URL.
      startTransition(() => {
        setModelUrl(url);
      });
      // Important: clear the input value so the same file can be chosen again after a reset
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [setModelUrl]);

  if (modelUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl pointer-events-auto">
      <div className="max-w-md w-full p-10 glass-panel rounded-[2rem] text-center space-y-8 shadow-2xl border border-white/10">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-white to-gray-400 rounded-3xl flex items-center justify-center border border-white/20 shadow-xl">
            <i className="fa-solid fa-cube text-4xl text-black"></i>
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight text-white italic">SCROLLSTUDIO 3D</h2>
          <p className="text-gray-400 text-sm leading-relaxed px-4">
            Import your <b>.glb</b> or <b>.gltf</b> model to start building your scroll-driven cinematic experience.
          </p>
        </div>

        <div className="relative">
          <label 
            htmlFor="file-upload"
            className={`group flex flex-col items-center justify-center w-full py-8 px-6 bg-white hover:bg-gray-200 text-black rounded-2xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-white/10 active:scale-[0.98] ${isPending ? 'opacity-50 cursor-wait' : ''}`}
          >
            <i className={`fa-solid ${isPending ? 'fa-spinner animate-spin' : 'fa-cloud-arrow-up'} text-2xl mb-2 transition-transform`}></i>
            <span className="text-sm font-bold uppercase tracking-widest">
              {isPending ? 'Loading Scene...' : 'Select Model File'}
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
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">
             <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
             Local processing only
          </div>
        </div>
      </div>
    </div>
  );
};
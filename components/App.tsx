import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { Scene } from './Studio/Scene';
import { Sidebar } from './Studio/Sidebar';
import { Timeline } from './Studio/Timeline';
import { Uploader } from './Studio/Uploader';
import { KeyframeCapturer } from './Studio/KeyframeCapturer';

const App: React.FC = () => {
  const { mode, modelUrl } = useStore();

  // Sync mode to HTML class for global styling adjustments
  useEffect(() => {
    if (mode === 'preview') {
      document.documentElement.classList.add('preview-mode');
    } else {
      document.documentElement.classList.remove('preview-mode');
    }
  }, [mode]);

  return (
    <div className={`w-full h-screen relative bg-[#050505] overflow-hidden ${mode === 'preview' ? 'h-[500vh] overflow-y-auto' : ''}`}>
      
      {/* 3D Engine Runtime (Bottom Layer) */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene />
            <KeyframeCapturer />
          </Suspense>
        </Canvas>
      </div>

      {/* Initialize / Upload Layer (Top Layer if no model) */}
      {!modelUrl && <Uploader />}

      {/* Editor Interface (Middle Layer) */}
      {mode === 'edit' && modelUrl && (
        <div className="relative z-20 w-full h-full pointer-events-none">
          {/* Controls need auto to be interactive */}
          <div className="pointer-events-auto">
            <Sidebar />
            <Timeline />
          </div>
          
          {/* Visual Accents */}
          <div className="fixed top-8 right-8 z-40 flex items-center gap-4 pointer-events-auto">
             <div className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-3 border-white/5 shadow-2xl">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-200 italic">Studio Ready</span>
             </div>
          </div>
        </div>
      )}

      {/* Preview Scrolling Content (Dynamic Layer) */}
      {mode === 'preview' && (
        <div className="relative z-30 w-full pointer-events-none">
          <div className="h-screen flex items-center justify-center">
            <div className="max-w-xl text-center p-12 bg-black/40 backdrop-blur-md rounded-[3rem] border border-white/10 opacity-0 animate-fade-in shadow-2xl">
               <h1 className="text-6xl font-black mb-6 italic tracking-tighter">CRAFTED RIG</h1>
               <p className="text-lg text-gray-400 font-medium">Precision in every scroll. Experience the geometry.</p>
            </div>
          </div>
          <div className="h-[200vh]"></div>
          <div className="h-screen flex items-end justify-start p-20">
             <div className="max-w-md p-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl">
               <h2 className="text-3xl font-black mb-4 text-white uppercase italic">Form & Function</h2>
               <p className="text-white/60 leading-relaxed">The architecture of this asset reveals itself through choreographed motion. Every angle is a story.</p>
             </div>
          </div>
          <div className="h-screen"></div>
          <div className="h-screen flex items-center justify-center">
             <div className="max-w-2xl text-center">
               <h3 className="text-[10vw] font-black text-white/5 uppercase italic tracking-tighter leading-none">Perspective</h3>
             </div>
          </div>
          
          {/* Close Preview UI */}
          <div className="fixed top-8 left-8 z-50 pointer-events-auto">
             <button 
              onClick={() => useStore.getState().setMode('edit')}
              className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 active:scale-95"
             >
               <i className="fa-solid fa-arrow-left"></i> Exit View
             </button>
          </div>
        </div>
      )}
      
      {/* Global CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default App;
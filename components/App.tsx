import React, { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../useStore';
import { Scene } from './Studio/Scene';
import { Sidebar } from './Studio/Sidebar';
import { Timeline } from './Studio/Timeline';
import { Handbook } from './Studio/Handbook';
import { Uploader } from '../hooks/Uploader';
import { KeyframeCapturer } from './Studio/KeyframeCapturer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const { mode, modelUrl, currentProgress, sections, setMode } = useStore();

  useEffect(() => {
    // Sync class for styling & height
    if (mode === 'preview') {
      document.documentElement.className = 'preview-mode';
      document.body.className = 'preview-mode';
      // Force ScrollTrigger to recognize the new height
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      document.documentElement.className = 'edit-mode';
      document.body.className = 'edit-mode';
      window.scrollTo(0, 0); 
    }
  }, [mode]);

  // Determine which sections are active based on scroll progress
  const activeSections = useMemo(() => {
    return sections.filter((s, i) => {
      const nextSection = sections[i + 1];
      const end = nextSection ? nextSection.progress : 1.1;
      return currentProgress >= s.progress && currentProgress < end;
    });
  }, [sections, currentProgress]);

  return (
    <div className={`w-full relative bg-[#050505] ${mode === 'preview' ? 'min-h-[1000vh]' : 'h-screen overflow-hidden'}`}>
      
      {/* 3D Render Layer */}
      <div className={`fixed inset-0 z-0 ${mode === 'edit' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <Canvas 
          shadows 
          dpr={[1, 2]} 
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance" 
          }}
          camera={{ fov: 35, position: [5, 5, 5] }}
        >
          <Suspense fallback={null}>
            <Scene />
            <KeyframeCapturer />
          </Suspense>
        </Canvas>
      </div>

      {/* Invisible Scroll Spacer */}
      {mode === 'preview' && (
        <div className="absolute top-0 left-0 w-full h-[1000vh] pointer-events-none z-[-1]" />
      )}

      {/* Model Onboarding */}
      {!modelUrl && <Uploader />}

      {/* Handbook / Tutorial Overlay */}
      <Handbook />

      {/* Editor UI */}
      {mode === 'edit' && modelUrl && (
        <div className="relative z-20 w-full h-full pointer-events-none select-none">
          <div className="pointer-events-auto">
            <Sidebar />
            <Timeline />
          </div>
          <div className="fixed top-8 right-8 z-40 pointer-events-auto">
             <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 border-white/10">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">Studio Active</span>
             </div>
          </div>
        </div>
      )}

      {/* Preview HUD & Content */}
      {mode === 'preview' && (
        <div className="relative z-30 w-full">
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
            {sections.map((section) => {
              const isFirst = sections[0]?.id === section.id;
              const isActive = activeSections.some(as => as.id === section.id);
              
              return (
                <div 
                  key={section.id}
                  className={`absolute inset-0 flex flex-col items-center justify-center p-10 transition-all duration-1000 transform ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                  }`}
                >
                   <div className="max-w-3xl text-center space-y-6">
                      {isFirst ? (
                        <div className="animate-in fade-in zoom-in-95 duration-1000">
                          <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-6">
                            Scroll to begin
                          </div>
                          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none text-white uppercase drop-shadow-2xl">
                            {section.title}
                          </h1>
                          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed mt-6">
                            {section.description}
                          </p>
                        </div>
                      ) : (
                        <div className="glass-panel p-12 rounded-[3rem] backdrop-blur-md border border-white/5 text-left max-w-xl mx-auto shadow-2xl">
                           <h2 className="text-5xl font-black italic tracking-tight text-white uppercase mb-6 leading-tight">
                             {section.title}
                           </h2>
                           <p className="text-gray-300 text-lg font-medium leading-relaxed">
                             {section.description}
                           </p>
                           <div className="h-1 w-24 bg-white mt-10 shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
                        </div>
                      )}
                   </div>
                </div>
              );
            })}
          </div>

          <div className="fixed top-8 left-8 z-50 pointer-events-auto">
             <button 
              onClick={() => setMode('edit')}
              className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-4 active:scale-95 group"
             >
               <i className="fa-solid fa-chevron-left group-hover:-translate-x-1 transition-transform"></i> Exit Viewer
             </button>
          </div>

          <div className="fixed bottom-10 left-10 right-10 z-50 pointer-events-none flex justify-between items-end">
             <div className="space-y-1">
               <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Story Progress</div>
               <div className="text-2xl font-black italic text-white/90">{(currentProgress * 100).toFixed(0)}%</div>
             </div>
             <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden pointer-events-auto">
                <div 
                  className="h-full bg-white transition-all duration-300 shadow-[0_0_10px_white]" 
                  style={{ width: `${(currentProgress * 100)}%` }}
                ></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
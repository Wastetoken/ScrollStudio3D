
import React, { useEffect, useMemo, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../useStore';
import { Scene } from './Studio/Scene';
import { Sidebar } from './Studio/Sidebar';
import { Timeline } from './Studio/Timeline';
import { Handbook } from './Studio/Handbook';
import { Uploader } from '../hooks/Uploader';
import { KeyframeCapturer } from './Studio/KeyframeCapturer';
import { ExportOverlay } from './Studio/ExportOverlay';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StorySection } from '../types';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const { mode, currentProgress, chapters, activeChapterId, setMode, isPlacingHotspot, setActiveChapter, setTransitionState, setSelectedMesh } = useStore();
  const transitionTimeline = useRef<gsap.core.Timeline | null>(null);

  const currentChapter = useMemo(() => {
    if (mode === 'edit') return chapters.find(c => c.id === activeChapterId);
    const found = chapters.find(c => currentProgress >= c.startProgress && currentProgress <= c.endProgress);
    return found || chapters[0];
  }, [mode, chapters, activeChapterId, currentProgress]);

  useEffect(() => {
    if (mode === 'preview' && currentChapter && currentChapter.id !== activeChapterId) {
      if (transitionTimeline.current) transitionTimeline.current.kill();
      const config = currentChapter.transition;
      const duration = (config?.duration || 1200) / 1000;
      
      transitionTimeline.current = gsap.timeline({
        onStart: () => setTransitionState(true, 0),
        onComplete: () => { setTransitionState(false, 0); transitionTimeline.current = null; }
      });
      
      transitionTimeline.current.to({}, { 
        duration: duration / 2, 
        onUpdate: function() { setTransitionState(true, this.progress()); }, 
        onComplete: () => setActiveChapter(currentChapter.id) 
      });
      
      transitionTimeline.current.to({}, { 
        duration: duration / 2, 
        onUpdate: function() { setTransitionState(true, 1 - this.progress()); } 
      });
    }
  }, [currentChapter, mode, activeChapterId, setActiveChapter, setTransitionState]);

  useEffect(() => {
    const baseClass = mode === 'preview' ? 'preview-mode' : 'edit-mode';
    document.documentElement.className = baseClass;
    document.body.className = `${baseClass} ${isPlacingHotspot ? 'placing-hotspot' : ''}`.trim();
  }, [mode, isPlacingHotspot]);

  const activeNarrativeBeats = useMemo(() => {
    if (!currentChapter) return [];
    const beats = currentChapter.narrativeBeats;
    return beats.filter((s, i) => {
      const nextBeat = beats[i + 1];
      const end = nextBeat ? nextBeat.progress : 1.1;
      return currentProgress >= s.progress && currentProgress < end;
    });
  }, [currentChapter, currentProgress]);

  const renderSection = (section: StorySection) => {
    const isActive = activeNarrativeBeats.some(as => as.id === section.id);
    const { style } = section;
    
    const fontClass = {
      display: 'font-black italic uppercase tracking-tighter',
      serif: 'font-serif font-bold italic',
      sans: 'font-sans font-bold',
      mono: 'font-mono'
    }[style.fontVariant];

    const alignmentClass = {
      left: 'text-left items-start',
      center: 'text-center items-center',
      right: 'text-right items-end'
    }[style.textAlign];

    const layoutClass = {
      split: 'w-1/2',
      full: 'w-full max-w-7xl',
      floating: 'max-w-xl'
    }[style.layout || 'full'];

    return (
      <div 
        key={section.id} 
        className={`absolute inset-0 flex flex-col justify-center transform transition-all duration-[1200ms] ${alignmentClass} ${isActive ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-12 scale-95 blur-xl pointer-events-none'}`}
      >
        <div className={`px-12 ${layoutClass}`}>
          <div 
            className={`p-16 rounded-[4rem] transition-all duration-700 ${style.theme === 'glass' ? 'bg-black/40 backdrop-blur-3xl border border-white/10 shadow-2xl' : 'bg-transparent'}`}
            style={{ 
              borderColor: style.accentColor + '22',
              backdropFilter: `blur(${style.backdropBlur}px)`
            }}
          >
            <h2 
              className={`text-7xl md:text-9xl mb-8 leading-[0.85] ${fontClass}`}
              style={{ 
                color: style.titleColor,
                textShadow: style.textGlow ? `0 0 40px ${style.titleColor}88` : 'none'
              }}
            >
              {section.title}
            </h2>
            <p 
              className={`text-xl md:text-2xl font-medium leading-relaxed max-w-2xl ${style.textAlign === 'center' ? 'mx-auto' : ''}`}
              style={{ color: style.descriptionColor }}
            >
              {section.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full relative bg-[#050505] ${mode === 'preview' ? 'min-h-[1000vh]' : 'h-screen overflow-hidden'}`}>
      <div className={`fixed inset-0 z-0`}>
        <Canvas 
          shadows 
          dpr={[1, 2]} 
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => setSelectedMesh(null)}
        >
          <Suspense fallback={null}>
            <Scene />
            <KeyframeCapturer />
          </Suspense>
        </Canvas>
      </div>

      {chapters.length === 0 && <Uploader />}
      <Handbook />
      <ExportOverlay />
      
      {mode === 'edit' && chapters.length > 0 && (
        <div className="relative z-[100] w-full h-full pointer-events-none">
          <div className="pointer-events-auto">
            <Sidebar />
            <Timeline />
          </div>
        </div>
      )}

      {mode === 'preview' && (
        <div className="relative z-[100] w-full">
          <div className="fixed inset-0 pointer-events-none">
            {currentChapter?.narrativeBeats.map(renderSection)}
          </div>
          <div className="fixed top-8 left-8 z-[200] pointer-events-auto">
             <button onClick={() => setMode('edit')} className="bg-black/60 backdrop-blur-3xl border border-white/10 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95">
               <i className="fa-solid fa-arrow-left mr-2"></i> Studio
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

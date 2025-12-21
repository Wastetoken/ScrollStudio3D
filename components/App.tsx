
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
      mono: 'font-mono uppercase tracking-[0.2em]',
      brutalist: 'font-black uppercase tracking-[-0.05em] leading-none'
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

    const animationClasses = {
      'fade-up': isActive ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-12 scale-95 blur-xl',
      'reveal': isActive ? 'opacity-100 [clip-path:inset(0_0_0_0)]' : 'opacity-0 [clip-path:inset(100%_0_0_0)]',
      'zoom': isActive ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-150 blur-2xl',
      'slide-left': isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
    }[style.entryAnimation || 'fade-up'];

    const themeStyles = {
      glass: {
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: `blur(${style.backdropBlur || 30}px)`,
        border: `${style.borderWeight || 1}px solid rgba(255, 255, 255, 0.1)`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      },
      solid: {
        background: style.accentColor || '#111111',
        border: `${style.borderWeight || 0}px solid transparent`,
      },
      outline: {
        background: 'transparent',
        border: `${style.borderWeight || 2}px solid ${style.accentColor || '#ffffff'}`,
      },
      none: {
        background: 'transparent',
        border: 'none',
        backdropFilter: 'none',
        boxShadow: 'none'
      }
    }[style.theme || 'glass'];

    return (
      <div 
        key={section.id} 
        className={`absolute inset-0 flex flex-col justify-center transition-all duration-[1200ms] ease-out ${alignmentClass} ${animationClasses} ${isActive ? '' : 'pointer-events-none'}`}
      >
        <div className={`px-12 ${layoutClass}`}>
          <div 
            className="transition-all duration-700 overflow-hidden"
            style={{ 
              ...themeStyles,
              borderRadius: `${style.borderRadius || 30}px`,
              padding: `${style.padding || 40}px`,
            }}
          >
            <h2 
              className={`text-6xl md:text-8xl mb-6 leading-[0.9] ${fontClass}`}
              style={{ 
                color: style.titleColor,
                textShadow: style.textGlow ? `0 0 30px ${style.titleColor}44` : 'none',
                letterSpacing: style.letterSpacing === 'tight' ? '-0.05em' : style.letterSpacing === 'wide' ? '0.1em' : style.letterSpacing === 'ultra' ? '0.3em' : 'normal'
              }}
            >
              {section.title}
            </h2>
            <p 
              className={`text-lg md:text-xl font-medium leading-relaxed max-w-2xl ${style.textAlign === 'center' ? 'mx-auto' : ''}`}
              style={{ 
                color: style.descriptionColor,
                fontWeight: style.fontWeight === 'thin' ? 200 : style.fontWeight === 'bold' ? 700 : style.fontWeight === 'black' ? 900 : 400
              }}
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

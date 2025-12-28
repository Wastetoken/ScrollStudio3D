import React, { useEffect, useMemo, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../useStore';
import { Scene } from './Studio/Scene';
import { ImprovedSidebar } from './Studio/ImprovedSidebar';
import { ImprovedTimeline } from './Studio/ImprovedTimeline';
import { Handbook } from './Studio/Handbook';
import { Uploader } from '../hooks/Uploader';
import { KeyframeCapturer } from './Studio/KeyframeCapturer';
import { ExportOverlay } from './Studio/ExportOverlay';
import { LandingPage } from './Landing/LandingPage';

import { useFontLoader } from '../hooks/useFontLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StorySection } from '../types';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const { mode, currentProgress, chapters, activeChapterId, setMode, isPlacingHotspot, setActiveChapter, setTransitionState, setSelectedMesh, typography, cinematicBars, landingMode } = useStore();
  const transitionTimeline = useRef<gsap.core.Timeline | null>(null);

  useFontLoader(typography.fonts);

  const currentChapter = useMemo(() => {
    if (!chapters || chapters.length === 0) return null;
    if (mode === 'edit') return chapters.find(c => c.id === activeChapterId) || chapters[0];
    return chapters.find(c => currentProgress >= c.startProgress && currentProgress <= c.endProgress) || chapters[0];
  }, [mode, chapters, activeChapterId, currentProgress]);

  useEffect(() => {
    const baseClass = mode === 'preview' ? 'preview-mode' : 'edit-mode';
    document.documentElement.className = baseClass;
    document.body.className = `${baseClass} ${isPlacingHotspot ? 'placing-hotspot' : ''}`.trim();
  }, [mode, isPlacingHotspot]);

  const glConfig = useMemo(() => ({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' as const,
  }), []);

  const renderSection = (section: StorySection) => {
    if (!currentChapter) return null;
    
    const beats = currentChapter.narrativeBeats;
    const idx = beats.findIndex(b => b.id === section.id);
    if (idx === -1) return null;

    const nextBeat = beats[idx + 1];
    const end = nextBeat ? nextBeat.progress : 1.1;
    const isActive = currentProgress >= section.progress && currentProgress < end;
    
    const { style } = section;
    const fontClass = {
      display: 'font-black italic uppercase tracking-tighter',
      serif: 'font-serif font-bold italic',
      sans: 'font-sans font-bold',
      mono: 'font-mono uppercase tracking-[0.2em]',
      brutalist: 'font-black uppercase tracking-[-0.05em] leading-none'
    }[style.fontVariant];

    const animationClasses = {
      'fade-up': isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95',
      'reveal': isActive ? 'opacity-100' : 'opacity-0',
      'zoom': isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-150',
      'slide-left': isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
    }[style.entryAnimation || 'fade-up'];

    return (
      <div 
        key={section.id} 
        className={`fixed inset-0 flex flex-col justify-center transition-all duration-1000 pointer-events-none ${animationClasses}`}
        style={{ zIndex: 50 + idx }}
      >
        <div className={`px-12 w-full max-w-7xl mx-auto flex flex-col ${style.textAlign === 'center' ? 'items-center text-center' : (style.textAlign === 'right' ? 'items-end text-right' : 'items-start text-left')}`}>
          <div 
            className="p-10 rounded-[2.5rem]"
            style={{ 
              background: style.theme === 'glass' ? 'rgba(0,0,0,0.5)' : (style.theme === 'solid' ? style.accentColor : 'transparent'),
              backdropFilter: style.theme === 'glass' ? `blur(${style.backdropBlur}px)` : 'none',
              border: style.theme === 'outline' ? `${style.borderWeight}px solid ${style.accentColor}` : 'none',
            }}
          >
            <h2 className={`text-6xl md:text-8xl mb-6 ${fontClass}`} style={{ color: style.titleColor }}>{section.title}</h2>
            <p className="text-xl max-w-2xl" style={{ color: style.descriptionColor }}>{section.description}</p>
          </div>
        </div>
      </div>
    );
  };

  // Show landing page if in landing mode
  if (landingMode) {
    return <LandingPage />;
  }

  return (
    <div className={`w-full relative bg-[#050505] ${mode === 'preview' ? 'min-h-[1000vh]' : 'h-screen overflow-hidden'}`}>
      <div className="fixed inset-0 z-0">
        <Canvas 
          shadows 
          dpr={[1, 2]} 
          gl={glConfig}
          onPointerMissed={() => setSelectedMesh(null)}
        >
          <Suspense fallback={null}>
            <Scene />
            <KeyframeCapturer />
          </Suspense>
        </Canvas>
      </div>

      {(!chapters || chapters.length === 0) && <Uploader />}
      <Handbook />
      <ExportOverlay />
      
      {mode === 'edit' && chapters && chapters.length > 0 && (
        <>
          <ImprovedSidebar />
          <ImprovedTimeline />
        </>
      )}

      {mode === 'preview' && (
        <div className="relative z-[150] w-full">
          <div className="fixed inset-0 pointer-events-none">
            {currentChapter?.narrativeBeats?.map(renderSection)}
          </div>
          <div className="fixed top-12 left-12 z-[200] pointer-events-auto">
             <button onClick={() => setMode('edit')} className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 transition-colors">
               <i className="fa-solid fa-arrow-left mr-3"></i> Studio Mode
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
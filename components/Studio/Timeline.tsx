import React, { useRef, useTransition, useMemo } from 'react';
import { useStore } from '../../useStore';

export const Timeline: React.FC = () => {
  const { currentProgress, setCurrentProgress, chapters, activeChapterId, mode } = useStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const activeChapter = useMemo(() => 
    chapters.find(c => c.id === activeChapterId), 
    [chapters, activeChapterId]
  );

  if (!activeChapter || !activeChapter.modelUrl) return null;

  const keyframes = activeChapter.cameraPath;

  const handleSeek = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    
    startTransition(() => {
      setCurrentProgress(progress);
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 z-[110] px-6 pb-8 pointer-events-none flex items-end">
      <div className="w-full max-w-7xl mx-auto flex items-center gap-6">
        
        {/* Main Scrubbing Console */}
        <div className="flex-1 glass-panel rounded-full px-10 py-5 pointer-events-auto relative border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] group">
          <div 
            ref={timelineRef}
            onClick={handleSeek}
            className={`h-2.5 w-full bg-white/5 rounded-full cursor-crosshair relative overflow-visible ${isPending ? 'opacity-70' : ''}`}
          >
            {/* Progress Visual */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-150"
              style={{ width: `${currentProgress * 100}%` }}
            />
            
            {/* Draggable Playhead */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-[0_0_40px_rgba(0,0,0,1)] border-[4px] border-emerald-500 cursor-grab active:cursor-grabbing transition-all hover:scale-125 hover:border-white active:scale-95"
              style={{ left: `${currentProgress * 100}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-500 text-black text-[9px] font-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                {(currentProgress * 100).toFixed(1)}%
              </div>
            </div>

            {/* Keyframe Markers */}
            {keyframes.map((kf) => (
              <div 
                key={kf.id}
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white/40 border border-white/20 pointer-events-none rounded-sm transition-all group-hover:bg-white"
                style={{ left: `${kf.progress * 100}%` }}
              />
            ))}
          </div>

          <div className="absolute -bottom-8 left-10 right-10 flex justify-between items-center text-[8px] text-white/20 font-black uppercase tracking-[0.4em]">
             <span>Start Vector</span>
             <div className="flex gap-4">
               {chapters.map((c, i) => (
                 <div key={c.id} className={`w-2 h-1 rounded-full ${c.id === activeChapterId ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
               ))}
             </div>
             <span>Terminal Point</span>
          </div>
        </div>

        {/* Action Controls */}
        {mode === 'edit' && (
          <div className="pointer-events-auto flex gap-4">
             <CaptureButton />
          </div>
        )}
      </div>
    </div>
  );
};

const CaptureButton: React.FC = () => {
  const { currentProgress } = useStore();
  
  const onCapture = () => {
    const event = new CustomEvent('capture-keyframe', { detail: { progress: currentProgress } });
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={onCapture}
      className="h-20 w-20 rounded-3xl bg-white text-black shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-90 group relative ring-4 ring-emerald-500/0 hover:ring-emerald-500/20"
    >
      <i className="fa-solid fa-camera text-xl mb-1"></i>
      <span className="text-[7px] font-black uppercase tracking-tighter">Capture</span>
      
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black border border-white/10 text-[9px] font-black uppercase tracking-widest text-white px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none shadow-2xl">
        Record Node
      </div>
    </button>
  );
};
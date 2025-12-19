import React, { useRef } from 'react';
import { useStore } from '../../useStore';

export const Timeline: React.FC = () => {
  const { currentProgress, setCurrentProgress, keyframes, mode, modelUrl } = useStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  if (!modelUrl) return null;

  const handleSeek = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    setCurrentProgress(progress);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 z-40 px-6 pb-6 pointer-events-none">
      <div className="max-w-6xl mx-auto h-full flex items-center gap-6">
        {/* Scrubber Area */}
        <div className="flex-1 glass-panel rounded-2xl p-4 pointer-events-auto relative group">
          <div 
            ref={timelineRef}
            onClick={handleSeek}
            className="h-2 w-full bg-gray-800 rounded-full cursor-pointer relative overflow-visible"
          >
            {/* Progress Fill */}
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-75"
              style={{ width: `${currentProgress * 100}%` }}
            />
            
            {/* Scrubber Head */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl border-2 border-gray-400 cursor-grab active:cursor-grabbing transition-all"
              style={{ left: `${currentProgress * 100}%`, transform: 'translate(-50%, -50%)' }}
            />

            {/* Keyframe Markers */}
            {keyframes.map((kf) => (
              <div 
                key={kf.id}
                className="absolute top-0 w-1 h-2 bg-white/60 pointer-events-none rounded-full"
                style={{ left: `${kf.progress * 100}%` }}
                title={`Keyframe at ${(kf.progress * 100).toFixed(0)}%`}
              />
            ))}
          </div>

          <div className="mt-3 flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase tracking-widest">
            <span>0%</span>
            <span className="text-black font-bold bg-white px-2 py-0.5 rounded">{(currentProgress * 100).toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Capture Button (Visible in Edit Mode) */}
        {mode === 'edit' && <CaptureButton />}
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
      className="pointer-events-auto h-16 w-16 rounded-2xl bg-white hover:bg-gray-200 text-black shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group relative"
    >
      <i className="fa-solid fa-camera text-xl"></i>
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Capture View
      </span>
    </button>
  );
};
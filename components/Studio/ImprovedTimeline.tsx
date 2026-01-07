import React, { useRef, useTransition, useMemo } from 'react';
import { useStore } from '../../useStore';

export const ImprovedTimeline: React.FC = () => {
  const { currentProgress, setCurrentProgress, chapters, activeChapterId, mode } = useStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const activeChapter = useMemo(() => 
    chapters.find(c => c.id === activeChapterId), 
    [chapters, activeChapterId]
  );

  if (!activeChapter || !activeChapter.modelUrl) return null;

  const keyframes = activeChapter.cameraPath;
  const beats = activeChapter.narrativeBeats;

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
    <div className="fixed bottom-0 left-0 right-0 h-36 z-[110] px-6 pb-6 pointer-events-none flex items-end">
      <div className="w-full max-w-7xl mx-auto flex items-center gap-6">
        
        {/* Main Timeline Container */}
        <div className="flex-1 pointer-events-auto">
          <div className="glass-panel rounded-3xl px-8 py-6 border border-white/10 shadow-2xl relative">
            {/* Progress Display */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-xl border border-white/10 shadow-xl">
              <div className="text-center">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Timeline</div>
                <div className="text-lg font-bold text-emerald-400">{(currentProgress * 100).toFixed(1)}%</div>
              </div>
            </div>

            {/* Timeline Track */}
            <div 
              ref={timelineRef}
              onClick={handleSeek}
              className={`relative h-3 w-full bg-white/5 rounded-full cursor-crosshair overflow-visible ${isPending ? 'opacity-70' : ''}`}
            >
              {/* Progress Fill */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-150"
                style={{ width: `${currentProgress * 100}%` }}
              />
              
              {/* Keyframe Markers */}
              {keyframes.map((kf) => (
                <div 
                  key={kf.id}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-6 bg-blue-400 border-2 border-white rounded-md pointer-events-none shadow-lg transition-all hover:scale-110 group"
                  style={{ left: `${kf.progress * 100}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white text-[8px] font-bold px-2 py-1 rounded whitespace-nowrap">
                    Keyframe {(kf.progress * 100).toFixed(0)}%
                  </div>
                </div>
              ))}

              {/* Narrative Beat Markers */}
              {beats.map((beat) => (
                <div 
                  key={beat.id}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-6 bg-purple-400 border-2 border-white rounded-md pointer-events-none shadow-lg transition-all hover:scale-110 group"
                  style={{ left: `${beat.progress * 100}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500 text-white text-[8px] font-bold px-2 py-1 rounded whitespace-nowrap max-w-32 truncate">
                    {beat.title}
                  </div>
                </div>
              ))}
              
              {/* Playhead */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl border-4 border-emerald-500 cursor-grab active:cursor-grabbing transition-all hover:scale-110 active:scale-95 z-10"
                style={{ left: `${currentProgress * 100}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-50"></div>
              </div>
            </div>

            {/* Chapter Indicators */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Keyframes</span>
              </div>
              <div className="flex gap-2">
                {chapters.map((c, i) => (
                  <div 
                    key={c.id} 
                    className={`w-8 h-1.5 rounded-full transition-all ${
                      c.id === activeChapterId 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Story Beats</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {mode === 'edit' && (
          <div className="pointer-events-auto flex gap-3">
            <CaptureButton />
            <PlaybackButton />
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
      className="group relative glass-panel w-20 h-20 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:border-blue-500/50 hover:shadow-blue-500/20 active:scale-95"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-teal-500/10 transition-all"></div>
      <i className="fa-solid fa-camera text-2xl text-white/70 group-hover:text-blue-400 transition-colors relative z-10 mb-1"></i>
      <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/70 transition-colors relative z-10">Capture</span>
      
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 text-[9px] font-bold uppercase tracking-wider text-white px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none shadow-2xl whitespace-nowrap">
        Save Keyframe
      </div>
    </button>
  );
};

const PlaybackButton: React.FC = () => {
  const { setMode } = useStore();
  
  return (
    <button
      onClick={() => setMode('preview')}
      className="group relative glass-panel w-20 h-20 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-105 hover:border-purple-500/50 hover:shadow-purple-500/20 active:scale-95"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all"></div>
      <i className="fa-solid fa-play text-2xl text-white/70 group-hover:text-purple-400 transition-colors relative z-10 mb-1"></i>
      <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/70 transition-colors relative z-10">Preview</span>
      
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 text-[9px] font-bold uppercase tracking-wider text-white px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none shadow-2xl whitespace-nowrap">
        Play Story
      </div>
    </button>
  );
};

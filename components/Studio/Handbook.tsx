import React, { useState } from 'react';
import { useStore } from '../../useStore';

const TutorialSection: React.FC<{ title: string; children: React.ReactNode; icon: string }> = ({ title, children, icon }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
        <i className={`fa-solid ${icon} text-black text-sm`}></i>
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-white italic">{title}</h3>
    </div>
    <div className="text-[11px] leading-relaxed text-gray-400 space-y-3 pl-11">
      {children}
    </div>
  </div>
);

export const Handbook: React.FC = () => {
  const { showHandbook, setShowHandbook } = useStore();
  const [activeTab, setActiveTab] = useState<'basics' | 'cinematics' | 'workflow'>('basics');

  if (!showHandbook) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-auto">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowHandbook(false)}
      />
      
      <div className="relative w-full max-w-4xl max-h-[85vh] glass-panel rounded-[2.5rem] flex flex-col overflow-hidden border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="space-y-1">
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Technical Documentation</div>
             <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">ScrollStudio Mastery</h2>
          </div>
          <button 
            onClick={() => setShowHandbook(false)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-white"></i>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-48 border-r border-white/10 p-4 space-y-2 bg-black/20">
            {[
              { id: 'basics', label: 'Core Basics', icon: 'fa-cube' },
              { id: 'cinematics', label: 'Cinematics', icon: 'fa-clapperboard' },
              { id: 'workflow', label: 'The Workflow', icon: 'fa-code-branch' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-gray-500 hover:bg-white/5'}`}
              >
                <i className={`fa-solid ${tab.icon} text-xs`}></i>
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10 no-scrollbar space-y-10 bg-gradient-to-br from-transparent to-white/[0.02]">
            {activeTab === 'basics' && (
              <>
                <TutorialSection title="Camera Control" icon="fa-video">
                  <p>Navigation is handled via standard 3D viewport controls:</p>
                  <ul className="list-disc space-y-2">
                    <li><b className="text-white">Rotate:</b> Left-click and drag anywhere in the scene.</li>
                    <li><b className="text-white">Pan:</b> Right-click and drag to slide the viewport.</li>
                    <li><b className="text-white">Zoom:</b> Use the mouse wheel to move closer or further.</li>
                  </ul>
                </TutorialSection>

                <TutorialSection title="Hotspots Explained" icon="fa-location-dot">
                  <p><b className="text-white">What is a Hotspot?</b> Unlike Story Beats which stay in the center of the screen, a <b className="text-white">Hotspot</b> is a physical marker pinned to a specific point in 3D space on your model.</p>
                  <p><b className="text-white">Anchoring:</b> When you click "Pin Hotspot Here", the engine captures the current <b className="text-white">Camera Target</b> (the point you are rotating around). This ensures the label stays exactly on that mechanical part as the camera moves.</p>
                  <ul className="list-disc space-y-2">
                    <li><b className="text-white">Visibility:</b> Hotspots only appear when the user scrolls near the progress percentage where you created them.</li>
                    <li><b className="text-white">Detailing:</b> Use these for technical callouts like "Air Intake", "Engine Specs", or "Material Finish".</li>
                  </ul>
                </TutorialSection>
              </>
            )}

            {activeTab === 'cinematics' && (
              <>
                <TutorialSection title="Cinematic Lenses" icon="fa-camera-retro">
                  <p>Adjust <b className="text-white">FOV (Field of View)</b> to change the perspective. 15mm is wide-angle (epic), while 80mm is telephoto (intimate/product focus).</p>
                  <p>Use <b className="text-white">Aperture</b> to create "Bokeh" (background blur). This is critical for making your model feel like it's being filmed with a professional camera.</p>
                </TutorialSection>
              </>
            )}

            {activeTab === 'workflow' && (
              <>
                <TutorialSection title="Step-by-Step Production" icon="fa-code-branch">
                  <ol className="list-decimal space-y-4">
                    <li><b className="text-white">Block the Path:</b> Create your keyframes from 0% to 100%. Ensure the model stays in view.</li>
                    <li><b className="text-white">Add Narrative:</b> Create "Story Beats" to give the viewer context.</li>
                    <li><b className="text-white">Detailing:</b> Use "Hotspots" to call out specific technical details directly on the model's geometry.</li>
                    <li><b className="text-white">Export:</b> Use the Project tab to download your JSON. Hand this JSON to a developer to build your live site.</li>
                  </ol>
                </TutorialSection>
              </>
            )}
          </div>
        </div>

        <div className="p-6 bg-white flex justify-center border-t border-white/10">
           <button 
            onClick={() => setShowHandbook(false)}
            className="px-10 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-transform"
           >
             Start Creating
           </button>
        </div>
      </div>
    </div>
  );
};
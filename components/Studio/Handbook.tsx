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
        {/* Header */}
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

        <div className="flex-1 overflow-hidden">
          {/* Tabs Sidebar */}
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

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-10 no-scrollbar space-y-10 bg-gradient-to-br from-transparent to-white/[0.02]">
            {activeTab === 'basics' && (
              <>
                <TutorialSection title="Camera Control" icon="fa-video">
                  <p>Navigation is handled via standard 3D viewport controls:</p>
                  <ul className="list-disc space-y-2">
                    <li><b className="text-white">Rotate:</b> Left-click and drag anywhere in the scene.</li>
                    <li><b className="text-white">Pan:</b> Right-click and drag to slide the viewport.</li>
                    <li><b className="text-white">Zoom:</b> Use the mouse wheel to move the camera closer or further from the target.</li>
                  </ul>
                  <div className="p-4 bg-white/5 border-l-2 border-white rounded-r-xl italic">
                    Pro Tip: The camera always orbits around the <b className="text-white">Target</b>. Pan the camera to change what you're focusing on.
                  </div>
                </TutorialSection>

                <TutorialSection title="The Scrubber (Progress)" icon="fa-clock">
                  <p>The timeline at the bottom represents <b>Story Progress (0% to 100%)</b>. This is NOT a time duration, but a scroll position.</p>
                  <p>Click anywhere on the bar to jump to that progress point. In the final experience, this is mapped directly to the user's scroll depth.</p>
                </TutorialSection>
              </>
            )}

            {activeTab === 'cinematics' && (
              <>
                <TutorialSection title="Optics & Lenses" icon="fa-camera-retro">
                  <p>Adjust the <b className="text-white">Field of View (FOV)</b> to create different cinematic feels. Lower FOV (e.g., 20mm) creates a "compressed" telephoto look, while higher FOV (e.g., 60mm) creates wide-angle drama.</p>
                  <p>Use <b className="text-white">Depth of Field</b> to blur the background. Set the <b>Aperture</b> to control blur intensity and <b>Distance</b> to focus on specific parts of your model.</p>
                </TutorialSection>

                <TutorialSection title="Atmosphere" icon="fa-wind">
                  <p><b>Fog:</b> Essential for scale. Dense fog can hide the edges of your model and create a sense of depth and mystery.</p>
                  <p><b>Bloom:</b> Controls the glow of bright objects. Use this sparingly to make metallic or emissive parts of your model "pop".</p>
                </TutorialSection>
              </>
            )}

            {activeTab === 'workflow' && (
              <>
                <TutorialSection title='The "Snapshot" Method' icon="fa-camera">
                  <p>This is the engine's core. To create an automated camera move:</p>
                  <ol className="list-decimal space-y-3">
                    <li>Scrub to <b className="text-white">0%</b> and position your camera. Click <b>"Capture View"</b>.</li>
                    <li>Scrub to <b className="text-white">50%</b>, move the camera to a new spot. Click <b>"Capture View"</b> again.</li>
                    <li>The engine now interpolates between these points. Keyframes appear as white marks on the timeline.</li>
                  </ol>
                </TutorialSection>

                <TutorialSection title="Story Beats & Pins" icon="fa-font">
                  <p><b>Story Beats:</b> Use the "Story" tab to add text overlays. These fade in based on the progress percentage where you created them.</p>
                  <p><b>Hotspots:</b> Use the "FX" tab to pin 3D annotations directly onto your model. These stay anchored to specific 3D coordinates.</p>
                </TutorialSection>

                <TutorialSection title="Finalizing & Exporting" icon="fa-file-export">
                  <p>Once your experience is polished, go to the <b className="text-white">Project</b> tab:</p>
                  <ul className="list-disc space-y-2">
                    <li><b className="text-white">Export:</b> This downloads a `.json` schema containing all your math, camera paths, and logic.</li>
                    <li><b className="text-white">Save Your Work:</b> Since this app runs in-memory, always export your project to save it. You can re-import the JSON file at any time to resume editing.</li>
                    <li><b className="text-white">Deployment:</b> This exported JSON is a standard schema. It can be consumed by any Three.js renderer running the ScrollStudio engine to reproduce your scene exactly.</li>
                  </ul>
                  <div className="p-4 bg-emerald-500/10 border-l-2 border-emerald-500 rounded-r-xl text-emerald-100">
                    Pro Tip: When re-importing a project, you must upload the <b className="text-white">same 3D model file</b> first, as the JSON only contains the scene instructions, not the geometry itself.
                  </div>
                </TutorialSection>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white flex justify-center border-t border-white/10">
           <button 
            onClick={() => setShowHandbook(false)}
            className="px-10 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-transform"
           >
             Got it, let's build
           </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useStore } from '../../useStore';

const TutorialSection: React.FC<{ title: string; children: React.ReactNode; icon: string }> = ({ title, children, icon }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
        <i className={`fa-solid ${icon} text-white/80 text-sm`}></i>
      </div>
      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">{title}</h3>
    </div>
    <div className="text-[11px] leading-relaxed text-zinc-400 space-y-3 pl-14">
      {children}
    </div>
  </div>
);

export const Handbook: React.FC = () => {
  const { showHandbook, setShowHandbook } = useStore();
  const [activeTab, setActiveTab] = useState<'directing' | 'optics' | 'atmosphere' | 'fx' | 'distribution'>('directing');

  if (!showHandbook) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
        onClick={() => setShowHandbook(false)}
      />

      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-zinc-800/50 rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="p-10 border-b border-white/5 flex justify-between items-start bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              <div className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">System Documentation v3.0</div>
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">ScrollStudio Manual</h2>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Mastering the high-fidelity spatial narrative.</p>
          </div>
          <button
            onClick={() => setShowHandbook(false)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all border border-white/10"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 border-r border-white/5 p-6 space-y-2 bg-black/20 shrink-0">
            {[
              { id: 'directing', label: 'Directing', icon: 'fa-video', desc: 'Paths & Timeline' },
              { id: 'optics', label: 'Optics', icon: 'fa-circle-dot', desc: 'Lenses & Blur' },
              { id: 'atmosphere', label: 'Atmosphere', icon: 'fa-cloud-sun', desc: 'Light & Space' },
              { id: 'fx', label: 'Visual FX', icon: 'fa-wand-magic-sparkles', desc: 'The Final Grade' },
              { id: 'distribution', label: 'Distribution', icon: 'fa-box-open', desc: 'Going Live' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex flex-col gap-1 px-5 py-4 rounded-2xl transition-all text-left border ${activeTab === tab.id ? 'bg-white border-white text-black shadow-[0_10px_40px_rgba(255,255,255,0.15)]' : 'bg-transparent border-transparent text-zinc-600 hover:bg-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </div>
                <span className={`text-[9px] font-bold opacity-50 ml-6 ${activeTab === tab.id ? 'text-black' : ''}`}>{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-12 no-scrollbar space-y-12 bg-gradient-to-br from-transparent to-white/[0.01]">

            {activeTab === 'directing' && (
              <div className="space-y-10">
                <TutorialSection title="Multi-Chapter System" icon="fa-layer-group">
                  <p>Projects are organized into <b className="text-white italic">Chapters</b>. Each chapter can hold a unique 3D model, lighting rig, and narrative sequence.</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><b className="text-white">Auto-Distribute:</b> Automatically spans chapters across the total scroll progress.</li>
                    <li><b className="text-white">Chapter Transitions:</b> Smooth cinematic flares trigger when moving between sectors.</li>
                  </ul>
                </TutorialSection>

                <TutorialSection title="Timeline & Keyframes" icon="fa-camera-retro">
                  <p>Capture the camera's state at any point on the timeline. The engine performs <b className="text-white">Catmull-Rom Spline Interpolation</b> to build a smooth path.</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><b className="text-white">View Modes:</b> Toggling <b className="text-white">Cinema</b> lets you see the interpolated path, while <b className="text-white">Free</b> unlocks the editor camera.</li>
                    <li><b className="text-white">Spline Alpha:</b> Adjust path tension from tight (Chordal) to sweeping (Centripetal).</li>
                  </ul>
                </TutorialSection>
              </div>
            )}

            {activeTab === 'optics' && (
              <div className="space-y-10">
                <TutorialSection title="Cinematic Lenses" icon="fa-circle-dot">
                  <p>Control Depth of Field with precision. Use <b className="text-white">Aperture</b> to expand the blur area and <b className="text-white">Focus Distance</b> to hit your target.</p>
                  <p><b className="text-white italic underline">Pro Tip:</b> Increase <b className="text-white">Bokeh Scale</b> (up to 10) for high-end dreamlike backgrounds. Pair this with a low FOV for macro shots.</p>
                </TutorialSection>

                <TutorialSection title="Field of View" icon="fa-magnifying-glass">
                  <p>Lower FOV (20-30) compresses space for a professional "product shot" look. Higher FOV (60-80) creates dynamic, fast-moving perspectives.</p>
                </TutorialSection>
              </div>
            )}

            {activeTab === 'atmosphere' && (
              <div className="space-y-10">
                <TutorialSection title="Studio Lighting" icon="fa-sun">
                  <p>Each chapter has an <b className="text-white">Environment Map</b>. Presets like <b className="text-white">Studio</b>, <b className="text-white">City</b>, and <b className="text-white">Night</b> provide fundamentally different reflection and lighting profiles.</p>
                </TutorialSection>

                <TutorialSection title="Volumetric Fog" icon="fa-cloud">
                  <p>Fog density adds a sense of massive scale. Match the <b className="text-white">Fog Color</b> to your background to create an infinite, seamless void.</p>
                </TutorialSection>
              </div>
            )}

            {activeTab === 'fx' && (
              <div className="space-y-10">
                <TutorialSection title="Visual Grade" icon="fa-wand-magic-sparkles">
                  <p>The final layer of fidelity:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><b className="text-white">Bloom:</b> High-intensity light spill from emissive surfaces.</li>
                    <li><b className="text-white">Scanlines & Grain:</b> Adds an analog/technical texture to the digital render.</li>
                    <li><b className="text-white">Camera Shake:</b> Subtle procedural noise for handheld cinematic realism.</li>
                    <li><b className="text-white">Vignette:</b> Focuses the eye by darkening corners.</li>
                  </ul>
                </TutorialSection>
              </div>
            )}
            {activeTab === 'distribution' && (
              <div className="space-y-10">
                <TutorialSection title="Direct-to-Web (ZIP)" icon="fa-file-zipper">
                  <p>The <b className="text-white">Self-Contained Export</b> is the fastest way to deploy. It includes a custom vanilla JS engine that doesn't require React.</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><b className="text-white">Assets Folder:</b> Your 3D models are bundled as separate files or embedded directly in the JSON.</li>
                    <li><b className="text-white">Local Server:</b> Due to CORS security, you must use a local server (like Live Server or Python) to view the zip contents locally.</li>
                  </ul>
                </TutorialSection>

                <TutorialSection title="React Integration" icon="fa-code">
                  <p>For existing React applications, use the <b className="text-white">JSON Export</b>. Simply feed the data into the <code className="text-emerald-400">ScrollyEngine</code> component.</p>
                </TutorialSection>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-white/5 flex justify-center bg-black/40">
          <button
            onClick={() => setShowHandbook(false)}
            className="px-12 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center gap-4"
          >
            Continue Designing
            <i className="fa-solid fa-arrow-right text-[8px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

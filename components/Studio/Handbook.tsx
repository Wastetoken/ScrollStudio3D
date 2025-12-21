
import React, { useState } from 'react';
import { useStore } from '../../useStore';

const TutorialSection: React.FC<{ title: string; children: React.ReactNode; icon: string; accent?: string }> = ({ title, children, icon, accent = "text-white" }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
        <i className={`fa-solid ${icon} ${accent} text-sm`}></i>
      </div>
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">{title}</h3>
    </div>
    <div className="text-[11px] leading-relaxed text-gray-400 space-y-3 pl-14">
      {children}
    </div>
  </div>
);

export const Handbook: React.FC = () => {
  const { showHandbook, setShowHandbook } = useStore();
  const [activeTab, setActiveTab] = useState<'directing' | 'optics' | 'atmosphere' | 'fx'>('directing');

  if (!showHandbook) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-auto">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={() => setShowHandbook(false)}
      />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel rounded-[3rem] flex flex-col overflow-hidden border-white/20 shadow-[0_0_120px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-10 border-b border-white/10 flex justify-between items-start bg-white/5">
          <div className="space-y-2">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Studio Academy v2.5</div>
             </div>
             <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">The Director's Manifesto</h2>
             <p className="text-xs text-white/20 font-medium">Mastering the art of spatial narrative and cinematic optics.</p>
          </div>
          <button 
            onClick={() => setShowHandbook(false)}
            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all border border-white/10"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 border-r border-white/10 p-6 space-y-2 bg-black/40 shrink-0">
            {[
              { id: 'directing', label: 'Directing', icon: 'fa-video', desc: 'Camera & Paths' },
              { id: 'optics', label: 'Optics', icon: 'fa-circle-dot', desc: 'Lenses & Bokeh' },
              { id: 'atmosphere', label: 'Atmosphere', icon: 'fa-cloud-sun', desc: 'Light & Exposure' },
              { id: 'fx', label: 'Visual FX', icon: 'fa-wand-magic-sparkles', desc: 'The Final Polish' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex flex-col gap-1 px-5 py-4 rounded-2xl transition-all text-left border ${activeTab === tab.id ? 'bg-white border-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.2)]' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${tab.icon} text-xs`}></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </div>
                <span className={`text-[9px] font-bold opacity-40 ml-6 ${activeTab === tab.id ? 'text-black' : ''}`}>{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-12 no-scrollbar space-y-12 bg-gradient-to-br from-transparent to-white/[0.02]">
            
            {activeTab === 'directing' && (
              <div className="space-y-10">
                <TutorialSection title="Camera Pathing (The Snapshot)" icon="fa-camera-retro" accent="text-emerald-400">
                  <p>ScrollStudio uses <b className="text-white">Non-Linear Spline Interpolation</b>. To create a movement:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Find your angle using <b className="text-white">Orbit (LMB)</b> and <b className="text-white">Pan (RMB)</b>.</li>
                    <li>Move the timeline playhead to your desired scroll percentage.</li>
                    <li>Hit the <b className="text-white">Capture</b> icon. The engine creates a keyframe.</li>
                  </ul>
                  <p>The camera will now smoothly travel between all captured snapshots as you scroll.</p>
                </TutorialSection>

                <TutorialSection title="FOV (Field of View)" icon="fa-magnifying-glass" accent="text-blue-400">
                  <p><b className="text-white">Wide vs. Telephoto:</b> FOV determines the camera's perspective. 
                     A high FOV (e.g., 60°) creates a wide-angle, epic sense of scale but can distort edges. 
                     A low FOV (e.g., 20°) acts like a zoom lens, flattening the image and bringing focus to technical details.</p>
                  <p><i className="fa-solid fa-circle-info mr-2 opacity-50"></i> You can capture different FOVs in different keyframes to create dynamic zoom-ins during movement.</p>
                </TutorialSection>

                <TutorialSection title="Spline Alpha (Movement Logic)" icon="fa-wave-square" accent="text-purple-400">
                  <p>Located in the <b className="text-white">Path</b> tab, Spline Alpha controls the "tension" of the camera path.</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><b className="text-white">0.0 (Centripetal):</b> Tight, more direct paths between points.</li>
                    <li><b className="text-white">0.5 (Catmull-Rom):</b> The standard for cinema. Balanced, natural curves.</li>
                    <li><b className="text-white">1.0 (Chordal):</b> Extremely smooth, sweeping arcs—ideal for orbiting large products.</li>
                  </ul>
                </TutorialSection>
              </div>
            )}

            {activeTab === 'optics' && (
              <div className="space-y-10">
                <TutorialSection title="Aperture (The Bokeh Effect)" icon="fa-circle-dot" accent="text-orange-400">
                  <p>Aperture controls the <b className="text-white">Depth of Field (DOF)</b>. A larger aperture (e.g., 0.1) results in a shallow depth of field, blurring the background and foreground while keeping a specific point in focus.</p>
                  <p><b className="text-white">Creative Use:</b> Use shallow DOF to guide the viewer's eye to specific mechanical parts or labels while softening the rest of the scene.</p>
                </TutorialSection>

                <TutorialSection title="Focus Distance" icon="fa-crosshairs" accent="text-red-400">
                  <p>This is the exact distance from the camera lens to the point that should be sharp. If your model is 10 units away, set your Focus Distance to 10.</p>
                  <p><i className="fa-solid fa-lightbulb mr-2 text-yellow-400"></i> Tip: Use the <b className="text-white">Bokeh Scale</b> to determine how "creamy" or exaggerated the background blur should be.</p>
                </TutorialSection>
              </div>
            )}

            {activeTab === 'atmosphere' && (
              <div className="space-y-10">
                <TutorialSection title="Tone Mapping & Exposure" icon="fa-brightness" accent="text-yellow-400">
                  <p><b className="text-white">Exposure:</b> This controls the overall brightness of the scene's virtual sensor. 
                     High exposure (2.0+) feels like a bright, over-exposed studio. 
                     Low exposure (0.5) creates a dark, "low-key" dramatic mood.</p>
                  <p>The engine uses <b className="text-white">ACES Filmic Tone Mapping</b>, ensuring that highlights don't "clip" to white too aggressively.</p>
                </TutorialSection>

                <TutorialSection title="Volumetric Fog" icon="fa-cloud" accent="text-cyan-400">
                  <p>Fog adds atmospheric depth. It helps the viewer understand the scale of the world. 
                     By matching the <b className="text-white">Fog Color</b> to your <b className="text-white">Background Color</b>, you can make the edges of your 3D world fade into infinity.</p>
                </TutorialSection>

                <TutorialSection title="Environment Presets" icon="fa-mountain-sun" accent="text-rose-400">
                  <p>In the <b className="text-white">Env</b> tab, you can swap between lighting rigs. <b className="text-white">Studio</b> is neutral, <b className="text-white">City</b> adds blue/orange highlights, and <b className="text-white">Night</b> focuses on high-contrast rim lighting.</p>
                </TutorialSection>
              </div>
            )}

            {activeTab === 'fx' && (
              <div className="space-y-10">
                <TutorialSection title="Bloom (HDR Glow)" icon="fa-sun" accent="text-emerald-400">
                  <p>Bloom makes highlights and <b className="text-white">Emissive</b> materials glow. 
                     Adjust the <b className="text-white">Threshold</b> to decide which parts of the model trigger the glow, and <b className="text-white">Intensity</b> to control how far that light spreads.</p>
                </TutorialSection>

                <TutorialSection title="Chromatic Aberration" icon="fa-eye" accent="text-indigo-400">
                  <p>This mimics a real-world lens imperfection where colors bleed at the edges of the frame. 
                     A subtle amount (0.002) adds a sense of <b className="text-white">Photorealism</b> and "weight" to the digital render.</p>
                </TutorialSection>

                <TutorialSection title="Vignette" icon="fa-circle" accent="text-gray-400">
                  <p>Vignetting darkens the corners of the frame. This is a classic cinematic technique to keep the viewer's focus centered on the product.</p>
                </TutorialSection>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-white flex justify-center border-t border-white/10 shrink-0">
           <button 
            onClick={() => setShowHandbook(false)}
            className="px-12 py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-3"
           >
             Initialize Production
             <i className="fa-solid fa-arrow-right text-[10px]"></i>
           </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { useStore } from '../../useStore';

export const Sidebar: React.FC = () => {
  const { 
    config, 
    setConfig, 
    mode, 
    setMode, 
    currentProgress, 
    modelUrl, 
    sections,
    addSection,
    removeSection,
    updateSection,
    cameraTarget,
    hotspots,
    addHotspot,
    removeHotspot,
    setShowHandbook,
    keyframes,
    loadProject
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'scene' | 'story' | 'fx' | 'project'>('story');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!modelUrl) return null;

  const handleAddHotspot = () => {
    addHotspot({
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Annotation',
      content: 'Describe this specific detail here.',
      position: [...cameraTarget],
      visibleAt: currentProgress
    });
  };

  const handleExport = () => {
    const projectData = {
      version: "1.0.0",
      config,
      keyframes,
      sections,
      hotspots
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scroll-studio-project-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        loadProject(json);
      } catch (err) {
        alert("Invalid project file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed left-6 top-6 bottom-32 w-80 z-40 flex flex-col gap-4 pointer-events-none">
      {/* Mode Switcher */}
      <div className="glass-panel p-2 rounded-xl flex pointer-events-auto shadow-2xl border-white/5">
        <button 
          onClick={() => setMode('edit')} 
          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'edit' ? 'bg-white text-black' : 'text-gray-500'}`}
        >
          Editor
        </button>
        <button 
          onClick={() => setMode('preview')} 
          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'preview' ? 'bg-white text-black' : 'text-gray-500'}`}
        >
          Preview
        </button>
      </div>

      {/* Main Controls */}
      <div className="glass-panel p-6 rounded-2xl flex-shrink-0 pointer-events-auto shadow-2xl flex flex-col max-h-[75vh] border-white/5">
        <div className="flex border-b border-white/5 mb-6 overflow-x-auto no-scrollbar">
          {['story', 'scene', 'fx', 'project'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 pb-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap px-4 ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
          {activeTab === 'story' && (
            <div className="space-y-4">
              <button 
                onClick={() => addSection({ id: Date.now().toString(), progress: currentProgress, title: 'Beat', description: '' })} 
                className="w-full py-3 bg-white text-black text-[9px] font-black uppercase rounded-xl hover:bg-gray-200 transition-colors"
              >
                + Add Story Beat
              </button>
              {sections.map(s => (
                <div key={s.id} className="p-4 bg-white/5 rounded-xl space-y-2 relative group">
                  <div className="flex justify-between items-center">
                    <input 
                      value={s.title} 
                      onChange={e => updateSection(s.id, { title: e.target.value })} 
                      className="bg-transparent border-b border-white/10 w-full text-[10px] font-bold text-white outline-none focus:border-white/40"
                    />
                    <button onClick={() => removeSection(s.id)} className="ml-2 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </div>
                  <textarea 
                    value={s.description} 
                    onChange={e => updateSection(s.id, { description: e.target.value })} 
                    className="bg-transparent w-full text-[9px] text-gray-400 h-16 resize-none outline-none" 
                    placeholder="Describe this scene..." 
                  />
                  <div className="text-[8px] text-white/20 font-mono">T: {(s.progress * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scene' && (
            <div className="space-y-6">
              <section className="space-y-3">
                <h4 className="text-[9px] uppercase font-black text-white/40 tracking-widest">Environment</h4>
                <div className="space-y-2">
                  <label className="flex justify-between text-[9px] uppercase font-bold">
                    Scale <span>{config.modelScale.toFixed(1)}x</span>
                  </label>
                  <input type="range" min="0.1" max="5" step="0.1" value={config.modelScale} onChange={e => setConfig({ modelScale: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <label className="flex justify-between text-[9px] uppercase font-bold">
                    Light <span>{config.ambientIntensity.toFixed(1)}</span>
                  </label>
                  <input type="range" min="0" max="2" step="0.1" value={config.ambientIntensity} onChange={e => setConfig({ ambientIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>
              </section>

              <section className="space-y-3 pt-6 border-t border-white/5">
                <h4 className="text-[9px] uppercase font-black text-white/40 tracking-widest">Optics (Lens)</h4>
                <div className="space-y-2">
                  <label className="flex justify-between text-[9px] uppercase font-bold">
                    Field of View <span>{config.defaultFov}mm</span>
                  </label>
                  <input type="range" min="15" max="100" step="1" value={config.defaultFov} onChange={e => setConfig({ defaultFov: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'fx' && (
            <div className="space-y-6">
              <section className="space-y-3">
                <h4 className="text-[9px] uppercase font-black text-white/40 tracking-widest">Focus & Blur</h4>
                <div className="space-y-2">
                  <label className="flex justify-between text-[9px] uppercase font-bold">Distance <span>{config.focusDistance}m</span></label>
                  <input type="range" min="0.1" max="20" step="0.1" value={config.focusDistance} onChange={e => setConfig({ focusDistance: parseFloat(e.target.value) })} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="flex justify-between text-[9px] uppercase font-bold">Aperture <span>{config.aperture.toFixed(3)}</span></label>
                  <input type="range" min="0" max="0.1" step="0.001" value={config.aperture} onChange={e => setConfig({ aperture: parseFloat(e.target.value) })} className="w-full" />
                </div>
              </section>

              <section className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-[9px] uppercase font-black text-white/40 tracking-widest">Atmosphere</h4>
                <div className="space-y-2">
                  <label className="flex justify-between text-[9px] uppercase font-bold">Fog <span>{config.fogDensity.toFixed(3)}</span></label>
                  <input type="range" min="0" max="0.1" step="0.005" value={config.fogDensity} onChange={e => setConfig({ fogDensity: parseFloat(e.target.value) })} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="flex justify-between text-[9px] uppercase font-bold">Bloom <span>{config.bloomIntensity.toFixed(1)}</span></label>
                  <input type="range" min="0" max="5" step="0.1" value={config.bloomIntensity} onChange={e => setConfig({ bloomIntensity: parseFloat(e.target.value) })} className="w-full" />
                </div>
              </section>

              <section className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-[9px] uppercase font-black text-white/40 tracking-widest">Annotations</h4>
                <button 
                  onClick={handleAddHotspot} 
                  className="w-full py-2 bg-white/10 text-white text-[8px] font-black uppercase rounded-lg hover:bg-white/20 transition-all"
                >
                  + Pin Hotspot Here
                </button>
                <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                  {hotspots.map(h => (
                    <div key={h.id} className="p-2 bg-white/5 rounded flex justify-between items-center group">
                      <span className="text-[8px] text-white/60 truncate w-32">{h.label}</span>
                      <button onClick={() => removeHotspot(h.id)} className="text-red-500/30 hover:text-red-500 transition-all">
                        <i className="fa-solid fa-trash text-[8px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'project' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                <h4 className="text-[10px] font-black uppercase text-emerald-500">Master Export</h4>
                <p className="text-[9px] text-gray-400">Serialize your entire project state (keyframes, beats, FX) into a JSON schema.</p>
                <button 
                  onClick={handleExport}
                  className="w-full py-3 bg-white text-black text-[9px] font-black uppercase rounded-xl hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  Download Project JSON
                </button>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <h4 className="text-[10px] font-black uppercase text-white">Import Session</h4>
                <p className="text-[9px] text-gray-400">Restore a previous session by uploading your JSON file.</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-white/10 text-white text-[9px] font-black uppercase rounded-xl hover:bg-white/20 transition-all"
                >
                  Load .json File
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImport} 
                  accept=".json" 
                  className="hidden" 
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[8px] text-gray-500 uppercase tracking-widest mb-2">
                  <span>Current State</span>
                  <span>{keyframes.length} Keyframes</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-2 mt-auto">
          <button 
            onClick={() => setShowHandbook(true)}
            className="py-2 bg-white text-black rounded-lg text-[8px] font-black uppercase hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-book-open"></i> Handbook
          </button>
          <button onClick={() => window.location.reload()} className="py-2 bg-red-500/10 rounded-lg text-[8px] font-black uppercase text-red-500 hover:bg-red-500/20 transition-colors">Reset</button>
        </div>
      </div>
    </div>
  );
};
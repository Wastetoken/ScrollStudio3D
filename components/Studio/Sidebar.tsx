import React, { useRef, useState, startTransition } from 'react';
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
    hotspots,
    removeHotspot,
    updateHotspot,
    setShowHandbook,
    keyframes,
    loadProject,
    isPlacingHotspot,
    setIsPlacingHotspot
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'scene' | 'story' | 'fx' | 'project'>('story');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!modelUrl) return null;

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
        // Wrapping in startTransition prevents synchronous suspension errors
        startTransition(() => {
          loadProject(json);
        });
      } catch (err) {
        alert("Invalid project file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const changeMode = (newMode: 'edit' | 'preview') => {
    startTransition(() => {
      setMode(newMode);
    });
  };

  const handleAddSection = () => {
    startTransition(() => {
      addSection({ id: Date.now().toString(), progress: currentProgress, title: 'Beat Title', description: '' });
    });
  };

  return (
    <div className="fixed left-6 top-6 bottom-32 w-80 z-40 flex flex-col gap-4 pointer-events-none">
      {/* Mode Switcher */}
      <div className="glass-panel p-2 rounded-xl flex pointer-events-auto shadow-2xl border-white/5">
        <button 
          onClick={() => changeMode('edit')} 
          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'edit' ? 'bg-white text-black' : 'text-gray-500'}`}
        >
          Editor
        </button>
        <button 
          onClick={() => changeMode('preview')} 
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
                onClick={handleAddSection} 
                className="w-full py-3 bg-white text-black text-[9px] font-black uppercase rounded-xl hover:bg-gray-200 transition-colors"
              >
                + Add Narrative Beat
              </button>
              {sections.map(s => (
                <div key={s.id} className="p-4 bg-white/5 rounded-xl space-y-2 relative group">
                  <div className="flex justify-between items-center">
                    <input 
                      value={s.title} 
                      onChange={e => startTransition(() => updateSection(s.id, { title: e.target.value }))} 
                      className="bg-transparent border-b border-white/10 w-full text-[10px] font-bold text-white outline-none focus:border-white/40"
                    />
                    <button onClick={() => startTransition(() => removeSection(s.id))} className="ml-2 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </div>
                  <textarea 
                    value={s.description} 
                    onChange={e => startTransition(() => updateSection(s.id, { description: e.target.value }))} 
                    className="bg-transparent w-full text-[9px] text-gray-400 h-16 resize-none outline-none" 
                    placeholder="Describe the mood or context..." 
                  />
                  <div className="text-[8px] text-white/20 font-mono">Visible at: {(s.progress * 100).toFixed(0)}%</div>
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
                <h4 className="text-[9px] uppercase font-black text-white/40 tracking-widest">Global Optics</h4>
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
                <div className="flex items-center justify-between">
                  <h4 className="text-[9px] uppercase font-black text-white/40 tracking-widest">3D Annotations</h4>
                  <div className="group relative">
                    <i className="fa-solid fa-circle-info text-white/20 text-[10px] cursor-help"></i>
                    <div className="absolute bottom-full right-0 w-32 p-2 bg-black text-[8px] text-gray-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 mb-2 pointer-events-none z-50">
                      Tap anywhere on the model surface to place.
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsPlacingHotspot(!isPlacingHotspot)} 
                  className={`w-full py-3 text-[8px] font-black uppercase rounded-lg transition-all shadow-xl border ${
                    isPlacingHotspot 
                      ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' 
                      : 'bg-white text-black border-transparent hover:bg-emerald-400'
                  }`}
                >
                  {isPlacingHotspot ? 'Select Placement Point...' : '+ Pin Hotspot (Hand Placement)'}
                </button>

                {isPlacingHotspot && (
                  <p className="text-[7px] text-emerald-400 font-bold uppercase text-center tracking-widest">
                    <i className="fa-solid fa-mouse-pointer mr-1"></i> Click model to anchor
                  </p>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pt-2">
                  {hotspots.map(h => (
                    <div key={h.id} className="p-3 bg-white/5 rounded-xl space-y-2 group border border-white/5">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            <input 
                              value={h.label} 
                              onChange={e => startTransition(() => updateHotspot(h.id, { label: e.target.value }))} 
                              className="bg-transparent text-[9px] font-bold text-white outline-none w-full border-b border-transparent focus:border-white/20"
                            />
                         </div>
                        <button onClick={() => startTransition(() => removeHotspot(h.id))} className="text-red-500/30 hover:text-red-500 transition-all pl-2">
                          <i className="fa-solid fa-trash text-[8px]"></i>
                        </button>
                      </div>
                      <textarea 
                        value={h.content} 
                        onChange={e => startTransition(() => updateHotspot(h.id, { content: e.target.value }))} 
                        className="bg-transparent w-full text-[8px] text-gray-500 h-12 resize-none outline-none"
                        placeholder="Detail content..."
                      />
                      <div className="flex justify-between items-center text-[7px] font-mono text-white/10 uppercase tracking-tighter">
                        <span>Side: {h.side}</span>
                        <span>Attached: {(h.visibleAt * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                  {hotspots.length === 0 && !isPlacingHotspot && <div className="text-center py-4 text-[9px] text-gray-600 italic">No spatial pins yet.</div>}
                </div>
              </section>

              <section className="space-y-3 pt-6 border-t border-white/5">
                <h4 className="text-[9px] uppercase font-black text-white/40 tracking-widest">Atmospheric FX</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex justify-between text-[9px] uppercase font-bold">Fog <span>{config.fogDensity.toFixed(3)}</span></label>
                    <input type="range" min="0" max="0.1" step="0.005" value={config.fogDensity} onChange={e => setConfig({ fogDensity: parseFloat(e.target.value) })} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex justify-between text-[9px] uppercase font-bold">Bloom <span>{config.bloomIntensity.toFixed(1)}</span></label>
                    <input type="range" min="0" max="5" step="0.1" value={config.bloomIntensity} onChange={e => setConfig({ bloomIntensity: parseFloat(e.target.value) })} className="w-full" />
                  </div>
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
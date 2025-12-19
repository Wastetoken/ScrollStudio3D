import React, { useRef, useState } from 'react';
import { useStore } from '../../useStore';
import { ProjectSchema, Vector3Array } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    config, 
    setConfig, 
    keyframes, 
    removeKeyframe, 
    mode, 
    setMode, 
    currentProgress, 
    modelUrl, 
    loadProject, 
    reset,
    sections,
    addSection,
    removeSection,
    updateSection
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'scene' | 'story'>('scene');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!modelUrl) return null;

  const exportProject = () => {
    const project = { version: "1.2.0", config, keyframes, sections, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scrollstudio-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as ProjectSchema;
        loadProject(json);
      } catch (err) { alert('Invalid project file format.'); }
    };
    reader.readAsText(file);
  };

  const handleAddSection = () => {
    addSection({
      id: Math.random().toString(36).substring(2, 9),
      progress: currentProgress,
      title: 'New Narrative Point',
      description: 'Describe what the viewer is seeing at this specific camera angle.'
    });
  };

  return (
    <div className="fixed left-6 top-6 bottom-32 w-80 z-40 flex flex-col gap-4 pointer-events-none">
      {/* Mode Switcher */}
      <div className="glass-panel p-2 rounded-xl flex pointer-events-auto shadow-2xl">
        <button
          onClick={() => setMode('edit')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
            mode === 'edit' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Design
        </button>
        <button
          onClick={() => setMode('preview')}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
            mode === 'preview' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-play mr-2"></i> Preview
        </button>
      </div>

      {/* Main Controls */}
      <div className="glass-panel p-6 rounded-2xl flex-shrink-0 pointer-events-auto shadow-2xl flex flex-col max-h-[75vh]">
        <div className="flex border-b border-white/10 mb-6">
          <button 
            onClick={() => setActiveTab('scene')}
            className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'scene' ? 'border-white text-white' : 'border-transparent text-gray-500'}`}
          >
            Scene
          </button>
          <button 
            onClick={() => setActiveTab('story')}
            className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'story' ? 'border-white text-white' : 'border-transparent text-gray-500'}`}
          >
            Story
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
          {activeTab === 'scene' ? (
            <div className="space-y-8 pb-4">
              <section className="space-y-4">
                <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Environment</h4>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-white">Grid Floor</label>
                  <button onClick={() => setConfig({ showFloor: !config.showFloor })} className={`px-3 py-1 rounded-full text-[9px] font-black border transition-all ${config.showFloor ? 'bg-white text-black border-white' : 'text-gray-500 border-white/10'}`}>
                    {config.showFloor ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-400"><span>Ambient Light</span><span>{config.ambientIntensity.toFixed(1)}</span></div>
                  <input type="range" min="0" max="2" step="0.1" value={config.ambientIntensity} onChange={(e) => setConfig({ ambientIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>
              </section>

              <section className="space-y-4 border-t border-white/5 pt-6">
                <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Model Config</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-400"><span>Scale</span><span>{config.modelScale.toFixed(1)}</span></div>
                  <input type="range" min="0.1" max="5" step="0.1" value={config.modelScale} onChange={(e) => setConfig({ modelScale: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                   {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="space-y-1">
                        <span className="text-[8px] text-gray-500 uppercase">Rot {axis}</span>
                        <input 
                          type="number" 
                          step="0.1"
                          value={config.modelRotation[i].toFixed(1)}
                          onChange={(e) => {
                            const newRot = [...config.modelRotation] as Vector3Array;
                            newRot[i] = parseFloat(e.target.value) || 0;
                            setConfig({ modelRotation: newRot });
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded p-1 text-[10px] text-white outline-none focus:border-white/30"
                        />
                      </div>
                   ))}
                </div>
              </section>

              <section className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Path Keyframes</h4>
                  <span className="text-[10px] text-white/40">{keyframes.length} Captured</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
                  {keyframes.length === 0 && <p className="text-[9px] text-gray-600 italic">No keyframes yet. Use "Capture" below.</p>}
                  {keyframes.map((kf) => (
                    <div key={kf.id} className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 flex items-center justify-between group transition-colors">
                      <span className="text-[10px] font-mono text-white/80">{(kf.progress * 100).toFixed(0)}%</span>
                      <button onClick={() => removeKeyframe(kf.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all p-1">
                        <i className="fa-solid fa-trash-can text-[9px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <button 
                onClick={handleAddSection}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all mb-4 text-white"
              >
                + Create Story Beat
              </button>
              
              <div className="space-y-4">
                {sections.length === 0 && <p className="text-[10px] text-gray-600 text-center py-4">Add your first story section to see overlays in preview mode.</p>}
                {sections.map((section) => (
                  <div key={section.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 space-y-3 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-emerald-400">POS: {(section.progress * 100).toFixed(0)}%</span>
                      <button onClick={() => removeSection(section.id)} className="text-gray-600 hover:text-red-500 p-1"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                    </div>
                    <input 
                      className="w-full bg-transparent border-b border-white/5 text-xs font-bold text-white focus:border-white outline-none pb-1 placeholder:text-gray-700"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      placeholder="Title of this scene..."
                    />
                    <textarea 
                      className="w-full bg-transparent text-[10px] text-gray-400 focus:text-white outline-none resize-none no-scrollbar h-20 leading-relaxed placeholder:text-gray-700"
                      value={section.description}
                      onChange={(e) => updateSection(section.id, { description: e.target.value })}
                      placeholder="Contextual story text..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-2 mt-auto">
          <button onClick={() => fileInputRef.current?.click()} className="py-2 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 text-gray-300 border border-white/5">Import</button>
          <button onClick={exportProject} className="py-2 bg-white rounded-lg text-[9px] font-black uppercase tracking-widest text-black hover:bg-gray-200 shadow-xl">Export</button>
          <button onClick={reset} className="col-span-2 py-2 text-[8px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors">Wipe Project</button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
      </div>
    </div>
  );
};
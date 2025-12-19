import React, { useRef, useState } from 'react';
import { useStore } from '../../useStore';
import { ProjectSchema, Vector3Array } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    config, 
    setConfig, 
    keyframes, 
    addKeyframe,
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
    updateSection,
    cameraPosition,
    cameraTarget
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'scene' | 'story'>('story');
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
    const sectionId = Math.random().toString(36).substring(2, 9);
    
    // 1. Add the narrative section
    addSection({
      id: sectionId,
      progress: currentProgress,
      title: 'New Chapter',
      description: 'Describe the focus of this viewpoint.'
    });

    // 2. Automatically capture the keyframe for this progress
    addKeyframe({
      id: `kf-${sectionId}`,
      progress: currentProgress,
      position: [...cameraPosition],
      target: [...cameraTarget],
      rotation: [...config.modelRotation]
    });
  };

  return (
    <div className="fixed left-6 top-6 bottom-32 w-80 z-40 flex flex-col gap-4 pointer-events-none">
      {/* Mode Switcher */}
      <div className="glass-panel p-2 rounded-xl flex pointer-events-auto shadow-2xl border-white/5">
        <button
          onClick={() => setMode('edit')}
          className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            mode === 'edit' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMode('preview')}
          className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            mode === 'preview' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          Showcase
        </button>
      </div>

      {/* Main Controls */}
      <div className="glass-panel p-6 rounded-2xl flex-shrink-0 pointer-events-auto shadow-2xl flex flex-col max-h-[75vh] border-white/5">
        <div className="flex border-b border-white/5 mb-6">
          <button 
            onClick={() => setActiveTab('story')}
            className={`flex-1 pb-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'story' ? 'border-white text-white' : 'border-transparent text-gray-600'}`}
          >
            Narrative
          </button>
          <button 
            onClick={() => setActiveTab('scene')}
            className={`flex-1 pb-3 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'scene' ? 'border-white text-white' : 'border-transparent text-gray-600'}`}
          >
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
          {activeTab === 'scene' ? (
            <div className="space-y-8 pb-4">
              <section className="space-y-4">
                <h4 className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Live Camera</h4>
                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-[7px] text-white/40 uppercase">Position</div>
                      <div className="text-[9px] font-mono text-white/80">{cameraPosition.map(p => p.toFixed(1)).join(', ')}</div>
                   </div>
                   <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-[7px] text-white/40 uppercase">Target</div>
                      <div className="text-[9px] font-mono text-white/80">{cameraTarget.map(p => p.toFixed(1)).join(', ')}</div>
                   </div>
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Environment</h4>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-white/80">Floor Grid</label>
                  <button onClick={() => setConfig({ showFloor: !config.showFloor })} className={`px-2 py-1 rounded text-[8px] font-black border transition-all ${config.showFloor ? 'bg-white text-black border-white' : 'text-gray-500 border-white/10'}`}>
                    {config.showFloor ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] text-gray-500 uppercase"><span>Ambient</span><span>{config.ambientIntensity.toFixed(1)}</span></div>
                  <input type="range" min="0" max="2" step="0.1" value={config.ambientIntensity} onChange={(e) => setConfig({ ambientIntensity: parseFloat(e.target.value) })} className="w-full" />
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Model</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] text-gray-500 uppercase"><span>Scale</span><span>{config.modelScale.toFixed(1)}</span></div>
                  <input type="range" min="0.1" max="5" step="0.1" value={config.modelScale} onChange={(e) => setConfig({ modelScale: parseFloat(e.target.value) })} className="w-full" />
                </div>
              </section>
              
              <section className="space-y-3 pt-4 border-t border-white/5">
                 <h4 className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Active Timeline</h4>
                 <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
                  {keyframes.map((kf) => (
                    <div key={kf.id} className="p-2 rounded bg-white/5 flex items-center justify-between group">
                      <span className="text-[9px] font-mono text-white/40">K-POS {(kf.progress * 100).toFixed(0)}%</span>
                      <button onClick={() => removeKeyframe(kf.id)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500"><i className="fa-solid fa-trash text-[8px]"></i></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <button 
                onClick={handleAddSection}
                className="w-full py-4 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                + Create Story Beat
              </button>
              
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 space-y-3 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">At {(section.progress * 100).toFixed(0)}%</span>
                      <button onClick={() => removeSection(section.id)} className="text-gray-600 hover:text-red-500"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                    </div>
                    <input 
                      className="w-full bg-transparent border-b border-white/10 text-[11px] font-bold text-white focus:border-white outline-none pb-1"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      placeholder="Title"
                    />
                    <textarea 
                      className="w-full bg-transparent text-[10px] text-gray-500 focus:text-white outline-none resize-none no-scrollbar h-20 leading-relaxed"
                      value={section.description}
                      onChange={(e) => updateSection(section.id, { description: e.target.value })}
                      placeholder="Story description..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-2 mt-auto">
          <button onClick={() => fileInputRef.current?.click()} className="py-2.5 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-white/10 text-white/60">Import</button>
          <button onClick={exportProject} className="py-2.5 bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white hover:bg-white/20">Export</button>
          <button onClick={reset} className="col-span-2 py-2 text-[7px] font-black uppercase tracking-widest text-red-500/30 hover:text-red-500 transition-colors">Reset Session</button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
      </div>
    </div>
  );
};
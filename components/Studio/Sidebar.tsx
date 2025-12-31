import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../useStore';
import { StorySection, FontDefinition } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    chapters, activeChapterId, setActiveChapter,
    mode, setMode, viewMode, setViewMode, currentProgress, setCurrentProgress,
    addChapter, removeChapter, updateChapter, duplicateChapter,
    addSection, removeSection, updateSection,
    removeKeyframe,
    selectedMeshName, setSelectedMesh, updateMaterial, setConfig,
    typography, addFont, removeFont, setIsExporting,
    projectName, author, projectDescription, setProjectInfo,
    isPlacingHotspot, setIsPlacingHotspot, removeHotspot,
    setLandingMode
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'chapters' | 'path' | 'story' | 'material' | 'hotspots' | 'typography' | 'fx' | 'settings'>('chapters');
  const [fontForm, setFontForm] = useState({ name: '', url: '' });
  const [showFontForm, setShowFontForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedMeshName) setActiveTab('material');
  }, [selectedMeshName]);

  const activeChapter = chapters.find(c => c.id === activeChapterId);
  if (!activeChapter) return null;

  const config = activeChapter.environment;
  const activeMaterial = (selectedMeshName) ? activeChapter.materialOverrides[selectedMeshName] || {
    color: '#ffffff', emissive: '#000000', emissiveIntensity: 0, metalness: 0, roughness: 1, wireframe: false
  } : null;

  const handleAddFont = () => {
    if (!fontForm.name || !fontForm.url) return;
    addFont({
      id: Math.random().toString(36).substr(2, 9),
      name: fontForm.name,
      source: 'cdn',
      url: fontForm.url.trim()
    });
    setFontForm({ name: '', url: '' });
    setShowFontForm(false);
  };

  const handleAddChapter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file) + `#.${file.name.split('.').pop()?.toLowerCase() || 'glb'}`;
      addChapter(url, file.name.split('.')[0].toUpperCase());
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddBeat = () => {
    const newBeat: StorySection = {
      id: Math.random().toString(36).substr(2, 9),
      progress: currentProgress,
      title: 'NEW NARRATIVE',
      description: 'Describe this spatial moment...',
      style: {
        titleColor: '#ffffff',
        descriptionColor: '#888888',
        textAlign: 'left',
        fontVariant: 'display',
        theme: 'glass',
        accentColor: '#ffffff',
        layout: 'full',
        letterSpacing: 'normal',
        fontWeight: 'bold',
        textGlow: true,
        borderWeight: 1,
        borderRadius: 30,
        padding: 40,
        backdropBlur: 30,
        entryAnimation: 'fade-up'
      }
    };
    addSection(newBeat);
  };

  return (
    <div className="fixed left-6 top-6 bottom-40 w-80 z-[200] flex flex-col pointer-events-none">
      <div className="glass-panel p-1 rounded-full flex pointer-events-auto shadow-2xl mb-4 border-white/5 shrink-0">
        <button onClick={() => setMode('edit')} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'edit' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}>Studio</button>
        <button onClick={() => setMode('preview')} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'preview' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}>Preview</button>
      </div>
      
      <button 
        onClick={() => setLandingMode(true)} 
        className="glass-panel px-6 py-3 rounded-full pointer-events-auto shadow-2xl mb-4 border-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all shrink-0 text-[10px] font-black uppercase tracking-[0.2em]"
      >
        <i className="fa-solid fa-home mr-2"></i> Home
      </button>

      <div className="glass-panel rounded-[2.5rem] flex-1 pointer-events-auto shadow-2xl flex flex-col min-h-0 border-white/10 overflow-hidden">
        <div className="grid grid-cols-4 gap-0.5 p-2 bg-black/40 border-b border-white/5 shrink-0">
          {[
            { id: 'chapters', icon: 'fa-layer-group' },
            { id: 'path', icon: 'fa-route' },
            { id: 'story', icon: 'fa-book-open' },
            { id: 'material', icon: 'fa-palette' },
            { id: 'hotspots', icon: 'fa-location-dot' },
            { id: 'typography', icon: 'fa-font' },
            { id: 'fx', icon: 'fa-wand-magic-sparkles' },
            { id: 'settings', icon: 'fa-gear' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`p-3 rounded-xl transition-all flex items-center justify-center relative group ${activeTab === tab.id ? 'bg-white/10 text-emerald-400' : 'text-white/20 hover:text-white/40'}`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-12">
          {activeTab === 'fx' && (
            <div className="space-y-6">
              <label className="control-label text-orange-500">Optics & Atmosphere</label>
              <div className="space-y-6 bg-white/5 p-5 rounded-3xl border border-white/5">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-white/40 uppercase">Bloom Intensity <span>{config.bloomIntensity.toFixed(1)}</span></div>
                  <input type="range" min="0" max="10" step="0.1" value={config.bloomIntensity} onChange={e => setConfig({ bloomIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-white/40 uppercase">Chromatic Aberration <span>{config.chromaticAberration.toFixed(4)}</span></div>
                  <input type="range" min="0" max="0.05" step="0.0005" value={config.chromaticAberration} onChange={e => setConfig({ chromaticAberration: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white rounded-full" />
                </div>
                <div className="space-y-2 pt-2 border-t border-white/5">
                   <div className="flex justify-between text-[9px] font-black text-white/40 uppercase">Fog Density <span>{config.fogDensity.toFixed(2)}</span></div>
                   <input type="range" min="0" max="0.5" step="0.01" value={config.fogDensity} onChange={e => setConfig({ fogDensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white rounded-full" />
                   <div className="flex gap-2 pt-2 items-center">
                      <input type="color" value={config.fogColor} onChange={e => setConfig({ fogColor: e.target.value })} className="h-6 w-12 rounded bg-transparent border-none cursor-pointer" />
                      <span className="text-[9px] font-mono text-white/40 uppercase">{config.fogColor}</span>
                   </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[9px] font-black text-white/40 uppercase">VRAM Exposure <span>{config.exposure.toFixed(1)}</span></div>
                  <input type="range" min="0" max="3" step="0.1" value={config.exposure} onChange={e => setConfig({ exposure: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white rounded-full" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'path' && (
            <div className="space-y-6">
              <label className="control-label text-blue-500">Path Interpolation</label>
              <div className="space-y-6 bg-white/5 p-5 rounded-3xl border border-white/5">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-white/40 uppercase">Spline Tension <span>{config.splineAlpha.toFixed(2)}</span></div>
                  <input type="range" min="0" max="1" step="0.01" value={config.splineAlpha} onChange={e => setConfig({ splineAlpha: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white rounded-full" />
                  <p className="text-[8px] text-white/20 uppercase font-bold italic tracking-wider">0: Tight • 0.5: Natural • 1: Sweeping</p>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-[9px] font-black text-white/30 uppercase">Captured Nodes</span>
                  {activeChapter.cameraPath.map(kf => (
                    <div key={kf.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl group border border-white/0 hover:border-white/10">
                      <button onClick={() => setCurrentProgress(kf.progress)} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-white">{(kf.progress * 100).toFixed(0)}% Node</button>
                      <button onClick={() => removeKeyframe(kf.id)} className="text-white/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hotspots' && (
            <div className="space-y-6">
              <label className="control-label text-emerald-500">Spatial Anchors</label>
              <button 
                onClick={() => setIsPlacingHotspot(!isPlacingHotspot)} 
                className={`w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all ${isPlacingHotspot ? 'bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}`}
              >
                <i className={`fa-solid ${isPlacingHotspot ? 'fa-crosshairs' : 'fa-plus'}`}></i>
                {isPlacingHotspot ? 'Tap Model Surface' : 'Place Anchor'}
              </button>
              <div className="space-y-3">
                {activeChapter.spatialAnnotations.map(h => (
                  <div key={h.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-white/40 uppercase">Anchor @ {(h.visibleAt * 100).toFixed(0)}%</span>
                      <button onClick={() => removeHotspot(h.id)} className="text-white/10 hover:text-red-500"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                    </div>
                    <input className="bg-transparent text-[10px] font-bold text-white w-full outline-none mb-1 uppercase" value={h.label} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <label className="control-label text-purple-500">Typography Lab</label>
              {!showFontForm ? (
                <button onClick={() => setShowFontForm(true)} className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-400 transition-all">
                  <i className="fa-solid fa-plus"></i> Import Typeface
                </button>
              ) : (
                <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <input placeholder="FONT NAME" className="bg-black/40 border border-white/10 p-3 rounded-xl text-[10px] w-full text-white outline-none" value={fontForm.name} onChange={e => setFontForm({...fontForm, name: e.target.value})} />
                  <input placeholder="CDN STYLESHEET URL" className="bg-black/40 border border-white/10 p-3 rounded-xl text-[10px] w-full text-white outline-none" value={fontForm.url} onChange={e => setFontForm({...fontForm, url: e.target.value})} />
                  <div className="flex gap-2">
                    <button onClick={handleAddFont} className="flex-1 py-3 bg-emerald-500 text-black text-[10px] font-black rounded-xl uppercase tracking-widest">Save</button>
                    <button onClick={() => setShowFontForm(false)} className="px-4 py-3 bg-white/5 text-white/40 text-[10px] font-black rounded-xl uppercase tracking-widest">Cancel</button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {typography.fonts.map(font => (
                  <div key={font.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{font.name}</span>
                    <button onClick={() => removeFont(font.id)} className="text-white/10 hover:text-red-500 transition-all"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <label className="control-label text-slate-500">Project Configuration</label>
              <div className="space-y-5 bg-white/5 p-5 rounded-3xl border border-white/5">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-white/30 uppercase">Sequence Identifier</span>
                  <input className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-[11px] text-white font-black uppercase outline-none focus:border-emerald-500" value={projectName} onChange={e => setProjectInfo({ projectName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-white/30 uppercase">Creative Director</span>
                  <input className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-[11px] text-white font-black uppercase outline-none focus:border-emerald-500" value={author} onChange={e => setProjectInfo({ author: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-white/30 uppercase">Brief</span>
                  <textarea className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-[11px] text-white/40 outline-none h-24 resize-none" value={projectDescription} onChange={e => setProjectInfo({ projectDescription: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-6">
              <label className="control-label text-emerald-500">Sectors</label>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl">
                <i className="fa-solid fa-plus"></i> New Sector
                <input type="file" ref={fileInputRef} onChange={handleAddChapter} accept=".glb,.gltf" className="hidden" />
              </button>
              <div className="space-y-3">
                {chapters.map((c) => (
                  <div key={c.id} className={`rounded-2xl p-4 border transition-all cursor-pointer group ${activeChapterId === c.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent'}`} onClick={() => setActiveChapter(c.id)}>
                    <div className="flex justify-between items-center">
                      <input value={c.name} onChange={(e) => updateChapter(c.id, { name: e.target.value })} className="bg-transparent border-0 text-[11px] font-bold text-white w-full outline-none" />
                      <button onClick={(e) => { e.stopPropagation(); removeChapter(c.id); }} className="text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'story' && (
            <div className="space-y-6">
              <label className="control-label text-blue-500">Narrative Beats</label>
              <button onClick={handleAddBeat} className="w-full py-4 bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                <i className="fa-solid fa-plus"></i> Add Beat
              </button>
              <div className="space-y-4">
                {activeChapter.narrativeBeats.map(beat => (
                  <div key={beat.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-emerald-400">{(beat.progress * 100).toFixed(0)}% Progress</span>
                      <button onClick={() => removeSection(beat.id)} className="text-white/20 hover:text-red-500 transition-all"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                    </div>
                    <input className="bg-transparent text-[11px] font-bold text-white w-full outline-none" value={beat.title} onChange={e => updateSection(beat.id, { title: e.target.value })} />
                    <textarea className="bg-transparent text-[10px] text-white/40 w-full outline-none h-16 resize-none no-scrollbar" value={beat.description} onChange={e => updateSection(beat.id, { description: e.target.value })} />
                    <select 
                      className="bg-black text-[9px] text-white p-2 rounded-lg border border-white/10 w-full font-black uppercase"
                      value={beat.style.fontFamily || ''}
                      onChange={e => updateSection(beat.id, { style: { ...beat.style, fontFamily: e.target.value }})}
                    >
                      <option value="">Default Font</option>
                      {typography.fonts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'material' && (
            <div className="space-y-8">
              <label className="control-label text-rose-500">Material Engineering</label>
              {!selectedMeshName ? (
                <p className="text-[10px] text-white/20 uppercase font-black text-center py-8">Select a component to edit.</p>
              ) : (
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-[9px] font-black text-white uppercase truncate block max-w-[150px]">{selectedMeshName}</span>
                    <button onClick={() => setSelectedMesh(null)} className="text-white/20 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-white/30 uppercase">Color</span>
                      <input type="color" value={activeMaterial?.color} onChange={e => updateMaterial(selectedMeshName!, { color: e.target.value })} className="w-full h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-white/30 uppercase">Emissive</span>
                      <input type="color" value={activeMaterial?.emissive} onChange={e => updateMaterial(selectedMeshName!, { emissive: e.target.value })} className="w-full h-8 rounded-lg bg-transparent border-none cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-black text-white/30">Roughness <span>{activeMaterial?.roughness.toFixed(2)}</span></div>
                    <input type="range" min="0" max="1" step="0.01" value={activeMaterial?.roughness} onChange={e => updateMaterial(selectedMeshName!, { roughness: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-black text-white/30">Metalness <span>{activeMaterial?.metalness.toFixed(2)}</span></div>
                    <input type="range" min="0" max="1" step="0.01" value={activeMaterial?.metalness} onChange={e => updateMaterial(selectedMeshName!, { metalness: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white rounded-full" />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="pt-10">
             <button onClick={() => setIsExporting(true)} className="w-full py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-blue-500 transition-all">
               <i className="fa-solid fa-cloud-arrow-down mr-2"></i> Compile Project
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
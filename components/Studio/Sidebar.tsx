import React, { useState, useRef } from 'react';
import { useStore } from '../../useStore';
import { FontDefinition } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    chapters, activeChapterId, setActiveChapter,
    mode, setMode, currentProgress, setCurrentProgress,
    addChapter, removeChapter, updateChapter, duplicateChapter, moveChapter, loadProject,
    addSection, removeSection, updateSection,
    projectName, removeKeyframe, updateKeyframe,
    setShowHandbook, selectedMeshName, setSelectedMesh, updateMaterial, setConfig,
    isPlacingHotspot, setIsPlacingHotspot, removeHotspot, updateHotspot,
    setIsExporting, typography, addFont, removeFont
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'chapters' | 'path' | 'story' | 'material' | 'hotspots' | 'scene' | 'project' | 'fonts'>('chapters');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [cdnUrl, setCdnUrl] = useState('');

  const activeChapter = chapters.find(c => c.id === activeChapterId);
  
  const activeMaterial = selectedMeshName && activeChapter ? activeChapter.materialOverrides[selectedMeshName] || {
    color: '#ffffff', emissive: '#000000', emissiveIntensity: 0, metalness: 0, roughness: 1, wireframe: false
  } : null;

  const handleAddChapter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'glb';
      const url = URL.createObjectURL(file) + `#.${extension}`;
      addChapter(url, file.name.split('.')[0].toUpperCase());
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLocalFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        const name = file.name.split('.')[0].replace(/[-_]/g, ' ');
        const id = `font-${Date.now()}`;
        addFont({
          id,
          name,
          source: 'local',
          localPath: `./fonts/${file.name}`,
          data: data, // For builder preview
          weights: [400],
          fallback: 'sans-serif'
        });
      };
      reader.readAsDataURL(file);
      if (fontInputRef.current) fontInputRef.current.value = '';
    }
  };

  const handleAddCdnFont = () => {
    if (!cdnUrl || !cdnUrl.startsWith('http')) return;
    const name = "CDN Font " + (typography.fonts.filter(f => f.source === 'cdn').length + 1);
    addFont({
      id: `cdn-${Date.now()}`,
      name,
      source: 'cdn',
      url: cdnUrl,
      weights: [400, 700],
      fallback: 'sans-serif'
    });
    setCdnUrl('');
  };

  const handleProjectImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const project = JSON.parse(event.target?.result as string);
          loadProject(project);
        } catch (err) {
          alert("Could not load project JSON.");
        }
      };
      reader.readAsText(file);
      if (projectInputRef.current) projectInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed left-6 top-6 bottom-32 w-84 z-[100] flex flex-col gap-4 pointer-events-none">
      <div className="glass-panel p-1.5 rounded-[2rem] flex pointer-events-auto shadow-2xl border-white/5">
        <button onClick={() => setMode('edit')} className={`flex-1 py-3.5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'edit' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>Builder</button>
        <button onClick={() => setMode('preview')} className={`flex-1 py-3.5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'preview' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}>Experience</button>
      </div>

      <div className="glass-panel p-6 rounded-[2.5rem] flex-shrink-0 pointer-events-auto shadow-2xl flex flex-col max-h-[85vh] border-white/10 overflow-hidden">
        <div className="flex border-b border-white/5 mb-6 shrink-0 no-scrollbar overflow-x-auto">
          {[
            { id: 'chapters', icon: 'fa-layer-group', label: 'Scenes' },
            { id: 'path', icon: 'fa-route', label: 'Path' },
            { id: 'story', icon: 'fa-book-open', label: 'Story' },
            { id: 'fonts', icon: 'fa-font', label: 'Font' },
            { id: 'material', icon: 'fa-palette', label: 'Mat' },
            { id: 'hotspots', icon: 'fa-location-dot', label: 'Pins' },
            { id: 'scene', icon: 'fa-wand-magic-sparkles', label: 'Env' },
            { id: 'project', icon: 'fa-gear', label: 'Proj' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setExpandedId(null); }} className={`flex-1 pb-4 text-[9px] font-black uppercase tracking-[0.15em] border-b-2 transition-all px-2 flex flex-col items-center gap-1.5 ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-white/20 hover:text-white/40'}`}>
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-6">
          {activeTab === 'chapters' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-white text-black text-[10px] font-black uppercase rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
              >
                <i className="fa-solid fa-plus text-xs"></i> New Scene
                <input type="file" ref={fileInputRef} onChange={handleAddChapter} accept=".glb,.gltf" className="hidden" />
              </button>

              <div className="space-y-3">
                {chapters.map((c, idx) => (
                  <div 
                    key={c.id} 
                    className={`rounded-2xl p-4 border transition-all cursor-pointer ${activeChapterId === c.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                    onClick={() => setActiveChapter(c.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Scene {idx + 1}</span>
                       <div className="flex gap-3">
                          <button onClick={(e) => { e.stopPropagation(); moveChapter(c.id, 'up'); }} className="text-white/20 hover:text-white" title="Move Up"><i className="fa-solid fa-chevron-up text-[8px]"></i></button>
                          <button onClick={(e) => { e.stopPropagation(); moveChapter(c.id, 'down'); }} className="text-white/20 hover:text-white" title="Move Down"><i className="fa-solid fa-chevron-down text-[8px]"></i></button>
                          <button onClick={(e) => { e.stopPropagation(); duplicateChapter(c.id); }} className="text-white/20 hover:text-emerald-400" title="Duplicate"><i className="fa-solid fa-copy text-[8px]"></i></button>
                          <button onClick={(e) => { e.stopPropagation(); removeChapter(c.id); }} className="text-white/20 hover:text-red-500" title="Delete"><i className="fa-solid fa-trash-can text-[8px]"></i></button>
                       </div>
                    </div>
                    <input 
                      value={c.name} 
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateChapter(c.id, { name: e.target.value })}
                      className="bg-transparent border-0 text-[11px] font-bold text-white w-full outline-none mb-1" 
                    />
                    
                    {activeChapterId === c.id && (
                      <div className="mb-3 space-y-1">
                        <label className="text-[7px] uppercase font-black text-white/20 tracking-widest">Remote Asset URL (for Export)</label>
                        <input 
                          value={c.modelUrl.startsWith('blob:') ? '' : c.modelUrl}
                          placeholder="https://your-cdn.com/model.glb"
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateChapter(c.id, { modelUrl: e.target.value })}
                          className="bg-black/40 border border-white/5 w-full p-2 rounded-lg text-[9px] text-white/60 outline-none font-mono"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white/40" 
                          style={{ 
                            marginLeft: `${c.startProgress * 100}%`, 
                            width: `${(c.endProgress - c.startProgress) * 100}%` 
                          }} 
                        />
                      </div>
                      <span className="text-[8px] font-mono text-white/20">{(c.startProgress * 100).toFixed(0)}-{(c.endProgress * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => useStore.getState().autoDistributeChapters()} className="w-full py-3 bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase rounded-xl hover:text-white transition-all">Equalize Project Timeline</button>
            </div>
          )}

          {activeTab === 'path' && activeChapter && (
            <div className="space-y-4 animate-in fade-in duration-300">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[9px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                  Use the camera icon on the timeline below to capture new path keyframes for this scene.
               </div>
               
               {activeChapter.cameraPath.length === 0 ? (
                 <div className="py-12 text-center opacity-20 text-[9px] uppercase font-black tracking-widest italic">No keyframes defined</div>
               ) : (
                 <div className="space-y-2">
                   {activeChapter.cameraPath.map((kf, i) => (
                     <div key={kf.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer" onClick={() => setCurrentProgress(kf.progress)}>
                        <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[8px] font-mono text-white/60">{i+1}</div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-white/80">POS_{(kf.progress * 100).toFixed(0)}%</span>
                              <div className="flex gap-2 text-[8px] text-white/20 font-mono">
                                <span>FOV: {kf.fov.toFixed(0)}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); removeKeyframe(kf.id); }} className="text-white/20 hover:text-red-500"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}

               <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-black text-white/30 tracking-widest">Spline Smoothness <span>{activeChapter.environment.splineAlpha.toFixed(2)}</span></div>
                    <input type="range" min="0" max="1" step="0.01" value={activeChapter.environment.splineAlpha} onChange={e => setConfig({ splineAlpha: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-black text-white/30 tracking-widest">Default FOV <span>{activeChapter.environment.defaultFov}</span></div>
                    <input type="range" min="5" max="120" step="1" value={activeChapter.environment.defaultFov} onChange={e => setConfig({ defaultFov: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'story' && activeChapter && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <button onClick={() => addSection({
                id: Date.now().toString(),
                progress: currentProgress,
                title: 'NEW STORY BEAT',
                description: 'Enter your narrative copy...',
                style: {
                  titleColor: '#ffffff', descriptionColor: '#9ca3af', textAlign: 'center', fontVariant: 'display',
                  theme: 'glass', accentColor: '#ffffff', layout: 'full', letterSpacing: 'normal', fontWeight: 'black',
                  textGlow: true, borderWeight: 1, borderRadius: 30, padding: 40, backdropBlur: 30, entryAnimation: 'fade-up'
                }
              })} className="w-full py-4 bg-white text-black text-[10px] font-black uppercase rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg">
                <i className="fa-solid fa-plus text-xs"></i> Add Narrative Beat
              </button>
              
              {activeChapter.narrativeBeats.map(s => (
                <div key={s.id} className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80 truncate">{s.title}</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/30 shrink-0">{(s.progress * 100).toFixed(0)}%</span>
                  </div>
                  
                  {expandedId === s.id && (
                    <div className="space-y-6 pt-4 border-t border-white/5 animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-black text-white/30 tracking-widest">Headline</label>
                        <input value={s.title} onChange={e => updateSection(s.id, { title: e.target.value })} className="bg-black/40 border border-white/10 w-full p-2.5 rounded-xl text-[10px] text-white outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-black text-white/30 tracking-widest">Body Copy</label>
                        <textarea value={s.description} onChange={e => updateSection(s.id, { description: e.target.value })} className="bg-black/40 border border-white/10 w-full p-2.5 rounded-xl text-[10px] text-white h-24 resize-none outline-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                           <label className="text-[8px] uppercase font-black text-white/30 tracking-widest">Typeface</label>
                           <select 
                            value={s.style.fontFamily || s.style.fontVariant} 
                            onChange={e => {
                              const val = e.target.value;
                              const isCustom = typography.fonts.some(f => f.id === val);
                              if (isCustom) {
                                updateSection(s.id, { style: { ...s.style, fontFamily: val } });
                              } else {
                                updateSection(s.id, { style: { ...s.style, fontVariant: val as any, fontFamily: undefined } });
                              }
                            }} 
                            className="bg-black/40 border border-white/10 w-full p-2 rounded-lg text-[9px] text-white outline-none"
                           >
                             <optgroup label="System Styles">
                               <option value="display">Display</option><option value="serif">Serif</option><option value="sans">Sans</option><option value="mono">Mono</option><option value="brutalist">Brutalist</option>
                             </optgroup>
                             {typography.fonts.length > 0 && (
                               <optgroup label="Custom Fonts">
                                 {typography.fonts.map(f => (
                                   <option key={f.id} value={f.id}>{f.name}</option>
                                 ))}
                               </optgroup>
                             )}
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[8px] uppercase font-black text-white/30 tracking-widest">Box Style</label>
                           <select value={s.style.theme} onChange={e => updateSection(s.id, { style: { ...s.style, theme: e.target.value as any } })} className="bg-black/40 border border-white/10 w-full p-2 rounded-lg text-[9px] text-white outline-none">
                             <option value="none">None (Text Only)</option><option value="glass">Glass Panel</option><option value="solid">Solid Background</option><option value="outline">Outline Only</option>
                           </select>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                           <label className="text-[8px] uppercase font-black text-white/30 tracking-widest">Entry FX</label>
                           <select value={s.style.entryAnimation} onChange={e => updateSection(s.id, { style: { ...s.style, entryAnimation: e.target.value as any } })} className="bg-black/40 border border-white/10 w-full p-2 rounded-lg text-[9px] text-white outline-none">
                             <option value="fade-up">Fade Up</option><option value="reveal">Reveal (Clip)</option><option value="zoom">Zoom Out</option><option value="slide-left">Slide Left</option>
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[8px] uppercase font-black text-white/30 tracking-widest">Layout</label>
                           <select value={s.style.layout} onChange={e => updateSection(s.id, { style: { ...s.style, layout: e.target.value as any } })} className="bg-black/40 border border-white/10 w-full p-2 rounded-lg text-[9px] text-white outline-none">
                             <option value="full">Full Screen</option><option value="split">Split Side</option><option value="floating">Floating</option>
                           </select>
                         </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[7px] uppercase font-black text-white/30 tracking-widest">Radius <span>{s.style.borderRadius}px</span></div>
                          <input type="range" min="0" max="100" step="1" value={s.style.borderRadius} onChange={e => updateSection(s.id, { style: { ...s.style, borderRadius: parseInt(e.target.value) } })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[7px] uppercase font-black text-white/30 tracking-widest">Border <span>{s.style.borderWeight}px</span></div>
                          <input type="range" min="0" max="10" step="1" value={s.style.borderWeight} onChange={e => updateSection(s.id, { style: { ...s.style, borderWeight: parseInt(e.target.value) } })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-black text-white/30 tracking-widest">Title Color</label>
                          <input type="color" value={s.style.titleColor} onChange={e => updateSection(s.id, { style: { ...s.style, titleColor: e.target.value } })} className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-black text-white/30 tracking-widest">Accent/Box</label>
                          <input type="color" value={s.style.accentColor} onChange={e => updateSection(s.id, { style: { ...s.style, accentColor: e.target.value } })} className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden" />
                        </div>
                      </div>

                      <button onClick={() => removeSection(s.id)} className="w-full py-2.5 text-red-500 bg-red-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Remove Beat</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                 <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Add Typography</h5>
                 <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => fontInputRef.current?.click()}
                      className="w-full py-4 bg-white text-black text-[10px] font-black uppercase rounded-[1.2rem] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      <i className="fa-solid fa-file-arrow-up text-xs"></i> Upload Local (.woff2)
                      <input type="file" ref={fontInputRef} onChange={handleLocalFontUpload} accept=".woff2,.woff,.ttf" className="hidden" />
                    </button>
                    
                    <div className="flex gap-2">
                       <input 
                        value={cdnUrl} 
                        onChange={e => setCdnUrl(e.target.value)}
                        placeholder="Google Fonts CSS URL..." 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-[10px] text-white outline-none"
                       />
                       <button 
                        onClick={handleAddCdnFont}
                        className="px-4 py-3 bg-white/10 hover:bg-white hover:text-black rounded-xl text-[10px] font-black transition-all"
                       >
                         Add
                       </button>
                    </div>
                 </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                 <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Fonts</h5>
                 {typography.fonts.length === 0 ? (
                   <div className="py-12 text-center opacity-20 text-[9px] uppercase font-black tracking-widest italic">No custom fonts added</div>
                 ) : (
                   <div className="space-y-2">
                     {typography.fonts.map(font => (
                       <div key={font.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                         <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-white" style={{ fontFamily: font.name }}>{font.name}</span>
                            <span className="text-[8px] uppercase font-black text-white/20 tracking-widest">{font.source} • {font.source === 'cdn' ? 'CDN' : 'Local'}</span>
                         </div>
                         <button 
                          onClick={() => removeFont(font.id)}
                          className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"
                         >
                           <i className="fa-solid fa-trash-can text-xs"></i>
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'material' && (
            <div className="space-y-6 animate-in fade-in">
              {selectedMeshName ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2 flex-1 mr-4">
                      <h5 className="text-[9px] uppercase font-black text-white/30 tracking-widest">Selected Mesh</h5>
                      <p className="text-[10px] text-white font-mono truncate bg-white/5 p-3 rounded-xl border border-white/5">{selectedMeshName}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedMesh(null)}
                      className="h-10 px-4 bg-white border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-black hover:bg-gray-100 transition-all"
                    >
                      Deselect
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <span className="text-[8px] uppercase font-black text-white/20">Base Color</span>
                       <input type="color" value={activeMaterial?.color} onChange={e => updateMaterial(selectedMeshName!, { color: e.target.value })} className="w-full h-10 bg-transparent cursor-pointer rounded-xl overflow-hidden border-0" />
                    </div>
                    <div className="space-y-2">
                       <span className="text-[8px] uppercase font-black text-white/20">Emissive</span>
                       <input type="color" value={activeMaterial?.emissive} onChange={e => updateMaterial(selectedMeshName!, { emissive: e.target.value })} className="w-full h-10 bg-transparent cursor-pointer rounded-xl overflow-hidden border-0" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] uppercase font-black text-white/40 tracking-widest">Emissive Intensity <span className="text-white">{activeMaterial?.emissiveIntensity}</span></div>
                      <input type="range" min="0" max="100" step="1" value={activeMaterial?.emissiveIntensity} onChange={e => updateMaterial(selectedMeshName!, { emissiveIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] uppercase font-black text-white/40 tracking-widest">Metalness <span className="text-white">{activeMaterial?.metalness.toFixed(2)}</span></div>
                      <input type="range" min="0" max="1" step="0.01" value={activeMaterial?.metalness} onChange={e => updateMaterial(selectedMeshName!, { metalness: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] uppercase font-black text-white/40 tracking-widest">Roughness <span className="text-white">{activeMaterial?.roughness.toFixed(2)}</span></div>
                      <input type="range" min="0" max="1" step="0.01" value={activeMaterial?.roughness} onChange={e => updateMaterial(selectedMeshName!, { roughness: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.2em] italic leading-relaxed">Click geometry in<br/>the viewport to<br/>edit materials</div>
              )}
            </div>
          )}

          {activeTab === 'hotspots' && activeChapter && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <button 
                onClick={() => setIsPlacingHotspot(!isPlacingHotspot)} 
                className={`w-full py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isPlacingHotspot ? 'bg-white text-black animate-pulse shadow-[0_0_20px_white]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
              >
                <i className={`fa-solid ${isPlacingHotspot ? 'fa-crosshairs' : 'fa-location-dot'} text-xs`}></i>
                {isPlacingHotspot ? 'Click Surface' : 'Pin Hotspot'}
              </button>
              
              {activeChapter.spatialAnnotations.map(h => (
                <div key={h.id} className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 truncate">{h.label}</span>
                    <span className="text-[9px] font-mono text-white/30">{(h.visibleAt * 100).toFixed(0)}%</span>
                  </div>
                  {expandedId === h.id && (
                    <div className="space-y-3 pt-4 border-t border-white/5 animate-in fade-in">
                      <input value={h.label} onChange={e => updateHotspot(h.id, { label: e.target.value })} className="bg-black/40 border border-white/10 w-full p-2.5 rounded-xl text-[10px] text-white" />
                      <textarea value={h.content} onChange={e => updateHotspot(h.id, { content: e.target.value })} className="bg-black/40 border border-white/10 w-full p-2.5 rounded-xl text-[10px] text-white h-20 resize-none" />
                      <button onClick={() => removeHotspot(h.id)} className="w-full py-2 text-red-500 bg-red-500/10 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">Delete Pin</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scene' && activeChapter && (
            <div className="space-y-8 animate-in fade-in duration-300 pb-10">
              {/* Environment Basics */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-white/30 tracking-widest">Environment Mood</label>
                  <select value={activeChapter.environment.envPreset} onChange={e => setConfig({ envPreset: e.target.value as any })} className="bg-white/5 border border-white/10 w-full p-3.5 rounded-2xl text-[11px] uppercase font-black text-white outline-none">
                    <option value="studio">Clean Studio</option><option value="city">Urban Core</option><option value="night">Deep Space</option><option value="sunset">Golden Hour</option><option value="forest">Natural</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] uppercase font-black text-white/30 tracking-widest">Tone Exposure <span>{activeChapter.environment.exposure.toFixed(2)}</span></div>
                  <input type="range" min="0.1" max="5" step="0.1" value={activeChapter.environment.exposure} onChange={e => setConfig({ exposure: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                </div>
              </div>

              {/* Lighting */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <h6 className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Direct Lighting</h6>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-black text-white/30 tracking-widest">Ambient Light <span>{activeChapter.environment.ambientIntensity.toFixed(2)}</span></div>
                    <input type="range" min="0" max="5" step="0.05" value={activeChapter.environment.ambientIntensity} onChange={e => setConfig({ ambientIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-black text-white/30 tracking-widest">Sun Intensity <span>{activeChapter.environment.directionalIntensity.toFixed(2)}</span></div>
                    <input type="range" min="0" max="10" step="0.1" value={activeChapter.environment.directionalIntensity} onChange={e => setConfig({ directionalIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Atmosphere & FX */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <h6 className="text-[9px] font-black uppercase tracking-widest text-blue-400">Atmosphere & FX</h6>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-black text-white/30 tracking-widest">Fog Density <span>{activeChapter.environment.fogDensity.toFixed(3)}</span></div>
                    <input type="range" min="0" max="0.5" step="0.005" value={activeChapter.environment.fogDensity} onChange={e => setConfig({ fogDensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-black text-white/30 tracking-widest">Bloom Intensity <span>{activeChapter.environment.bloomIntensity.toFixed(1)}</span></div>
                    <input type="range" min="0" max="10" step="0.1" value={activeChapter.environment.bloomIntensity} onChange={e => setConfig({ bloomIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 appearance-none accent-white cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="space-y-2">
                   <span className="text-[8px] uppercase font-black text-white/20 tracking-widest">BG Color / Fog Color</span>
                   <input type="color" value={activeChapter.environment.backgroundColor} onChange={e => setConfig({ backgroundColor: e.target.value, fogColor: e.target.value })} className="w-full h-10 bg-transparent cursor-pointer rounded-xl overflow-hidden border-0" />
                </div>
                <button onClick={() => setConfig({ showFloor: !activeChapter.environment.showFloor })} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${activeChapter.environment.showFloor ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                  {activeChapter.environment.showFloor ? 'Hide Ground Reflector' : 'Show Ground Reflector'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'project' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                <div className="space-y-2">
                  <span className="text-[8px] uppercase font-black text-white/20 tracking-widest">Project Title</span>
                  <input value={projectName} className="bg-black/20 border border-white/5 w-full p-3 text-[11px] text-white outline-none rounded-xl" onChange={e => useStore.getState().setProjectInfo({ projectName: e.target.value })} />
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setIsExporting(true)}
                  className="w-full py-4 bg-emerald-500 text-black text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-code text-xs"></i>
                  Export Component
                </button>

                <button 
                  onClick={() => {
                    const data = { manifest: { projectName, author: 'DESIGN_OPERATOR_01', lastModified: new Date().toISOString() }, chapters, typography };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${projectName.toLowerCase()}.json`; a.click();
                  }} 
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                >
                  Download Project JSON
                </button>

                <button 
                  onClick={() => projectInputRef.current?.click()}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
                >
                  Restore From JSON
                  <input 
                    ref={projectInputRef}
                    type="file" 
                    accept=".json" 
                    onChange={handleProjectImport} 
                    className="hidden" 
                  />
                </button>
              </div>

              <button onClick={() => setShowHandbook(true)} className="w-full py-3 text-[9px] font-black uppercase tracking-widest text-white/10 hover:text-white transition-colors underline underline-offset-4">Read Documentation</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
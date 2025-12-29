import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../useStore';
import { StorySection } from '../../types';

export const ImprovedSidebar: React.FC = () => {
  const { 
    chapters, activeChapterId, setActiveChapter,
    mode, setMode, currentProgress, setCurrentProgress,
    addChapter, removeChapter, updateChapter, duplicateChapter,
    addSection, removeSection, updateSection,
    removeKeyframe,
    selectedMeshName, setSelectedMesh, updateMaterial, setConfig,
    addFont, removeFont, setIsExporting, typography,
    projectName, author, projectDescription, setProjectInfo,
    isPlacingHotspot, setIsPlacingHotspot, removeHotspot,
    setLandingMode
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'chapters' | 'camera' | 'story' | 'materials' | 'effects' | 'typography' | 'hotspots' | 'settings'>('chapters');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFontForm, setShowFontForm] = useState(false);
  const [fontForm, setFontForm] = useState({ name: '', url: '' });

  useEffect(() => {
    if (selectedMeshName) setActiveTab('materials');
  }, [selectedMeshName]);

  const activeChapter = chapters.find(c => c.id === activeChapterId);
  if (!activeChapter) return null;

  const config = activeChapter.environment;
  const activeMaterial = selectedMeshName ? activeChapter.materialOverrides[selectedMeshName] || {
    color: '#ffffff', emissive: '#000000', emissiveIntensity: 0, metalness: 0, roughness: 1, wireframe: false
  } : null;

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

  return (
    <div className="fixed left-6 top-6 bottom-40 w-[28rem] z-[200] flex flex-col pointer-events-none gap-4">
      {/* Header Controls */}
      <div className="pointer-events-auto space-y-3">
        {/* Mode Switcher */}
        <div className="glass-panel p-1.5 rounded-2xl flex shadow-2xl border border-white/10">
          <button 
            onClick={() => setMode('edit')} 
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'edit' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-pen-to-square mr-2"></i>Studio
          </button>
          <button 
            onClick={() => setMode('preview')} 
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'preview' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-play mr-2"></i>Preview
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button 
            onClick={() => setLandingMode(true)} 
            className="glass-panel px-4 py-3 rounded-xl shadow-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider flex-1"
          >
            <i className="fa-solid fa-home mr-2"></i>Home
          </button>
          <button 
            onClick={() => setIsExporting(true)} 
            className="glass-panel px-4 py-3 rounded-xl shadow-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider flex-1"
          >
            <i className="fa-solid fa-download mr-2"></i>Export
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="glass-panel rounded-3xl flex-1 pointer-events-auto shadow-2xl flex flex-col min-h-0 border border-white/10 overflow-hidden">
        {/* Tab Navigation - Now with 8 tabs in 2 rows */}
        <div className="grid grid-cols-4 gap-0.5 p-1.5 bg-black/30 shrink-0">
          {[
            { id: 'chapters', icon: 'fa-layer-group', label: 'Scenes' },
            { id: 'camera', icon: 'fa-video', label: 'Camera' },
            { id: 'story', icon: 'fa-book-open', label: 'Story' },
            { id: 'materials', icon: 'fa-droplet', label: 'Materials' },
            { id: 'effects', icon: 'fa-sparkles', label: 'FX' },
            { id: 'typography', icon: 'fa-font', label: 'Fonts' },
            { id: 'hotspots', icon: 'fa-location-dot', label: 'Hotspots' },
            { id: 'settings', icon: 'fa-gear', label: 'Settings' },
          ].map((tab) => {
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`py-3 px-2 rounded-xl transition-all relative group ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <i className={`fa-solid ${tab.icon} text-sm`}></i>
                  <span className="text-[8px] font-bold uppercase tracking-wider">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* CHAPTERS TAB */}
          {activeTab === 'chapters' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Scene Chapters</h3>
                <label htmlFor="add-scene-input" className="cursor-pointer px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                  <i className="fa-solid fa-plus mr-2"></i>Add Scene
                  <input 
                    id="add-scene-input"
                    ref={fileInputRef}
                    type="file" 
                    accept=".glb,.gltf" 
                    onChange={handleAddChapter} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="space-y-3">
                {chapters.map((chapter, idx) => (
                  <div 
                    key={chapter.id}
                    onClick={() => setActiveChapter(chapter.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      chapter.id === activeChapterId
                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          chapter.id === activeChapterId ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-white">{chapter.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateChapter(chapter.id); }}
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all flex items-center justify-center"
                        >
                          <i className="fa-solid fa-copy text-xs"></i>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeChapter(chapter.id); }}
                          className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all flex items-center justify-center"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                      {chapter.cameraPath.length} keyframes • {chapter.narrativeBeats.length} beats
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider mb-4">Camera Path</h3>
                <div className="space-y-4">
                  {activeChapter.cameraPath.map((kf) => (
                    <div key={kf.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{(kf.progress * 100).toFixed(1)}%</span>
                        <button
                          onClick={() => removeKeyframe(kf.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all flex items-center justify-center"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="text-white/40">
                          <div className="uppercase tracking-wider font-bold mb-1">Position</div>
                          <div className="text-white/60 font-mono">
                            {kf.position.map(v => v.toFixed(1)).join(', ')}
                          </div>
                        </div>
                        <div className="text-white/40">
                          <div className="uppercase tracking-wider font-bold mb-1">Target</div>
                          <div className="text-white/60 font-mono">
                            {kf.lookAt.map(v => v.toFixed(1)).join(', ')}
                          </div>
                        </div>
                        <div className="text-white/40">
                          <div className="uppercase tracking-wider font-bold mb-1">FOV</div>
                          <div className="text-white/60 font-mono">{kf.fov}°</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STORY TAB */}
          {activeTab === 'story' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Narrative Beats</h3>
                <button
                  onClick={handleAddBeat}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  <i className="fa-solid fa-plus mr-2"></i>Add Beat
                </button>
              </div>

              <div className="space-y-3">
                {activeChapter.narrativeBeats.map((beat) => (
                  <div key={beat.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <input
                        type="text"
                        value={beat.title}
                        onChange={(e) => updateSection(beat.id, { title: e.target.value })}
                        className="flex-1 bg-transparent text-sm font-bold text-white outline-none"
                        placeholder="Beat Title"
                      />
                      <button
                        onClick={() => removeSection(beat.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all flex items-center justify-center ml-2"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                    <textarea
                      value={beat.description}
                      onChange={(e) => updateSection(beat.id, { description: e.target.value })}
                      className="w-full bg-white/5 text-xs text-white/70 outline-none rounded-xl p-3 border border-white/10 resize-none"
                      rows={3}
                      placeholder="Description..."
                    />
                    <div className="mt-2 text-[10px] text-white/40 uppercase tracking-wider font-bold">
                      @ {(beat.progress * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Material Editor</h3>
              
              {selectedMeshName && activeMaterial ? (
                <div className="space-y-5">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white">{selectedMeshName}</span>
                      <button
                        onClick={() => setSelectedMesh(null)}
                        className="text-white/40 hover:text-white transition-all text-xs"
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Color */}
                      <div>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Base Color</div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={activeMaterial.color}
                            onChange={(e) => updateMaterial(selectedMeshName, { color: e.target.value })}
                            className="h-10 w-20 rounded-xl cursor-pointer border border-white/20"
                          />
                          <span className="text-xs font-mono text-white/60">{activeMaterial.color}</span>
                        </div>
                      </div>

                      {/* Metalness */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                          Metalness <span>{activeMaterial.metalness.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={activeMaterial.metalness}
                          onChange={(e) => updateMaterial(selectedMeshName, { metalness: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-white/10 rounded-full appearance-none accent-emerald-500"
                        />
                      </div>

                      {/* Roughness */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                          Roughness <span>{activeMaterial.roughness.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={activeMaterial.roughness}
                          onChange={(e) => updateMaterial(selectedMeshName, { roughness: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-white/10 rounded-full appearance-none accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-white/40 text-sm">
                  <i className="fa-solid fa-mouse-pointer text-2xl mb-3 block"></i>
                  Click on a 3D object to edit its material
                </div>
              )}
            </div>
          )}

          {/* EFFECTS TAB - Enhanced with all missing controls */}
          {activeTab === 'effects' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Post Processing & Effects</h3>
              
              <div className="space-y-4">
                {/* Bloom */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
                    Bloom Intensity <span className="text-white">{config.bloomIntensity.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={config.bloomIntensity}
                    onChange={(e) => setConfig({ bloomIntensity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none accent-white"
                  />
                </div>

                {/* Chromatic Aberration */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
                    Chromatic Aberration <span className="text-white">{config.chromaticAberration.toFixed(4)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.05"
                    step="0.0005"
                    value={config.chromaticAberration}
                    onChange={(e) => setConfig({ chromaticAberration: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none accent-white"
                  />
                </div>

                {/* Fog */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
                    Fog Density <span className="text-white">{config.fogDensity.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={config.fogDensity}
                    onChange={(e) => setConfig({ fogDensity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none accent-white"
                  />
                  <div className="flex gap-2 items-center mt-3">
                    <input
                      type="color"
                      value={config.fogColor}
                      onChange={(e) => setConfig({ fogColor: e.target.value })}
                      className="h-8 w-16 rounded-lg cursor-pointer border border-white/20"
                    />
                    <span className="text-[10px] font-mono text-white/40">{config.fogColor}</span>
                  </div>
                </div>

                {/* Exposure */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
                    Exposure <span className="text-white">{config.exposure.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={config.exposure}
                    onChange={(e) => setConfig({ exposure: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none accent-white"
                  />
                </div>

                {/* Spline Tension */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
                    Camera Path Tension <span className="text-white">{config.splineAlpha.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={config.splineAlpha}
                    onChange={(e) => setConfig({ splineAlpha: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none accent-white"
                  />
                  <p className="text-[8px] text-white/30 uppercase font-bold italic tracking-wider mt-2">0: Tight • 0.5: Natural • 1: Sweeping</p>
                </div>
              </div>
            </div>
          )}

          {/* TYPOGRAPHY TAB - NEW */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Typography Management</h3>
              
              {!showFontForm ? (
                <button 
                  onClick={() => setShowFontForm(true)} 
                  className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-white/90 transition-all"
                >
                  <i className="fa-solid fa-plus"></i> Import Typeface
                </button>
              ) : (
                <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <input 
                    placeholder="FONT NAME" 
                    className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs w-full text-white outline-none focus:border-white/30 transition-colors" 
                    value={fontForm.name} 
                    onChange={e => setFontForm({...fontForm, name: e.target.value})} 
                  />
                  <input 
                    placeholder="CDN STYLESHEET URL" 
                    className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs w-full text-white outline-none focus:border-white/30 transition-colors" 
                    value={fontForm.url} 
                    onChange={e => setFontForm({...fontForm, url: e.target.value})} 
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddFont} 
                      className="flex-1 py-3 bg-white text-black text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-white/90 transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setShowFontForm(false)} 
                      className="px-4 py-3 bg-white/5 text-white/60 text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {typography.fonts.map(font => (
                  <div 
                    key={font.id} 
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all"
                  >
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{font.name}</span>
                    <button 
                      onClick={() => removeFont(font.id)} 
                      className="text-white/20 hover:text-red-500 transition-all"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOTSPOTS TAB - NEW */}
          {activeTab === 'hotspots' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Spatial Anchors</h3>
              
              <button 
                onClick={() => setIsPlacingHotspot(!isPlacingHotspot)} 
                className={`w-full py-4 text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isPlacingHotspot 
                    ? 'bg-white text-black animate-pulse' 
                    : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                }`}
              >
                <i className={`fa-solid ${isPlacingHotspot ? 'fa-crosshairs' : 'fa-plus'}`}></i>
                {isPlacingHotspot ? 'Click 3D Model Surface' : 'Place Anchor'}
              </button>

              <div className="space-y-3">
                {activeChapter.spatialAnnotations.map(h => (
                  <div 
                    key={h.id} 
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-white/20 transition-all"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Anchor @ {(h.visibleAt * 100).toFixed(0)}%</span>
                      <button 
                        onClick={() => removeHotspot(h.id)} 
                        className="text-white/20 hover:text-red-500 transition-all"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                    <input 
                      className="bg-black/40 border border-white/10 p-2 rounded-xl text-xs font-bold text-white w-full outline-none focus:border-white/30 transition-colors uppercase" 
                      value={h.label}
                      placeholder="Anchor Label"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB - NEW */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Project Configuration</h3>
              
              <div className="space-y-5 p-5 bg-white/5 rounded-3xl border border-white/10">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Project Name</span>
                  <input 
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm text-white font-bold uppercase outline-none focus:border-white/30 transition-colors" 
                    value={projectName} 
                    onChange={e => setProjectInfo({ projectName: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Author</span>
                  <input 
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm text-white font-bold uppercase outline-none focus:border-white/30 transition-colors" 
                    value={author} 
                    onChange={e => setProjectInfo({ author: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Description</span>
                  <textarea 
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white/60 outline-none h-24 resize-none focus:border-white/30 transition-colors" 
                    value={projectDescription} 
                    onChange={e => setProjectInfo({ projectDescription: e.target.value })} 
                  />
                </div>
              </div>

              <button 
                onClick={() => setIsExporting(true)} 
                className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-cloud-arrow-down"></i> Export Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

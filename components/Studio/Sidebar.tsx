import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
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
    cameraPosition,
    setCameraPosition,
    cameraTarget,
    setCameraTarget
  } = useStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!modelUrl) return null;

  const exportProject = () => {
    const project = {
      version: "1.0.0",
      config,
      keyframes,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scrollytelling-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        alert('Project loaded successfully!');
      } catch (err) {
        console.error('Import failed', err);
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleStartOver = () => {
    if (window.confirm('Are you sure you want to start over? This will remove all keyframes and return to the uploader.')) {
      reset();
    }
  };

  const updateModelRotation = (index: number, val: number) => {
    const newRot = [...config.modelRotation] as Vector3Array;
    newRot[index] = val;
    setConfig({ modelRotation: newRot });
  };

  const updateCameraPosUI = (index: number, val: number) => {
    const newPos = [...cameraPosition] as Vector3Array;
    newPos[index] = val;
    setCameraPosition(newPos);
  };

  const updateCameraTargetUI = (index: number, val: number) => {
    const newTarget = [...cameraTarget] as Vector3Array;
    newTarget[index] = val;
    setCameraTarget(newTarget);
  };

  return (
    <div className="fixed left-6 top-6 bottom-32 w-80 z-40 flex flex-col gap-4 pointer-events-none">
      {/* Mode Switcher */}
      <div className="glass-panel p-2 rounded-xl flex pointer-events-auto shadow-2xl">
        <button
          onClick={() => setMode('edit')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
            mode === 'edit' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Edit
        </button>
        <button
          onClick={() => setMode('preview')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
            mode === 'preview' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <i className="fa-solid fa-eye mr-2"></i> Preview
        </button>
      </div>

      {/* Scene Parameters */}
      <div className="glass-panel p-6 rounded-2xl flex-shrink-0 pointer-events-auto shadow-2xl overflow-y-auto no-scrollbar max-h-[60vh]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
            <i className="fa-solid fa-sliders text-xs"></i> Parameters
          </h3>
          <button 
            onClick={handleStartOver}
            className="text-[10px] text-gray-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            <i className="fa-solid fa-rotate-left"></i> Start Over
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Floor Visibility</label>
              <button
                onClick={() => setConfig({ showFloor: !config.showFloor })}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  config.showFloor 
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                    : 'bg-transparent text-gray-500 border-white/10 hover:border-white/20'
                }`}
              >
                {config.showFloor ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auto Orbit</label>
              <button
                onClick={() => setConfig({ autoRotate: !config.autoRotate })}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  config.autoRotate 
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                    : 'bg-transparent text-gray-500 border-white/10 hover:border-white/20'
                }`}
              >
                {config.autoRotate ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Camera View Controls */}
          <div className="border-t border-white/5 pt-6 space-y-6">
            <h4 className="text-[9px] font-bold text-white uppercase tracking-widest opacity-50">Camera Position</h4>
            {['X', 'Y', 'Z'].map((label, i) => (
              <div key={`pos-${label}`} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
                  <span className="text-[10px] font-mono text-white">{cameraPosition[i].toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.1"
                  value={cameraPosition[i]}
                  onChange={(e) => updateCameraPosUI(i, parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-6 space-y-6">
            <h4 className="text-[9px] font-bold text-white uppercase tracking-widest opacity-50">Camera Target</h4>
            {['X', 'Y', 'Z'].map((label, i) => (
              <div key={`target-${label}`} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
                  <span className="text-[10px] font-mono text-white">{cameraTarget[i].toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={cameraTarget[i]}
                  onChange={(e) => updateCameraTargetUI(i, parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-6 space-y-6">
            <h4 className="text-[9px] font-bold text-white uppercase tracking-widest opacity-50">Model Setup</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scale</label>
                <span className="text-[10px] font-mono text-white">{config.modelScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={config.modelScale}
                onChange={(e) => setConfig({ modelScale: parseFloat(e.target.value) })}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div className="space-y-4">
              {['Rot X', 'Rot Y', 'Rot Z'].map((label, i) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
                    <span className="text-[10px] font-mono text-white">{config.modelRotation[i].toFixed(2)}r</span>
                  </div>
                  <input
                    type="range"
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.01}
                    value={config.modelRotation[i]}
                    onChange={(e) => updateModelRotation(i, parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline List Section */}
      <div className="glass-panel p-6 rounded-2xl flex-1 overflow-hidden flex flex-col pointer-events-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Captured Sequence</h3>
          <span className="text-[10px] font-mono text-gray-500">{keyframes.length}</span>
        </div>
        
        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-2">
          {keyframes.length === 0 ? (
            <div className="text-[10px] text-gray-500 text-center py-10 bg-black/40 rounded-xl border border-white/5 border-dashed uppercase tracking-widest leading-loose">
              Timeline is empty.<br/>Capture viewpoints below.
            </div>
          ) : (
            keyframes.map((kf) => (
              <div 
                key={kf.id} 
                className={`p-3 rounded-xl border transition-all flex items-center justify-between group ${
                  Math.abs(currentProgress - kf.progress) < 0.01 
                    ? 'bg-white/20 border-white/50 shadow-lg' 
                    : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-[10px] font-black text-white">POINT AT {(kf.progress * 100).toFixed(0)}%</div>
                  <div className="text-[8px] text-gray-500 font-mono tracking-tighter">
                    {kf.position.map(p => p.toFixed(1)).join(', ')}
                  </div>
                </div>
                <button 
                  onClick={() => removeKeyframe(kf.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-400/10"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
          >
            Import JSON
          </button>
          <button 
            onClick={exportProject}
            className="py-3 bg-white text-black hover:bg-gray-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-[0.98]"
          >
            Export JSON
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleImport} 
        />
      </div>
    </div>
  );
};
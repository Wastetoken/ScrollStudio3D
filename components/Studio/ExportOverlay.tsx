
import React, { useState } from 'react';
import { useStore } from '../../useStore';

export const ExportOverlay: React.FC = () => {
  const { isExporting, setIsExporting, projectName, chapters, author, projectDescription } = useStore();
  const [copied, setCopied] = useState<'json' | 'code' | null>(null);

  if (!isExporting) return null;

  const projectData = {
    manifest: {
      projectName,
      author,
      description: projectDescription,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      engineVersion: "2.5.0",
      license: "MIT"
    },
    chapters: chapters.map(c => ({
      ...c,
      modelUrl: c.modelUrl.startsWith('blob:') ? 'PASTE_REMOTE_ASSET_URL_HERE' : c.modelUrl
    }))
  };

  const usageSnippet = `import { ScrollyEngine } from './ScrollyEngine';
import projectData from './project.json';

export default function App() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <ScrollyEngine data={projectData} />
    </main>
  );
}`;

  const handleCopy = (type: 'json' | 'code') => {
    const text = type === 'json' ? JSON.stringify(projectData, null, 2) : usageSnippet;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setIsExporting(false)} />
      
      <div className="relative w-full max-w-6xl glass-panel rounded-[3.5rem] border-white/20 shadow-[0_0_150px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Production Pipeline</h2>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">Runtime Engine v2.5 • Deployment Ready</p>
          </div>
          <button 
            onClick={() => setIsExporting(false)}
            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all group"
          >
            <i className="fa-solid fa-xmark transition-transform group-hover:rotate-90"></i>
          </button>
        </div>

        <div className="flex-1 p-10 overflow-y-auto no-scrollbar space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-black text-xs">1</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">Data Manifest</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Copy your project configuration. Save this as <code className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">project.json</code> in your project's source folder.
              </p>
              <div className="relative group">
                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 max-h-64 overflow-auto font-mono text-[10px] text-emerald-300/60 no-scrollbar">
                   <pre>{JSON.stringify(projectData, null, 2)}</pre>
                </div>
                <button 
                  onClick={() => handleCopy('json')}
                  className={`absolute top-4 right-4 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied === 'json' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}
                >
                  {copied === 'json' ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-black font-black text-xs">2</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">Implementation</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                Import the <code className="text-white">ScrollyEngine</code> component (located in <code className="text-white">components/Player</code>) and pass your data manifest.
              </p>
              <div className="relative group">
                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 font-mono text-[10px] text-blue-300/60">
                  <pre>{usageSnippet}</pre>
                </div>
                <button 
                  onClick={() => handleCopy('code')}
                  className={`absolute top-4 right-4 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied === 'code' ? 'bg-blue-500 text-black' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}
                >
                  {copied === 'code' ? 'Copied!' : 'Copy Snippet'}
                </button>
              </div>
            </div>

          </div>

          <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6">
            <div className="flex items-center gap-4">
               <i className="fa-solid fa-circle-check text-emerald-400"></i>
               <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Production Checklist</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="text-[10px] font-black text-white/80 uppercase tracking-widest">Dependencies</div>
                <p className="text-[10px] text-white/30 leading-relaxed">Ensure three, @react-three/fiber, @react-three/drei, and @react-three/postprocessing are installed.</p>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-black text-white/80 uppercase tracking-widest">Asset Management</div>
                <p className="text-[10px] text-white/30 leading-relaxed">Replace all <code className="text-emerald-400">blob:</code> URLs with stable CDN links in your JSON.</p>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-black text-white/80 uppercase tracking-widest">Performance</div>
                <p className="text-[10px] text-white/30 leading-relaxed">The engine uses mesh indexing. No manual optimization of the render loop is required.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-black/40 border-t border-white/10 flex justify-center">
           <button onClick={() => setIsExporting(false)} className="px-12 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl">
              Back to Builder
           </button>
        </div>
      </div>
    </div>
  );
};

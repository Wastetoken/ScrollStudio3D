import React, { useState } from 'react';
import { useStore } from '../../useStore';
import JSZip from 'jszip';

export const ExportOverlay: React.FC = () => {
  const { isExporting, setIsExporting, projectName, chapters, author, projectDescription, typography } = useStore();
  const [copied, setCopied] = useState<'json' | 'code' | null>(null);
  const [embedAssets, setEmbedAssets] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isExporting) return null;

  const getProjectData = async (shouldEmbed: boolean) => {
    const embeddedAssets: Record<string, string> = {};

    if (shouldEmbed) {
      setIsProcessing(true);
      for (const chapter of chapters) {
        if (chapter.modelUrl.startsWith('blob:') || chapter.modelUrl.startsWith('http')) {
          try {
            const response = await fetch(chapter.modelUrl);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            embeddedAssets[chapter.id] = base64;
          } catch (e) {
            console.error("Failed to embed asset:", chapter.modelUrl, e);
          }
        }
      }
      setIsProcessing(false);
    }

    return {
      manifest: {
        projectName,
        author,
        description: projectDescription,
        createdAt: new Date().toISOString(),
        engineVersion: "2.6.0"
      },
      typography: {
        fonts: typography.fonts || []
      },
      chapters: chapters.map(c => ({
        ...c,
        modelUrl: c.modelUrl.startsWith('blob:') && !shouldEmbed ? 'PASTE_REMOTE_ASSET_URL_HERE' : c.modelUrl
      })),
      embeddedAssets: shouldEmbed ? embeddedAssets : undefined
    };
  };

  const usageSnippet = `import { ScrollyEngine } from './ScrollyEngine';
import projectData from './project.json';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ScrollyEngine data={projectData} />
    </div>
  );
}`;

  const handleDownloadJson = async () => {
    setIsProcessing(true);
    const data = await getProjectData(embedAssets);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase()}.json`;
    a.click();
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setIsExporting(false)} />
      
      <div className="relative w-full max-w-4xl glass-panel rounded-[3rem] border-white/20 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">Export Pipeline</h2>
            <p className="text-[10px] text-white/40 uppercase font-bold">Project State Serialization</p>
          </div>
          <button onClick={() => setIsExporting(false)} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-emerald-400">Data & Assets</h3>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                <input type="checkbox" id="embed-cb" checked={embedAssets} onChange={e => setEmbedAssets(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                <label htmlFor="embed-cb" className="text-[10px] text-white font-bold uppercase cursor-pointer">Embed Models in JSON (Self-Contained)</label>
              </div>
              <button onClick={handleDownloadJson} disabled={isProcessing} className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-emerald-400 shadow-xl active:scale-95 disabled:opacity-30">
                {isProcessing ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Download Project JSON'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-blue-400">Implementation</h3>
              <div className="bg-black/40 rounded-2xl p-6 font-mono text-[9px] text-blue-300/60 border border-white/5 overflow-x-auto">
                <pre>{usageSnippet}</pre>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(usageSnippet);
                  setCopied('code');
                  setTimeout(() => setCopied(null), 2000);
                }}
                className="w-full py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase rounded-xl hover:bg-white/10 transition-all"
              >
                {copied === 'code' ? 'Copied Snippet!' : 'Copy Implementation Code'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-black/40 border-t border-white/10 flex justify-center">
           <button onClick={() => setIsExporting(false)} className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-all tracking-widest">Return to Studio</button>
        </div>
      </div>
    </div>
  );
};
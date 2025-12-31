import React, { useState } from 'react';
import { useStore } from '../../useStore';
import JSZip from 'jszip';
import { INDEX_HTML_TEMPLATE, README_MD_TEMPLATE, SCROLLY_PIPELINE_JS } from './exportTemplates';

export const ExportOverlay: React.FC = () => {
  const { isExporting, setIsExporting, projectName, chapters, author, projectDescription, typography } = useStore();
  const [copied, setCopied] = useState<'json' | 'code' | null>(null);
  const [embedAssets, setEmbedAssets] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isExporting) return null;

  const getProjectData = async (shouldEmbed: boolean) => {
    const embeddedAssets: Record<string, string> = {};
    const externalAssets: Record<string, Blob> = {};

    setIsProcessing(true);
    for (const chapter of chapters) {
      if (chapter.modelUrl.startsWith('blob:') || chapter.modelUrl.startsWith('http')) {
        try {
          const response = await fetch(chapter.modelUrl);
          const blob = await response.blob();

          if (shouldEmbed) {
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            embeddedAssets[chapter.id] = base64;
          } else {
            externalAssets[`assets/chapter_${chapter.id}.glb`] = blob;
          }
        } catch (e) {
          console.error("Failed to process asset:", chapter.modelUrl, e);
        }
      }
    }
    setIsProcessing(false);

    const data = {
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
        modelUrl: !shouldEmbed ? `assets/chapter_${c.id}.glb` : c.modelUrl
      })),
      embeddedAssets: shouldEmbed ? embeddedAssets : undefined
    };

    return { data, externalAssets };
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
    const { data } = await getProjectData(embedAssets);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    setIsProcessing(false);
  };

  const handleDownloadZip = async () => {
    setIsProcessing(true);
    try {
      const { data, externalAssets } = await getProjectData(embedAssets);
      const zip = new JSZip();

      // Add project data
      zip.file('project.json', JSON.stringify(data, null, 2));

      // Add engine and templates
      zip.file('ScrollyPipeline.js', SCROLLY_PIPELINE_JS);
      zip.file('index.html', INDEX_HTML_TEMPLATE(projectName));
      zip.file('README.md', README_MD_TEMPLATE(projectName));

      // Add external assets if not embedded
      if (!embedAssets) {
        for (const [path, blob] of Object.entries(externalAssets)) {
          zip.file(path, blob);
        }
      } else {
        zip.folder('assets'); // Create empty folder anyway for structure
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_export.zip`;
      a.click();
    } catch (e) {
      console.error("ZIP Generation failed:", e);
    }
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
          <button onClick={() => setIsExporting(false)} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center transition-all hover:bg-white/10 hover:rotate-90">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-emerald-400">Distribution Package</h3>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                <input type="checkbox" id="embed-cb" checked={embedAssets} onChange={e => setEmbedAssets(e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded border-white/20" />
                <div className="flex flex-col">
                  <label htmlFor="embed-cb" className="text-[10px] text-white font-bold uppercase cursor-pointer">Embed Models in JSON</label>
                  <span className="text-[8px] text-white/40 uppercase">Makes the export a single portable file structure</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownloadZip}
                  disabled={isProcessing}
                  className="w-full py-5 bg-emerald-500 text-black text-[12px] font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  {isProcessing ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-file-zipper text-lg"></i> Download Project ZIP</>}
                </button>

                <button
                  onClick={handleDownloadJson}
                  disabled={isProcessing}
                  className="w-full py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-30"
                >
                  Download Project JSON Only
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-blue-400">Implementation Code</h3>
              <div className="relative group">
                <div className="bg-black/40 rounded-2xl p-6 font-mono text-[9px] text-blue-300/60 border border-white/5 overflow-x-auto min-h-[160px]">
                  <pre>{usageSnippet}</pre>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(usageSnippet);
                    setCopied('code');
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-all"
                >
                  <i className={`fa-solid ${copied === 'code' ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                </button>
              </div>
              <p className="text-[8px] text-white/30 uppercase text-center">Use this snippet to integrate the ScrollyEngine directly into an existing React application.</p>
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
import React, { useRef, useEffect } from 'react';

const Noise: React.FC<{ patternRefreshInterval?: number; patternAlpha?: number }> = ({ 
  patternRefreshInterval = 2, 
  patternAlpha = 14 
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    let f = 0;
    let id = 0;
    const S = 1024;
    
    const resize = () => {
      c.width = S;
      c.height = S;
      c.style.width = '100vw';
      c.style.height = '100vh';
    };
    
    const draw = () => {
      const img = ctx.createImageData(S, S);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = patternAlpha;
      }
      ctx.putImageData(img, 0, 0);
    };
    
    const loop = () => {
      if (f % patternRefreshInterval === 0) draw();
      f++;
      id = requestAnimationFrame(loop);
    };
    
    addEventListener('resize', resize);
    resize();
    loop();
    
    return () => {
      removeEventListener('resize', resize);
      cancelAnimationFrame(id);
    };
  }, [patternRefreshInterval, patternAlpha]);
  
  return (
    <canvas 
      ref={ref} 
      className="pointer-events-none absolute inset-0" 
      style={{ imageRendering: 'pixelated' }} 
    />
  );
};

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Multi-color radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_620px_at_50%_200px,rgba(99,102,241,0.2),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_520px_at_80%_60%,rgba(168,85,247,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_420px_at_20%_80%,rgba(236,72,153,0.1),transparent_70%)]" />
      
      {/* Animated ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      
      {/* Grid pattern with fade */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#94a3b815_1px,transparent_1px),linear-gradient(to_bottom,#94a3b815_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_20%,#000_70%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_90%_60%_at_50%_20%,#000_70%,transparent_100%)] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]" />
      
      {/* Noise overlay */}
      <Noise patternAlpha={12} />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};

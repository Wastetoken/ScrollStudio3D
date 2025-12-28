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
      <div className="absolute inset-0 bg-slate-950" />
      
      {/* Radial gradient spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_620px_at_50%_200px,rgba(99,102,241,0.35),transparent_70%)]" />
      
      {/* Grid pattern with fade */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#94a3b81f_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81f_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_85%_55%_at_50%_15%,#000_75%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_85%_55%_at_50%_15%,#000_75%,transparent_100%)] [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]" />
      
      {/* Noise overlay */}
      <Noise patternAlpha={18} />
    </div>
  );
};

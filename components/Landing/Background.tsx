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
      {/* Base dark background - Deep Black/Grey */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Subtle Radial gradient spotlight - Charcoal Grey */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_40%,rgba(40,40,40,0.4),transparent_100%)]" />

      {/* Grid pattern with very subtle fade */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,#000_60%,transparent_100%)]" />

      {/* Noise overlay */}
      <Noise patternAlpha={12} />
    </div>
  );
};

import React from 'react';
import { useStore } from '../../useStore';

const FloatingShape: React.FC<{ 
  delay?: number; 
  width?: number; 
  height?: number; 
  className?: string;
  gradient?: string;
}> = ({ delay = 0, width = 400, height = 100, className = '', gradient = 'from-indigo-500/[0.15]' }) => {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        animation: `float 12s ease-in-out ${delay}s infinite`,
      }}
    >
      <div
        style={{ width, height }}
        className={`rounded-full bg-gradient-to-r ${gradient} to-transparent backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]`}
      />
    </div>
  );
};

export const Hero: React.FC = () => {
  const { setLandingMode } = useStore();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const title = "Create Stunning 3D Scrollytelling Experiences";
  const words = title.split(' ');

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#030303] via-[#050505] to-[#030303]">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_1px,_transparent_1px)] [background-size:24px_24px]" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-purple-500/[0.05] blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

      {/* Floating Shapes */}
      <FloatingShape 
        delay={0.3} 
        width={600} 
        height={140} 
        gradient="from-indigo-500/[0.15]" 
        className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%] rotate-12" 
      />
      <FloatingShape 
        delay={0.5} 
        width={500} 
        height={120} 
        gradient="from-rose-500/[0.15]" 
        className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%] -rotate-[15deg]" 
      />
      <FloatingShape 
        delay={0.4} 
        width={300} 
        height={80} 
        gradient="from-violet-500/[0.15]" 
        className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%] -rotate-[8deg]" 
      />
      <FloatingShape 
        delay={0.6} 
        width={200} 
        height={60} 
        gradient="from-amber-500/[0.15]" 
        className="right-[15%] md:right-[20%] top-[10%] md:top-[15%] rotate-[20deg]" 
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 md:px-10 lg:px-12">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 mx-auto block w-fit transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '0.2s',
          }}
        >
          <span className="text-sm text-white/60 tracking-wide uppercase font-bold">3D Storytelling Platform</span>
        </div>

        {/* Animated Title */}
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl text-center mb-6">
          {words.map((word, index) => (
            <span
              key={index}
              className="inline-block mr-3 md:mr-4 transition-all duration-500 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
              style={{
                opacity: isVisible ? 1 : 0,
                filter: isVisible ? 'blur(0px)' : 'blur(4px)',
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: `${0.3 + index * 0.08}s`,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p 
          className="mx-auto max-w-2xl text-center text-lg font-light text-white/40 mb-10 leading-relaxed transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '1s',
          }}
        >
          Build interactive 3D narratives with scroll-based animations, cinematic camera movements, 
          and stunning visual effects. No code required.
        </p>

        {/* CTA Buttons */}
        <div 
          className="flex flex-wrap items-center justify-center gap-4 mb-16 transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '1.2s',
          }}
        >
          <button 
            onClick={() => setLandingMode(false)}
            className="group relative transform rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50"
          >
            <span className="relative z-10 flex items-center gap-2">
              Launch Studio
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <button 
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="transform rounded-2xl border-2 border-white/10 bg-white/[0.03] backdrop-blur-sm px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20"
          >
            Learn More
          </button>
        </div>

        {/* Preview Card with Glassmorphism */}
        <div 
          className="relative mx-auto max-w-5xl transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transitionDelay: '1.4s',
          }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-50" />
          
          <div className="relative rounded-3xl border-2 border-white/10 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
            <div className="w-full overflow-hidden rounded-2xl border-2 border-white/10">
              <div className="aspect-video w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />
                
                <div className="text-center relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white font-bold text-lg mb-2">Interactive 3D Studio Preview</p>
                  <p className="text-slate-400 text-sm">Launch Studio to start creating immersive experiences</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transitionDelay: '1.6s',
          }}
        >
          {[
            { icon: '🎬', label: 'Cinematic Camera', desc: 'Professional paths' },
            { icon: '✨', label: 'Visual Effects', desc: 'Stunning FX library' },
            { icon: '📱', label: 'Export Ready', desc: 'Share anywhere' },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-white font-bold text-lg mb-1">{item.label}</h3>
              <p className="text-white/40 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(15px) rotate(var(--rotate, 0deg)); }
        }
      `}</style>
    </div>
  );
};

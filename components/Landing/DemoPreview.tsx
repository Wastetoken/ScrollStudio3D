import React from 'react';
import { useStore } from '../../useStore';

export const DemoPreview: React.FC = () => {
  const { setLandingMode } = useStore();
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className="relative py-24 px-6 md:px-10 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div
          className="relative rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:p-12 backdrop-blur-sm transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          }}
        >
          {/* Gradient glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl" />
          
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Create?
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Launch the studio and start building your interactive 3D story in minutes. 
                Upload your 3D models and bring them to life.
              </p>
            </div>

            {/* Preview Area */}
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
              <div className="aspect-video w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
                {/* Animated rings */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-20 blur-2xl animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Interactive Studio</h3>
                <p className="text-slate-400 text-center mb-6 max-w-md">
                  Full-featured 3D editor with timeline controls, camera paths, and real-time preview
                </p>

                {/* Use Cases */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm">
                    Product Reveals
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm">
                    Story Presentations
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm">
                    Portfolios
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm">
                    Education
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={() => setLandingMode(false)}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-4 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50"
              >
                <span className="relative z-10">Launch Studio Now</span>
                <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

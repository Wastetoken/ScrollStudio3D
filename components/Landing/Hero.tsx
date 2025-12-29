import React from 'react';
import { useStore } from '../../useStore';
import { Scene3D } from './Scene3D';

export const Hero: React.FC = () => {
  const { setLandingMode } = useStore();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const title = "Create Stunning 3D Scrollytelling Experiences";
  const words = title.split(' ');

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12 md:px-10 lg:px-12">
      {/* 3D Scene Background */}
      <Scene3D />
      <div className="max-w-7xl mx-auto w-full">
        {/* Animated Title */}
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl text-center mb-6 text-white">
          {words.map((word, index) => (
            <span
              key={index}
              className="inline-block mr-3 md:mr-4 transition-all duration-500"
              style={{
                opacity: isVisible ? 1 : 0,
                filter: isVisible ? 'blur(0px)' : 'blur(4px)',
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: `${index * 0.1}s`,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p 
          className="mx-auto max-w-2xl text-center text-lg font-normal text-slate-400 mb-8 transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: '0.8s',
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
            transitionDelay: '1s',
          }}
        >
          <button 
            onClick={() => setLandingMode(false)}
            className="transform rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500 shadow-lg hover:shadow-xl"
          >
            Launch Studio
          </button>
          <button 
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="transform rounded-lg border border-slate-600 bg-slate-800/50 px-8 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-700/50 hover:border-slate-500"
          >
            Learn More
          </button>
        </div>

        {/* Preview Card */}
        <div 
          className="relative mx-auto max-w-4xl transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: '1.2s',
          }}
        >
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/50 p-4 shadow-2xl backdrop-blur-sm">
            <div className="w-full overflow-hidden rounded-xl border border-slate-700">
              <div className="aspect-video w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">Interactive 3D Demo Preview</p>
                  <p className="text-slate-500 text-xs mt-2">Launch Studio to start creating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

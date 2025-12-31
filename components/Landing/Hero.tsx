import React from 'react';
import { useStore } from '../../useStore';
import { Scene3D } from './Scene3D';

export const Hero: React.FC = () => {
  const { setLandingMode, setShowHandbook } = useStore();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const title = "Create Stunning 3D Scrollytelling Experiences";
  const words = title.split(' ');

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12 md:px-10 lg:px-12 z-10">
      {/* 3D Scene Background - Ensure it is behind */}
      <div className="absolute inset-0 -z-10">
        <Scene3D />
        {/* Dark Vignette Overlay for Text Separation */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-20">
        {/* Animated Title */}
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl text-center mb-6 text-white drop-shadow-lg">
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
          className="mx-auto max-w-2xl text-center text-xl font-light text-zinc-300 mb-10 leading-relaxed transition-all duration-500"
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
          className="flex flex-wrap items-center justify-center gap-4 mb-16 transition-all duration-500 pointer-events-auto"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: '1s',
          }}
        >
          <button
            onClick={() => setLandingMode(false)}
            className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest text-[10px] rounded-full transition-all hover:scale-105 shadow-2xl cursor-pointer z-50"
          >
            Launch Studio
          </button>
          <button
            onClick={() => setShowHandbook(true)}
            className="px-8 py-4 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] rounded-full transition-all hover:scale-105 flex items-center justify-center cursor-pointer z-50"
          >
            Docs
          </button>
          <a
            href="/playground/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] rounded-full transition-all hover:scale-105 flex items-center justify-center cursor-pointer z-50"
          >
            Playground
          </a>
        </div>

        {/* Video Player - With Requested Glowing Border */}
        <div
          className="relative mx-auto max-w-4xl transition-all duration-500 pointer-events-auto"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: '1.2s',
          }}
        >
          <div className="glowing-video-container shadow-2xl">
            <div className="relative rounded-[24px] bg-black overflow-hidden aspect-video z-30 w-full h-full">
              <video
                autoPlay
                loop
                muted
                playsInline
                controls
                crossOrigin="anonymous"
                className="w-full h-full object-cover relative z-40"
              >
                <source src="https://pub-1ae9a3d95ead4a65b5c663c4d43d1de2.r2.dev/ScrollStudio.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

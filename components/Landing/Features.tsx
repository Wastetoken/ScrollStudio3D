import React from 'react';
import { FeatureScene3D } from './FeatureScene3D';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
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
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-3xl border-2 border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/20"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}s`,
      }}
    >
      {/* Ambient glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-20" />
      
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
      
      <div className="relative">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/50 group-hover:shadow-2xl group-hover:shadow-indigo-500/60 transition-all duration-500 group-hover:scale-110">
          {icon}
        </div>
        
        <h3 className="mb-3 text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">{title}</h3>
        <p className="text-white/50 leading-relaxed group-hover:text-white/70 transition-colors duration-300">{description}</p>
      </div>

      {/* Corner accent with glow */}
      <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-3xl transition-all duration-500 group-hover:translate-x-12 group-hover:-translate-y-12 group-hover:scale-125" />
    </div>
  );
};

export const Features: React.FC = () => {
  const features = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      title: '3D Scrollytelling',
      description: 'Create immersive scroll-based narratives with smooth 3D animations. Your story unfolds as users scroll through interactive scenes.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Timeline Editor',
      description: 'Professional-grade timeline controls for keyframe animation, camera paths, and narrative beats. Full control over every moment.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      title: 'Export & Share',
      description: 'Export your creations as standalone experiences or embed them anywhere. Share your stories with the world effortlessly.',
    },
  ];

  return (
    <div id="features" className="relative py-24 px-6 md:px-10 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful tools designed for creators, storytellers, and designers.
          </p>
        </div>

        {/* 3D Showcase */}
        <div className="mb-16">
          <FeatureScene3D />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

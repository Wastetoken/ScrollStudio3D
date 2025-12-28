import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../useStore';

const InteractiveModel: React.FC<{ url: string }> = ({ url }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.3;
    groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.15;
  });

  return (
    <group ref={groupRef} scale={1.8}>
      <primitive object={clonedScene} />
    </group>
  );
};

const DemoScene: React.FC = () => {
  const modelUrl = 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Scrollytelling%202.glb';
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />
      <Suspense fallback={null}>
        <InteractiveModel url={modelUrl} />
        <Environment preset="studio" />
      </Suspense>
    </>
  );
};

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

            {/* Preview Area with 3D Scene */}
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
              <div className="aspect-video w-full relative">
                {/* 3D Canvas */}
                <Canvas
                  dpr={[1, 2]}
                  gl={{ 
                    antialias: true, 
                    alpha: false,
                    powerPreference: 'high-performance'
                  }}
                >
                  <DemoScene />
                </Canvas>
                
                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col items-center justify-end p-8 pointer-events-none">
                  <h3 className="text-2xl font-bold text-white mb-2">Interactive Studio</h3>
                  <p className="text-slate-300 text-center mb-4 max-w-md text-sm">
                    Full-featured 3D editor with timeline controls, camera paths, and real-time preview
                  </p>

                  {/* Use Cases */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-300 text-xs">
                      Product Reveals
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-300 text-xs">
                      Story Presentations
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-300 text-xs">
                      Portfolios
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-300 text-xs">
                      Education
                    </span>
                  </div>
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

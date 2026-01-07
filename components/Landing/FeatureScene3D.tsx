import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
}

const RotatingModel: React.FC<ModelProps> = ({ url }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle auto-rotation
    groupRef.current.rotation.y += 0.005;
    
    // Subtle mouse interaction
    const targetX = mouseRef.current.x * 0.2;
    const targetY = mouseRef.current.y * 0.2;
    
    groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.03;
    groupRef.current.rotation.z += (targetX - groupRef.current.rotation.z) * 0.03;

    // Gentle floating
    groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
  });

  return (
    <group ref={groupRef} scale={1.5}>
      <primitive object={clonedScene} />
    </group>
  );
};

const Scene: React.FC = () => {
  const modelUrl = 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Scrollytelling%202.glb';

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
      
      <Suspense fallback={null}>
        <RotatingModel url={modelUrl} />
        <Environment preset="sunset" />
      </Suspense>
    </>
  );
};

export const FeatureScene3D: React.FC = () => {
  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-800">
      <Canvas
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

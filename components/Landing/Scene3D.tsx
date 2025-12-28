import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  position: [number, number, number];
  scale?: number;
  floatIntensity?: number;
  floatSpeed?: number;
}

const FloatingModel: React.FC<ModelProps> = ({ 
  url, 
  position, 
  scale = 1, 
  floatIntensity = 0.3,
  floatSpeed = 1 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  
  // Clone the scene to allow multiple instances
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smooth mouse tracking
    targetRotation.current.y = mouseRef.current.x * 0.5;
    targetRotation.current.x = mouseRef.current.y * 0.3;

    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.05;

    // Floating animation
    const time = state.clock.getElapsedTime() * floatSpeed;
    groupRef.current.position.y = position[1] + Math.sin(time) * floatIntensity;
    groupRef.current.position.x = position[0] + Math.cos(time * 0.5) * (floatIntensity * 0.5);
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

const Scene: React.FC = () => {
  const modelUrl = 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Scrollytelling%202.glb';

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <spotLight position={[-10, 10, -5]} angle={0.3} penumbra={1} intensity={0.5} castShadow />
      
      <Suspense fallback={null}>
        {/* Strategic placement of models */}
        <FloatingModel 
          url={modelUrl} 
          position={[-3, 0, 0]} 
          scale={1.2}
          floatIntensity={0.4}
          floatSpeed={0.8}
        />
        <FloatingModel 
          url={modelUrl} 
          position={[3.5, -1, -2]} 
          scale={0.9}
          floatIntensity={0.3}
          floatSpeed={1.2}
        />
        <FloatingModel 
          url={modelUrl} 
          position={[0, 2, -3]} 
          scale={0.7}
          floatIntensity={0.5}
          floatSpeed={1.5}
        />
        
        <Environment preset="city" />
      </Suspense>
    </>
  );
};

export const Scene3D: React.FC = () => {
  return (
    <div className="absolute inset-0 opacity-60">
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

// Preload the model
useGLTF.preload('https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Scrollytelling%202.glb');

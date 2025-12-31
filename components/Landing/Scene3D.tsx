import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const FloatingModel: React.FC<ModelProps> = ({
  url,
  position,
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    // Apply dark minimalist material override to all meshes
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.color.set('#222222');
        mat.roughness = 0.2;
        mat.metalness = 0.8;
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.3;
    groupRef.current.rotation.y += 0.002;
  });

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      <primitive object={clonedScene} />
    </group>
  );
};

const StrategicShape: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type: 'torus' | 'octahedron' | 'capsule';
  color?: string;
}> = ({ position, rotation = [0, 0, 0], scale = 1, type, color = "#111111" }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x += 0.001;
    ref.current.rotation.y += 0.002;
    ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.2;
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      {type === 'torus' && <torusGeometry args={[1, 0.02, 16, 100]} />}
      {type === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
      {type === 'capsule' && <capsuleGeometry args={[0.5, 1, 4, 8]} />}
      <meshStandardMaterial
        color={color}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
};

const Scene: React.FC = () => {
  const modelUrl = 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Scrollytelling%202.glb';

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.2} color="#ffffff" />

      <Suspense fallback={null}>
        {/* Strategic Framing using Custom Models */}
        <FloatingModel
          url={modelUrl}
          position={[-6, 2, -3]}
          scale={1.8}
          rotation={[0.5, 0.4, 0]}
        />
        <FloatingModel
          url={modelUrl}
          position={[6, -3, -2]}
          scale={1.5}
          rotation={[-0.2, -0.6, 0]}
        />
        <FloatingModel
          url={modelUrl}
          position={[-4, -4, -4]}
          scale={1.2}
          rotation={[0, 0.8, 0.4]}
        />
        <FloatingModel
          url={modelUrl}
          position={[5, 4, -5]}
          scale={2.2}
          rotation={[0.8, 0, -0.2]}
        />
      </Suspense>
    </>
  );
};

export const Scene3D: React.FC = () => {
  return (
    <div className="absolute inset-0 opacity-80">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

useGLTF.preload('https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Scrollytelling%202.glb');

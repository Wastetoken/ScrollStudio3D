import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { useGSAPTimeline } from '../../hooks/useGSAPTimeline';

interface ModelProps {
  url: string;
}

const Model: React.FC<ModelProps & { modelRef: React.RefObject<THREE.Group> }> = ({ url, modelRef }) => {
  const { scene } = useGLTF(url);
  const { config, mode } = useStore();

  useFrame(() => {
    // In edit mode, manually apply rotation from the sidebar config
    if (mode === 'edit' && modelRef.current) {
      modelRef.current.rotation.set(
        config.modelRotation[0],
        config.modelRotation[1],
        config.modelRotation[2]
      );
    }
  });

  return (
    <group 
      ref={modelRef} 
      scale={config.modelScale} 
      position={config.modelPosition}
      dispose={null}
    >
      <primitive object={scene} />
    </group>
  );
};

export const Scene: React.FC = () => {
  const { modelUrl, mode, config } = useStore();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const modelRef = useRef<THREE.Group>(null!);
  const lookAtProxy = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const orbitControlsRef = useRef<any>(null!);

  const { camera } = useThree();

  // The Compiler
  useGSAPTimeline(cameraRef.current, lookAtProxy, modelRef);

  useFrame(() => {
    if (mode === 'preview' && cameraRef.current) {
      cameraRef.current.lookAt(lookAtProxy);
    }
  });

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef} 
        makeDefault 
        position={[5, 5, 5]} 
        fov={45} 
      />
      
      {mode === 'edit' && (
        <OrbitControls 
          ref={orbitControlsRef}
          makeDefault 
          enableDamping 
          dampingFactor={0.05}
        />
      )}

      {/* Robust local lighting setup */}
      <ambientLight intensity={config.ambientIntensity} />
      <hemisphereLight intensity={0.5} groundColor="#000000" color="#ffffff" />
      
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={config.directionalIntensity} 
        castShadow 
      />
      
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ffffff" />

      {modelUrl && (
        <React.Suspense fallback={null}>
          <Model url={modelUrl} modelRef={modelRef} />
        </React.Suspense>
      )}

      {config.showFloor && (
        <>
          <ContactShadows 
            position={[0, -1, 0]} 
            opacity={0.4} 
            scale={20} 
            blur={2} 
            far={4.5} 
          />
          <gridHelper args={[20, 20, 0x333333, 0x222222]} position={[0, -1, 0]} />
        </>
      )}
    </>
  );
};
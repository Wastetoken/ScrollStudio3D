import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../useStore';
import { useGSAPTimeline } from '../../hooks/useGSAPTimeline';

interface ModelProps {
  url: string;
  modelRef: React.RefObject<THREE.Group>;
}

const ModelPrimitive: React.FC<ModelProps> = ({ url, modelRef }) => {
  const { scene } = useGLTF(url);
  const { config, mode } = useStore();

  useFrame(() => {
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

const CameraSync: React.FC<{ cameraRef: React.RefObject<THREE.PerspectiveCamera> }> = ({ cameraRef }) => {
  const { mode, cameraPosition, setCameraPosition, cameraTarget, setCameraTarget, modelUrl } = useStore();
  const controlsRef = useRef<any>(null);
  
  const lastStorePos = useRef(cameraPosition);
  const lastStoreTarget = useRef(cameraTarget);

  useEffect(() => {
    lastStorePos.current = cameraPosition;
    lastStoreTarget.current = cameraTarget;
  }, [cameraPosition, cameraTarget]);

  useFrame(() => {
    if (!cameraRef.current || !modelUrl || mode !== 'edit') return;

    // 1. Sync store -> camera
    const posChanged = cameraPosition.some((v, i) => Math.abs(v - lastStorePos.current[i]) > 0.0001);
    const targetChanged = cameraTarget.some((v, i) => Math.abs(v - lastStoreTarget.current[i]) > 0.0001);

    if (posChanged) {
      cameraRef.current.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
      lastStorePos.current = cameraPosition;
    }

    if (targetChanged && controlsRef.current) {
      controlsRef.current.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
      lastStoreTarget.current = cameraTarget;
    }

    // 2. Sync camera -> store
    if (!posChanged && !targetChanged) {
      const { x, y, z } = cameraRef.current.position;
      if (Math.abs(x - cameraPosition[0]) > 0.005 || Math.abs(y - cameraPosition[1]) > 0.005 || Math.abs(z - cameraPosition[2]) > 0.005) {
        const newPos: [number, number, number] = [x, y, z];
        setCameraPosition(newPos);
        lastStorePos.current = newPos;
      }

      if (controlsRef.current) {
        const { x: tx, y: ty, z: tz } = controlsRef.current.target;
        if (Math.abs(tx - cameraTarget[0]) > 0.005 || Math.abs(ty - cameraTarget[1]) > 0.005 || Math.abs(tz - cameraTarget[2]) > 0.005) {
          const newTarget: [number, number, number] = [tx, ty, tz];
          setCameraTarget(newTarget);
          lastStoreTarget.current = newTarget;
        }
      }
    }
  });

  return mode === 'edit' && modelUrl ? (
    <OrbitControls 
      key={modelUrl} // Force reset of controls when the model or session changes
      ref={controlsRef}
      makeDefault 
      enableDamping 
      dampingFactor={0.05}
    />
  ) : null;
};

export const Scene: React.FC = () => {
  const { modelUrl, mode, config } = useStore();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const modelRef = useRef<THREE.Group>(null!);
  const lookAtProxy = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useGSAPTimeline(cameraRef.current, lookAtProxy, modelRef);

  useFrame((state, delta) => {
    if (!modelUrl) return;

    if (mode === 'preview' && cameraRef.current) {
      cameraRef.current.lookAt(lookAtProxy);
      
      if (config.autoRotate) {
        const speed = config.autoRotateSpeed * 0.1 * delta;
        const x = cameraRef.current.position.x;
        const z = cameraRef.current.position.z;
        cameraRef.current.position.x = x * Math.cos(speed) - z * Math.sin(speed);
        cameraRef.current.position.z = x * Math.sin(speed) + z * Math.cos(speed);
      }
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
      
      <CameraSync cameraRef={cameraRef} />

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
          <ModelPrimitive url={modelUrl} modelRef={modelRef} />
        </React.Suspense>
      )}

      {config.showFloor && (
        <>
          <ContactShadows 
            position={[0, -1.01, 0]} 
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
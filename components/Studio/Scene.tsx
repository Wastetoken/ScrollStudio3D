import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, ThreeElements, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Html
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from '../../useStore';
import { useGSAPTimeline } from '../../hooks/useGSAPTimeline';

// The manual JSX declaration was shadowing the standard React HTML types (div, span, etc.)
// causing pervasive errors across the application. We rely on the environment's standard
// React types and use targeted suppressions for R3F-specific intrinsic elements.

const HotspotMarker: React.FC<{ hotspot: any }> = ({ hotspot }) => {
  const { currentProgress } = useStore();
  const distance = Math.abs(currentProgress - hotspot.visibleAt);
  const isActive = distance < 0.08;
  const opacity = Math.max(0, 1 - (distance * 12));

  if (opacity <= 0) return null;

  return (
    <Html position={hotspot.position} center distanceFactor={12}>
      <div 
        className="group flex flex-col items-center transition-all duration-700 pointer-events-none"
        style={{ 
          opacity, 
          transform: `scale(${isActive ? 1 : 0.6})`,
        }}
      >
        <div className="relative flex flex-col items-center">
          <div className={`glass-panel p-4 rounded-2xl w-52 shadow-2xl border-white/20 mb-4 transition-all duration-500 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
               <h5 className="text-[10px] font-black uppercase text-white tracking-widest truncate">{hotspot.label}</h5>
            </div>
            <p className="text-[9px] text-gray-400 leading-relaxed font-medium">{hotspot.content}</p>
          </div>
          <div className={`w-[1px] h-8 bg-gradient-to-t from-white to-transparent transition-all duration-500 ${isActive ? 'scale-y-100' : 'scale-y-0'}`} />
          <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center relative">
            <div className={`w-1.5 h-1.5 bg-white rounded-full transition-transform duration-500 ${isActive ? 'scale-125' : 'scale-100'}`}></div>
            {isActive && <div className="absolute inset-0 bg-white/40 rounded-full animate-ping"></div>}
          </div>
        </div>
      </div>
    </Html>
  );
};

const ModelPrimitive: React.FC<{ url: string; modelRef: React.RefObject<THREE.Group> }> = ({ url, modelRef }) => {
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
    // @ts-ignore - group is an intrinsic element in R3F
    <group ref={modelRef} scale={config.modelScale} position={config.modelPosition} dispose={null}>
      {/* @ts-ignore - primitive is an intrinsic element in R3F */}
      <primitive object={scene} />
    </group>
  );
};

export const Scene: React.FC = () => {
  const { modelUrl, mode, config, hotspots } = useStore();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const modelRef = useRef<THREE.Group>(null!);
  const lookAtProxy = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const sceneFog = useMemo(() => new THREE.FogExp2(config.fogColor, config.fogDensity), []);
  const { scene: threeScene } = useThree();

  useGSAPTimeline(cameraRef.current, lookAtProxy, modelRef);

  useEffect(() => {
    threeScene.fog = sceneFog;
  }, [threeScene, sceneFog]);

  useFrame((state) => {
    if (!modelUrl) return;
    
    if (mode === 'preview' && cameraRef.current) {
      cameraRef.current.lookAt(lookAtProxy);
    }
    
    // Update existing fog instead of creating new instances
    if (threeScene.fog) {
      (threeScene.fog as THREE.FogExp2).color.set(config.fogColor);
      (threeScene.fog as THREE.FogExp2).density = config.fogDensity;
    }
    state.gl.toneMappingExposure = config.exposure;
  });

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef} 
        makeDefault 
        position={[5, 5, 5]} 
        fov={config.defaultFov} 
      />
      
      {mode === 'edit' && modelUrl && (
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      )}
      
      {/* @ts-ignore - ambientLight is intrinsic to R3F */}
      <ambientLight intensity={config.ambientIntensity} />
      {/* @ts-ignore - directionalLight is intrinsic to R3F */}
      <directionalLight position={[10, 10, 10]} intensity={config.directionalIntensity} castShadow />
      {/* @ts-ignore - pointLight is intrinsic to R3F */}
      <pointLight position={[-10, -10, -10]} intensity={config.ambientIntensity * 0.5} color="#4444ff" />

      {modelUrl && (
        <React.Suspense fallback={null}>
          <ModelPrimitive url={modelUrl} modelRef={modelRef} />
          {hotspots.map(h => <HotspotMarker key={h.id} hotspot={h} />)}
        </React.Suspense>
      )}

      {config.showFloor && (
        // @ts-ignore - group is intrinsic to R3F
        <group position={[0, -1, 0]}>
          <ContactShadows opacity={0.4} scale={20} blur={2.5} far={4.5} />
          {/* @ts-ignore - gridHelper is intrinsic to R3F */}
          <gridHelper args={[40, 40, 0x222222, 0x111111]} />
        </group>
      )}

      <EffectComposer disableNormalPass multisampling={4}>
        <Bloom 
          luminanceThreshold={config.bloomThreshold} 
          intensity={config.bloomIntensity} 
          mipmapBlur 
        />
        <DepthOfField 
          focusDistance={config.focusDistance / 20}
          focalLength={0.02} 
          bokehScale={config.aperture * 100} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};
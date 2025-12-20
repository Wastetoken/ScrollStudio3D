
import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
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

// Fix: Corrected the JSX namespace declaration to properly extend IntrinsicElements with ThreeElements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const HotspotMarker: React.FC<{ hotspot: any }> = ({ hotspot }) => {
  const { currentProgress } = useStore();
  // Hotspots are visible in a window around their trigger point
  const distance = Math.abs(currentProgress - hotspot.visibleAt);
  const isActive = distance < 0.1;
  const opacity = Math.max(0, 1 - (distance * 8));

  if (opacity <= 0) return null;

  return (
    <Html position={hotspot.position} center distanceFactor={10}>
      <div 
        className="group flex items-center gap-4 transition-all duration-500"
        style={{ 
          opacity, 
          transform: `scale(${isActive ? 1 : 0.8})`, 
          pointerEvents: isActive ? 'auto' : 'none' 
        }}
      >
        <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center relative">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          {isActive && <div className="absolute inset-0 bg-white/40 rounded-full animate-ping"></div>}
        </div>
        
        {isActive && (
          <div className="glass-panel p-4 rounded-2xl w-48 shadow-2xl border-white/10 animate-in fade-in slide-in-from-left-4 duration-500">
            <h5 className="text-[10px] font-black uppercase text-white mb-1">{hotspot.label}</h5>
            <p className="text-[9px] text-gray-400 leading-relaxed">{hotspot.content}</p>
          </div>
        )}
      </div>
    </Html>
  );
};

const ModelPrimitive: React.FC<{ url: string; modelRef: React.RefObject<THREE.Group> }> = ({ url, modelRef }) => {
  const { scene } = useGLTF(url);
  const { config, mode } = useStore();

  useFrame(() => {
    if (mode === 'edit' && modelRef.current) {
      // Fix: A spread argument must either have a tuple type or be passed to a rest parameter.
      // Accessing array indices directly to avoid spread issues in this environment.
      modelRef.current.rotation.set(
        config.modelRotation[0],
        config.modelRotation[1],
        config.modelRotation[2]
      );
    }
  });

  return (
    <group ref={modelRef} scale={config.modelScale} position={config.modelPosition} dispose={null}>
      <primitive object={scene} />
    </group>
  );
};

export const Scene: React.FC = () => {
  const { modelUrl, mode, config, hotspots } = useStore();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const modelRef = useRef<THREE.Group>(null!);
  const lookAtProxy = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // Syncs scroll progress to camera/model properties
  useGSAPTimeline(cameraRef.current, lookAtProxy, modelRef);

  useFrame((state) => {
    if (!modelUrl) return;
    
    // Look at target in preview mode (GSAP controls lookAtProxy)
    if (mode === 'preview' && cameraRef.current) {
      cameraRef.current.lookAt(lookAtProxy);
    }
    
    // Update Fog
    state.scene.fog = new THREE.FogExp2(config.fogColor, config.fogDensity);
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
      
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight position={[10, 10, 10]} intensity={config.directionalIntensity} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={config.ambientIntensity * 0.5} color="#4444ff" />

      {modelUrl && (
        <React.Suspense fallback={null}>
          <ModelPrimitive url={modelUrl} modelRef={modelRef} />
          {hotspots.map(h => <HotspotMarker key={h.id} hotspot={h} />)}
        </React.Suspense>
      )}

      {config.showFloor && (
        <>
          <ContactShadows position={[0, -1.01, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
          <gridHelper args={[40, 40, 0x222222, 0x111111]} position={[0, -1, 0]} />
        </>
      )}

      {/* Post-Processing Stack */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={config.bloomThreshold} 
          intensity={config.bloomIntensity} 
          mipmapBlur 
        />
        <DepthOfField 
          focusDistance={config.focusDistance / 20} // Normalized for post-processing unit
          focalLength={0.02} 
          bokehScale={config.aperture * 100} 
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

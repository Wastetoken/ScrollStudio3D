import React, { useRef, useMemo, useEffect, Suspense, startTransition } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
import { Hotspot } from '../../types';

const HotspotMarker: React.FC<{ hotspot: Hotspot }> = ({ hotspot }) => {
  const { currentProgress } = useStore();
  const distance = Math.abs(currentProgress - hotspot.visibleAt);
  const isActive = distance < 0.12;
  const opacity = Math.max(0, 1 - (distance * 10));

  if (opacity <= 0) return null;

  // Calculate "Jet Out" direction based on normal
  // normal[0] is X (Left/Right), normal[1] is Y (Up/Down)
  const isLeft = hotspot.normal[0] < 0;
  const isUp = hotspot.normal[1] > 0;
  const jetDistance = 160; // Base length of the leader line

  return (
    <Html 
      position={hotspot.position} 
      center 
      distanceFactor={8}
      zIndexRange={[100, 0]}
    >
      <div 
        className="relative transition-all duration-1000 pointer-events-none"
        style={{ opacity }}
      >
        {/* 1. THE ANCHOR POINT (Centered exactly on position) */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse"></div>
          <div className={`w-2 h-2 bg-white rounded-full transition-all duration-500 shadow-[0_0_15px_white] ${isActive ? 'scale-125' : 'scale-50'}`}></div>
        </div>

        {/* 2. THE JETTING CONTAINER 
            We rotate and translate this based on the normal to "jet out" to wherever the model isn't.
        */}
        <div 
          className={`absolute flex items-center transition-all duration-1000 origin-left ${isActive ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            width: `${jetDistance}px`,
            // If normal points left, flip the whole container 180deg
            transform: `rotate(${isLeft ? '180deg' : '0deg'}) scale(${isActive ? 1 : 0.5})`,
            // Offset slightly from the dot center
            left: isLeft ? '-10px' : '10px',
            top: '0px'
          }}
        >
          {/* Leader Line */}
          <div 
            className={`h-[1.5px] bg-gradient-to-r from-white via-white/50 to-transparent transition-all duration-1000 origin-left shrink-0 ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
            style={{ width: '100%' }}
          />

          {/* 3. THE DIALOG BOX 
              We counter-rotate the dialog so the text stays upright 
          */}
          <div 
            className={`glass-panel p-6 rounded-[2rem] w-72 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border-white/10 transition-all duration-1000 pointer-events-auto ${
              isActive 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-4 scale-90'
            }`}
            style={{ 
              transform: `rotate(${isLeft ? '-180deg' : '0deg'})`,
              // Apply a small vertical offset if the normal suggests it
              marginTop: isUp ? '-40px' : '40px'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
               <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>
               <h5 className="text-[11px] font-black uppercase text-white tracking-[0.25em] truncate">
                 {hotspot.label}
               </h5>
            </div>
            <p className="text-[10.5px] text-gray-400 leading-relaxed font-medium">
              {hotspot.content}
            </p>
            
            <div className="absolute -bottom-1 -right-1 opacity-5">
              <i className="fa-solid fa-crosshairs text-4xl text-white"></i>
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
};

const ModelPrimitive: React.FC<{ url: string; modelRef: React.RefObject<THREE.Group> }> = ({ url, modelRef }) => {
  const { scene } = useGLTF(url);
  const { config, mode, isPlacingHotspot, addHotspot, currentProgress } = useStore();

  useFrame(() => {
    if (mode === 'edit' && modelRef.current) {
      modelRef.current.rotation.set(
        config.modelRotation[0],
        config.modelRotation[1],
        config.modelRotation[2]
      );
    }
  });

  const handlePointerDown = (e: any) => {
    if (!isPlacingHotspot) return;
    
    e.stopPropagation();
    
    // Get the first intersection from the raycaster
    const intersection = e.intersections?.[0];
    if (!intersection) return;

    // The point is already in world space
    const point = intersection.point;
    
    // Calculate world-space normal for directionality
    const normal = intersection.face.normal.clone();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(intersection.object.matrixWorld);
    normal.applyMatrix3(normalMatrix).normalize();

    startTransition(() => {
      addHotspot({
        id: Math.random().toString(36).substr(2, 9),
        label: 'SYSTEM COMPONENT',
        content: 'Describe the technical specifications or aesthetic purpose of this component.',
        position: [point.x, point.y, point.z],
        normal: [normal.x, normal.y, normal.z],
        visibleAt: currentProgress,
        side: 'auto'
      });
    });
  };

  return (
    <group 
      ref={modelRef} 
      scale={config.modelScale} 
      position={config.modelPosition} 
      dispose={null}
      onPointerDown={handlePointerDown}
    >
      <primitive object={scene} />
    </group>
  );
};

export const Scene: React.FC = () => {
  const { modelUrl, mode, config, hotspots, isPlacingHotspot } = useStore();
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
        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05} 
          enabled={!isPlacingHotspot} 
        />
      )}
      
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight position={[10, 10, 10]} intensity={config.directionalIntensity} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={config.ambientIntensity * 0.5} color="#4444ff" />

      <Suspense fallback={null}>
        {modelUrl && (
          <>
            <ModelPrimitive url={modelUrl} modelRef={modelRef} />
            {hotspots.map(h => <HotspotMarker key={h.id} hotspot={h} />)}
          </>
        )}
      </Suspense>

      {config.showFloor && (
        <group position={[0, -1, 0]}>
          <ContactShadows opacity={0.4} scale={20} blur={2.5} far={4.5} />
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
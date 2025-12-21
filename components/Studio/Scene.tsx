
import React, { useRef, useMemo, Suspense, startTransition, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Html,
  Environment,
  Lightformer,
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration, Glitch } from '@react-three/postprocessing';
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

  const isLeft = hotspot.side === 'left' || (hotspot.side === 'auto' && hotspot.normal[0] < 0);
  const jetDistance = 160;

  return (
    <Html 
      position={hotspot.position} 
      center 
      distanceFactor={8} 
      zIndexRange={[100, 0]}
      style={{ 
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 100 : 0 
      }}
    >
      <div className="relative transition-all duration-1000" style={{ opacity }}>
        <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8">
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full animate-pulse"></div>
          <div className={`w-1.5 h-1.5 bg-white rounded-full transition-all duration-700 shadow-[0_0_20px_white] ${isActive ? 'scale-150' : 'scale-50'}`}></div>
        </div>
        <div 
          className={`absolute flex items-center transition-all duration-1000 origin-left ${isActive ? 'opacity-100' : 'opacity-0 translate-y-4'}`} 
          style={{ 
            width: `${jetDistance}px`, 
            transform: `rotate(${isLeft ? '180deg' : '0deg'}) scale(${isActive ? 1 : 0.8})`, 
            left: isLeft ? '-10px' : '10px'
          }}
        >
          <div className={`h-[1px] bg-gradient-to-r from-white via-white/40 to-transparent transition-all duration-1000 origin-left shrink-0 ${isActive ? 'scale-x-100' : 'scale-x-0'}`} style={{ width: '100%' }} />
          <div 
            className={`p-8 rounded-[2.5rem] w-80 backdrop-blur-3xl bg-black/60 border border-white/10 shadow-2xl transition-all duration-1000 pointer-events-auto ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 blur-md'}`} 
            style={{ transform: `rotate(${isLeft ? '-180deg' : '0deg'})` }}
          >
            <div className="flex items-center gap-4 mb-4">
               <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_12px_white] animate-pulse"></div>
               <h5 className="text-[12px] font-black uppercase text-white tracking-[0.3em] truncate">{hotspot.label}</h5>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed font-medium tracking-wide">{hotspot.content}</p>
          </div>
        </div>
      </div>
    </Html>
  );
};

const ModelPrimitive: React.FC<{ url: string; modelRef: React.RefObject<THREE.Group> }> = ({ url, modelRef }) => {
  const { scene } = useGLTF(url);
  const { mode, isPlacingHotspot, addHotspot, currentProgress, chapters, activeChapterId, setSelectedMesh, selectedMeshName } = useStore();
  
  const activeChapter = chapters.find(c => c.id === activeChapterId);
  const materialOverrides = activeChapter?.materialOverrides || {};

  // PRE-INDEX MESHES FOR PERFORMANCE
  const meshRegistry = useMemo(() => {
    const registry = new Map<string, THREE.Mesh>();
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        registry.set(obj.name, obj as THREE.Mesh);
      }
    });
    return registry;
  }, [scene]);

  // APPLY MATERIAL UPDATES IN LAYOUT PHASE (PRE-PAINT)
  useLayoutEffect(() => {
    if (!scene) return;

    meshRegistry.forEach((mesh, name) => {
      const override = materialOverrides[name];
      const isSelected = mode === 'edit' && name === selectedMeshName;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      mats.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial)) return;

        if (override) {
          m.color.set(override.color);
          m.emissive.set(override.emissive);
          m.emissiveIntensity = override.emissiveIntensity;
          m.metalness = override.metalness;
          m.roughness = override.roughness;
          m.wireframe = !!override.wireframe;
        } else {
          m.wireframe = false;
        }

        // Apply visual selection state (Glow intensity)
        if (isSelected) {
          // Temporarily boost emissive for selection visibility
          m.emissiveIntensity = (override?.emissiveIntensity || 0) + 1.5;
          if (!override?.emissive || override.emissive === '#000000') {
            m.emissive.set('#444444');
          }
        } else if (!override) {
          // Reset to default
          m.emissiveIntensity = 0;
          m.emissive.set('#000000');
        }
        
        m.needsUpdate = true;
      });
    });
  }, [scene, meshRegistry, materialOverrides, selectedMeshName, mode]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const intersection = e.intersections?.[0];
    if (!intersection) return;

    if (isPlacingHotspot) {
      const point = intersection.point;
      const normal = intersection.face.normal.clone();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(intersection.object.matrixWorld);
      normal.applyMatrix3(normalMatrix).normalize();

      startTransition(() => {
        addHotspot({
          id: Math.random().toString(36).substr(2, 9),
          label: 'ANALYTICS_PIN',
          content: 'Add technical metadata here...',
          position: [point.x, point.y, point.z],
          normal: [normal.x, normal.y, normal.z],
          visibleAt: currentProgress,
          side: 'auto'
        });
      });
    } else if (mode === 'edit') {
      setSelectedMesh(intersection.object.name);
    }
  };

  return <primitive ref={modelRef} object={scene} onPointerDown={handlePointerDown} />;
};

const ProceduralEnvironment: React.FC<{ preset?: any }> = ({ preset }) => {
  return (
    <Environment preset={preset} resolution={256}>
      {/* If preset is studio, we add custom lightformers for extra detail */}
      {preset === 'studio' && (
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          <Lightformer form="ring" intensity={2} rotation-y={Math.PI / 2} position={[-5, 2, -1]} scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={2} rotation-y={Math.PI / 2} position={[10, 2, 1]} scale={[20, 20, 1]} />
          <Lightformer form="rect" intensity={2} rotation-y={-Math.PI / 2} position={[-10, 2, 1]} scale={[20, 20, 1]} />
        </group>
      )}
    </Environment>
  );
};

export const Scene: React.FC = () => {
  const { chapters, activeChapterId, mode, isPlacingHotspot, isTransitioning } = useStore();
  const { camera, gl } = useThree();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const lookAtProxy = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const modelRef = useRef<THREE.Group>(null);

  const activeChapter = chapters.find(c => c.id === activeChapterId);
  const config = activeChapter?.environment;

  const activeCamera = (cameraRef.current || camera) as THREE.PerspectiveCamera;
  useGSAPTimeline(activeCamera, lookAtProxy, modelRef);

  useLayoutEffect(() => {
    if (gl) {
      gl.toneMappingExposure = config?.exposure ?? 1.0;
    }
  }, [gl, config?.exposure]);

  useFrame(() => {
    if (activeCamera && mode === 'preview') {
      activeCamera.lookAt(lookAtProxy);
    }
  });

  if (!activeChapter) return null;

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={config?.defaultFov || 35} position={[10, 10, 10]} near={0.1} far={2000} />
      {mode === 'edit' && <OrbitControls enableDamping dampingFactor={0.05} makeDefault enabled={!isPlacingHotspot} />}
      <color attach="background" args={[config?.backgroundColor || '#050505']} />
      <fog attach="fog" args={[config?.fogColor || '#050505', 0, 100]} />
      <ambientLight intensity={config?.ambientIntensity || 0.5} />
      <directionalLight position={[10, 10, 5]} intensity={config?.directionalIntensity || 1} castShadow />
      
      <Suspense fallback={
        <Html center>
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <div className="text-white text-[10px] font-black uppercase tracking-[0.3em] bg-black/80 px-6 py-2 rounded-full border border-white/10">
              Initializing Engine Pipe...
            </div>
          </div>
        </Html>
      }>
        <ModelPrimitive url={activeChapter.modelUrl} modelRef={modelRef} />
        <ProceduralEnvironment preset={config?.envPreset} />
        {activeChapter.spatialAnnotations.map(h => <HotspotMarker key={h.id} hotspot={h} />)}
      </Suspense>

      {config?.showFloor && (
        <>
          <ContactShadows opacity={0.6} scale={40} blur={2} far={15} color="#000000" position={[0, -0.01, 0]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#050505" roughness={0.5} metalness={0.8} transparent opacity={0.8} />
          </mesh>
          <gridHelper args={[100, 100, 0x333333, 0x111111]} position={[0, -0.02, 0]} />
        </>
      )}

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={config?.bloomIntensity || 1.5} luminanceThreshold={config?.bloomThreshold || 0.9} mipmapBlur />
        <DepthOfField focusDistance={config?.focusDistance || 0.01} focalLength={0.2} bokehScale={config?.bokehScale || 2} />
        <ChromaticAberration offset={new THREE.Vector2(config?.chromaticAberration || 0.001, config?.chromaticAberration || 0.001)} />
        <Vignette darkness={config?.vignetteDarkness || 1.1} />
        {isTransitioning && <Glitch strength={new THREE.Vector2(0.3, 1.0)} mode={1} />}
      </EffectComposer>
    </>
  );
};

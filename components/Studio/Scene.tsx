
import React, { useRef, useMemo, Suspense, startTransition, useLayoutEffect, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  OrbitControls, 
  PerspectiveCamera, 
  Html,
  Environment
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Outline, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from '../../useStore';
import { useGSAPTimeline } from '../../hooks/useGSAPTimeline';
import { Hotspot } from '../../types';

// R3F Intrinsic Elements workaround for TypeScript
const Group = 'group' as any;
const Primitive = 'primitive' as any;
const Color = 'color' as any;
const FogExp2 = 'fogExp2' as any;
const AmbientLight = 'ambientLight' as any;
const DirectionalLight = 'directionalLight' as any;

const HotspotMarker: React.FC<{ hotspot: Hotspot }> = ({ hotspot }) => {
  const { currentProgress } = useStore();
  const distance = Math.abs(currentProgress - hotspot.visibleAt);
  const isActive = distance < 0.12;
  const opacity = Math.max(0, 1 - (distance * 10));

  if (opacity <= 0) return null;

  return (
    <Html position={hotspot.position} center distanceFactor={8} zIndexRange={[100, 0]}>
      <div className="relative transition-all duration-1000" style={{ opacity }}>
        <div className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8">
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full animate-pulse"></div>
          <div className={`w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_20px_white] transition-all ${isActive ? 'scale-150' : 'scale-50'}`}></div>
        </div>
      </div>
    </Html>
  );
};

const ModelPrimitive: React.FC<{ url: string; modelRef: React.RefObject<THREE.Group>; materialOverrides: any; scale: number; position: [number, number, number]; rotation: [number, number, number] }> = ({ url, modelRef, materialOverrides, scale, position, rotation }) => {
  const { setEngineError, mode, setSelectedMesh, isPlacingHotspot, addHotspot, currentProgress, setAudit } = useStore();
  const { gl } = useThree();
  
  const { scene } = useGLTF(url || '', true, false, (loader) => {
    loader.manager.onError = (e) => setEngineError(`Failed to load asset: ${e}`);
  });
  
  const meshRegistry = useMemo(() => {
    const registry = new Map<string, THREE.Mesh>();
    if (scene) {
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) registry.set(obj.name, obj as THREE.Mesh);
      });
    }
    return registry;
  }, [scene]);

  useLayoutEffect(() => {
    if (!scene) return;
    scene.position.set(0, 0, 0);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.x = -center.x;
    scene.position.z = -center.z;
    scene.position.y = -box.min.y; 
    scene.updateMatrixWorld(true);

    if (gl?.info) {
      setAudit({
        polyCount: gl.info.render.triangles,
        drawCalls: gl.info.render.calls,
        vramEstimateMB: Math.round(gl.info.memory.textures + gl.info.memory.geometries),
        status: 'optimal'
      });
    }
  }, [scene, gl, setAudit]);

  useLayoutEffect(() => {
    if (!scene || !meshRegistry) return;
    meshRegistry.forEach((mesh, name) => {
      const override = materialOverrides[name];
      if (!override) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.color.set(override.color);
          m.emissive.set(override.emissive);
          m.emissiveIntensity = override.emissiveIntensity;
          m.metalness = override.metalness;
          m.roughness = override.roughness;
          m.wireframe = !!override.wireframe;
          m.needsUpdate = true;
        }
      });
    });
  }, [scene, meshRegistry, materialOverrides]);

  if (!scene) return null;

  return (
    /* Use Group and Primitive constants to satisfy TypeScript */
    <Group ref={modelRef} scale={scale} position={position} rotation={rotation}>
      <Primitive object={scene} onPointerDown={(e: any) => {
          e.stopPropagation();
          const intersection = e.intersections?.[0];
          if (!intersection) return;
          if (isPlacingHotspot) {
            const point = intersection.point;
            const normal = intersection.face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(intersection.object.matrixWorld)).normalize();
            startTransition(() => {
              addHotspot({ id: Math.random().toString(36).substr(2, 9), label: 'PIN_NAME', content: 'Description...', position: [point.x, point.y, point.z], normal: [normal.x, normal.y, normal.z], visibleAt: currentProgress, side: 'auto' });
            });
          } else if (mode === 'edit') setSelectedMesh(intersection.object.name);
        }} 
      />
    </Group>
  );
};

export const Scene: React.FC = () => {
  const { chapters, activeChapterId, mode, viewMode, currentProgress, isPlacingHotspot, selectedMeshName } = useStore();
  const { gl } = useThree();
  const cinemaCamRef = useRef<THREE.PerspectiveCamera>(null!);
  const freeCamRef = useRef<THREE.PerspectiveCamera>(null!);
  const lookAtProxy = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const modelRef = useRef<THREE.Group>(null);

  const currentChapter = useMemo(() => {
    if (mode === 'edit') return chapters.find(c => c.id === activeChapterId);
    return chapters.find(c => currentProgress >= c.startProgress && currentProgress <= c.endProgress) || chapters[0];
  }, [mode, chapters, activeChapterId, currentProgress]);

  const config = currentChapter?.environment;
  useGSAPTimeline(cinemaCamRef.current, lookAtProxy, modelRef);

  useEffect(() => {
    if (gl && config) {
      gl.toneMappingExposure = config.exposure;
    }
  }, [gl, config?.exposure]);

  const selectedMesh = useMemo(() => {
    if (!selectedMeshName || !modelRef.current) return null;
    let found: THREE.Object3D | null = null;
    modelRef.current.traverse(obj => { if (obj.name === selectedMeshName) found = obj; });
    return found;
  }, [selectedMeshName, currentChapter?.id]);

  if (!currentChapter || !config) return null;

  return (
    <>
      <PerspectiveCamera ref={cinemaCamRef} makeDefault={viewMode === 'cinema'} fov={config.defaultFov || 35} position={[10, 10, 10]} />
      <PerspectiveCamera ref={freeCamRef} makeDefault={viewMode === 'free'} fov={50} position={[15, 15, 15]} />

      {mode === 'edit' && (
        <OrbitControls 
          camera={viewMode === 'cinema' ? cinemaCamRef.current : freeCamRef.current}
          enabled={!isPlacingHotspot} 
        />
      )}

      {/* Use R3F constants for scene elements */}
      <Color attach="background" args={[config.backgroundColor]} />
      <FogExp2 attach="fog" args={[config.fogColor, config.fogDensity ?? 0.08]} />
      <AmbientLight intensity={config.ambientIntensity ?? 0.4} />
      <DirectionalLight position={[10, 10, 5]} intensity={config.directionalIntensity ?? 1.2} castShadow />
      
      <Suspense fallback={null}>
        <ModelPrimitive 
          url={currentChapter.modelUrl} 
          modelRef={modelRef} 
          materialOverrides={currentChapter.materialOverrides} 
          scale={config.modelScale || 1}
          position={config.modelPosition || [0,0,0]}
          rotation={config.modelRotation || [0,0,0]}
        />
        <Environment preset={config.envPreset} />
        {currentChapter.spatialAnnotations.map(h => <HotspotMarker key={h.id} hotspot={h} />)}
      </Suspense>

      {gl && (
        <EffectComposer multisampling={8}>
          <Bloom intensity={config.bloomIntensity} luminanceThreshold={config.bloomThreshold} mipmapBlur />
          {selectedMesh && <Outline selection={[selectedMesh as any]} visibleEdgeColor={0x10b981} edgeStrength={5} />}
          <Vignette darkness={config.vignetteDarkness} />
          <ChromaticAberration offset={new THREE.Vector2(config.chromaticAberration, config.chromaticAberration)} />
        </EffectComposer>
      )}
    </>
  );
};

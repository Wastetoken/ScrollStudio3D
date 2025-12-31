import React, { useRef, useMemo, Suspense, startTransition, useLayoutEffect, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  PerspectiveCamera,
  Html,
  Environment,
  Grid,
  TransformControls,
  useHelper
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Outline, ChromaticAberration, DepthOfField, Noise, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from '../../useStore';
import { useGSAPTimeline } from '../../useGSAPTimeline';
import { Hotspot } from '../../types';
import { CameraPathVisualizer } from './CameraPath/CameraPathVisualizer';
import { KeyframeMarkers } from './CameraPath/KeyframeMarkers';
import { createCurvesFromKeyframes, interpolateCameraState } from './cameraUtils';

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

const ModelPrimitive: React.FC<{ url: string; modelRef: React.RefObject<THREE.Group>; materialOverrides: any; scale: number; position: [number, number, number]; rotation: [number, number, number]; controlsRef?: React.RefObject<any> }> = ({ url, modelRef, materialOverrides, scale, position, rotation, controlsRef }) => {
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
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const normScale = 10 / maxDim;

    // Apply normalization scale
    scene.scale.set(normScale, normScale, normScale);
    scene.updateMatrixWorld(true);

    // Recalculate bounds after scaling for centering
    const newBox = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    newBox.getCenter(center);

    scene.position.x = -center.x;
    scene.position.z = -center.z;
    scene.position.y = -newBox.min.y;
    scene.updateMatrixWorld(true);

    // Auto-Framing: Set Controls target to model center
    if (controlsRef?.current) {
      controlsRef.current.target.set(0, (newBox.max.y - newBox.min.y) / 2, 0);
      controlsRef.current.update();
    }

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

const KeyframeCaptureHandler: React.FC<{ trigger: number; orbitControls: React.RefObject<any>; camera: React.RefObject<THREE.PerspectiveCamera> }> = ({ trigger, orbitControls, camera }) => {
  const { addKeyframe, currentProgress, activeChapterId, chapters } = useStore();
  const prevTrigger = useRef(0);

  useEffect(() => {
    if (trigger > prevTrigger.current && camera.current) {
      prevTrigger.current = trigger;
      const activeChapter = chapters.find(c => c.id === activeChapterId);
      if (!activeChapter) return;

      const localProgress = THREE.MathUtils.clamp(
        (currentProgress - activeChapter.startProgress) / (activeChapter.endProgress - activeChapter.startProgress),
        0,
        1
      );

      // Precision Viewport Raycasting
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera.current);
      const intersects = raycaster.intersectObjects(camera.current.parent!.children, true);

      let targetVec = new THREE.Vector3(0, 0, 0);
      if (intersects.length > 0) {
        targetVec.copy(intersects[0].point);
      } else if (orbitControls?.current) {
        targetVec.copy(orbitControls.current.target);
      }

      const pos = camera.current.position;
      const conf = activeChapter.environment;

      addKeyframe({
        id: Math.random().toString(36).substr(2, 9),
        progress: localProgress,
        position: [pos.x, pos.y, pos.z],
        target: [targetVec.x, targetVec.y, targetVec.z],
        quaternion: [camera.current.quaternion.x, camera.current.quaternion.y, camera.current.quaternion.z, camera.current.quaternion.w],
        fov: camera.current.fov,
        // Cinematic Lens
        focusDistance: conf?.focusDistance || 5,
        aperture: conf?.aperture || 0.02,
        bokehScale: conf?.bokehScale || 1,
      });
    }
  }, [trigger, camera, orbitControls, addKeyframe, currentProgress]);

  return null;
};

export const Scene: React.FC = () => {
  const { chapters, activeChapterId, mode, viewMode, currentProgress, isPlacingHotspot, selectedMeshName, selectedKeyframeId, setConfig } = useStore();
  const { gl } = useThree();
  const cinemaCamRef = useRef<THREE.PerspectiveCamera>(null!);
  const freeCamRef = useRef<THREE.PerspectiveCamera>(null!);
  const lookAtProxy = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const modelRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  const captureKeyframeTrigger = useStore(s => s.captureKeyframeTrigger);

  const currentChapter = useMemo(() => {
    if (mode === 'edit') return chapters.find(c => c.id === activeChapterId);
    return chapters.find(c => currentProgress >= c.startProgress && currentProgress <= c.endProgress) || chapters[0];
  }, [mode, chapters, activeChapterId, currentProgress]);

  const config = currentChapter?.environment;
  useGSAPTimeline(cinemaCamRef.current, lookAtProxy, modelRef);

  // Show Camera Helper in Free Mode
  useHelper(viewMode === 'free' ? cinemaCamRef : null, THREE.CameraHelper);

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

  // Preview Mode Logic
  useFrame(() => {
    if (mode === 'preview' && currentChapter) {
      // Create curves efficiently (memoization would be better but this ensures sync)
      // In a real optimized app, we'd memoize these curves whenever keyframes change.
      // Given we are inside usestore, let's trust the component re-renders when data changes.
      // But for useFrame, we shouldn't recreate curves every frame!
      // Let's rely on a ref or memo that updates when chapter changes.
    }
  });

  // Optimized Curve Memoization
  const curves = useMemo(() => {
    if (!currentChapter || !config) return null;
    return createCurvesFromKeyframes(currentChapter.cameraPath, config.splineAlpha);
  }, [currentChapter?.cameraPath, config?.splineAlpha]);

  const lensStateRef = useRef({ focusDistance: 5, aperture: 0.02, bokehScale: 1, target: new THREE.Vector3() });
  const dofRef = useRef<any>(null);

  useFrame((state) => {
    if (mode === 'preview' && curves && curves.posCurve && curves.targetCurve) {
      const ch = chapters.find(c => currentProgress >= c.startProgress && currentProgress <= c.endProgress) || chapters[0];
      if (ch) {
        const localT = (currentProgress - ch.startProgress) / (ch.endProgress - ch.startProgress);
        const safeT = Number.isFinite(localT) ? localT : 0;

        const cameraState = interpolateCameraState(
          safeT,
          ch.cameraPath.sort((a, b) => a.progress - b.progress),
          config.splineAlpha,
          curves.posCurve,
          curves.targetCurve
        );

        if (cinemaCamRef.current) {
          cinemaCamRef.current.position.copy(cameraState.position);
          cinemaCamRef.current.lookAt(cameraState.target);
          cinemaCamRef.current.fov = cameraState.fov;
          cinemaCamRef.current.updateProjectionMatrix();

          // Update Lens Ref
          lensStateRef.current.focusDistance = cameraState.focusDistance;
          lensStateRef.current.aperture = cameraState.aperture;
          lensStateRef.current.bokehScale = cameraState.bokehScale;
          lensStateRef.current.target.copy(cameraState.target);

          // Direct Uniform Injection for DoF
          if (dofRef.current) {
            dofRef.current.focusDistance = cameraState.focusDistance;
            dofRef.current.bokehScale = cameraState.bokehScale;
            // Map aperture to focalLength (multiplier for visibility)
            dofRef.current.focalLength = cameraState.aperture * 5.0;
          }
        }
      }
    } else if (mode === 'edit' && config) {
      // In edit mode, use direct config values
      lensStateRef.current.focusDistance = config.focusDistance;
      lensStateRef.current.aperture = config.aperture;
      lensStateRef.current.bokehScale = config.bokehScale;

      if (dofRef.current) {
        dofRef.current.focusDistance = config.focusDistance;
        dofRef.current.bokehScale = config.bokehScale;
        dofRef.current.focalLength = config.aperture * 5.0;
      }
    }
  });

  if (!currentChapter || !config) return null;

  return (
    <>
      <PerspectiveCamera ref={cinemaCamRef} makeDefault={viewMode === 'cinema'} fov={config.defaultFov || 35} position={[10, 10, 10]} />
      <PerspectiveCamera ref={freeCamRef} makeDefault={viewMode === 'free'} fov={50} position={[15, 15, 15]} />

      {mode === 'edit' && (
        <OrbitControls
          ref={controlsRef}
          camera={viewMode === 'cinema' ? cinemaCamRef.current : freeCamRef.current}
          enabled={!isPlacingHotspot}
        />
      )}

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
          position={config.modelPosition || [0, 0, 0]}
          rotation={config.modelRotation || [0, 0, 0]}
          controlsRef={controlsRef}
        />
        <Environment preset={config.envPreset} environmentIntensity={config.envMapIntensity ?? 1} />
        {config.showFloor && <Grid infiniteGrid fadeDistance={50} sectionColor={0x10b981} cellColor={0x0b1210} />}

        {mode === 'edit' && !isPlacingHotspot && !selectedMeshName && !selectedKeyframeId && (
          <TransformControls
            object={modelRef}
            mode="translate"
            {...{
              onDraggingChanged: (e: any) => {
                if (controlsRef.current) {
                  controlsRef.current.enabled = !e.value;
                }
              }
            }}
            onMouseUp={() => {
              if (modelRef.current) {
                const { position, rotation, scale } = modelRef.current;
                setConfig({
                  modelPosition: [position.x, position.y, position.z],
                  modelRotation: [rotation.x, rotation.y, rotation.z]
                });
              }
            }}
          />
        )}

        <KeyframeCaptureHandler
          trigger={captureKeyframeTrigger}
          orbitControls={controlsRef}
          camera={viewMode === 'cinema' ? cinemaCamRef : freeCamRef}
        />

        <KeyframeMarkers orbitControls={controlsRef} />
        <CameraPathVisualizer />

        {currentChapter.spatialAnnotations.map(h => <HotspotMarker key={h.id} hotspot={h} />)}
      </Suspense>

      {gl && (
        <EffectComposer multisampling={4}>
          <Bloom intensity={config.bloomIntensity} luminanceThreshold={config.bloomThreshold} mipmapBlur />
          {selectedMesh && <Outline selection={[selectedMesh as any]} visibleEdgeColor={0x10b981} edgeStrength={5} />}
          <Vignette darkness={config.vignetteDarkness} />
          <ChromaticAberration
            offset={new THREE.Vector2(config.chromaticAberration, config.chromaticAberration)}
            radialModulation={false}
            modulationOffset={0}
          />
          <DepthOfField
            ref={dofRef}
            focusDistance={lensStateRef.current.focusDistance}
            focalLength={lensStateRef.current.aperture * 5.0}
            bokehScale={lensStateRef.current.bokehScale}
            height={480}
          />
          <Noise opacity={config.grainIntensity} />
          <Scanline density={1.25} opacity={config.scanlineIntensity} />
        </EffectComposer>
      )}
    </>
  );
};
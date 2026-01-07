import React, { useMemo, Suspense, useState, useLayoutEffect, ReactNode, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  PerspectiveCamera,
  Environment,
  Html,
  ScrollControls,
  useScroll,
  Preload,
  ContactShadows,
  MeshReflectorMaterial
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField, ChromaticAberration } from '@react-three/postprocessing';
import { ProjectSchema, SceneChapter, Hotspot, StorySection, FontDefinition } from '../../types';
import { createCurvesFromKeyframes, interpolateCameraState } from './cameraUtils';

const Group = 'group' as any;
const Primitive = 'primitive' as any;
const Color = 'color' as any;
const FogExp2 = 'fogExp2' as any;
const AmbientLight = 'ambientLight' as any;
const DirectionalLight = 'directionalLight' as any;
const Mesh = 'mesh' as any;
const PlaneGeometry = 'planeGeometry' as any;

interface EngineProps {
  data: ProjectSchema;
}

const loadPlayerFont = (font: FontDefinition) => {
  const existingElement = document.getElementById(`font-${font.id}`);
  if (existingElement) return;

  if (font.source === 'cdn' && font.url) {
    const link = document.createElement('link');
    link.id = `font-${font.id}`;
    link.rel = 'stylesheet';
    link.href = font.url;
    document.head.appendChild(link);
  } else if (font.source === 'local') {
    const style = document.createElement('style');
    style.id = `font-${font.id}`;
    const src = font.data ? font.data : font.localPath;
    if (!src) return;

    style.textContent = `
      @font-face {
        font-family: '${font.name}';
        src: url('${src}') format('woff2');
        font-weight: ${font.weights?.join(' ') || 'normal'};
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }
};

const IndexedChapterModel: React.FC<{ chapter: SceneChapter }> = ({ chapter }) => {
  const { scene } = useGLTF(chapter.modelUrl);

  const meshRegistry = useMemo(() => {
    const registry = new Map<string, THREE.Mesh>();
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        registry.set(obj.name, obj as THREE.Mesh);
      }
    });
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

    scene.scale.set(normScale, normScale, normScale);
    scene.updateMatrixWorld(true);

    const newBox = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    newBox.getCenter(center);

    scene.position.x = -center.x;
    scene.position.z = -center.z;
    scene.position.y = -newBox.min.y;
    scene.updateMatrixWorld(true);

    const overrides = chapter.materialOverrides;
    if (!overrides) return;

    meshRegistry.forEach((mesh, name) => {
      const settings = overrides[name];
      if (settings) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.color.set(settings.color);
            mat.emissive.set(settings.emissive);
            mat.emissiveIntensity = settings.emissiveIntensity;
            mat.metalness = settings.metalness;
            mat.roughness = settings.roughness;
            mat.wireframe = !!settings.wireframe;
            mat.needsUpdate = true;
          }
        });
      }
    });
  }, [chapter.id, meshRegistry, chapter.materialOverrides, scene]);

  const { environment: config } = chapter;

  return (
    <Group scale={config.modelScale} position={config.modelPosition} rotation={config.modelRotation}>
      <Primitive object={scene} />
    </Group>
  );
};

const SpatialAnnotation: React.FC<{ hotspot: Hotspot; scrollProgress: number }> = ({ hotspot, scrollProgress }) => {
  const distance = Math.abs(scrollProgress - hotspot.visibleAt);
  const opacity = THREE.MathUtils.smoothstep(distance, 0.12, 0.04);
  if (opacity <= 0) return null;
  return (
    <Html position={hotspot.position} center distanceFactor={12}>
      <div style={{ opacity, transition: 'opacity 0.4s', width: '280px', padding: '1.5rem', background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(32px)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
        <h4 className="m-0 text-[10px] font-black uppercase tracking-[0.2em]">{hotspot.label}</h4>
        <p className="m-0 text-[11px] leading-relaxed opacity-60 font-medium">{hotspot.content}</p>
      </div>
    </Html>
  );
};

const ScrollyRig: React.FC<{ chapters: SceneChapter[]; isMobile: boolean }> = ({ chapters, isMobile }) => {
  const { camera, gl, scene } = useThree();
  const scroll = useScroll();
  const [activeChapterId, setActiveChapterId] = useState(chapters[0].id);
  const bloomPassRef = useRef<any>(null);

  const currentChapter = useMemo(() =>
    chapters.find(c => scroll.offset >= c.startProgress && scroll.offset <= c.endProgress) || chapters[0],
    [scroll.offset, chapters]
  );

  const config = currentChapter.environment;

  useLayoutEffect(() => {
    if (gl) gl.toneMappingExposure = config.exposure ?? 1.0;
    if (camera) camera.up.set(0, 1, 0.000001);
    if (scene) {
      // @ts-ignore
      scene.environmentIntensity = config.envMapIntensity ?? 1.0;
    }
  }, [gl, scene, config.exposure, config.envMapIntensity, camera]);

  useEffect(() => {
    if (bloomPassRef.current && config) {
      bloomPassRef.current.intensity = config.bloomIntensity ?? 1.5;
      bloomPassRef.current.luminanceThreshold = config.bloomThreshold ?? 0.8;
    }
  }, [config.bloomIntensity, config.bloomThreshold]);

  const curves = useMemo(() => {
    const sorted = [...currentChapter.cameraPath].sort((a, b) => a.progress - b.progress);
    const { posCurve, targetCurve } = createCurvesFromKeyframes(sorted, config.splineAlpha);
    return { posCurve, targetCurve, sorted };
  }, [currentChapter.id, currentChapter.cameraPath, config.splineAlpha]);

  const lensStateRef = useRef({ focusDistance: 10, aperture: 0.2, bokehScale: 2 });
  const dofRef = useRef<any>(null);

  useFrame(() => {
    const progress = scroll.offset;
    const found = chapters.find(c => progress >= c.startProgress && progress <= c.endProgress);
    if (found && found.id !== activeChapterId) setActiveChapterId(found.id);

    const duration = currentChapter.endProgress - currentChapter.startProgress;
    const localT = duration === 0 ? 0 : (progress - currentChapter.startProgress) / duration;

    const state = interpolateCameraState(localT, curves.sorted, config.splineAlpha, curves.posCurve, curves.targetCurve);

    camera.position.copy(state.position);
    camera.lookAt(state.target);
    (camera as THREE.PerspectiveCamera).fov = state.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    // Update dynamic lens state
    lensStateRef.current.focusDistance = state.focusDistance;
    lensStateRef.current.aperture = state.aperture;
    lensStateRef.current.bokehScale = state.bokehScale;

    if (dofRef.current) {
      dofRef.current.focusDistance = state.focusDistance;
      dofRef.current.bokehScale = state.bokehScale;
      // Consistent multiplier with editor
      dofRef.current.focalLength = state.aperture * 5.0;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={config.defaultFov} position={[0, 0, 20]} />
      <Color attach="background" args={[config.backgroundColor]} />
      <FogExp2 attach="fog" args={[config.fogColor, (config.fogDensity ?? 0) * 0.1]} />
      <AmbientLight intensity={config.ambientIntensity ?? 0.3} />
      <DirectionalLight position={[10, 10, 5]} intensity={config.directionalIntensity ?? 0.8} />

      <Suspense fallback={<Html center><div className="flex flex-col items-center gap-4"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div><span className="text-[10px] font-black uppercase tracking-widest opacity-40">Loading Assets...</span></div></Html>}>
        <IndexedChapterModel chapter={currentChapter} />
        <Environment preset={config.envPreset as any} />
        {currentChapter.spatialAnnotations.map(h => <SpatialAnnotation key={h.id} hotspot={h} scrollProgress={scroll.offset} />)}
        <Preload all />
      </Suspense>

      {config.showFloor && (
        <>
          <ContactShadows opacity={0.3} scale={40} blur={2.5} far={10} color="#000000" position={[0, 0, 0]} />
          <Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
            <PlaneGeometry args={[100, 100]} />
            <MeshReflectorMaterial blur={[300, 100]} resolution={1024} mixBlur={1} mixStrength={40} roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4} color={config.backgroundColor} metalness={0.5} mirror={0} />
          </Mesh>
        </>
      )}

      <EffectComposer multisampling={4} enableNormalPass={false}>
        <Bloom ref={bloomPassRef} intensity={config.bloomIntensity ?? 1.5} luminanceThreshold={config.bloomThreshold ?? 0.9} mipmapBlur />
        <DepthOfField
          ref={dofRef}
          focusDistance={lensStateRef.current.focusDistance}
          focalLength={lensStateRef.current.aperture * 5.0}
          bokehScale={lensStateRef.current.bokehScale}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(config.chromaticAberration ?? 0, config.chromaticAberration ?? 0)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette darkness={isMobile ? (config.vignetteDarkness ?? 1.1) * 0.7 : (config.vignetteDarkness ?? 1.1)} />
      </EffectComposer>
    </>
  );
};

const StoryOverlay: React.FC<{ chapters: SceneChapter[]; typography?: ProjectSchema['typography'] }> = ({ chapters, typography }) => {
  const scroll = useScroll();
  const [progress, setProgress] = useState(0);
  const allBeats = useMemo(() => chapters.flatMap(c => c.narrativeBeats), [chapters]);
  useFrame(() => { if (Math.abs(scroll.offset - progress) > 0.0001) setProgress(scroll.offset); });
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {allBeats.map((beat, idx) => {
        const nextBeat = allBeats[idx + 1];
        const end = nextBeat ? nextBeat.progress : 1.1;
        const isActive = progress >= beat.progress && progress < end;
        const dist = Math.abs(progress - beat.progress);
        const opacity = isActive ? 1 : Math.max(0, 1 - dist * 10);
        if (opacity <= 0) return null;
        const { style } = beat;
        const customFont = style.fontFamily && typography?.fonts ? typography.fonts.find(f => f.id === style.fontFamily) : null;
        const fontClass = { display: 'font-black italic uppercase tracking-tighter', serif: 'font-serif font-bold italic', sans: 'font-sans font-bold', mono: 'font-mono uppercase tracking-[0.2em]', brutalist: 'font-black uppercase tracking-[-0.05em]' }[style.fontVariant];
        const fontFamily = customFont ? `'${customFont.name}', ${customFont.fallback || 'sans-serif'}` : undefined;
        return (
          <div key={beat.id} style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: beat.style.textAlign === 'center' ? 'center' : (beat.style.textAlign === 'right' ? 'flex-end' : 'flex-start'), opacity, transform: `translateY(${(1 - opacity) * 30}px)`, transition: 'opacity 0.8s, transform 0.8s', textAlign: beat.style.textAlign, padding: '10vw' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: `blur(${style.backdropBlur || 30}px)`, borderRadius: `${style.borderRadius || 30}px`, padding: `${style.padding || 40}px`, border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 className={customFont ? '' : fontClass} style={{ fontSize: 'clamp(2rem, 8vw, 6rem)', fontWeight: beat.style.fontWeight === 'black' ? 900 : 700, textTransform: 'uppercase', lineHeight: 0.85, marginBottom: '1.5rem', fontStyle: 'italic', fontFamily, color: beat.style.titleColor, textShadow: beat.style.textGlow ? `0 0 40px ${beat.style.titleColor}88` : 'none' }}>{beat.title}</h2>
              <p style={{ fontSize: '1.15rem', lineHeight: 1.6, opacity: 0.6, maxWidth: '500px', color: beat.style.descriptionColor, fontFamily }}>{beat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

export const ScrollyEngine: React.FC<EngineProps> = ({ data }) => {
  if (!data || !data.chapters || data.chapters.length === 0) return null;
  const isMobile = useMobile();
  const prefersReducedMotion = useMemo(() => typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false, []);
  const processedData = useMemo(() => {
    const chapters = data.chapters.map(c => {
      if (data.embeddedAssets && data.embeddedAssets[c.id]) {
        try {
          const base64 = data.embeddedAssets[c.id];
          const binary = atob(base64.split(',')[1] || base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob) + '#.glb';
          return { ...c, modelUrl: url };
        } catch (e) { console.error("Asset error:", e); }
      }
      return c;
    });
    return { ...data, chapters };
  }, [data]);
  useLayoutEffect(() => { if (processedData.typography?.fonts) processedData.typography.fonts.forEach(loadPlayerFont); }, [processedData.typography]);
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <Canvas shadows={!isMobile} dpr={isMobile ? [1, 1] : [1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <ScrollControls pages={processedData.chapters.length * 4} damping={prefersReducedMotion ? 0.05 : 0.25} infinite={false}>
          <ScrollyRig chapters={processedData.chapters} isMobile={isMobile} />
          <StoryOverlay chapters={processedData.chapters} typography={processedData.typography} />
        </ScrollControls>
      </Canvas>
    </div>
  );
};

export default ScrollyEngine;
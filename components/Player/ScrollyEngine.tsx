
import React, { useMemo, Suspense, useState, useLayoutEffect, ErrorInfo, ReactNode, useEffect } from 'react';
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
import { ProjectSchema, SceneChapter, Hotspot } from '../../types';

interface EngineProps {
  data: ProjectSchema;
}

/**
 * PRODUCTION ERROR BOUNDARY
 */
interface EngineErrorBoundaryProps {
  children?: ReactNode;
}

interface EngineErrorBoundaryState {
  hasError: boolean;
  errorDetail?: string;
}

class EngineErrorBoundary extends React.Component<EngineErrorBoundaryProps, EngineErrorBoundaryState> {
  state: EngineErrorBoundaryState = { hasError: false };
  
  static getDerivedStateFromError() { 
    return { hasError: true }; 
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ScrollyEngine Critical Failure:", error, errorInfo);
    this.setState({ errorDetail: error.message });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-black text-white p-10 text-center">
          <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-black uppercase italic tracking-tighter">Engine Stalled</h2>
          <p className="text-xs opacity-50 max-w-xs mt-2">Failed to initialize 3D context. Check asset URLs and VRAM limits.</p>
          {this.state.errorDetail && (
            <p className="text-[8px] font-mono opacity-30 mt-4 max-w-md break-all">{this.state.errorDetail}</p>
          )}
          <button onClick={() => window.location.reload()} className="mt-6 px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-full">Restart Core</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * REACTIVE MOBILE DETECTION HOOK
 */
function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.innerWidth < 768 || 
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

/**
 * OPTIMIZED MESH COMPONENT
 */
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
  }, [chapter.id, meshRegistry, chapter.materialOverrides]);

  return <primitive object={scene} />;
};

const SpatialAnnotation: React.FC<{ hotspot: Hotspot; scrollProgress: number }> = ({ hotspot, scrollProgress }) => {
  const distance = Math.abs(scrollProgress - hotspot.visibleAt);
  const opacity = THREE.MathUtils.smoothstep(distance, 0.12, 0.04);
  
  if (opacity <= 0) return null;

  return (
    <Html position={hotspot.position} center distanceFactor={12}>
      <div 
        style={{ 
          opacity, 
          transition: 'opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          pointerEvents: opacity > 0.8 ? 'auto' : 'none',
          width: '280px',
          padding: '1.5rem',
          background: 'rgba(5,5,5,0.9)',
          backdropFilter: 'blur(32px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
          color: 'white'
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
          <h4 className="m-0 text-[10px] font-black uppercase tracking-[0.2em]">{hotspot.label}</h4>
        </div>
        <p className="m-0 text-[11px] leading-relaxed opacity-60 font-medium">{hotspot.content}</p>
      </div>
    </Html>
  );
};

const ScrollyRig: React.FC<{ chapters: SceneChapter[]; isMobile: boolean }> = ({ chapters, isMobile }) => {
  const { camera, gl } = useThree();
  const scroll = useScroll();
  const lookAtTarget = useMemo(() => new THREE.Vector3(), []);
  const [activeChapterId, setActiveChapterId] = useState(chapters[0].id);

  const currentChapter = useMemo(() => 
    chapters.find(c => c.id === activeChapterId) || chapters[0], 
    [activeChapterId, chapters]
  );

  useLayoutEffect(() => {
    if (gl) {
      gl.toneMappingExposure = currentChapter.environment.exposure ?? 1.0;
    }
  }, [gl, currentChapter.environment.exposure]);

  const curves = useMemo(() => {
    const path = currentChapter.cameraPath;
    if (path.length < 2) return null;
    
    const splineAlpha = currentChapter.environment.splineAlpha || 0.5;
    const curveType = splineAlpha === 0 ? 'centripetal' : splineAlpha === 1 ? 'chordal' : 'catmullrom';

    const pos = new THREE.CatmullRomCurve3(path.map(k => new THREE.Vector3(...k.position)));
    pos.curveType = curveType;
    
    const target = new THREE.CatmullRomCurve3(path.map(k => new THREE.Vector3(...k.target)));
    target.curveType = curveType;

    return { pos, target, keyframes: path };
  }, [currentChapter.id, currentChapter.cameraPath, currentChapter.environment.splineAlpha]);

  useFrame(() => {
    const progress = scroll.offset;
    // Find active chapter based on overall scroll progress
    const found = chapters.find(c => progress >= c.startProgress && progress <= c.endProgress);
    if (found && found.id !== activeChapterId) {
      setActiveChapterId(found.id);
    }

    if (!curves) {
      // Static fallback if only one keyframe exists
      if (currentChapter.cameraPath.length === 1) {
        const kf = currentChapter.cameraPath[0];
        camera.position.set(...kf.position);
        camera.lookAt(...kf.target);
        (camera as THREE.PerspectiveCamera).fov = kf.fov;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
      return;
    }

    // Calculate normalized progress within the active chapter
    const duration = currentChapter.endProgress - currentChapter.startProgress;
    const localT = THREE.MathUtils.clamp((progress - currentChapter.startProgress) / (duration || 1), 0, 1);

    // Camera Interpolation
    camera.position.copy(curves.pos.getPointAt(localT));
    lookAtTarget.copy(curves.target.getPointAt(localT));
    camera.lookAt(lookAtTarget);

    // FOV Interpolation
    const kfs = curves.keyframes;
    const idx = kfs.findIndex((kf, i) => i === kfs.length - 1 || localT < kfs[i + 1].progress);
    const kfA = kfs[idx];
    const kfB = kfs[idx + 1] || kfA;
    const segmentT = kfA === kfB ? 0 : (localT - kfA.progress) / (kfB.progress - kfA.progress);
    
    (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(kfA.fov, kfB.fov, THREE.MathUtils.clamp(segmentT, 0, 1));
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={currentChapter.environment.defaultFov} position={[0, 0, 20]} />
      <color attach="background" args={[currentChapter.environment.backgroundColor]} />
      <fog attach="fog" args={[currentChapter.environment.fogColor, 0, 100 / (currentChapter.environment.fogDensity || 0.001)]} />
      <ambientLight intensity={currentChapter.environment.ambientIntensity} />
      <directionalLight position={[10, 10, 5]} intensity={currentChapter.environment.directionalIntensity} />
      
      <Suspense fallback={
        <Html center>
           <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Loading Assets...</span>
           </div>
        </Html>
      }>
        <IndexedChapterModel chapter={currentChapter} />
        <Environment preset={currentChapter.environment.envPreset as any} />
        {currentChapter.spatialAnnotations.map(h => (
          <SpatialAnnotation key={h.id} hotspot={h} scrollProgress={scroll.offset} />
        ))}
        <Preload all />
      </Suspense>

      {currentChapter.environment.showFloor && (
        <>
          <ContactShadows opacity={0.3} scale={40} blur={2.5} far={10} color="#000000" position={[0, -0.01, 0]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
            <planeGeometry args={[100, 100]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={1024}
              mixBlur={1}
              mixStrength={40}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050505"
              metalness={0.5}
              mirror={0}
            />
          </mesh>
        </>
      )}

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          intensity={currentChapter.environment.bloomIntensity} 
          luminanceThreshold={currentChapter.environment.bloomThreshold || 0.9} 
          mipmapBlur 
        />
        <DepthOfField 
          focusDistance={currentChapter.environment.focusDistance} 
          focalLength={currentChapter.environment.aperture || 0.2} 
          bokehScale={currentChapter.environment.bokehScale} 
        />
        <ChromaticAberration 
          offset={new THREE.Vector2(currentChapter.environment.chromaticAberration, currentChapter.environment.chromaticAberration)} 
        />
        <Vignette darkness={isMobile ? currentChapter.environment.vignetteDarkness * 0.7 : currentChapter.environment.vignetteDarkness} />
      </EffectComposer>
    </>
  );
};

const StoryOverlay: React.FC<{ chapters: SceneChapter[] }> = ({ chapters }) => {
  const scroll = useScroll();
  const [progress, setProgress] = useState(0);
  const allBeats = useMemo(() => chapters.flatMap(c => c.narrativeBeats), [chapters]);

  useFrame(() => {
    if (Math.abs(scroll.offset - progress) > 0.0001) {
      setProgress(scroll.offset);
    }
  });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {allBeats.map((beat, idx) => {
        const nextBeat = allBeats[idx + 1];
        const end = nextBeat ? nextBeat.progress : 1.1;
        const isActive = progress >= beat.progress && progress < end;
        const dist = Math.abs(progress - beat.progress);
        const opacity = isActive ? 1 : Math.max(0, 1 - dist * 10);

        if (opacity <= 0) return null;

        return (
          <div 
            key={beat.id}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: beat.style.textAlign === 'center' ? 'center' : (beat.style.textAlign === 'right' ? 'flex-end' : 'flex-start'),
              opacity,
              transform: `translateY(${(1 - opacity) * 30}px)`,
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              textAlign: beat.style.textAlign,
              padding: '10vw'
            }}
          >
            <div style={{ 
              maxWidth: beat.style.layout === 'full' ? '850px' : '500px', 
              background: beat.style.theme === 'glass' ? 'rgba(0,0,0,0.2)' : 'transparent', 
              backdropFilter: beat.style.theme === 'glass' ? `blur(${beat.style.backdropBlur}px)` : 'none', 
              padding: '4rem', 
              borderRadius: '3.5rem', 
              border: beat.style.theme === 'glass' ? '1px solid rgba(255,255,255,0.03)' : 'none',
              boxShadow: beat.style.theme === 'glass' ? '0 50px 100px rgba(0,0,0,0.4)' : 'none'
            }}>
              <h2 style={{ 
                fontSize: 'clamp(2rem, 8vw, 6rem)', 
                fontWeight: beat.style.fontWeight === 'black' ? 900 : 700, 
                textTransform: 'uppercase', 
                lineHeight: 0.85, 
                marginBottom: '1.5rem', 
                fontStyle: 'italic', 
                letterSpacing: '-0.05em', 
                color: beat.style.titleColor,
                textShadow: beat.style.textGlow ? `0 0 40px ${beat.style.titleColor}88` : 'none'
              }}>
                {beat.title}
              </h2>
              <p style={{ fontSize: '1.15rem', lineHeight: 1.6, opacity: 0.6, maxWidth: '500px', margin: beat.style.textAlign === 'center' ? '0 auto' : '0', color: beat.style.descriptionColor }}>
                {beat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ScrollyEngine: React.FC<EngineProps> = ({ data }) => {
  if (!data || !data.chapters || data.chapters.length === 0) return null;

  const isMobile = useMobile();
  
  const prefersReducedMotion = useMemo(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  , []);

  const pageDepth = useMemo(() => {
    const base = data.chapters.length * 4;
    const beatsWeight = data.chapters.reduce((acc, c) => acc + c.narrativeBeats.length, 0) * 0.5;
    return Math.max(8, base + beatsWeight);
  }, [data.chapters]);

  return (
    <EngineErrorBoundary>
      <div style={{ width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>
        <Canvas 
          shadows={!isMobile} 
          dpr={isMobile ? [1, 1] : [1, 1.5]} 
          gl={{ antialias: true, alpha: true, stencil: false, powerPreference: 'high-performance' }}
        >
          <ScrollControls 
            pages={pageDepth} 
            damping={prefersReducedMotion ? 0.05 : (isMobile ? 0.15 : 0.25)} 
            infinite={false}
          >
            <ScrollyRig chapters={data.chapters} isMobile={isMobile} />
            <StoryOverlay chapters={data.chapters} />
          </ScrollControls>
        </Canvas>
      </div>
    </EngineErrorBoundary>
  );
};

export default ScrollyEngine;

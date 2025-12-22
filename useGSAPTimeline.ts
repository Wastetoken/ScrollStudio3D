import React, { useEffect, useRef, startTransition } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '../useStore';
import * as THREE from 'three';
import { createCurvesFromKeyframes, interpolateCameraState } from '../cameraUtils';

gsap.registerPlugin(ScrollTrigger);

export const useGSAPTimeline = (
  camera: THREE.PerspectiveCamera,
  lookAtProxy: THREE.Vector3,
  modelRef: React.RefObject<THREE.Group>
) => {
  const { chapters, activeChapterId, mode, currentProgress, setCurrentProgress } = useStore();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  const activeChapter = chapters.find(c => c.id === activeChapterId);
  const keyframes = activeChapter?.cameraPath || [];
  const splineAlpha = activeChapter?.environment.splineAlpha ?? 0.5;

  useEffect(() => {
    const cleanupTriggers = () => {
      triggersRef.current.forEach(t => t.kill());
      triggersRef.current = [];
    };

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('resize', refresh);
    
    cleanupTriggers();

    if (!camera || !camera.position || keyframes.length < 1 || !activeChapter) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      const sorted = [...keyframes].sort((a, b) => a.progress - b.progress);
      const { posCurve, targetCurve } = createCurvesFromKeyframes(sorted, splineAlpha);

      const scrubObj = { progress: 0 };
      tl.to(scrubObj, {
        progress: 1,
        ease: 'none',
        duration: 1,
        onUpdate: () => {
          const state = interpolateCameraState(scrubObj.progress, sorted, splineAlpha, posCurve, targetCurve);
          
          camera.position.copy(state.position);
          lookAtProxy.copy(state.target);
          camera.quaternion.copy(state.quaternion);
          camera.fov = state.fov;
          
          if (typeof camera.updateProjectionMatrix === 'function') {
            camera.updateProjectionMatrix();
          }
          // FORCE STABILITY: Ensure matrix is updated immediately to prevent frame-lag flips
          camera.updateMatrixWorld(true);
        }
      }, 0);

      if (mode === 'preview') {
        const trigger = ScrollTrigger.create({
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.1, 
          onUpdate: (self) => {
            startTransition(() => {
              setCurrentProgress(self.progress);
            });
          }
        });
        triggersRef.current.push(trigger);
        ScrollTrigger.refresh();
      }
      timelineRef.current = tl;
    });

    return () => {
      window.removeEventListener('resize', refresh);
      if (ctx && typeof ctx.revert === 'function') ctx.revert();
      cleanupTriggers();
    };
  }, [keyframes, mode, camera, lookAtProxy, modelRef, setCurrentProgress, activeChapter, splineAlpha]);

  useEffect(() => {
    if (timelineRef.current) {
      if (mode === 'preview' && activeChapter) {
        const range = activeChapter.endProgress - activeChapter.startProgress;
        const rel = (currentProgress - activeChapter.startProgress) / (range || 1);
        timelineRef.current.progress(THREE.MathUtils.clamp(rel, 0, 1));
      } else {
        timelineRef.current.progress(currentProgress);
      }
    }
  }, [currentProgress, mode, activeChapter]);

  return timelineRef;
};
import React, { useEffect, useRef, startTransition } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '../useStore';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export const useGSAPTimeline = (
  camera: THREE.PerspectiveCamera,
  lookAtProxy: THREE.Vector3,
  modelRef: React.RefObject<THREE.Group>
) => {
  const { chapters, activeChapterId, mode, currentProgress, setCurrentProgress } = useStore();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const activeChapter = chapters.find(c => c.id === activeChapterId);
  const keyframes = activeChapter?.cameraPath || [];
  const splineAlpha = activeChapter?.environment.splineAlpha ?? 0.5;

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('resize', refresh);
    
    // Critical: Clean up existing triggers strictly
    const currentTriggers = ScrollTrigger.getAll();
    currentTriggers.forEach(t => t.kill());

    // Defensive Check: Ensure camera and keyframes are valid before proceeding
    if (!camera || !camera.position || keyframes.length < 1 || !activeChapter) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // Prevent "Divide by Zero" in spline math if keyframes share progress
      const sorted = [...keyframes]
        .sort((a, b) => a.progress - b.progress)
        .map((kf, i, arr) => {
          if (i > 0 && kf.progress <= arr[i-1].progress) {
            return { ...kf, progress: arr[i-1].progress + 0.00001 };
          }
          return kf;
        });
      
      if (sorted.length === 1) {
        const kf = sorted[0];
        // Ensure properties exist before calling GSAP .set
        if (camera.position && kf.position) tl.set(camera.position, { x: kf.position[0], y: kf.position[1], z: kf.position[2] }, 0);
        if (lookAtProxy && kf.target) tl.set(lookAtProxy, { x: kf.target[0], y: kf.target[1], z: kf.target[2] }, 0);
        tl.set(camera, { fov: kf.fov || 35 }, 0);
        
        if (camera.quaternion && kf.quaternion) {
          camera.quaternion.set(kf.quaternion[0], kf.quaternion[1], kf.quaternion[2], kf.quaternion[3]);
        }
        return;
      }

      const points = sorted.map(k => new THREE.Vector3(...k.position));
      const targets = sorted.map(k => new THREE.Vector3(...k.target));
      const posCurve = new THREE.CatmullRomCurve3(points);
      posCurve.curveType = splineAlpha === 0 ? 'centripetal' : splineAlpha === 1 ? 'chordal' : 'catmullrom';
      
      const targetCurve = new THREE.CatmullRomCurve3(targets);
      targetCurve.curveType = posCurve.curveType;

      const scrubObj = { progress: 0 };
      tl.to(scrubObj, {
        progress: 1,
        ease: 'none',
        duration: 1,
        onUpdate: () => {
          const t = scrubObj.progress;
          const currentPos = posCurve.getPointAt(t);
          const currentTarget = targetCurve.getPointAt(t);
          
          if (camera.position && currentPos) camera.position.copy(currentPos);
          if (lookAtProxy && currentTarget) lookAtProxy.copy(currentTarget);

          let i = 0;
          while (i < sorted.length - 2 && t > sorted[i+1].progress) i++;
          const kfA = sorted[i];
          const kfB = sorted[i+1] || kfA;
          const segmentProgress = kfA === kfB ? 0 : (t - kfA.progress) / (kfB.progress - kfA.progress);
          const alpha = THREE.MathUtils.clamp(segmentProgress, 0, 1);

          if (camera.quaternion && kfA.quaternion && kfB.quaternion) {
            const qA = new THREE.Quaternion(...kfA.quaternion);
            const qB = new THREE.Quaternion(...kfB.quaternion);
            camera.quaternion.slerpQuaternions(qA, qB, alpha);
          }
          
          camera.fov = kfA.fov + (kfB.fov - kfA.fov) * alpha;
          if (typeof camera.updateProjectionMatrix === 'function') {
            camera.updateProjectionMatrix();
          }
        }
      }, 0);

      if (mode === 'preview') {
        ScrollTrigger.create({
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
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
      timelineRef.current = tl;
    });

    return () => {
      window.removeEventListener('resize', refresh);
      if (ctx && typeof ctx.revert === 'function') ctx.revert();
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
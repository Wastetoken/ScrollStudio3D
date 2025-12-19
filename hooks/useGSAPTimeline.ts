import React, { useEffect, useRef } from 'react';
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
  const { keyframes, mode, currentProgress, setCurrentProgress, modelUrl } = useStore();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Immediate cleanup of any existing triggers to prevent collision
    ScrollTrigger.getAll().forEach(t => t.kill());

    if (!camera || keyframes.length < 1 || !modelUrl) {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: mode === 'edit',
        onUpdate: () => {
          if (mode === 'preview') {
            setCurrentProgress(tl.progress());
          }
        },
      });

      if (mode === 'preview') {
        ScrollTrigger.create({
          animation: tl,
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5, // Smoother follow
          invalidateOnRefresh: true,
        });
      }

      const sorted = [...keyframes].sort((a, b) => a.progress - b.progress);

      // Initialize first frame
      const first = sorted[0];
      tl.set(camera.position, { x: first.position[0], y: first.position[1], z: first.position[2] }, 0);
      tl.set(lookAtProxy, { x: first.target[0], y: first.target[1], z: first.target[2] }, 0);
      
      if (modelRef.current) {
        tl.set(modelRef.current.rotation, { x: first.rotation[0], y: first.rotation[1], z: first.rotation[2] }, 0);
      }

      // Build sequence
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const current = sorted[i];
        const duration = current.progress - prev.progress;
        const startTime = prev.progress;

        tl.to(camera.position, {
          x: current.position[0],
          y: current.position[1],
          z: current.position[2],
          ease: 'power2.inOut',
          duration: duration,
        }, startTime);

        tl.to(lookAtProxy, {
          x: current.target[0],
          y: current.target[1],
          z: current.target[2],
          ease: 'power2.inOut',
          duration: duration,
        }, startTime);

        if (modelRef.current) {
          tl.to(modelRef.current.rotation, {
            x: current.rotation[0],
            y: current.rotation[1],
            z: current.rotation[2],
            ease: 'power2.inOut',
            duration: duration,
          }, startTime);
        }
      }

      timelineRef.current = tl;
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [keyframes, mode, camera, lookAtProxy, modelRef, setCurrentProgress, modelUrl]);

  useEffect(() => {
    if (mode === 'edit' && timelineRef.current) {
      timelineRef.current.progress(currentProgress);
    }
  }, [currentProgress, mode]);

  return timelineRef;
};
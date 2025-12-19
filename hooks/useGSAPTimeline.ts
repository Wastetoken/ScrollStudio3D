import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export const useGSAPTimeline = (
  camera: THREE.PerspectiveCamera,
  lookAtProxy: THREE.Vector3,
  modelRef: React.RefObject<THREE.Group>
) => {
  const { keyframes, mode, currentProgress, setCurrentProgress } = useStore();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!camera || keyframes.length < 1) return;

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
          scrub: 1,
        });
      }

      const sorted = [...keyframes].sort((a, b) => a.progress - b.progress);

      // --- Implicit Start Frame Handling ---
      // If the first frame isn't at 0, treat it as the state from 0 to its progress point
      const first = sorted[0];
      
      tl.set(camera.position, { x: first.position[0], y: first.position[1], z: first.position[2] }, 0);
      tl.set(lookAtProxy, { x: first.target[0], y: first.target[1], z: first.target[2] }, 0);
      
      if (modelRef.current) {
        tl.set(modelRef.current.rotation, { x: first.rotation[0], y: first.rotation[1], z: first.rotation[2] }, 0);
      }

      // If first progress > 0, we create a "hold" from 0 to that point
      // (The above .set at 0 handles this visually)

      // Piecewise animation between keyframes
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const current = sorted[i];
        
        // Use normalized duration within the 0-1 timeline
        const duration = current.progress - prev.progress;
        const startTime = prev.progress;

        tl.to(camera.position, {
          x: current.position[0],
          y: current.position[1],
          z: current.position[2],
          ease: 'power1.inOut',
          duration: duration,
        }, startTime);

        tl.to(lookAtProxy, {
          x: current.target[0],
          y: current.target[1],
          z: current.target[2],
          ease: 'power1.inOut',
          duration: duration,
        }, startTime);

        if (modelRef.current) {
          tl.to(modelRef.current.rotation, {
            x: current.rotation[0],
            y: current.rotation[1],
            z: current.rotation[2],
            ease: 'power1.inOut',
            duration: duration,
          }, startTime);
        }
      }

      // Handle the case where last progress < 1: GSAP will just hold the state until 1.0 automatically.

      timelineRef.current = tl;
    });

    return () => ctx.revert();
  }, [keyframes, mode, camera, lookAtProxy, modelRef, setCurrentProgress]);

  useEffect(() => {
    if (mode === 'edit' && timelineRef.current) {
      timelineRef.current.progress(currentProgress);
    }
  }, [currentProgress, mode]);

  return timelineRef;
};
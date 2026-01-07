import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStore } from '../../useStore';
import * as THREE from 'three';

export const KeyframeCapturer: React.FC = () => {
  const { camera, scene } = useThree();
  const { addKeyframe, chapters, activeChapterId } = useStore();

  const activeChapter = chapters.find(c => c.id === activeChapterId);

  useEffect(() => {
    const handleCapture = (e: any) => {
      if (!activeChapter) return;

      const globalProgress = e.detail.progress;
      const localProgress = THREE.MathUtils.clamp(
        (globalProgress - activeChapter.startProgress) / (activeChapter.endProgress - activeChapter.startProgress),
        0,
        1
      );

      const cam = camera as THREE.PerspectiveCamera;

      // Precision Raycasting from Viewport Center
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), cam); // Center of screen
      const intersects = raycaster.intersectObjects(scene.children, true);

      let target: [number, number, number] = [0, 0, 0];
      if (intersects.length > 0) {
        // High Precision Hit
        const p = intersects[0].point;
        target = [p.x, p.y, p.z];
      } else {
        // Fallback to OrbitControls target or origin
        scene.traverse((obj: any) => {
          if ((obj as any).isOrbitControls && (obj as any).target) {
            target = [(obj as any).target.x, (obj as any).target.y, (obj as any).target.z];
          }
        });
      }

      const newKeyframe = {
        id: Math.random().toString(36).substring(2, 11),
        progress: localProgress,
        position: [cam.position.x, cam.position.y, cam.position.z] as [number, number, number],
        target: target,
        quaternion: [cam.quaternion.x, cam.quaternion.y, cam.quaternion.z, cam.quaternion.w] as [number, number, number, number],
        fov: cam.fov,
        // Cinematic Lens
        focusDistance: activeChapter.environment.focusDistance,
        aperture: activeChapter.environment.aperture,
        bokehScale: activeChapter.environment.bokehScale,
      };

      addKeyframe(newKeyframe);
    };

    window.addEventListener('capture-keyframe', handleCapture);
    return () => window.removeEventListener('capture-keyframe', handleCapture);
  }, [camera, scene, addKeyframe, activeChapter]);

  return null;
};
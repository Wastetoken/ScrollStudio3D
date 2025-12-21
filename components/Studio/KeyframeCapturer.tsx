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
      
      const progress = e.detail.progress;
      
      let target: [number, number, number] = [0, 0, 0];
      
      scene.traverse((obj: any) => {
        // Find OrbitControls target if existing
        if ((obj as any).isOrbitControls && (obj as any).target) {
          target = [(obj as any).target.x, (obj as any).target.y, (obj as any).target.z];
        }
      });
      
      const cam = camera as THREE.PerspectiveCamera;

      const newKeyframe = {
        id: Math.random().toString(36).substring(2, 11),
        progress: progress,
        position: [cam.position.x, cam.position.y, cam.position.z] as [number, number, number],
        target: target,
        quaternion: [cam.quaternion.x, cam.quaternion.y, cam.quaternion.z, cam.quaternion.w] as [number, number, number, number],
        fov: cam.fov,
      };

      addKeyframe(newKeyframe);
    };

    window.addEventListener('capture-keyframe', handleCapture);
    return () => window.removeEventListener('capture-keyframe', handleCapture);
  }, [camera, scene, addKeyframe, activeChapter]);

  return null;
};
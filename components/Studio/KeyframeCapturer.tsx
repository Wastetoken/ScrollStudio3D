import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStore } from '../../useStore';
import * as THREE from 'three';

export const KeyframeCapturer: React.FC = () => {
  const { camera, scene } = useThree();
  const { addKeyframe, config, modelUrl } = useStore();

  useEffect(() => {
    const handleCapture = (e: any) => {
      if (!modelUrl) return;
      
      const progress = e.detail.progress;
      
      let target: [number, number, number] = [0, 0, 0];
      
      scene.traverse((obj: any) => {
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
        rotation: [...config.modelRotation] as [number, number, number],
        fov: cam.fov, // Capture current optics
      };

      addKeyframe(newKeyframe);
    };

    window.addEventListener('capture-keyframe', handleCapture);
    return () => window.removeEventListener('capture-keyframe', handleCapture);
  }, [camera, scene, addKeyframe, config.modelRotation, modelUrl]);

  return null;
};
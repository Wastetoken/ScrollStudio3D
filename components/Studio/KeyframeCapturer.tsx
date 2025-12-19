import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

export const KeyframeCapturer: React.FC = () => {
  const { camera, scene } = useThree();
  const { addKeyframe, config } = useStore();

  useEffect(() => {
    const handleCapture = (e: any) => {
      const progress = e.detail.progress;
      
      // Attempt to locate OrbitControls and extract its target
      let target: [number, number, number] = [0, 0, 0];
      
      scene.traverse((obj: any) => {
        if (obj.isOrbitControls || (obj.target && obj.domElement)) {
          target = [obj.target.x, obj.target.y, obj.target.z];
        }
      });
      
      const newKeyframe = {
        id: Math.random().toString(36).substring(2, 11),
        progress: progress,
        position: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
        target: target,
        rotation: [...config.modelRotation] as [number, number, number],
      };

      addKeyframe(newKeyframe);
      console.log('Captured Keyframe:', newKeyframe);
    };

    window.addEventListener('capture-keyframe', handleCapture);
    return () => window.removeEventListener('capture-keyframe', handleCapture);
  }, [camera, scene, addKeyframe, config.modelRotation]);

  return null;
};
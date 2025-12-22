import * as THREE from 'three';
import { Keyframe } from '../types';

/**
 * Shared camera interpolation logic to keep Builder and Player visually consistent.
 */
export const interpolateCameraState = (
  t: number,
  keyframes: Keyframe[],
  splineAlpha: number,
  posCurve: THREE.CatmullRomCurve3 | null,
  targetCurve: THREE.CatmullRomCurve3 | null
) => {
  const result = {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    fov: 35
  };

  if (keyframes.length === 0) return result;
  
  const clampedT = THREE.MathUtils.clamp(t, 0, 1);

  if (keyframes.length === 1 || !posCurve || !targetCurve) {
    const kf = keyframes[0];
    result.position.set(...kf.position);
    result.target.set(...kf.target);
    result.quaternion.set(...kf.quaternion);
    result.fov = kf.fov;
    return result;
  }

  // Position and Target from Splines
  result.position.copy(posCurve.getPointAt(clampedT));
  result.target.copy(targetCurve.getPointAt(clampedT));

  // FOV and Quaternion segment interpolation
  let i = 0;
  // Use binary search or optimized while loop for segment finding
  while (i < keyframes.length - 2 && clampedT > keyframes[i + 1].progress) i++;
  
  const kfA = keyframes[i];
  const kfB = keyframes[i + 1] || kfA;
  
  const segmentProgress = kfA === kfB ? 0 : (clampedT - kfA.progress) / (kfB.progress - kfA.progress);
  const alpha = THREE.MathUtils.clamp(segmentProgress, 0, 1);

  // Consistent high-precision slerp
  const qA = new THREE.Quaternion(...kfA.quaternion);
  const qB = new THREE.Quaternion(...kfB.quaternion);
  result.quaternion.slerpQuaternions(qA, qB, alpha);
  
  result.fov = THREE.MathUtils.lerp(kfA.fov, kfB.fov, alpha);

  return result;
};

export const createCurvesFromKeyframes = (keyframes: Keyframe[], splineAlpha: number) => {
  if (keyframes.length < 2) return { posCurve: null, targetCurve: null };

  const points = keyframes.map(k => new THREE.Vector3(...k.position));
  const targets = keyframes.map(k => new THREE.Vector3(...k.target));
  
  const posCurve = new THREE.CatmullRomCurve3(points);
  const targetCurve = new THREE.CatmullRomCurve3(targets);
  
  // Consistency check for spline type
  const curveType = splineAlpha === 0 ? 'centripetal' : splineAlpha === 1 ? 'chordal' : 'catmullrom';
  posCurve.curveType = curveType;
  targetCurve.curveType = curveType;

  return { posCurve, targetCurve };
};
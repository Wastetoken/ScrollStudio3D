
import React, { useLayoutEffect, useRef } from 'react';
import { useStore } from '../../../useStore';
import * as THREE from 'three';

// Intrinsic elements workaround
const Line = 'line' as any;
const BufferGeometry = 'bufferGeometry' as any;
const LineBasicMaterial = 'lineBasicMaterial' as any;


import { createCurvesFromKeyframes } from '../cameraUtils';

export const CameraPathVisualizer: React.FC = () => {
    const { chapters, activeChapterId, mode } = useStore();
    const activeChapter = chapters.find(c => c.id === activeChapterId);

    // Create geometry ref for the line - Unconditional hook
    const geometryRef = useRef<THREE.BufferGeometry>(null!);

    // Calculate curves - Unconditional (memoized to prevent recalc, though regular var is fine if fast)
    // We need to be careful: createCurvesFromKeyframes depends on activeChapter.
    // If no activeChapter, we can pass empty array.

    // Derived state
    const keyframes = activeChapter ? activeChapter.cameraPath : [];
    const splineAlpha = activeChapter ? activeChapter.environment.splineAlpha : 0.5;
    const shouldRender = activeChapter && mode === 'edit';

    const { posCurve } = React.useMemo(() =>
        createCurvesFromKeyframes(keyframes, splineAlpha),
        [keyframes, splineAlpha]);

    const curvePoints = React.useMemo(() =>
        posCurve ? posCurve.getPoints(Math.max(2, keyframes.length * 20)) : [],
        [posCurve, keyframes.length]);

    // Update geometry - Unconditional hook
    useLayoutEffect(() => {
        if (geometryRef.current) {
            if (curvePoints && curvePoints.length > 0) {
                // Ensure points are valid Vector3s
                try {
                    geometryRef.current.setFromPoints(curvePoints);
                } catch (e) {
                    console.warn("Failed to set curve points:", e);
                }
            } else {
                // Reset if no points
                geometryRef.current.setFromPoints([]);
            }
        }
    }, [curvePoints]);

    if (!shouldRender || !posCurve || curvePoints.length === 0) return null;

    return (
        <line>
            <bufferGeometry ref={geometryRef} />
            <lineBasicMaterial color="#10b981" linewidth={1} opacity={0.3} transparent />
        </line>
    );
};

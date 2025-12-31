
import React, { useRef, useLayoutEffect, useState } from 'react';
import { useStore } from '../../../useStore';
import { Html, TransformControls } from '@react-three/drei';
import * as THREE from 'three';

// Intrinsic elements workaround
const Mesh = 'mesh' as any;
const Group = 'group' as any;
const SphereGeometry = 'sphereGeometry' as any;
const CylinderGeometry = 'cylinderGeometry' as any;
const OctahedronGeometry = 'octahedronGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;

const MarkerWithDirection: React.FC<{
    id: string;
    index: number;
    position: [number, number, number];
    target: [number, number, number];
    isSelected: boolean;
    onSelect: (id: string) => void;
    onUpdate: (pos: [number, number, number]) => void;
    orbitControls: React.MutableRefObject<any>;
    modelScale: number;
}> = ({ id, index, position, target, isSelected, onSelect, onUpdate, orbitControls, modelScale }) => {
    const handleRef = useRef<THREE.Mesh>(null);
    const directionRef = useRef<THREE.Group>(null);

    // Ultra-minimal adaptive sizing
    const baseSize = modelScale * 0.025;
    const arrowSize = modelScale * 0.08;

    useLayoutEffect(() => {
        if (directionRef.current) directionRef.current.lookAt(new THREE.Vector3(...target));
    }, [position, target]);

    return (
        <group>
            {/* Directional Visuals (Non-interactive) */}
            <group position={position} ref={directionRef}>
                <mesh
                    position={[0, 0, arrowSize]}
                    rotation={[Math.PI / 2, 0, 0]}
                    onClick={(e) => { e.stopPropagation(); onSelect(id); }}
                    onPointerOver={() => (document.body.style.cursor = 'pointer')}
                    onPointerOut={() => (document.body.style.cursor = 'auto')}
                >
                    <cylinderGeometry args={[0, baseSize * 0.4, arrowSize, 8]} />
                    <meshBasicMaterial color={isSelected ? "#fbbf24" : "#ffffff"} transparent opacity={isSelected ? 0.8 : 0.2} />
                </mesh>
            </group>

            {/* Interactive Handle */}
            <mesh
                ref={handleRef}
                position={position}
                onClick={(e) => { e.stopPropagation(); onSelect(id); }}
                onPointerOver={() => (document.body.style.cursor = 'move')}
                onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
                <octahedronGeometry args={[baseSize, 0]} />
                <meshStandardMaterial
                    color={isSelected ? "#fbbf24" : "#ffffff"}
                    emissive={isSelected ? "#fbbf24" : "#ffffff"}
                    emissiveIntensity={isSelected ? 1 : 0.1}
                    transparent
                    opacity={isSelected ? 1 : 0.3}
                />
            </mesh>

            <mesh position={position}>
                <octahedronGeometry args={[baseSize * 0.3, 0]} />
                <meshBasicMaterial color={isSelected ? "#fbbf24" : "#ffffff"} />
            </mesh>

            <Html position={[position[0], position[1] + baseSize * 1.5, position[2]]} center distanceFactor={15} zIndexRange={[100, 0]}>
                <div className={`px-1 py-0 rounded-sm text-[5px] font-black tracking-tighter transition-all border ${isSelected ? 'bg-amber-500 border-amber-300 text-black scale-110 shadow-[0_0_8px_#fbbf24]' : 'bg-black/20 border-white/5 text-white/30'}`}>
                    {index + 1}
                </div>
            </Html>

            {isSelected && (
                <TransformControls
                    object={handleRef}
                    mode="translate"
                    {...{
                        onDraggingChanged: (e: any) => {
                            if (orbitControls.current) {
                                orbitControls.current.enabled = !e.value;
                            }
                        }
                    } as any}
                    onMouseUp={() => {
                        if (handleRef.current) {
                            const { x, y, z } = handleRef.current.position;
                            onUpdate([x, y, z]);
                        }
                    }}
                />
            )}
        </group>
    );
}

export const KeyframeMarkers: React.FC<{ orbitControls: React.MutableRefObject<any> }> = ({ orbitControls }) => {
    const {
        chapters,
        activeChapterId,
        mode,
        selectedKeyframeId,
        setSelectedKeyframe,
        updateKeyframe
    } = useStore();

    const activeChapter = chapters.find(c => c.id === activeChapterId);
    if (!activeChapter || mode !== 'edit') return null;

    const modelScale = activeChapter.environment.modelScale || 1;

    return (
        <group>
            {activeChapter.cameraPath.map((kf, index) => (
                <MarkerWithDirection
                    key={kf.id}
                    id={kf.id}
                    index={index}
                    position={kf.position}
                    target={kf.target}
                    isSelected={selectedKeyframeId === kf.id}
                    onSelect={setSelectedKeyframe}
                    onUpdate={(newPos) => updateKeyframe(kf.id, { position: newPos })}
                    orbitControls={orbitControls}
                    modelScale={modelScale}
                />
            ))}
        </group>
    );
};

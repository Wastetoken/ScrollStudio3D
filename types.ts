export type Vector3Array = [number, number, number];

export interface Keyframe {
  id: string;
  progress: number; // 0 to 1
  position: Vector3Array;
  target: Vector3Array;
  rotation: Vector3Array; // Model rotation
}

export interface SceneConfig {
  modelScale: number;
  ambientIntensity: number;
  directionalIntensity: number;
  modelPosition: Vector3Array;
  modelRotation: Vector3Array;
  showFloor: boolean;
}

export type EngineMode = 'edit' | 'preview';

export interface ProjectSchema {
  version: string;
  config: SceneConfig;
  keyframes: Keyframe[];
}

export interface StoreState {
  modelUrl: string | null;
  mode: EngineMode;
  keyframes: Keyframe[];
  config: SceneConfig;
  currentProgress: number;
  
  // Actions
  setModelUrl: (url: string | null) => void;
  setMode: (mode: EngineMode) => void;
  addKeyframe: (kf: Keyframe) => void;
  removeKeyframe: (id: string) => void;
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  setConfig: (config: Partial<SceneConfig>) => void;
  setCurrentProgress: (progress: number) => void;
  loadProject: (project: ProjectSchema) => void;
  reset: () => void;
}
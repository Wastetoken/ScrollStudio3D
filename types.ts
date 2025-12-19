export type Vector3Array = [number, number, number];

export interface Keyframe {
  id: string;
  progress: number; // 0 to 1
  position: Vector3Array;
  target: Vector3Array;
  rotation: Vector3Array; // Model rotation
}

export interface StorySection {
  id: string;
  progress: number;
  title: string;
  description: string;
}

export interface SceneConfig {
  modelScale: number;
  ambientIntensity: number;
  directionalIntensity: number;
  modelPosition: Vector3Array;
  modelRotation: Vector3Array;
  showFloor: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  backgroundColor: string;
}

export type EngineMode = 'edit' | 'preview';

export interface ProjectSchema {
  version: string;
  config: SceneConfig;
  keyframes: Keyframe[];
  sections: StorySection[];
}

export interface StoreState {
  modelUrl: string | null;
  mode: EngineMode;
  keyframes: Keyframe[];
  sections: StorySection[];
  config: SceneConfig;
  currentProgress: number;
  cameraPosition: Vector3Array;
  cameraTarget: Vector3Array;
  
  // Actions
  setModelUrl: (url: string | null) => void;
  setMode: (mode: EngineMode) => void;
  addKeyframe: (kf: Keyframe) => void;
  removeKeyframe: (id: string) => void;
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  addSection: (section: StorySection) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<StorySection>) => void;
  setConfig: (config: Partial<SceneConfig>) => void;
  setCurrentProgress: (progress: number) => void;
  setCameraPosition: (pos: Vector3Array) => void;
  setCameraTarget: (target: Vector3Array) => void;
  loadProject: (project: ProjectSchema) => void;
  reset: () => void;
}
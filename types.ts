export type Vector3Array = [number, number, number];

export interface Hotspot {
  id: string;
  label: string;
  content: string;
  position: Vector3Array;
  normal: Vector3Array; // Added to calculate "jet out" direction
  visibleAt: number; // Progress threshold (0-1)
  side: 'left' | 'right' | 'auto'; 
}

export interface Keyframe {
  id: string;
  progress: number;
  position: Vector3Array;
  target: Vector3Array;
  rotation: Vector3Array;
  fov: number; // Per-keyframe Field of View
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
  backgroundColor: string;
  // Post Processing
  bloomIntensity: number;
  bloomThreshold: number;
  exposure: number;
  // Atmosphere
  fogDensity: number;
  fogColor: string;
  // Lens Optics
  focusDistance: number;
  aperture: number;
  bokehScale: number;
  defaultFov: number;
}

export type EngineMode = 'edit' | 'preview';

export interface ProjectSchema {
  version: string;
  config: SceneConfig;
  keyframes: Keyframe[];
  sections: StorySection[];
  hotspots: Hotspot[];
}

export interface StoreState {
  modelUrl: string | null;
  mode: EngineMode;
  keyframes: Keyframe[];
  sections: StorySection[];
  hotspots: Hotspot[];
  config: SceneConfig;
  currentProgress: number;
  cameraPosition: Vector3Array;
  cameraTarget: Vector3Array;
  showHandbook: boolean;
  isPlacingHotspot: boolean;
  
  // Actions
  setModelUrl: (url: string | null) => void;
  setMode: (mode: EngineMode) => void;
  addKeyframe: (kf: Keyframe) => void;
  removeKeyframe: (id: string) => void;
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  addSection: (section: StorySection) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<StorySection>) => void;
  addHotspot: (h: Hotspot) => void;
  removeHotspot: (id: string) => void;
  updateHotspot: (id: string, updates: Partial<Hotspot>) => void;
  setConfig: (config: Partial<SceneConfig>) => void;
  setCurrentProgress: (progress: number) => void;
  setCameraPosition: (pos: Vector3Array) => void;
  setCameraTarget: (target: Vector3Array) => void;
  loadProject: (project: ProjectSchema) => void;
  setShowHandbook: (show: boolean) => void;
  setIsPlacingHotspot: (isPlacing: boolean) => void;
  reset: () => void;
}
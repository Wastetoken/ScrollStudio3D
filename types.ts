
export type Vector3Array = [number, number, number];
export type QuaternionArray = [number, number, number, number];

export type TransitionType = 'glitch' | 'flare' | 'blur' | 'fade' | 'none';
export type EnvironmentPreset = 'studio' | 'city' | 'forest' | 'apartment' | 'night' | 'sunset';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // in milliseconds
  intensity: number;
  color?: string;
}

export interface MaterialOverride {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  metalness: number;
  roughness: number;
  wireframe: boolean;
}

export interface AssetAudit {
  polyCount: number;
  drawCalls: number;
  vramEstimateMB: number;
  status: 'optimal' | 'warning' | 'critical';
}

export type PerformanceTier = 'ultra' | 'high' | 'mobile' | 'emergency';

export interface Hotspot {
  id: string;
  label: string;
  content: string;
  position: Vector3Array;
  normal: Vector3Array;
  visibleAt: number;
  side: 'left' | 'right' | 'auto';
}

export interface StoreState {
  mode: EngineMode;
  performanceTier: PerformanceTier;
  currentProgress: number;
  showHandbook: boolean;
  isPlacingHotspot: boolean;
  isLoading: boolean;
  engineError: string | null;
  selectedMeshName: string | null;
  cinematicBars: boolean;
  
  // Transition State
  isTransitioning: boolean;
  transitionProgress: number; 

  projectName: string;
  author: string;
  projectDescription: string;

  chapters: SceneChapter[];
  activeChapterId: string | null;
  lastAudit: AssetAudit | null;

  setPerformanceTier: (tier: PerformanceTier) => void;
  setTransitionState: (isTransitioning: boolean, progress: number) => void;
  setProjectInfo: (info: { projectName?: string, author?: string, projectDescription?: string }) => void;
  setMode: (mode: EngineMode) => void;
  setCurrentProgress: (progress: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setEngineError: (error: string | null) => void;
  setIsPlacingHotspot: (isPlacing: boolean) => void;
  setShowHandbook: (show: boolean) => void;
  setSelectedMesh: (name: string | null) => void;
  setCinematicBars: (active: boolean) => void;

  addChapter: (modelUrl: string, name: string) => void;
  removeChapter: (id: string) => void;
  updateChapter: (id: string, updates: Partial<SceneChapter>) => void;
  setActiveChapter: (id: string) => void;

  addKeyframe: (kf: Keyframe) => void;
  removeKeyframe: (id: string) => void;
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  addSection: (section: StorySection) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<StorySection>) => void;
  addHotspot: (h: Hotspot) => void;
  removeHotspot: (id: string) => void;
  updateHotspot: (id: string, updates: Partial<Hotspot>) => void;
  
  updateMaterial: (meshName: string, updates: Partial<MaterialOverride>) => void;
  setConfig: (config: Partial<SceneConfig>) => void;
  setAudit: (audit: AssetAudit) => void;

  loadProject: (project: ProjectSchema) => void;
  reset: () => void;
}

export interface Keyframe {
  id: string;
  progress: number;
  position: Vector3Array;
  target: Vector3Array;
  quaternion: QuaternionArray; 
  fov: number;
}

export interface StorySectionStyle {
  titleColor: string;
  descriptionColor: string;
  textAlign: 'left' | 'center' | 'right';
  fontVariant: 'serif' | 'sans' | 'mono' | 'display' | 'brutalist';
  theme: 'glass' | 'solid' | 'outline' | 'none';
  accentColor: string;
  layout: 'split' | 'full' | 'floating';
  letterSpacing: 'tight' | 'normal' | 'wide' | 'ultra';
  fontWeight: 'thin' | 'normal' | 'bold' | 'black';
  textGlow: boolean;
  borderWeight: number;
  borderRadius: number;
  padding: number;
  backdropBlur: number;
  entryAnimation: 'fade-up' | 'reveal' | 'zoom' | 'slide-left';
}

export interface StorySection {
  id: string;
  progress: number;
  title: string;
  description: string;
  style: StorySectionStyle;
}

export interface SceneConfig {
  modelScale: number;
  ambientIntensity: number;
  directionalIntensity: number;
  modelPosition: Vector3Array;
  modelRotation: Vector3Array;
  showFloor: boolean;
  backgroundColor: string;
  bloomIntensity: number;
  bloomThreshold: number;
  exposure: number;
  fogDensity: number;
  fogColor: string;
  focusDistance: number;
  aperture: number;
  bokehScale: number;
  defaultFov: number;
  grainIntensity: number;
  cameraShake: number; 
  chromaticAberration: number;
  scanlineIntensity: number;
  vignetteDarkness: number;
  ambientGlowColor: string;
  splineAlpha: number; 
  envMapIntensity: number;
  envPreset: EnvironmentPreset;
}

export interface SceneChapter {
  id: string;
  name: string;
  modelUrl: string;
  startProgress: number; 
  endProgress: number;   
  transition: TransitionConfig;
  environment: SceneConfig;
  cameraPath: Keyframe[];
  narrativeBeats: StorySection[];
  spatialAnnotations: Hotspot[];
  materialOverrides: Record<string, MaterialOverride>;
}

export type EngineMode = 'edit' | 'preview';

export interface ProjectSchema {
  manifest: {
    projectName: string;
    author: string;
    description: string;
    createdAt: string;
    lastModified: string;
    engineVersion: string;
    license: string;
    audit?: AssetAudit;
  };
  chapters: SceneChapter[];
}

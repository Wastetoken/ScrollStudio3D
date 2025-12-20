import { create } from 'zustand';
import { StoreState, EngineMode, SceneConfig, Vector3Array, StorySection, Hotspot } from './types';

const DEFAULT_CONFIG: SceneConfig = {
  modelScale: 1,
  ambientIntensity: 0.5,
  directionalIntensity: 1,
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  showFloor: true,
  backgroundColor: '#050505',
  // Cinematic Defaults
  bloomIntensity: 1.5,
  bloomThreshold: 0.9,
  exposure: 1.0,
  fogDensity: 0.02,
  fogColor: '#050505',
  focusDistance: 5.0,
  aperture: 0.025,
  bokehScale: 1.0,
  defaultFov: 35,
};

const DEFAULT_SECTIONS: StorySection[] = [
  { id: 'start', progress: 0, title: 'THE JOURNEY', description: 'Begin your cinematic exploration of this 3D landscape.' }
];

export const useStore = create<StoreState>((set) => ({
  modelUrl: null,
  mode: 'edit',
  keyframes: [],
  sections: [...DEFAULT_SECTIONS],
  hotspots: [],
  config: { ...DEFAULT_CONFIG },
  currentProgress: 0,
  cameraPosition: [5, 5, 5],
  cameraTarget: [0, 0, 0],
  showHandbook: false,
  isPlacingHotspot: false,

  setModelUrl: (url) => set((state) => {
    if (url && state.modelUrl && state.modelUrl.startsWith('blob:') && state.modelUrl !== url) {
      URL.revokeObjectURL(state.modelUrl);
    }
    return { modelUrl: url };
  }),

  setMode: (mode) => set({ mode }),

  addKeyframe: (kf) => set((state) => ({
    keyframes: [...state.keyframes, kf].sort((a, b) => a.progress - b.progress)
  })),

  removeKeyframe: (id) => set((state) => ({
    keyframes: state.keyframes.filter((k) => k.id !== id)
  })),

  updateKeyframe: (id, updates) => set((state) => ({
    keyframes: state.keyframes.map((k) => (k.id === id ? { ...k, ...updates } : k))
  })),

  addSection: (section) => set((state) => ({
    sections: [...state.sections, section].sort((a, b) => a.progress - b.progress)
  })),

  removeSection: (id) => set((state) => ({
    sections: state.sections.filter((s) => s.id !== id)
  })),

  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
  })),

  addHotspot: (h) => set((state) => ({
    hotspots: [...state.hotspots, h],
    isPlacingHotspot: false
  })),

  removeHotspot: (id) => set((state) => ({
    hotspots: state.hotspots.filter(h => h.id !== id)
  })),

  updateHotspot: (id, updates) => set((state) => ({
    hotspots: state.hotspots.map(h => h.id === id ? { ...h, ...updates } : h)
  })),

  setConfig: (configUpdate) => set((state) => ({
    config: { ...state.config, ...configUpdate }
  })),

  setCurrentProgress: (progress) => set({ currentProgress: progress }),

  setCameraPosition: (pos) => set({ cameraPosition: pos }),

  setCameraTarget: (target) => set({ cameraTarget: target }),

  setShowHandbook: (show) => set({ showHandbook: show }),

  setIsPlacingHotspot: (isPlacing) => set({ isPlacingHotspot: isPlacing }),

  loadProject: (project) => set({
    config: { ...DEFAULT_CONFIG, ...project.config },
    keyframes: project.keyframes || [],
    sections: project.sections || [...DEFAULT_SECTIONS],
    hotspots: project.hotspots || [],
  }),

  reset: () => set({
    modelUrl: null,
    mode: 'edit',
    keyframes: [],
    sections: [...DEFAULT_SECTIONS],
    hotspots: [],
    config: { ...DEFAULT_CONFIG },
    currentProgress: 0,
    cameraPosition: [5, 5, 5],
    cameraTarget: [0, 0, 0],
    showHandbook: false,
    isPlacingHotspot: false
  }),
}));
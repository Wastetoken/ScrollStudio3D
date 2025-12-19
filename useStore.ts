import { create } from 'zustand';
import { StoreState, EngineMode, SceneConfig, Vector3Array, StorySection } from './types';

const DEFAULT_CONFIG: SceneConfig = {
  modelScale: 1,
  ambientIntensity: 0.5,
  directionalIntensity: 1,
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  showFloor: true,
  autoRotate: false,
  autoRotateSpeed: 1.0,
  backgroundColor: '#050505'
};

const DEFAULT_SECTIONS: StorySection[] = [
  { id: 'start', progress: 0, title: 'NEW PROJECT', description: 'Scroll down to begin your journey through this 3D landscape.' }
];

export const useStore = create<StoreState>((set, get) => ({
  modelUrl: null,
  mode: 'edit',
  keyframes: [],
  sections: [...DEFAULT_SECTIONS],
  config: { ...DEFAULT_CONFIG },
  currentProgress: 0,
  cameraPosition: [5, 5, 5],
  cameraTarget: [0, 0, 0],

  setModelUrl: (url) => set((state) => {
    if (url && state.modelUrl && state.modelUrl.startsWith('blob:') && state.modelUrl !== url) {
      try { URL.revokeObjectURL(state.modelUrl); } catch (e) {}
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

  setConfig: (configUpdate) => set((state) => ({
    config: { ...state.config, ...configUpdate }
  })),

  setCurrentProgress: (progress) => set({ currentProgress: progress }),

  setCameraPosition: (cameraPosition) => set({ cameraPosition }),

  setCameraTarget: (cameraTarget) => set({ cameraTarget }),

  loadProject: (project) => set({
    config: { ...DEFAULT_CONFIG, ...project.config },
    keyframes: (project.keyframes || []).sort((a, b) => a.progress - b.progress),
    sections: (project.sections || [...DEFAULT_SECTIONS]).sort((a, b) => a.progress - b.progress),
    mode: 'edit'
  }),

  reset: () => set({
    modelUrl: null,
    mode: 'edit',
    keyframes: [],
    sections: [...DEFAULT_SECTIONS],
    config: { ...DEFAULT_CONFIG },
    currentProgress: 0,
    cameraPosition: [5, 5, 5],
    cameraTarget: [0, 0, 0]
  }),
}));
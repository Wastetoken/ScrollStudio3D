import { create } from 'zustand';
import { StoreState, EngineMode, SceneConfig, Vector3Array } from '../types';

const DEFAULT_CONFIG: SceneConfig = {
  modelScale: 1,
  ambientIntensity: 0.5,
  directionalIntensity: 1,
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  showFloor: true,
  autoRotate: false,
  autoRotateSpeed: 1.0
};

export const useStore = create<StoreState>((set, get) => ({
  modelUrl: null,
  mode: 'edit',
  keyframes: [],
  config: { ...DEFAULT_CONFIG },
  currentProgress: 0,
  cameraPosition: [5, 5, 5],
  cameraTarget: [0, 0, 0],

  setModelUrl: (url) => set((state) => {
    // Safely revoke old blob URLs when a new one is set
    if (url && state.modelUrl && state.modelUrl.startsWith('blob:') && state.modelUrl !== url) {
      try {
        URL.revokeObjectURL(state.modelUrl);
      } catch (e) {
        console.warn("Cleanup error during URL swap:", e);
      }
    }
    return { modelUrl: url };
  }),

  setMode: (mode) => set({ mode }),

  addKeyframe: (kf) => set((state) => {
    const newKeyframes = [...state.keyframes, kf].sort((a, b) => a.progress - b.progress);
    return { keyframes: newKeyframes };
  }),

  removeKeyframe: (id) => set((state) => ({
    keyframes: state.keyframes.filter((k) => k.id !== id)
  })),

  updateKeyframe: (id, updates) => set((state) => ({
    keyframes: state.keyframes.map((k) => (k.id === id ? { ...k, ...updates } : k))
  })),

  setConfig: (configUpdate) => set((state) => ({
    config: { ...state.config, ...configUpdate }
  })),

  setCurrentProgress: (progress) => set({ currentProgress: progress }),

  setCameraPosition: (cameraPosition) => set({ cameraPosition }),

  setCameraTarget: (cameraTarget) => set({ cameraTarget }),

  loadProject: (project) => set({
    config: project.config,
    keyframes: project.keyframes.sort((a, b) => a.progress - b.progress),
    mode: 'edit'
  }),

  reset: () => {
    // Clear state but leave URL revocation for the next upload to prevent unmount race conditions
    set({
      modelUrl: null,
      mode: 'edit',
      keyframes: [],
      config: { ...DEFAULT_CONFIG },
      currentProgress: 0,
      cameraPosition: [5, 5, 5],
      cameraTarget: [0, 0, 0]
    });
  },
}));
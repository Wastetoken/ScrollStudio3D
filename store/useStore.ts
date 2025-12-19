import { create } from 'zustand';
import { StoreState, Keyframe, EngineMode, SceneConfig, ProjectSchema } from '../types';

const DEFAULT_CONFIG: SceneConfig = {
  modelScale: 1,
  ambientIntensity: 0.5,
  directionalIntensity: 1,
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  showFloor: true
};

export const useStore = create<StoreState>((set) => ({
  modelUrl: null,
  mode: 'edit',
  keyframes: [],
  config: DEFAULT_CONFIG,
  currentProgress: 0,

  setModelUrl: (url) => set((state) => {
    if (state.modelUrl && state.modelUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.modelUrl);
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

  loadProject: (project) => set({
    config: project.config,
    keyframes: project.keyframes.sort((a, b) => a.progress - b.progress)
  }),

  reset: () => set((state) => {
    if (state.modelUrl && state.modelUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.modelUrl);
    }
    return {
      modelUrl: null,
      mode: 'edit',
      keyframes: [],
      config: DEFAULT_CONFIG,
      currentProgress: 0
    };
  }),
}));
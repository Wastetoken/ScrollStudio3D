
import { create } from 'zustand';
import { StoreState, EngineMode, SceneConfig, SceneChapter, StorySection, Hotspot, StorySectionStyle, ProjectSchema, Keyframe, TransitionConfig, AssetAudit, PerformanceTier, MaterialOverride } from './types';

const DEFAULT_CONFIG: SceneConfig = {
  modelScale: 1,
  ambientIntensity: 0.3,
  directionalIntensity: 0.8,
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  showFloor: false,
  backgroundColor: '#050505',
  bloomIntensity: 1.5,
  bloomThreshold: 0.9,
  exposure: 1.0,
  fogDensity: 0.02,
  fogColor: '#050505',
  focusDistance: 5.0,
  aperture: 0.025,
  bokehScale: 1.0,
  defaultFov: 35,
  grainIntensity: 0.05,
  cameraShake: 0.1,
  chromaticAberration: 0.002,
  scanlineIntensity: 0.1,
  vignetteDarkness: 1.1,
  ambientGlowColor: '#111111',
  splineAlpha: 0.5,
  envMapIntensity: 1.0,
  envPreset: 'studio'
};

const DEFAULT_TRANSITION: TransitionConfig = {
  type: 'flare',
  duration: 1200,
  intensity: 1.0
};

export const useStore = create<StoreState & { 
  autoDistributeChapters: () => void;
  duplicateChapter: (id: string) => void;
  moveChapter: (id: string, direction: 'up' | 'down') => void;
  isExporting: boolean;
  setIsExporting: (isExporting: boolean) => void;
}>((set) => ({
  mode: 'edit',
  performanceTier: 'high',
  currentProgress: 0,
  showHandbook: false,
  isPlacingHotspot: false,
  isLoading: false,
  engineError: null,
  isTransitioning: false,
  transitionProgress: 0,
  selectedMeshName: null,
  cinematicBars: false,
  isExporting: false,
  
  projectName: 'UNTITLED_CHRONICLE',
  author: 'DESIGN_OPERATOR_01',
  projectDescription: 'A multi-chapter high-fidelity spatial narrative.',

  chapters: [],
  activeChapterId: null,
  lastAudit: null,

  setIsExporting: (isExporting) => set({ isExporting }),
  setPerformanceTier: (tier) => set({ performanceTier: tier }),
  setTransitionState: (isTransitioning, progress) => set({ isTransitioning, transitionProgress: progress }),
  setProjectInfo: (info) => set((state) => ({ ...state, ...info })),
  setMode: (mode) => set({ mode }),
  setCurrentProgress: (progress) => set({ currentProgress: progress }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setEngineError: (error) => set({ engineError: error }),
  setIsPlacingHotspot: (isPlacing) => set({ isPlacingHotspot: isPlacing }),
  setShowHandbook: (show) => set({ showHandbook: show }),
  setAudit: (audit) => set({ lastAudit: audit }),
  setSelectedMesh: (name) => set({ selectedMeshName: name }),
  setCinematicBars: (active) => set({ cinematicBars: active }),

  addChapter: (modelUrl, name) => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newChapter: SceneChapter = {
      id,
      name: name || `CHAPTER_${state.chapters.length + 1}`,
      modelUrl,
      startProgress: 0,
      endProgress: 1,
      transition: { ...DEFAULT_TRANSITION },
      environment: { ...DEFAULT_CONFIG },
      cameraPath: [],
      narrativeBeats: [],
      spatialAnnotations: [],
      materialOverrides: {}
    };
    const newChapters = [...state.chapters, newChapter];
    
    // Auto-redistribute if multiple chapters exist to fill [0,1]
    const count = newChapters.length;
    const segment = 1 / count;
    newChapters.forEach((c, i) => {
      c.startProgress = i * segment;
      c.endProgress = (i + 1) * segment;
    });

    return {
      chapters: newChapters,
      activeChapterId: id,
      engineError: null // Clear previous errors on new chapter add
    };
  }),

  duplicateChapter: (id) => set((state) => {
    const original = state.chapters.find(c => c.id === id);
    if (!original) return state;
    const newId = Math.random().toString(36).substring(2, 9);
    const copy: SceneChapter = JSON.parse(JSON.stringify(original));
    copy.id = newId;
    copy.name = `${original.name}_COPY`;
    
    const index = state.chapters.findIndex(c => c.id === id);
    const newChapters = [...state.chapters];
    newChapters.splice(index + 1, 0, copy);
    
    // Redistribute
    const segment = 1 / newChapters.length;
    newChapters.forEach((c, i) => {
      c.startProgress = i * segment;
      c.endProgress = (i + 1) * segment;
    });
    
    return { chapters: newChapters, activeChapterId: newId };
  }),

  moveChapter: (id, direction) => set((state) => {
    const index = state.chapters.findIndex(c => c.id === id);
    if (index === -1) return state;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= state.chapters.length) return state;
    
    const newChapters = [...state.chapters];
    const [removed] = newChapters.splice(index, 1);
    newChapters.splice(newIndex, 0, removed);
    
    // Redistribute timelines to match order
    const segment = 1 / newChapters.length;
    newChapters.forEach((c, i) => {
      c.startProgress = i * segment;
      c.endProgress = (i + 1) * segment;
    });
    
    return { chapters: newChapters };
  }),

  autoDistributeChapters: () => set((state) => {
    if (state.chapters.length === 0) return state;
    const count = state.chapters.length;
    const segment = 1 / count;
    const updated = state.chapters.map((c, i) => ({
      ...c,
      startProgress: i * segment,
      endProgress: (i + 1) * segment
    }));
    return { chapters: updated };
  }),

  removeChapter: (id) => set((state) => {
    const filtered = state.chapters.filter(c => c.id !== id);
    // Redistribute
    if (filtered.length > 0) {
      const segment = 1 / filtered.length;
      filtered.forEach((c, i) => {
        c.startProgress = i * segment;
        c.endProgress = (i + 1) * segment;
      });
    }
    const newActiveId = state.activeChapterId === id ? (filtered[0]?.id || null) : state.activeChapterId;
    return {
      chapters: filtered,
      activeChapterId: newActiveId,
      engineError: filtered.length === 0 ? null : state.engineError
    };
  }),

  updateChapter: (id, updates) => set((state) => ({
    chapters: state.chapters.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  setActiveChapter: (id) => set({ activeChapterId: id, engineError: null }),

  addKeyframe: (kf) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, cameraPath: [...c.cameraPath, kf].sort((a, b) => a.progress - b.progress) } 
      : c)
  })),

  removeKeyframe: (id) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, cameraPath: c.cameraPath.filter(k => k.id !== id) } 
      : c)
  })),

  updateKeyframe: (id, updates) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, cameraPath: c.cameraPath.map(k => k.id === id ? { ...k, ...updates } : k) } 
      : c)
  })),

  addSection: (section) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, narrativeBeats: [...c.narrativeBeats, section].sort((a, b) => a.progress - b.progress) } 
      : c)
  })),

  removeSection: (id) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, narrativeBeats: c.narrativeBeats.filter(s => s.id !== id) } 
      : c)
  })),

  updateSection: (id, updates) => set((state) => ({
    chapters: state.chapters.map(c => {
      if (c.id !== state.activeChapterId) return c;
      return {
        ...c,
        narrativeBeats: c.narrativeBeats.map(s => {
          if (s.id !== id) return s;
          const newStyle = updates.style ? { ...s.style, ...updates.style } : s.style;
          return { ...s, ...updates, style: newStyle };
        })
      };
    })
  })),

  addHotspot: (h) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, spatialAnnotations: [...c.spatialAnnotations, h] } 
      : c),
    isPlacingHotspot: false
  })),

  removeHotspot: (id) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, spatialAnnotations: c.spatialAnnotations.filter(h => h.id !== id) } 
      : c)
  })),

  updateHotspot: (id, updates) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, spatialAnnotations: c.spatialAnnotations.map(h => h.id === id ? { ...h, ...updates } : h) } 
      : c)
  })),

  updateMaterial: (meshName, updates) => set((state) => ({
    chapters: state.chapters.map(c => {
      if (c.id !== state.activeChapterId) return c;
      const current = c.materialOverrides[meshName] || {
        color: '#ffffff', emissive: '#000000', emissiveIntensity: 0, metalness: 0, roughness: 1, wireframe: false
      };
      return {
        ...c,
        materialOverrides: {
          ...c.materialOverrides,
          [meshName]: { ...current, ...updates }
        }
      };
    })
  })),

  setConfig: (configUpdate) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, environment: { ...c.environment, ...configUpdate } } 
      : c)
  })),

  loadProject: (project) => set({
    projectName: project.manifest.projectName || 'RESTORED_PROJECT',
    author: project.manifest.author || 'DESIGN_OPERATOR_01',
    projectDescription: project.manifest.description || '',
    chapters: project.chapters,
    activeChapterId: project.chapters[0]?.id || null,
    currentProgress: 0,
    mode: 'edit',
    engineError: null
  }),

  reset: () => set(() => ({
    mode: 'edit',
    performanceTier: 'high',
    currentProgress: 0,
    chapters: [],
    activeChapterId: null,
    isPlacingHotspot: false,
    isLoading: false,
    engineError: null,
    isTransitioning: false,
    transitionProgress: 0,
    lastAudit: null,
    selectedMeshName: null,
    isExporting: false
  }))
}));

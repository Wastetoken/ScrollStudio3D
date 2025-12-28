import { create } from 'zustand';
import { StoreState, EngineMode, SceneConfig, SceneChapter, StorySection, Hotspot, StorySectionStyle, ProjectSchema, Keyframe, TransitionConfig, AssetAudit, PerformanceTier, MaterialOverride, FontDefinition, ViewMode } from './types';

const DEFAULT_CONFIG: SceneConfig = {
  modelScale: 1,
  ambientIntensity: 0.5,
  directionalIntensity: 1.5,
  modelPosition: [0, 0, 0],
  modelRotation: [0, 0, 0],
  showFloor: true,
  backgroundColor: '#030303',
  bloomIntensity: 2.5,
  bloomThreshold: 0.1, 
  exposure: 1.2,
  fogDensity: 0.1,
  fogColor: '#030303',
  focusDistance: 5.0,
  aperture: 0.05,
  bokehScale: 2.5,
  defaultFov: 40,
  grainIntensity: 0.05,
  cameraShake: 0.1,
  chromaticAberration: 0.005,
  scanlineIntensity: 0.1,
  vignetteDarkness: 1.2,
  ambientGlowColor: '#1a1a1a',
  splineAlpha: 0.5,
  envMapIntensity: 1.5,
  envPreset: 'studio'
};

const DEFAULT_TRANSITION: TransitionConfig = {
  type: 'flare',
  duration: 1200,
  intensity: 1.0
};

const DEFAULT_BEAT_STYLE: StorySectionStyle = {
  titleColor: '#ffffff',
  descriptionColor: '#888888',
  textAlign: 'left',
  fontVariant: 'display',
  theme: 'glass',
  accentColor: '#ffffff',
  layout: 'full',
  letterSpacing: 'normal',
  fontWeight: 'bold',
  textGlow: true,
  borderWeight: 1,
  borderRadius: 30,
  padding: 40,
  backdropBlur: 30,
  entryAnimation: 'fade-up'
};

export const useStore = create<StoreState & { 
  autoDistributeChapters: () => void;
  duplicateChapter: (id: string) => void;
  moveChapter: (id: string, direction: 'up' | 'down') => void;
  setNarrativeBeats: (beats: StorySection[]) => void;
  isExporting: boolean;
  setIsExporting: (isExporting: boolean) => void;
  landingMode: boolean;
  setLandingMode: (mode: boolean) => void;
}>((set) => ({
  mode: 'edit',
  viewMode: 'cinema',
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
  landingMode: false,
  
  projectName: 'UNTITLED_CHRONICLE',
  author: 'DESIGN_OPERATOR_01',
  projectDescription: 'A multi-chapter high-fidelity spatial narrative.',

  chapters: [],
  typography: { fonts: [] },
  activeChapterId: null,
  lastAudit: null,

  setIsExporting: (isExporting) => set({ isExporting }),
  setLandingMode: (landingMode) => set({ landingMode }),
  setPerformanceTier: (tier) => set({ performanceTier: tier }),
  setTransitionState: (isTransitioning, progress) => set({ isTransitioning, transitionProgress: progress }),
  setProjectInfo: (info) => set((state) => ({ ...state, ...info })),
  setMode: (mode) => set({ mode, viewMode: mode === 'preview' ? 'cinema' : 'cinema' }),
  setViewMode: (vMode) => set({ viewMode: vMode }),
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
    
    const count = newChapters.length;
    const segment = 1 / count;
    newChapters.forEach((c, i) => {
      c.startProgress = i * segment;
      c.endProgress = (i + 1) * segment;
    });

    return {
      chapters: newChapters,
      activeChapterId: id,
      engineError: null
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

  addSection: (section) => set((setState) => ({
    chapters: setState.chapters.map(c => c.id === setState.activeChapterId 
      ? { ...c, narrativeBeats: [...c.narrativeBeats, section].sort((a, b) => a.progress - b.progress) } 
      : c)
  })),

  setNarrativeBeats: (beats) => set((state) => ({
    chapters: state.chapters.map(c => c.id === state.activeChapterId 
      ? { ...c, narrativeBeats: beats.map(b => ({ ...b, style: { ...DEFAULT_BEAT_STYLE, ...b.style } })) } 
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

  removeHotspot: (id) => set((idState) => ({
    chapters: idState.chapters.map(c => c.id === idState.activeChapterId 
      ? { ...c, spatialAnnotations: c.spatialAnnotations.filter(h => h.id !== id) } 
      : c)
  })),

  updateHotspot: (id, updates) => set((state) => ({
    chapters: state.chapters.map(c => {
      if (c.id !== state.activeChapterId) return c;
      return {
        ...c,
        spatialAnnotations: c.spatialAnnotations.map(h => h.id === id ? { ...h, ...updates } : h)
      };
    })
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

  addFont: (font) => set((state) => ({
    typography: {
      ...state.typography,
      fonts: [...state.typography.fonts, font]
    }
  })),

  removeFont: (fontId) => set((state) => ({
    typography: {
      ...state.typography,
      fonts: state.typography.fonts.filter(f => f.id !== fontId)
    }
  })),

  loadProject: (project) => {
    const chapters = project.chapters.map(c => {
      if (project.embeddedAssets && project.embeddedAssets[c.id]) {
        try {
          const base64 = project.embeddedAssets[c.id];
          const binary = atob(base64.split(',')[1] || base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob) + '#.glb';
          return { ...c, modelUrl: url };
        } catch (e) {
          console.error("Failed to decode embedded asset for chapter:", c.id, e);
        }
      }
      return c;
    });

    const firstChapter = chapters[0];
    set({
      projectName: project.manifest.projectName || 'RESTORED_PROJECT',
      author: project.manifest.author || 'DESIGN_OPERATOR_01',
      projectDescription: project.manifest.description || '',
      chapters: chapters,
      typography: project.typography || { fonts: [] },
      activeChapterId: firstChapter?.id || null,
      currentProgress: 0,
      mode: 'edit',
      viewMode: 'cinema',
      engineError: null,
      isLoading: false
    });
  },

  reset: () => set(() => ({
    mode: 'edit',
    viewMode: 'cinema',
    performanceTier: 'high',
    currentProgress: 0,
    chapters: [],
    typography: { fonts: [] },
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
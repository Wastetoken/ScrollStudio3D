
export const SCROLLY_PIPELINE_JS = `
/**
 * ScrollyPipeline.js
 * Core engine for ScrollStudio3D exported projects.
 */

class ScrollyPipeline {
  constructor(options) {
    this.container = options.container || document.body;
    this.data = options.data;
    this.chapters = this.data.chapters;
    this.assets = this.data.embeddedAssets || {};
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.scroll = { offset: 0, target: 0 };
    this.chapterInstances = new Map();
    this.activeChapterId = null;
    this.curves = new Map();
    
    this.init();
  }

  async init() {
    this.setupPostProcessing();
    this.setupLighting();
    this.setupOverlay();
    
    if (this.data.typography && this.data.typography.fonts) {
      this.data.typography.fonts.forEach(f => this.loadFont(f));
    }

    await this.loadAllChapters();
    this.setupScroll();
    this.onResize();
    window.addEventListener('resize', () => this.onResize());
    this.animate();
    this.update(0);
  }

  setupOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'scrolly-overlay';
    this.overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:10;';
    this.container.appendChild(this.overlay);
    
    this.beats = this.chapters.flatMap(c => c.narrativeBeats || []);
    this.beatElements = new Map();
    
    this.beats.forEach(beat => {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;inset:0;display:none;flex-direction:column;justify-content:center;padding:10vw;transition:opacity 0.8s, transform 0.8s;';
      
      const content = document.createElement('div');
      const style = beat.style || {};
      const borderRadius = style.borderRadius || 30;
      const padding = style.padding || 40;
      const blur = style.backdropBlur || 30;
      
      content.style.cssText = "background:rgba(0,0,0,0.4);backdrop-filter:blur(" + blur + "px);border-radius:" + borderRadius + "px;padding:" + padding + "px;border:1px solid rgba(255,255,255,0.1);max-width:800px;pointer-events:auto;";
      
      const title = document.createElement('h2');
      title.innerText = beat.title;
      title.style.cssText = "font-size:clamp(2rem, 8vw, 6rem);margin-bottom:1.5rem;line-height:0.85;font-weight:900;text-transform:uppercase;font-style:italic;";
      if (style.titleColor) title.style.color = style.titleColor;
      if (style.textGlow) title.style.textShadow = "0 0 40px " + (style.titleColor || '#ffffff') + "88";
      
      const desc = document.createElement('p');
      desc.innerText = beat.description;
      desc.style.cssText = "font-size:1.15rem;line-height:1.6;opacity:0.6;max-width:500px;";
      if (style.descriptionColor) desc.style.color = style.descriptionColor;
      
      content.appendChild(title);
      content.appendChild(desc);
      el.appendChild(content);
      
      if (style.textAlign === 'center') {
          el.style.alignItems = 'center';
          el.style.textAlign = 'center';
      } else if (style.textAlign === 'right') {
          el.style.alignItems = 'flex-end';
          el.style.textAlign = 'right';
      } else {
          el.style.alignItems = 'flex-start';
          el.style.textAlign = 'left';
      }
      
      this.overlay.appendChild(el);
      this.beatElements.set(beat.id, el);
    });

    this.hotspotElements = new Map();
    this.chapters.forEach(chapter => {
        (chapter.spatialAnnotations || []).forEach(h => {
            const el = document.createElement('div');
            el.className = 'hotspot';
            el.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;transition:opacity 0.4s;width:280px;padding:1.5rem;background:rgba(5,5,5,0.9);backdrop-filter:blur(32px);border-radius:1.5rem;border:1px solid rgba(255,255,255,0.1);color:white;";
            
            const title = document.createElement('h4');
            title.innerText = h.label;
            title.style.cssText = "margin:0;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;";
            
            const content = document.createElement('p');
            content.innerText = h.content;
            content.style.cssText = "margin:0.5rem 0 0 0;font-size:11px;line-height:1.6;opacity:0.6;font-weight:500;";
            
            el.appendChild(title);
            el.appendChild(content);
            this.overlay.appendChild(el);
            this.hotspotElements.set(h.id, { el, pos: new THREE.Vector3(...h.position), visibleAt: h.visibleAt });
        });
    });
  }

  loadFont(font) {
    if (font.source === 'cdn' && font.url) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = font.url;
      document.head.appendChild(link);
    } else if (font.source === 'local') {
      const style = document.createElement('style');
      const src = font.data ? font.data : font.localPath;
      if (!src) return;
      style.textContent = "@font-face { font-family: '" + font.name + "'; src: url('" + src + "') format('woff2'); font-display: swap; }";
      document.head.appendChild(style);
    }
  }

  setupPostProcessing() {
    if (window.THREE.UnrealBloomPass) {
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        this.composer.addPass(this.bloomPass);
    }
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.directionalLight.position.set(10, 10, 5);
    this.scene.add(this.directionalLight);
  }

  async loadAllChapters() {
    const loader = new THREE.GLTFLoader();
    for (const chapter of this.chapters) {
      const modelUrl = this.assets[chapter.id] || chapter.modelUrl;
      const gltf = await new Promise((resolve, reject) => {
        loader.load(modelUrl, resolve, undefined, reject);
      });
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const normScale = 10 / maxDim;
      model.scale.set(normScale, normScale, normScale);
      
      const newBox = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      newBox.getCenter(center);
      model.position.x = -center.x;
      model.position.z = -center.z;
      model.position.y = -newBox.min.y;
      
      const config = chapter.environment || {};
      model.scale.multiplyScalar(config.modelScale || 1);
      if (config.modelPosition) model.position.add(new THREE.Vector3(...config.modelPosition));
      if (config.modelRotation) model.rotation.set(...config.modelRotation);
      
      const overrides = chapter.materialOverrides || {};
      model.traverse(node => {
          if (node.isMesh) {
              const settings = overrides[node.name];
              if (settings) {
                  const mats = Array.isArray(node.material) ? node.material : [node.material];
                  mats.forEach(mat => {
                      if (mat.isMeshStandardMaterial) {
                          mat.color.set(settings.color);
                          mat.emissive.set(settings.emissive);
                          mat.emissiveIntensity = settings.emissiveIntensity;
                          mat.metalness = settings.metalness;
                          mat.roughness = settings.roughness;
                          mat.wireframe = !!settings.wireframe;
                      }
                  });
              }
          }
      });
      this.chapterInstances.set(chapter.id, model);
      const sorted = [...chapter.cameraPath].sort((a, b) => a.progress - b.progress);
      if (sorted.length >= 2) {
          const points = sorted.map(k => new THREE.Vector3(...k.position));
          const targets = sorted.map(k => new THREE.Vector3(...k.target));
          const posCurve = new THREE.CatmullRomCurve3(points);
          const targetCurve = new THREE.CatmullRomCurve3(targets);
          const alpha = config.splineAlpha ?? 0.5;
          const curveType = alpha === 0 ? 'centripetal' : alpha === 1 ? 'chordal' : 'catmullrom';
          posCurve.curveType = curveType;
          targetCurve.curveType = curveType;
          this.curves.set(chapter.id, { posCurve, targetCurve, sorted });
      } else if (sorted.length === 1) {
          this.curves.set(chapter.id, { sorted });
      }
    }
  }

  setupScroll() {
    const totalHeight = this.chapters.length * 400;
    document.body.style.height = totalHeight + 'vh';
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.scroll.target = scrollY / maxScroll;
    });
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    if (this.composer) this.composer.setSize(w, h);
  }

  update(progress) {
    const currentChapter = this.chapters.find(c => progress >= c.startProgress && progress <= c.endProgress) || this.chapters[0];
    if (this.activeChapterId !== currentChapter.id) {
        if (this.activeChapterId && this.chapterInstances.has(this.activeChapterId)) {
            this.scene.remove(this.chapterInstances.get(this.activeChapterId));
        }
        this.activeChapterId = currentChapter.id;
        const model = this.chapterInstances.get(this.activeChapterId);
        if (model) this.scene.add(model);
        const config = currentChapter.environment || {};
        this.scene.background = new THREE.Color(config.backgroundColor || '#030303');
        this.ambientLight.intensity = config.ambientIntensity ?? 0.5;
        this.directionalLight.intensity = config.directionalIntensity ?? 1.5;
        this.renderer.toneMappingExposure = config.exposure ?? 1.0;
        if (this.bloomPass) {
            this.bloomPass.intensity = config.bloomIntensity ?? 1.5;
            this.bloomPass.threshold = config.bloomThreshold ?? 0.1;
        }
    }

    const curves = this.curves.get(currentChapter.id);
    if (curves) {
        const duration = currentChapter.endProgress - currentChapter.startProgress;
        const localT = duration === 0 ? 0 : (progress - currentChapter.startProgress) / duration;
        if (curves.posCurve) {
            const pos = curves.posCurve.getPointAt(localT);
            const target = curves.targetCurve.getPointAt(localT);
            this.camera.position.copy(pos);
            this.camera.lookAt(target);
            let i = 0;
            const kfs = curves.sorted;
            while (i < kfs.length - 2 && localT > kfs[i + 1].progress) i++;
            const kfA = kfs[i];
            const kfB = kfs[i+1] || kfA;
            const segT = kfA === kfB ? 0 : (localT - kfA.progress) / (kfB.progress - kfA.progress);
            const alpha = Math.max(0, Math.min(1, segT));
            this.camera.fov = kfA.fov + (kfB.fov - kfA.fov) * alpha;
            this.camera.updateProjectionMatrix();
        } else if (curves.sorted && curves.sorted[0]) {
            const kf = curves.sorted[0];
            this.camera.position.set(...kf.position);
            this.camera.lookAt(new THREE.Vector3(...kf.target));
            this.camera.fov = kf.fov;
            this.camera.updateProjectionMatrix();
        }
    }

    this.beats.forEach((beat, idx) => {
        const nextBeat = this.beats[idx + 1];
        const end = nextBeat ? nextBeat.progress : 1.1;
        const isActive = progress >= beat.progress && progress < end;
        const el = this.beatElements.get(beat.id);
        if (isActive) {
            el.style.display = 'flex';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0px)';
        } else {
            const dist = Math.abs(progress - beat.progress);
            const opacity = Math.max(0, 1 - dist * 10);
            if (opacity <= 0) {
                el.style.display = 'none';
            } else {
                el.style.display = 'flex';
                el.style.opacity = opacity;
                el.style.transform = "translateY(" + ((1 - opacity) * 30) + "px)";
            }
        }
    });

    this.hotspotElements.forEach(h => {
        const distance = Math.abs(progress - h.visibleAt);
        const opacity = Math.max(0, Math.min(1, (0.08 - distance) * 20));
        
        if (opacity <= 0) {
            h.el.style.opacity = '0';
        } else {
            const vector = h.pos.clone().project(this.camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
            
            h.el.style.opacity = opacity;
            h.el.style.transform = "translate(-50%, -50%) translate(" + x + "px, " + y + "px)";
        }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.scroll.offset += (this.scroll.target - this.scroll.offset) * 0.1;
    this.update(this.scroll.offset);
    if (this.composer) {
        this.composer.render();
    } else {
        this.renderer.render(this.scene, this.camera);
    }
  }
}

window.ScrollyPipeline = ScrollyPipeline;
`;

export const INDEX_HTML_TEMPLATE = (projectName: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${projectName} • ScrollStudio Export</title>
    <style>
        body { margin: 0; background: #000; overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: white; }
        #app { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
    <!-- Dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
    <script src="ScrollyPipeline.js"></script>
</head>
<body>
    <div id="app"></div>
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const response = await fetch('project.json');
                const projectData = await response.json();
                const pipeline = new ScrollyPipeline({
                    container: document.getElementById('app'),
                    data: projectData
                });
            } catch (e) {
                console.error("Failed to initialize scrolly pipeline:", e);
                document.body.innerHTML = '<div style="padding:40px; text-align:center;"><h1>Failed to load project</h1><p>' + e.message + '</p></div>';
            }
        });
    </script>
</body>
</html>`;

export const README_MD_TEMPLATE = (projectName: string) => `# \${projectName}

This is a self-contained scrollytelling experience exported from **ScrollStudio3D**.

## How to Run

### 1. Local Preview
Due to browser security restrictions on loading local files (CORS), you cannot simply double-click index.html to open it. You must run it through a local server.

**Option A: VS Code Live Server**
If you use VS Code, install the "Live Server" extension, right-click index.html, and select "Open with Live Server".

**Option B: Python (Built-in)**
Run this command in the project folder:
\`\`\`bash
python -m http.server 8000
\`\`\`
Then visit http://localhost:8000 in your browser.

**Option C: Node.js (npx)**
\`\`\`bash
npx serve .
\`\`\`

## Project Structure
- index.html: The entry point.
- project.json: Your project configuration, including chapters, camera paths, and narrative beats.
- ScrollyPipeline.js: The core engine that powers the experience.
- assets/: (Optional) Any external 3D models or media.

## Customization
You can modify the style block in index.html to change the global appearance, or edit project.json to adjust the narrative flow.`;

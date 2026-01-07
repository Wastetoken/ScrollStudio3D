function Scene3D({ onProgress, onLoaded }) {
  try {
    React.useEffect(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 2, 18);
      
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      document.getElementById('viewport').appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      const point = new THREE.PointLight(0xff4400, 2, 50);
      point.position.set(5, 5, 5);
      const directional = new THREE.DirectionalLight(0xffffff, 0.8);
      directional.position.set(-5, 10, 7);
      scene.add(ambient, point, directional);

      const composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.04, 0.02);
      composer.addPass(bloom);

      let model, mixer, animations = {}, currentAnim = '';
      const loader = new THREE.GLTFLoader();
      const modelUrl = 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Emotive%20creature.glb';
      
      loader.load(modelUrl,
        (gltf) => {
          model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3()).length();
          model.scale.setScalar(9 / size);
          model.position.set(0, -2, 0);
          scene.add(model);
          
          mixer = new THREE.AnimationMixer(model);
          if (gltf.animations && gltf.animations.length > 0) {
            gltf.animations.forEach(clip => { 
              const name = clip.name.toLowerCase().replace(/\s+/g, '_');
              animations[name] = mixer.clipAction(clip); 
            });
            const firstAnim = Object.keys(animations)[0];
            if (firstAnim) playAnimation(firstAnim);
          }
          setupScrollAnimation(model);
          onLoaded();
        },
        (xhr) => { 
          if (xhr.total > 0) onProgress(Math.round((xhr.loaded / xhr.total) * 100)); 
        },
        (err) => { 
          console.error('Model load error details:', err.message || err.type || err); 
          onLoaded(); 
        }
      );

      function playAnimation(name) {
        if (currentAnim === name || !animations[name]) return;
        Object.values(animations).forEach(a => a.fadeOut(0.5));
        animations[name].reset().fadeIn(0.5).play();
        currentAnim = name;
      }

      function setupScrollAnimation(m) {
        gsap.registerPlugin(ScrollTrigger);
        const animKeys = Object.keys(animations);
        
        ScrollTrigger.create({
          trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: true,
          onUpdate: (self) => {
            if (animKeys.length === 0) return;
            const idx = Math.floor(self.progress * animKeys.length) % animKeys.length;
            playAnimation(animKeys[idx] || animKeys[0]);
          }
        });

        const tl = gsap.timeline({ scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1 } });
        tl.to(m.position, { x: 0, y: -1, z: 6 }, 0).to(m.rotation, { y: 0, x: 0.1, z: 0 }, 0)
          .to(m.position, { x: -5, y: -1, z: 4 }, 0.2).to(m.rotation, { y: Math.PI * 0.3, x: 0, z: 0.05 }, 0.2)
          .to(m.position, { x: 5, y: -2, z: 3 }, 0.45).to(m.rotation, { y: -Math.PI * 0.35, x: 0.1, z: -0.05 }, 0.45)
          .to(m.position, { x: 0, y: 0, z: 5 }, 0.65).to(m.rotation, { y: Math.PI * 0.1, x: -0.15, z: 0 }, 0.65)
          .to(m.position, { x: 1.5, y: 1.5, z: 12 }, 0.01).to(m.rotation, { y: -Math.PI * 0.1, x: 0.3, z: -0.2 }, 0.45);
      }

      const clock = new THREE.Clock();
      function animate() { requestAnimationFrame(animate); if (mixer) mixer.update(clock.getDelta()); composer.render(); }
      animate();

      const handleResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight); };
      window.addEventListener('resize', handleResize);
      return () => { window.removeEventListener('resize', handleResize); renderer.dispose(); };
    }, []);

    return null;
  } catch (error) { console.error('Scene3D error:', error); return null; }
}

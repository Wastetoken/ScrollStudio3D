function SkaterScene({ onProgress, onLoaded }) {
  try {
    React.useEffect(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 3, 20);
      
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.8;
      document.getElementById('viewport').appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const point = new THREE.PointLight(0x00aaff, 1.2, 50);
      point.position.set(5, 5, 5);
      scene.add(point);
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(-5, 10, 7);
      scene.add(dir);

      const composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.25, 0.04, 0.01));

      let model, mixer, animations = {}, currentAnim = '';
      const loader = new THREE.GLTFLoader();
      
      loader.load('https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Skateboarder.glb',
        (gltf) => {
          model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3()).length();
          model.scale.setScalar(6 / size);
          model.position.set(0, -3, 0);
          scene.add(model);
          
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach(clip => { 
            const name = clip.name.toLowerCase().replace(/\s+/g, '_');
            animations[name] = mixer.clipAction(clip);
          });
          if (animations['idle_and_push']) playAnim('idle_and_push');
          setupScroll(model, camera);
          onLoaded();
        },
        (xhr) => { if (xhr.total > 0) onProgress(Math.round((xhr.loaded / xhr.total) * 100)); },
        (err) => { console.error('Model error:', err); onLoaded(); }
      );

      function playAnim(name) {
        if (currentAnim === name || !animations[name]) return;
        Object.values(animations).forEach(a => a.fadeOut(0.5));
        animations[name].reset().fadeIn(0.5).play();
        currentAnim = name;
      }

      function setupScroll(m, cam) {
        gsap.registerPlugin(ScrollTrigger);
        const animSeq = ['idle_and_push', 'jump', 'tricks_1', 'tricks_2', 'walk'];
        
        ScrollTrigger.create({
          trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: true,
          onUpdate: (self) => {
            const idx = Math.min(Math.floor(self.progress * animSeq.length), animSeq.length - 1);
            playAnim(animSeq[idx]);
          }
        });

        const tl = gsap.timeline({ scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1 } });
        tl.to(m.position, { x: 4, y: -2, z: 0 }, 0).to(m.rotation, { y: -Math.PI * 0.3 }, 0).to(cam.position, { x: 4, y: 4, z: 18 }, 0)
          .to(m.position, { x: -4, y: -1, z: 2 }, 0.25).to(m.rotation, { y: Math.PI * 0.4 }, 0.25).to(cam.position, { x: -3, y: 5, z: 16 }, 0.25)
          .to(m.position, { x: 0, y: 0, z: 4 }, 0.5).to(m.rotation, { y: 0 }, 0.5).to(cam.position, { x: 0, y: 3, z: 14 }, 0.5)
          .to(m.position, { x: 3, y: -1, z: 1 }, 0.75).to(m.rotation, { y: -Math.PI * 0.2 }, 0.75).to(cam.position, { x: 3, y: 2, z: 18 }, 0.75)
          .to(m.position, { x: 0, y: -2, z: 3 }, 1).to(m.rotation, { y: Math.PI * 0.1 }, 1).to(cam.position, { x: 0, y: 3, z: 20 }, 1);
      }

      const clock = new THREE.Clock();
      function animate() { requestAnimationFrame(animate); if (mixer) mixer.update(clock.getDelta()); composer.render(); }
      animate();

      const resize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight); };
      window.addEventListener('resize', resize);
      return () => { window.removeEventListener('resize', resize); renderer.dispose(); };
    }, []);

    return null;
  } catch (error) { console.error('SkaterScene error:', error); return null; }
}
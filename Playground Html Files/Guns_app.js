const debugEl = document.getElementById('debug-info');

function updateDebug(msg) {
  console.log(msg);
  if (debugEl) {
    debugEl.innerHTML += '<br>' + msg;
  }
}

class CyberArsenal {
  constructor() {
    this.canvas = document.querySelector('#webgl-canvas');
    this.scrollContainer = document.querySelector('[data-scroll-container]');
    
    if (!this.canvas || !this.scrollContainer) {
      console.error('Required elements not found.');
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });

    this.clock = new THREE.Clock();
    this.weapons = [];
    this.mouse = new THREE.Vector2();
    this.targetMouse = new THREE.Vector2();
    this.loader = new THREE.GLTFLoader();
    this.loadedCount = 0;
    this.totalWeapons = 3;

    // NEW: Scroll-based time system
    this.scrollTime = 0;
    this.lastScrollY = 0;
    this.scrollVelocity = 0;

    this.init();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.scene.fog = new THREE.Fog(0x284f08, 2, 20);

    const ambientLight = new THREE.AmbientLight(0x000, 10.2);
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 2, 80, 0.3, 10);
    spotLight.position.set(0, 15, 4);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 102;
    spotLight.shadow.mapSize.height = 102;
    this.scene.add(spotLight);

    const blueLight = new THREE.PointLight(0x00ffff, 10.5, 30);
    blueLight.position.set(-8, 2, 5);
    this.scene.add(blueLight);

    const orangeLight = new THREE.PointLight(0xFF3C00, 10.5, 30);
    orangeLight.position.set(8, -5, 5);
    this.scene.add(orangeLight);

    this.scroll = new LocomotiveScroll({
      el: this.scrollContainer,
      smooth: true,
      multiplier: 1,
      lerp: 0.08
    });

    this.loadWeapons();

    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    // NEW: Track scroll delta for time-based progress
    this.scroll.on('scroll', (args) => {
      const currentScrollY = args.scroll.y;
      const deltaY = currentScrollY - this.lastScrollY;
      
      // Only advance time on downward scroll
      if (deltaY > 0) {
        this.scrollTime += deltaY * 0.001; // Scale factor for time progression
      }
      
      this.scrollVelocity = deltaY;
      this.lastScrollY = currentScrollY;
    });

    this.animate();
  }

  loadWeapons() {
    const weaponData = [
      {
        url: 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/guns/mp5.glb',
        name: 'mp5',
        id: 'weapon-01',
        baseScale: 85,
        startTime: 0.2,
        duration: 1.5,
        path: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-6, -2, 4),
          new THREE.Vector3(-3, 0, 7),
          new THREE.Vector3(0, 0.5, 3),
          new THREE.Vector3(2, 0, -1),
          new THREE.Vector3(0, 0, 0)
        ])
      },
      {
        url: 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/guns/sawed-off.glb',
        name: 'Shotgun',
        id: 'weapon-02',
        baseScale: 1305,
        startTime: 1.3,
        duration: 1.3,
        path: new THREE.CatmullRomCurve3([
          new THREE.Vector3(6, 3, -1),
          new THREE.Vector3(2, 1, 0),
          new THREE.Vector3(0, -0.5, 1),
          new THREE.Vector3(-2, -1, 0),
          new THREE.Vector3(0, 0, 0)
        ])
      },
      {
        url: 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/guns/m14.glb',
        name: 'Sniper',
        id: 'weapon-03',
        baseScale: 250,
        startTime: 2.4,
        duration: 1.0,
        path: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-5, -3, -2),
          new THREE.Vector3(-2, -3, 0),
          new THREE.Vector3(0, -3.5, 1),
          new THREE.Vector3(2, -3, 0),
          new THREE.Vector3(5, -3, -2)
        ])
      }
    ];

    weaponData.forEach((data, i) => {
      updateDebug(`Loading weapon ${i + 1}: ${data.name}`);
      
      this.loader.load(
        data.url,
        (gltf) => {
          this.loadedCount++;
          updateDebug(`✓ ${data.name} loaded (${this.loadedCount}/${this.totalWeapons})`);

          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.material.side = THREE.DoubleSide;
            }
          });

          this.weapons[i] = {
            mesh: model,
            id: data.id,
            baseScale: data.baseScale,
            path: data.path,
            startTime: data.startTime,
            duration: data.duration,
            pathProgress: 0,
            isActive: false,
            hasStarted: false
          };

          model.visible = false;
          this.scene.add(model);

          if (this.loadedCount === this.totalWeapons) {
            updateDebug('All models loaded successfully.');
            if (debugEl && debugEl.parentElement) {
              debugEl.parentElement.removeChild(debugEl);
            }
          }
        },
        undefined,
        (error) => {
          updateDebug(`✗ ${data.name} failed: ${error.message}`);
        }
      );
    });
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(e) {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const deltaTime = this.clock.getDelta();

    // Smooth mouse following
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Camera setup
    const lookAtTarget = new THREE.Vector3(this.mouse.x * 0.5, this.mouse.y * 0.5, -1);
    this.camera.position.z = 10;
    this.camera.lookAt(lookAtTarget);

    // NEW: Time-based weapon animation
    this.weapons.forEach((weapon) => {
      if (!weapon || !weapon.mesh) return;

      const weaponTime = this.scrollTime - weapon.startTime;
      
      // Check if weapon should start
      if (weaponTime >= 0 && !weapon.hasStarted) {
        weapon.hasStarted = true;
        weapon.isActive = true;
        weapon.mesh.visible = true;
      }

      // Only update if weapon is active
      if (!weapon.isActive) return;

      // Calculate progress (0 to 1) based on time
      const rawProgress = weaponTime / weapon.duration;
      weapon.pathProgress = Math.max(0, Math.min(1, rawProgress));

      // Hide weapon if it's completed its path
      if (weapon.pathProgress >= 1) {
        weapon.isActive = false;
        weapon.mesh.visible = false;
        return;
      }

      // Position along path
      const pos = weapon.path.getPoint(weapon.pathProgress);
      weapon.mesh.position.copy(pos);

      // Orientation along path
      const tangent = weapon.path.getTangent(weapon.pathProgress);
      const lookAtPos = new THREE.Vector3().copy(pos).add(tangent);
      weapon.mesh.lookAt(lookAtPos);

      // Mouse-based rotation (reduced influence)
      weapon.mesh.rotation.y += this.mouse.x * 0.1;
      weapon.mesh.rotation.x -= this.mouse.y * 0.1;

      // Constant scale (no depth illusion)
      const scale = weapon.baseScale / 50;
      weapon.mesh.scale.set(scale, scale, scale);

      // Opacity-based visibility (fade in/out at path ends)
      let opacity = 1;
      if (weapon.pathProgress < 0.1) {
        opacity = weapon.pathProgress / 0.1; // Fade in
      } else if (weapon.pathProgress > 0.9) {
        opacity = (1 - weapon.pathProgress) / 0.1; // Fade out
      }

      weapon.mesh.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.transparent = true;
              mat.opacity = opacity;
            });
          } else {
            child.material.transparent = true;
            child.material.opacity = opacity;
          }
        }
      });
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('load', () => {
  new CyberArsenal();

  // Cursor follower logic
  const cursor = document.createElement('div');
  cursor.classList.add('cursor-follower');
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
});

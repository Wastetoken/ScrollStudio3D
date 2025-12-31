<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ScrollStudio • Immersive</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['General Sans', 'Inter', 'sans-serif'],
                        serif: ['Playfair Display', 'serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        void: '#030303',
                        surface: '#0F0F0F',
                        accent: '#FF4D00',
                        muted: '#666666'
                    },
                    letterSpacing: {
                        tighter: '-0.05em',
                        tight: '-0.02em',
                        widest: '0.2em'
                    },
                    fontSize: {
                        'hero': '12vw',
                        'sub-hero': '9vw'
                    }
                }
            }
        }
    </script>

    <link href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,900;1,400&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>

    <style>
        :root {
            --cursor-size: 20px;
            --accent-glow: 0 0 20px rgba(255, 77, 0, 0.4);
            --transition-smooth: all 0.8s cubic-bezier(0.77, 0, 0.175, 1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
        }

        body {
            background-color: #030303;
            color: #EAEAEA;
            overflow-x: hidden;
            cursor: none;
            line-height: 1.2;
        }

        #viewport {
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1;
            pointer-events: none;
            background: radial-gradient(circle at center, #0F0F0F 0%, #030303 100%);
        }

        #cursor-dot {
            width: var(--cursor-size);
            height: var(--cursor-size);
            background: white;
            border-radius: 50%;
            position: fixed;
            top: 0;
            left: 0;
            transform: translate(-50%, -50%);
            z-index: 9999;
            pointer-events: none;
            mix-blend-mode: exclusion;
            transition: width 0.3s, height 0.3s;
        }

        .noise-layer {
            position: fixed;
            inset: 0;
            z-index: 50;
            pointer-events: none;
            opacity: 0.05;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        .section-h {
            height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 10;
            pointer-events: none;
        }

        .gs-anim {
            opacity: 0;
            transform: translateY(60px);
            filter: blur(10px);
        }

        .loader-screen {
            position: fixed;
            inset: 0;
            background: #030303;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .loader-bar-container {
            width: 240px;
            height: 1px;
            background: rgba(255,255,255,0.1);
            margin-top: 2rem;
            position: relative;
            overflow: hidden;
        }

        #loader-bar {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            background: white;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .nav-item {
            position: relative;
            overflow: hidden;
        }

        .nav-item::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 1px;
            background: white;
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.4s ease;
        }

        .nav-item:hover::after {
            transform: scaleX(1);
            transform-origin: left;
        }

        .outline-text {
            -webkit-text-stroke: 1px rgba(255,255,255,0.3);
            color: transparent;
        }

        canvas {
            display: block;
        }
    </style>
</head>
<body class="selection:bg-white selection:text-black">
    <div id="cursor-dot"></div>
    <div class="noise-layer"></div>

    <div class="loader-screen" id="loader">
        <h1 class="text-5xl italic font-serif tracking-tighter text-white">ScrollStudio</h1>
        <div class="loader-bar-container">
            <div id="loader-bar"></div>
        </div>
        <p class="mt-4 font-mono text-[10px] tracking-widest text-muted uppercase" id="loader-status">Initializing Core Assets</p>
    </div>

    <nav class="fixed top-0 left-0 w-full p-10 z-50 flex justify-between items-start mix-blend-difference text-white pointer-events-none">
        <div class="pointer-events-auto">
            <span class="font-bold tracking-tighter text-2xl uppercase">ScrollStudio.</span>
        </div>
        <div class="hidden md:flex flex-col items-end gap-2 font-mono text-[10px] opacity-60">
            <div class="flex gap-4 pointer-events-auto">
                <a href="#" class="nav-item">PROCESS</a>
                <a href="#" class="nav-item">WORKS</a>
                <a href="#" class="nav-item">LAB</a>
            </div>
            <div class="mt-4 text-right">
                <span>RENDER_ENGINE: <span id="render-mode" class="text-white">WEBGL_V2</span></span><br>
                <span>ASSET_PATH: <span class="text-white">CREATURE_01.GLB</span></span>
            </div>
        </div>
    </nav>

    <div id="viewport"></div>

    <main class="relative z-10 w-full">
        <section class="section-h px-10">
            <div class="max-w-7xl w-full text-center pointer-events-auto">
                <div class="overflow-hidden">
                    <h2 class="text-hero leading-[0.8] font-serif font-medium text-white mix-blend-difference gs-anim">
                        Transform <br> 
                        <span class="font-sans font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-600">Vision</span>
                    </h2>
                </div>
                <p class="mt-12 text-2xl font-mono text-muted mix-blend-difference gs-anim max-w-2xl mx-auto">
                    A cinematic playground for your 3D assets. Scroll to interact.
                </p>
            </div>
        </section>

        <section class="section-h px-10">
            <div class="max-w-6xl w-full flex justify-end pointer-events-auto">
                <div class="text-right">
                    <div class="font-mono text-accent mb-6 tracking-widest text-sm gs-anim">01 — SPATIAL CONTROL</div>
                    <h2 class="text-sub-hero leading-[0.85] font-sans font-black uppercase text-white gs-anim">
                        Command <br> <span class="outline-text">Moment</span>
                    </h2>
                    <p class="mt-8 text-3xl font-serif italic text-white/70 gs-anim max-w-lg ml-auto">
                        Precision tracking between the camera and the subject.
                    </p>
                </div>
            </div>
        </section>

        <section class="section-h px-10">
            <div class="max-w-5xl w-full flex justify-start pointer-events-auto">
                <div class="relative">
                    <div class="absolute -left-20 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-accent to-transparent"></div>
                    <div class="font-mono text-muted mb-6 tracking-widest text-sm gs-anim">02 — BOUNDLESS CREATIVITY</div>
                    <h2 class="text-sub-hero leading-[0.9] font-serif italic text-white gs-anim">
                        Design Without <br> <span class="not-italic font-sans font-bold text-white uppercase tracking-tighter">Limits</span>
                    </h2>
                    <p class="mt-8 text-xl font-sans font-light text-muted gs-anim max-w-md leading-relaxed">
                        Every frame is a story. Every pixel is a choice. Build experiences that defy the browser's 2D constraints.
                    </p>
                </div>
            </div>
        </section>

        <section class="section-h">
            <div class="text-center pointer-events-auto relative">
                <div class="absolute inset-0 blur-3xl bg-accent/10 rounded-full scale-150 -z-10"></div>
                <h2 class="text-hero leading-[0.8] font-sans font-black text-white mix-blend-overlay gs-anim">BLEND</h2>
                <h2 class="text-hero leading-[0.8] font-serif italic text-white mix-blend-difference -mt-8 gs-anim">NARRATIVE</h2>
            </div>
        </section>

        <section class="section-h">
            <div class="text-center pointer-events-auto z-20">
                <div class="mb-10 flex flex-col items-center gap-4">
                    <div class="w-[1px] h-20 bg-gradient-to-b from-white to-transparent gs-anim"></div>
                    <span class="font-mono text-xs tracking-widest uppercase gs-anim">End of Sequence</span>
                </div>
                <button class="group relative px-20 py-10 bg-white overflow-hidden rounded-full transition-all duration-500 hover:scale-110 active:scale-95 gs-anim">
                    <span class="relative z-10 font-bold font-sans tracking-[0.3em] text-black group-hover:text-white transition-colors duration-500 uppercase">LAUNCH STUDIO</span>
                    <div class="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                </button>
            </div>
        </section>

        <footer class="p-10 flex justify-between items-end text-muted font-mono text-[10px]">
            <div>©2024 SCROLLSTUDIO LABS</div>
            <div class="flex gap-10">
                <span>INSTAGRAM</span>
                <span>TWITTER</span>
                <span>BEHANCE</span>
            </div>
        </footer>
        
        <div class="h-[10vh]"></div>
    </main>

    <script>
        const ASSET_URL = 'https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Emotive%20creature.glb';

        let scene, camera, renderer, composer, model, mixer, clock = new THREE.Clock();

        // Cursor Logic
        const dot = document.getElementById('cursor-dot');
        window.addEventListener('mousemove', e => {
            gsap.to(dot, { 
                x: e.clientX, 
                y: e.clientY, 
                duration: 0.15,
                ease: "power2.out"
            });
        });

        // Scene Initialization
        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 18);

            renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true,
                powerPreference: "high-performance"
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            document.getElementById('viewport').appendChild(renderer.domElement);

            // Post Processing Stack
            const renderPass = new THREE.RenderPass(scene, camera);
            const bloom = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight), 
                1.5, 0.4, 0.85
            );
            bloom.threshold = 0.2;
            bloom.strength = 1.0;
            
            composer = new THREE.EffectComposer(renderer);
            composer.addPass(renderPass);
            composer.addPass(bloom);

            // Lighting Configuration
            scene.add(new THREE.AmbientLight(0xffffff, 1.0));
            const spotlight = new THREE.PointLight(0xffffff, 1.5);
            spotlight.position.set(10, 15, 10);
            scene.add(spotlight);

            const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
            fillLight.position.set(-10, -5, 5);
            scene.add(fillLight);

            // GLTF Loading
            const loader = new THREE.GLTFLoader();
            loader.load(ASSET_URL, (gltf) => {
                model = gltf.scene;
                
                // Normalized scale + centering
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3()).length();
                model.scale.setScalar(11 / size);
                
                scene.add(model);

                if (gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    mixer.clipAction(gltf.animations[0]).play();
                }

                // Hide loader and start GSAP
                gsap.to("#loader", { 
                    opacity: 0, 
                    duration: 1.2, 
                    ease: "power4.inOut",
                    onComplete: () => {
                        document.getElementById('loader').style.display = 'none';
                        initGSAP();
                    }
                });

            }, (xhr) => {
                const progress = xhr.loaded / xhr.total;
                document.getElementById('loader-bar').style.transform = `scaleX(${progress})`;
                document.getElementById('loader-status').innerText = `Syncing Meshes: ${Math.round(progress * 100)}%`;
            });

            animate();
        }

        function initGSAP() {
            gsap.registerPlugin(ScrollTrigger);

            // Model Scroll Journey
            const mainTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: "main",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.2
                }
            });

            mainTimeline
                .to(model.position, { x: 5, y: 1.5, z: -4, ease: "power1.inOut" })
                .to(model.rotation, { y: Math.PI * 0.4, x: 0.1 }, 0)
                
                .to(model.position, { x: -6, y: -1, z: 2, ease: "power1.inOut" }, ">")
                .to(model.rotation, { y: Math.PI * 1.6, x: -0.1 }, "<")
                
                .to(model.position, { x: 0, y: 0, z: 8, ease: "power1.inOut" }, ">")
                .to(model.rotation, { y: Math.PI * 2, x: 0 }, "<");

            // UI Content Entrance Animations
            document.querySelectorAll('.gs-anim').forEach(element => {
                gsap.to(element, {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 90%",
                        end: "bottom 10%",
                        toggleActions: "play reverse play reverse"
                    }
                });
            });
        }

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            if (mixer) mixer.update(delta);
            composer.render();
        }

        window.onload = init;

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>

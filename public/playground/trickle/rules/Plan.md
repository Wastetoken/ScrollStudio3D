React Three Fiber Implementation with Your GLB Model & GSAP Animations
Recreate the exact scroll-triggered 3D experience from your HTML using React Three Fiber, GSAP ScrollTrigger, and your Emotive creature.glb model with animations.

Overview
Transform your vanilla Three.js + GSAP code into a React component that:

Loads your specific GLB model (https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Emotive%20creature.glb)
Plays embedded animations from the GLB using AnimationMixer
Uses GSAP ScrollTrigger for model position/rotation during scroll
Applies UnrealBloom post-processing for cinematic glow
Implements the exact same scroll journey (model moves x: 5→-6→0, rotates through Math.PI values)
Preserves custom cursor, noise overlay, loader screen, and all styling from your HTML
Key Implementation Details
1. Model Loading & Animation

// Use GLTFLoader from drei
const { scene, animations } = useGLTF('https://pub-a56d70d158b1414d83c3856ea210601c.r2.dev/Emotive%20creature.glb')
const mixer = new THREE.AnimationMixer(scene)
mixer.clipAction(animations[0]).play()
// Update mixer in useFrame
2. GSAP ScrollTrigger Integration

const mainTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: "main",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.2
  }
})
mainTimeline
  .to(model.position, { x: 5, y: 1.5, z: -4 })
  .to(model.rotation, { y: Math.PI * 0.4, x: 0.1 }, 0)
  .to(model.position, { x: -6, y: -1, z: 2 }, ">")
  .to(model.rotation, { y: Math.PI * 1.6, x: -0.1 }, "<")
  .to(model.position, { x: 0, y: 0, z: 8 }, ">")
  .to(model.rotation, { y: Math.PI * 2, x: 0 }, "<")
3. Post-Processing Effects

import { EffectComposer, Bloom } from '@react-three/postprocessing'
<EffectComposer>
  <Bloom 
    intensity={1.0}
    luminanceThreshold={0.2}
    luminanceSmoothing={0.4}
  />
</EffectComposer>
4. Model Scaling & Centering

// Normalize scale to 11 units like your original code
const box = new THREE.Box3().setFromObject(scene)
const size = box.getSize(new THREE.Vector3()).length()
scene.scale.setScalar(11 / size)
5. UI Elements from HTML
Custom Cursor: Track mouse position with GSAP animation
Noise Layer: SVG noise overlay with opacity 0.05
Loader Screen: Progress bar tracking model load (loader.load callback)
Section Animations: .gs-anim elements fade in with ScrollTrigger
Tailwind Styling: Preserve all classes (font-serif italic, tracking-tighter, etc.)
Files to Modify
components/Landing/LandingPage.tsx
Replace with scroll-based layout container
Add sections matching HTML structure (Transform Vision, Command Moment, etc.)
Keep ScrollTrigger-enabled text animations
components/Landing/Scene3D.tsx
Replace generic model URL with your creature GLB
Implement GSAP scroll timeline for position/rotation
Add AnimationMixer for GLB animations
Configure camera (fov: 40, position: [0, 0, 18])
Add lighting setup (AmbientLight + PointLight + DirectionalLight)
Remove multiple floating models, use single centered model
components/Landing/Background.tsx
Add noise layer SVG
Implement custom cursor dot with GSAP tracking
components/Landing/Hero.tsx
Loader screen with progress bar
Initial hero text ("Transform Vision" with gradient)
Inspiration from 21st.dev Library
Based on community patterns:

Alice Scroll Story: ScrollTrigger with pinned sections and parallax
Scroll Animated Video: Expanding media with scrub animations
Futuristic Hero: WebGPU bloom effects and texture manipulation
Full Screen Scroll FX: Multi-section scroll with center-aligned content
Technical Stack
React Three Fiber for 3D rendering
GSAP + ScrollTrigger for scroll animations
@react-three/postprocessing for UnrealBloom
@react-three/drei for useGLTF hook
AnimationMixer for GLB animations
Tailwind for styling (preserve all classes from HTML)
# ScrollStudio 3D: Cinematic Scrollytelling Engine

**ScrollStudio** is a professional-grade, browser-based creative suite designed to bridge the gap between high-end 3D production and web-based scrollytelling. It allows designers and developers to transform standard GLB/GLTF models into immersive, scroll-driven cinematic experiences similar to those seen on premium product landing pages.

---

## Getting Started

To run ScrollStudio locally for development or to customize the engine, follow these steps.

### Prerequisites
- **Node.js**: Version 18.0 or higher.
- **npm** or **yarn**.

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/scroll-studio-3d.git
   cd scroll-studio-3d
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`.*

---

## Core Features

### 1. Keyframe-Based Camera Pathing
The engine uses a **Snapshot Method**. Instead of defining a path with code, you simply position the camera in the editor at a specific scroll percentage (e.g., 25%) and hit "Capture." The engine automatically calculates the smooth Hermite or linear interpolation between that point and your next keyframe.

### 2. Spatial Annotations (Hotspots)
Unlike standard UI overlays, Hotspots are pinned to **3D Coordinates**. 
*   **Anchoring:** They are tethered to the model's geometry.
*   **Proximity Logic:** They automatically fade in/out based on the user's scroll position relative to the pin's "creation percentage."

### 3. Narrative Beats
A dedicated story layer that handles full-screen text transitions. These are synced to the scroll progress, allowing you to tell a linear story as the camera orbits the model.

### 4. Cinematic Post-Processing
Built-in professional optics controls:
*   **Depth of Field (Bokeh):** Real-time blur based on aperture and focus distance.
*   **Volumetric Fog:** Adds scale and atmospheric depth.
*   **Bloom & HDR:** High-dynamic-range glow for emissive materials.
*   **FOV Control:** Switch between wide-angle (15mm) and telephoto (80mm) perspectives.

---

## How to Use the Studio

### Step 1: The Onboarding
Launch the app and upload a `.glb` or `.gltf` file. Your model is processed locally in the browser—no data is sent to a server.

### Step 2: Blocking the Scene
1.  Set your timeline to **0%**.
2.  Use the mouse to orbit, pan, and zoom until you have the perfect "Hero" shot.
3.  Click the **Camera Icon (Capture View)**.
4.  Move the timeline to **100%**.
5.  Reposition the camera for the "Final" shot and click **Capture** again.
6.  *The path is now live.* Scrub the timeline to see the interpolation.

### Step 3: Layering FX
Go to the **FX Tab** to tune the atmosphere. Increase the **Fog Density** to hide the world edges and adjust the **Aperture** to focus the viewer's eye on specific mechanical details of your model.

### Step 4: Adding "The Why" (Narrative)
Use the **Story Tab** to add Narrative Beats. For a car model, you might add a beat at 30% titled "Aerodynamics" and another at 70% titled "Electric Powerhouse." These will fade in gracefully as the user scrolls.

### Step 5: Master Export
Once satisfied, go to the **Project Tab** and click **Download Project JSON**. This file contains the "brain" of your experience.

---

## Technical Architecture

*   **Engine:** [React Three Fiber](https://r3f.docs.pmnd.rs/) (Three.js abstraction).
*   **Interpolation:** [GSAP](https://gsap.com/) (GreenSock) for high-precision timeline scrubbing.
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) for a high-performance reactive store.
*   **Optics:** [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) for GPU-accelerated shaders.

## Production Deployment

To use your creation in a production website:
1.  Initialize a standard Three.js/R3F scene.
2.  Load the `Project JSON` exported from the Studio.
3.  Feed the keyframe data into a GSAP ScrollTrigger.
4.  Map the `scrollProgress` to the engine's `seek()` function.

---
*Built for creators by ScrollStudio Engineering.*
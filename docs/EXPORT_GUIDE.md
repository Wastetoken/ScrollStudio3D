# ScrollStudio3D: Export & Distribution Guide

This guide explains the two primary ways to distribute and use the scrollytelling experiences created with ScrollStudio3D.

---

## 1. Self-Contained ZIP Export (Vanilla JS)

The "Download Project ZIP" option in the **Export Pipeline** generates a complete, runnable package that has zero dependencies on React or complex build tools.

### What's inside the ZIP?
- `index.html`: The entry point that initializes the scene.
- `project.json`: All your scene data, keyframes, and configuration.
- `ScrollyPipeline.js`: The standalone engine that powers the experience.
- `assets/`: (Optional) Folder containing 3D models (GLB).
- `README.md`: Local setup instructions.

### Usage
1.  **Extract** the contents of the ZIP file.
2.  **Run a Local Server**: Due to browser security (CORS), you cannot open `index.html` directly from your file system.
    - **VS Code**: Use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
    - **Python**: Run `python -m http.server 8000` in the directory.
    - **Node.js**: Run `npx serve .`.
3.  **View**: Open your browser to the address provided (usually `http://localhost:8000` or `http://localhost:5000`).

---

## 2. React Integration (JSON Export)

If you are a developer integrating the scrolly experience into an existing React / Three Fiber application, use the "Download Project JSON" option.

### Implementation Steps
1.  **Add Components**: Ensure you have the `ScrollyEngine.tsx` component and its utility dependencies (like `cameraUtils.ts`) in your React project.
2.  **Load the Data**: import or fetch your `project.json`.
3.  **Render**:

```tsx
import { ScrollyEngine } from './components/Studio/ScrollyEngine';
import projectData from './project.json';

export default function MyPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <ScrollyEngine data={projectData} />
    </div>
  );
}
```

### Required Dependencies
Your React project will need the following installed:
- `three`
- `@types/three`
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/postprocessing`

---

## 3. Asset Strategies

When exporting, you have a toggle for **"Embed Models in JSON"**:

| Strategy | Pros | Cons |
| :--- | :--- | :--- |
| **Embedded (Base64)** | Single file portability; easy to move. | Larger JSON file size; slower initial data parse. |
| **External (.glb)** | Smaller JSON; standard asset loading; better caching. | Requires maintaining the `assets/` folder structure. |

---

## 4. Customization Post-Export

### Adjusting Content
You can open `project.json` in any text editor to:
- Change **Narrative Beat** text or times.
- Tweak **Camera FOV** or positions.
- Modify **Background Colors** or environment settings.

### Styling (Vanilla Export)
In the ZIP export, you can edit the `<style>` tag in `index.html` to customize the appearance of the narrative overlays, typography, and scrollbar behavior.

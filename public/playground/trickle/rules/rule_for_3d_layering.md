When working with 3D viewport and page content layering
- The #viewport element (containing 3D scene) must have z-index: 100 or higher to render in front of page content
- Navigation should have z-index: 200 to stay above the 3D viewport
- Noise layer should have z-index: 150 to stay above viewport but below navigation
- Page content (main, sections) should have z-index: 1 to stay behind 3D model
- Never lower the viewport z-index below 100 when model needs to be in front
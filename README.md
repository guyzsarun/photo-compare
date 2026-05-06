# Photo Compare

A web application for side-by-side photo comparison with interactive markers, per-image rotation and filter controls, and project save/load support.

## Features

- **Dual Image Upload**: Upload two images simultaneously via drag-and-drop or file picker; swap either image at any time
- **Side-by-Side View**: Reference and Comparison images displayed in aligned panels for easy visual comparison
- **Interactive Markers**: Click on either image to place colour-coded, labelled markers; markers are linked across both images by shared ID
- **Marker Management**: Edit marker labels and colours, remove individual markers, or clear all markers at once; click a marker in the side panel to center the canvas on it
- **Zoom & Pan**: Zoom in/out and drag to pan within each image canvas
- **Sync Pan / Zoom / Rotate**: Toggle synchronisation so that pan, zoom, and rotation changes apply to both images simultaneously
- **Rotation**: Per-image rotation slider (−180° to +180°) with a one-click reset
- **Brightness & Contrast**: Per-image brightness and contrast sliders with a one-click reset
- **Keyboard Shortcut**: Press `Space` to toggle marker-placement mode without leaving the keyboard
- **Save / Load Project**: Save the current session (images + markers + view state) to a JSON file and reload it later using the File System Access API

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) – build tool and dev server
- [Fabric.js](http://fabricjs.com/) – canvas rendering and interaction
- [Zustand](https://zustand-demo.pmnd.rs/) – state management
- [Tailwind CSS](https://tailwindcss.com/) – styling
- [react-dropzone](https://react-dropzone.js.org/) – drag-and-drop uploads

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Development

```bash
npm install
npm run dev
```

The app is served at `http://localhost:5173` by default.

### Production Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Docker

A multi-stage Dockerfile is included that builds the app and serves it with Nginx on port 80.

```bash
docker build -t photo-compare .
docker run -p 8080:80 photo-compare
```

The app is then accessible at `http://localhost:8080`.

## Use Cases

- **Before/After Comparisons**: Compare renovation, restoration, or editing work
- **Quality Control**: Identify differences in manufacturing or production
- **Medical Imaging**: Compare scans or x-rays over time
- **Design Reviews**: Compare design iterations or mockups
- **Photo Editing**: Evaluate editing changes and adjustments
- **Document Comparison**: Compare versions of documents or drawings

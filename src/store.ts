import { create } from 'zustand';
import { ImageState, Marker } from './types';

interface AppState {
  image1: ImageState;
  image2: ImageState;
  isAddingMarker: boolean;
  syncPanZoom: boolean; // Now syncs pan, zoom, and rotate
  projectFileHandle: any;
  theme: 'dark' | 'light';

  setImage1File: (file: File, dataUrl: string) => void;
  setImage2File: (file: File, dataUrl: string) => void;
  setProjectFileHandle: (handle: any) => void;

  toggleAddingMarker: () => void;
  toggleSyncPanZoom: () => void;
  toggleTheme: () => void;

  addMarker: (imageIndex: 1 | 2, marker: Marker) => void;
  removeMarker: (id: string) => void;
  updateMarkerLabel: (id: string, label: string) => void;
  updateMarkerColor: (id: string, color: string) => void;
  updateMarkerPosition: (imageIndex: 1 | 2, id: string, x: number, y: number) => void;

  updatePanZoom: (imageIndex: 1 | 2, zoom: number, panX: number, panY: number, rotation: number) => void;
  updateFilters: (imageIndex: 1 | 2, brightness: number, contrast: number) => void;
  resetPanZoom: () => void;
  clearImages: () => void;
  clearMarkers: () => void;
}

const initialImageState: ImageState = {
  file: null,
  dataUrl: null,
  markers: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  brightness: 100, // percentage for CSS filter
  contrast: 100, // percentage for CSS filter
};

export const useAppStore = create<AppState>((set) => ({
  image1: { ...initialImageState },
  image2: { ...initialImageState },
  isAddingMarker: false,
  syncPanZoom: false, // Default to independent, per user request
  projectFileHandle: null,
  theme: (document.documentElement.classList.contains('dark') ? 'dark' : 'light') as 'dark' | 'light',

  setImage1File: (file, dataUrl) => set((state) => ({ image1: { ...state.image1, file, dataUrl, markers: [] } })),
  setImage2File: (file, dataUrl) => set((state) => ({ image2: { ...state.image2, file, dataUrl, markers: [] } })),
  setProjectFileHandle: (handle) => set({ projectFileHandle: handle }),

  toggleAddingMarker: () => set((state) => ({ isAddingMarker: !state.isAddingMarker })),
  toggleSyncPanZoom: () => set((state) => ({ syncPanZoom: !state.syncPanZoom })),
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next);
    return { theme: next };
  }),

  addMarker: (imageIndex, marker) => set((state) => {
    if (imageIndex === 1) {
      return { image1: { ...state.image1, markers: [...state.image1.markers, marker] } };
    } else {
      return { image2: { ...state.image2, markers: [...state.image2.markers, marker] } };
    }
  }),

  removeMarker: (id) => set((state) => ({
    image1: { ...state.image1, markers: state.image1.markers.filter(m => m.id !== id) },
    image2: { ...state.image2, markers: state.image2.markers.filter(m => m.id !== id) },
  })),

  updateMarkerLabel: (id, label) => set((state) => ({
    image1: { ...state.image1, markers: state.image1.markers.map(m => m.id === id ? { ...m, label } : m) },
    image2: { ...state.image2, markers: state.image2.markers.map(m => m.id === id ? { ...m, label } : m) },
  })),

  updateMarkerColor: (id, color) => set((state) => ({
    image1: { ...state.image1, markers: state.image1.markers.map(m => m.id === id ? { ...m, color } : m) },
    image2: { ...state.image2, markers: state.image2.markers.map(m => m.id === id ? { ...m, color } : m) },
  })),

  updateMarkerPosition: (imageIndex, id, x, y) => set((state) => {
    if (imageIndex === 1) {
      return { image1: { ...state.image1, markers: state.image1.markers.map(m => m.id === id ? { ...m, x, y } : m) } };
    } else {
      return { image2: { ...state.image2, markers: state.image2.markers.map(m => m.id === id ? { ...m, x, y } : m) } };
    }
  }),

  updatePanZoom: (imageIndex, zoom, panX, panY, rotation) => set((state) => {
    if (state.syncPanZoom) {
      return {
        image1: { ...state.image1, zoom, panX, panY, rotation },
        image2: { ...state.image2, zoom, panX, panY, rotation },
      };
    } else {
      if (imageIndex === 1) {
        return { image1: { ...state.image1, zoom, panX, panY, rotation } };
      } else {
        return { image2: { ...state.image2, zoom, panX, panY, rotation } };
      }
    }
  }),

  updateFilters: (imageIndex, brightness, contrast) => set((state) => {
    if (imageIndex === 1) {
      return { image1: { ...state.image1, brightness, contrast } };
    } else {
      return { image2: { ...state.image2, brightness, contrast } };
    }
  }),

  resetPanZoom: () => set((state) => ({
    image1: { ...state.image1, zoom: 1, panX: 0, panY: 0, rotation: 0, brightness: 100, contrast: 100 },
    image2: { ...state.image2, zoom: 1, panX: 0, panY: 0, rotation: 0, brightness: 100, contrast: 100 },
  })),

  clearImages: () => set({ image1: { ...initialImageState }, image2: { ...initialImageState } }),

  clearMarkers: () => set((state) => ({
    image1: { ...state.image1, markers: [] },
    image2: { ...state.image2, markers: [] },
  })),
}));

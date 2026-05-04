import { create } from 'zustand';
import { ImageState, Marker } from './types';

interface AppState {
  image1: ImageState;
  image2: ImageState;
  isAddingMarker: boolean;
  syncPanZoom: boolean; // Now syncs pan, zoom, and rotate
  
  setImage1File: (file: File, dataUrl: string) => void;
  setImage2File: (file: File, dataUrl: string) => void;
  
  toggleAddingMarker: () => void;
  toggleSyncPanZoom: () => void;
  
  addMarker: (imageIndex: 1 | 2, marker: Marker) => void;
  removeMarker: (id: string) => void;
  updateMarkerLabel: (id: string, label: string) => void;
  updateMarkerColor: (id: string, color: string) => void;
  
  updatePanZoom: (imageIndex: 1 | 2, zoom: number, panX: number, panY: number, rotation: number) => void;
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
};

export const useAppStore = create<AppState>((set) => ({
  image1: { ...initialImageState },
  image2: { ...initialImageState },
  isAddingMarker: false,
  syncPanZoom: false, // Default to independent, per user request
  
  setImage1File: (file, dataUrl) => set((state) => ({ image1: { ...state.image1, file, dataUrl } })),
  setImage2File: (file, dataUrl) => set((state) => ({ image2: { ...state.image2, file, dataUrl } })),
  
  toggleAddingMarker: () => set((state) => ({ isAddingMarker: !state.isAddingMarker })),
  toggleSyncPanZoom: () => set((state) => ({ syncPanZoom: !state.syncPanZoom })),
  
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
  
  updatePanZoom: (imageIndex, zoom, panX, panY, rotation) => set((state) => {
    if (state.syncPanZoom) {
      return {
        image1: { ...state.image1, zoom, panX, panY, rotation },
        image2: { ...state.image2, zoom, panX, panY, rotation },
      };
    } else {
      return {
        [`image${imageIndex}`]: { ...state[`image${imageIndex}`], zoom, panX, panY, rotation },
      };
    }
  }),
  
  resetPanZoom: () => set((state) => ({
    image1: { ...state.image1, zoom: 1, panX: 0, panY: 0, rotation: 0 },
    image2: { ...state.image2, zoom: 1, panX: 0, panY: 0, rotation: 0 },
  })),
  
  clearImages: () => set({ image1: { ...initialImageState }, image2: { ...initialImageState } }),
  
  clearMarkers: () => set((state) => ({
    image1: { ...state.image1, markers: [] },
    image2: { ...state.image2, markers: [] },
  })),
}));

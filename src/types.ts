export interface Marker {
  id: string;
  x: number;
  y: number;
  label: string;
  color?: string;
}

export interface ImageState {
  file: File | null;
  dataUrl: string | null;
  markers: Marker[];
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  brightness: number;
  contrast: number;
  fitScale: number; // scale applied to fit the image into the canvas viewport
}

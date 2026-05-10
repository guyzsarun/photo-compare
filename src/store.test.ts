import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './store';

describe('useAppStore', () => {
  beforeEach(() => {
    const state = useAppStore.getState();
    if (state.isAddingMarker) state.toggleAddingMarker();
    if (state.syncPanZoom) state.toggleSyncPanZoom();
    state.clearImages();
    state.clearMarkers();
  });

  describe('initial state', () => {
    it('should have both images as null', () => {
      const state = useAppStore.getState();
      expect(state.image1.dataUrl).toBeNull();
      expect(state.image2.dataUrl).toBeNull();
      expect(state.image1.file).toBeNull();
      expect(state.image2.file).toBeNull();
    });

    it('should have isAddingMarker as false', () => {
      const state = useAppStore.getState();
      expect(state.isAddingMarker).toBe(false);
    });

    it('should have syncPanZoom as false', () => {
      const state = useAppStore.getState();
      expect(state.syncPanZoom).toBe(false);
    });

    it('should have default zoom as 1', () => {
      const state = useAppStore.getState();
      expect(state.image1.zoom).toBe(1);
      expect(state.image2.zoom).toBe(1);
    });

    it('should have default pan as 0', () => {
      const state = useAppStore.getState();
      expect(state.image1.panX).toBe(0);
      expect(state.image1.panY).toBe(0);
      expect(state.image2.panX).toBe(0);
      expect(state.image2.panY).toBe(0);
    });

    it('should have default rotation as 0', () => {
      const state = useAppStore.getState();
      expect(state.image1.rotation).toBe(0);
      expect(state.image2.rotation).toBe(0);
    });

    it('should have default brightness and contrast as 100', () => {
      const state = useAppStore.getState();
      expect(state.image1.brightness).toBe(100);
      expect(state.image1.contrast).toBe(100);
      expect(state.image2.brightness).toBe(100);
      expect(state.image2.contrast).toBe(100);
    });
  });

  describe('setImage1File', () => {
    it('should set image1 dataUrl and file', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const dataUrl = 'data:image/jpeg;base64,test';

      useAppStore.getState().setImage1File(mockFile, dataUrl);

      const state = useAppStore.getState();
      expect(state.image1.file).toBe(mockFile);
      expect(state.image1.dataUrl).toBe(dataUrl);
    });

    it('should clear markers when setting new image1', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      useAppStore.getState().setImage1File(mockFile, 'data:image/jpeg;base64,test');
      useAppStore.getState().addMarker(1, { id: '1', x: 10, y: 10, label: 'Test' });

      useAppStore.getState().setImage1File(mockFile, 'data:image/jpeg;base64,test2');

      const state = useAppStore.getState();
      expect(state.image1.markers).toHaveLength(0);
    });
  });

  describe('setImage2File', () => {
    it('should set image2 dataUrl and file', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const dataUrl = 'data:image/jpeg;base64,test';

      useAppStore.getState().setImage2File(mockFile, dataUrl);

      const state = useAppStore.getState();
      expect(state.image2.file).toBe(mockFile);
      expect(state.image2.dataUrl).toBe(dataUrl);
    });

    it('should clear markers when setting new image2', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      useAppStore.getState().setImage2File(mockFile, 'data:image/jpeg;base64,test');
      useAppStore.getState().addMarker(2, { id: '1', x: 10, y: 10, label: 'Test' });

      useAppStore.getState().setImage2File(mockFile, 'data:image/jpeg;base64,test2');

      const state = useAppStore.getState();
      expect(state.image2.markers).toHaveLength(0);
    });
  });

  describe('toggleAddingMarker', () => {
    it('should toggle isAddingMarker from false to true', () => {
      useAppStore.getState().toggleAddingMarker();
      expect(useAppStore.getState().isAddingMarker).toBe(true);
    });

    it('should toggle isAddingMarker from true to false', () => {
      useAppStore.getState().toggleAddingMarker();
      useAppStore.getState().toggleAddingMarker();
      expect(useAppStore.getState().isAddingMarker).toBe(false);
    });
  });

  describe('toggleSyncPanZoom', () => {
    it('should toggle syncPanZoom from false to true', () => {
      useAppStore.getState().toggleSyncPanZoom();
      expect(useAppStore.getState().syncPanZoom).toBe(true);
    });

    it('should toggle syncPanZoom from true to false', () => {
      useAppStore.getState().toggleSyncPanZoom();
      useAppStore.getState().toggleSyncPanZoom();
      expect(useAppStore.getState().syncPanZoom).toBe(false);
    });
  });

  describe('addMarker', () => {
    it('should add marker to image1', () => {
      const marker = { id: 'm1', x: 100, y: 200, label: 'Test Marker', color: '#ff0000' };
      useAppStore.getState().addMarker(1, marker);

      const state = useAppStore.getState();
      expect(state.image1.markers).toHaveLength(1);
      expect(state.image1.markers[0]).toEqual(marker);
    });

    it('should add marker to image2', () => {
      const marker = { id: 'm2', x: 150, y: 250, label: 'Test Marker 2' };
      useAppStore.getState().addMarker(2, marker);

      const state = useAppStore.getState();
      expect(state.image2.markers).toHaveLength(1);
      expect(state.image2.markers[0]).toEqual(marker);
    });

    it('should add to specified image only', () => {
      const marker = { id: 'm3', x: 50, y: 50, label: 'Test' };
      useAppStore.getState().addMarker(1, marker);

      const state = useAppStore.getState();
      expect(state.image1.markers).toHaveLength(1);
      expect(state.image2.markers).toHaveLength(0);
    });
  });

  describe('removeMarker', () => {
    it('should remove marker from both images', () => {
      useAppStore.getState().addMarker(1, { id: 'm1', x: 10, y: 10, label: 'Test' });
      useAppStore.getState().removeMarker('m1');

      const state = useAppStore.getState();
      expect(state.image1.markers).toHaveLength(0);
      expect(state.image2.markers).toHaveLength(0);
    });

    it('should only remove specified marker', () => {
      useAppStore.getState().addMarker(1, { id: 'm1', x: 10, y: 10, label: 'Test1' });
      useAppStore.getState().addMarker(2, { id: 'm2', x: 20, y: 20, label: 'Test2' });
      useAppStore.getState().removeMarker('m1');

      const state = useAppStore.getState();
      expect(state.image1.markers).toHaveLength(0);
      expect(state.image2.markers).toHaveLength(1);
    });
  });

  describe('updateMarkerLabel', () => {
    it('should update label on image1', () => {
      useAppStore.getState().addMarker(1, { id: 'm1', x: 10, y: 10, label: 'Old Label' });
      useAppStore.getState().updateMarkerLabel('m1', 'New Label');

      const state = useAppStore.getState();
      expect(state.image1.markers[0].label).toBe('New Label');
    });
  });

  describe('updateMarkerColor', () => {
    it('should update color on image1', () => {
      useAppStore.getState().addMarker(1, { id: 'm1', x: 10, y: 10, label: 'Test' });
      useAppStore.getState().updateMarkerColor('m1', '#00ff00');

      const state = useAppStore.getState();
      expect(state.image1.markers[0].color).toBe('#00ff00');
    });
  });

  describe('updateMarkerPosition', () => {
    it('should update position on specified image', () => {
      useAppStore.getState().addMarker(1, { id: 'm1', x: 10, y: 10, label: 'Test' });
      useAppStore.getState().updateMarkerPosition(1, 'm1', 50, 60);

      const state = useAppStore.getState();
      expect(state.image1.markers[0].x).toBe(50);
      expect(state.image1.markers[0].y).toBe(60);
    });
  });

  describe('updatePanZoom', () => {
    it('should update only specified image when sync is off', () => {
      useAppStore.getState().updatePanZoom(1, 2.5, 100, 50, 45);

      const state = useAppStore.getState();
      expect(state.image1.zoom).toBe(2.5);
      expect(state.image1.panX).toBe(100);
      expect(state.image1.panY).toBe(50);
      expect(state.image1.rotation).toBe(45);
      expect(state.image2.zoom).toBe(1);
      expect(state.image2.panX).toBe(0);
    });

    it('should update both images when sync is on', () => {
      useAppStore.getState().toggleSyncPanZoom();
      useAppStore.getState().updatePanZoom(1, 1.5, 20, 30, 90);

      const state = useAppStore.getState();
      expect(state.image1.zoom).toBe(1.5);
      expect(state.image1.panX).toBe(20);
      expect(state.image1.panY).toBe(30);
      expect(state.image1.rotation).toBe(90);
      expect(state.image2.zoom).toBe(1.5);
      expect(state.image2.panX).toBe(20);
      expect(state.image2.panY).toBe(30);
      expect(state.image2.rotation).toBe(90);
    });
  });

  describe('updateFilters', () => {
    it('should update brightness and contrast for image1', () => {
      useAppStore.getState().updateFilters(1, 150, 80);

      const state = useAppStore.getState();
      expect(state.image1.brightness).toBe(150);
      expect(state.image1.contrast).toBe(80);
    });

    it('should update brightness and contrast for image2', () => {
      useAppStore.getState().updateFilters(2, 120, 110);

      const state = useAppStore.getState();
      expect(state.image2.brightness).toBe(120);
      expect(state.image2.contrast).toBe(110);
    });
  });

  describe('resetPanZoom', () => {
    it('should reset all pan/zoom/rotation/filters for both images', () => {
      useAppStore.getState().updatePanZoom(1, 3, 100, 50, 45);
      useAppStore.getState().updateFilters(1, 150, 80);
      useAppStore.getState().updatePanZoom(2, 2, 200, 150, 90);
      useAppStore.getState().updateFilters(2, 120, 110);

      useAppStore.getState().resetPanZoom();

      const state = useAppStore.getState();
      expect(state.image1.zoom).toBe(1);
      expect(state.image1.panX).toBe(0);
      expect(state.image1.panY).toBe(0);
      expect(state.image1.rotation).toBe(0);
      expect(state.image1.brightness).toBe(100);
      expect(state.image1.contrast).toBe(100);
      expect(state.image2.zoom).toBe(1);
      expect(state.image2.panX).toBe(0);
      expect(state.image2.panY).toBe(0);
      expect(state.image2.rotation).toBe(0);
      expect(state.image2.brightness).toBe(100);
      expect(state.image2.contrast).toBe(100);
    });
  });

  describe('clearImages', () => {
    it('should clear all images and reset state', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      useAppStore.getState().setImage1File(mockFile, 'data:image/jpeg;base64,test');
      useAppStore.getState().setImage2File(mockFile, 'data:image/jpeg;base64,test');

      useAppStore.getState().clearImages();

      const state = useAppStore.getState();
      expect(state.image1.dataUrl).toBeNull();
      expect(state.image1.file).toBeNull();
      expect(state.image2.dataUrl).toBeNull();
      expect(state.image2.file).toBeNull();
    });
  });

  describe('clearMarkers', () => {
    it('should clear all markers from both images', () => {
      useAppStore.getState().addMarker(1, { id: 'm1', x: 10, y: 10, label: 'Test1' });
      useAppStore.getState().addMarker(2, { id: 'm2', x: 20, y: 20, label: 'Test2' });

      useAppStore.getState().clearMarkers();

      const state = useAppStore.getState();
      expect(state.image1.markers).toHaveLength(0);
      expect(state.image2.markers).toHaveLength(0);
    });
  });
});
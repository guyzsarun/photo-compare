import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useAppStore } from '../store';
import { Marker } from '../types';

interface ImageCanvasProps {
  imageIndex: 1 | 2;
  width: number;
  height: number;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({ imageIndex, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const imageObjRef = useRef<fabric.Image | null>(null);
  const [imageLoadedKey, setImageLoadedKey] = useState(0);

  const state = useAppStore(s => imageIndex === 1 ? s.image1 : s.image2);
  const isAddingMarker = useAppStore(s => s.isAddingMarker);

  const safeRotation = state.rotation || 0;

  // Initialize canvas
  useEffect(() => {
    if (!containerRef.current) return;

    // Create canvas dynamically to avoid React DOM reconciliation conflicts with Fabric
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    containerRef.current.appendChild(canvasEl);

    const canvas = new fabric.Canvas(canvasEl, {
      width,
      height,
      selection: false,
      renderOnAddRemove: true,
      backgroundColor: '#0f172a', // slate-900
    });

    fabricRef.current = canvas;

    canvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      const appState = useAppStore.getState();
      const currentState = imageIndex === 1 ? appState.image1 : appState.image2;
      const currentRot = currentState.rotation || 0;

      if (appState.isAddingMarker && imageObjRef.current) {
        const pointer = canvas.getPointer(opt.e);
        const img = imageObjRef.current;

        // img.left and img.top are the center of the image on the canvas
        const imgCenterX = img.left || 0;
        const imgCenterY = img.top || 0;

        // Translate pointer to be relative to the center of the image
        const px = pointer.x - imgCenterX;
        const py = pointer.y - imgCenterY;

        // Un-rotate the coordinates back to 0 degrees to find the original spot
        const rad = -currentRot * (Math.PI / 180);
        const rx = px * Math.cos(rad) - py * Math.sin(rad);
        const ry = px * Math.sin(rad) + py * Math.cos(rad);

        // Scale down to original image resolution and translate to top-left origin
        const unscaledX = rx / (img.scaleX || 1);
        const unscaledY = ry / (img.scaleY || 1);

        const originalWidth = img.width || 0;
        const originalHeight = img.height || 0;

        const x = unscaledX + originalWidth / 2;
        const y = unscaledY + originalHeight / 2;

        // Check if click is inside image bounds
        if (x >= 0 && x <= originalWidth && y >= 0 && y <= originalHeight) {
          const allMarkers = [...appState.image1.markers, ...appState.image2.markers];
          const nextNum = allMarkers.length + 1;

          const newMarker: Marker = {
            id: Date.now().toString(),
            x,
            y,
            label: `M${nextNum}`
          };
          appState.addMarker(imageIndex, newMarker);
        }
      } else if (evt.altKey || opt.e.shiftKey || opt.e.button === 0) { // Allow drag
        if (!appState.isAddingMarker) {
          canvas.isDragging = true;
          canvas.selection = false;
          canvas.lastPosX = evt.clientX;
          canvas.lastPosY = evt.clientY;
        }
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (canvas.isDragging) {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform!;
        vpt[4] += e.clientX - canvas.lastPosX!;
        vpt[5] += e.clientY - canvas.lastPosY!;
        canvas.requestRenderAll();
        canvas.lastPosX = e.clientX;
        canvas.lastPosY = e.clientY;

        const st = useAppStore.getState();
        st.updatePanZoom(imageIndex, canvas.getZoom(), vpt[4], vpt[5], imageIndex === 1 ? (st.image1.rotation || 0) : (st.image2.rotation || 0));
      }
    });

    canvas.on('mouse:up', () => {
      if (!canvas.viewportTransform) return;
      canvas.setViewportTransform(canvas.viewportTransform);
      canvas.isDragging = false;
      canvas.selection = true;
    });

    canvas.on('mouse:wheel', (opt) => {
      const delta = (opt.e as WheelEvent).deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();

      const vpt = canvas.viewportTransform!;
      const st = useAppStore.getState();
      st.updatePanZoom(imageIndex, canvas.getZoom(), vpt[4], vpt[5], imageIndex === 1 ? (st.image1.rotation || 0) : (st.image2.rotation || 0));
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [imageIndex]); // Only run once on mount

  // Handle Resize
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    canvas.setWidth(width);
    canvas.setHeight(height);

    // Recenter image if loaded
    if (imageObjRef.current) {
      const img = imageObjRef.current;
      const scale = Math.min(width / img.width!, height / img.height!);
      img.set({
        left: width / 2,
        top: height / 2,
        scaleX: scale,
        scaleY: scale,
      });
      canvas.requestRenderAll();
    }
  }, [width, height]);

  // Load image natively to ensure it loads before passing to Fabric
  useEffect(() => {
    if (!fabricRef.current || !state.dataUrl) return;

    const canvas = fabricRef.current;

    const imgElement = new Image();
    imgElement.onload = () => {
      if (!fabricRef.current) return; // Unmounted during load

      const img = new fabric.Image(imgElement);
      if (imageObjRef.current) {
        canvas.remove(imageObjRef.current);
      }

      // Center and scale image
      const scale = Math.min(width / img.width!, height / img.height!);
      img.set({
        originX: 'center',
        originY: 'center',
        left: width / 2,
        top: height / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        angle: safeRotation, // Set initial rotation from state
      });

      canvas.add(img);
      canvas.sendToBack(img);
      imageObjRef.current = img;

      canvas.requestRenderAll();
      setImageLoadedKey(k => k + 1); // Trigger marker rendering
    };
    imgElement.src = state.dataUrl;
  }, [state.dataUrl]);

  // Sync Pan & Zoom & Rotation from store
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const vpt = canvas.viewportTransform!;
    let changed = false;

    if (vpt[4] !== state.panX || vpt[5] !== state.panY || canvas.getZoom() !== state.zoom) {
      canvas.setZoom(state.zoom);
      vpt[4] = state.panX;
      vpt[5] = state.panY;
      changed = true;
    }

    if (imageObjRef.current && imageObjRef.current.angle !== safeRotation) {
      // Rotation now perfectly pivots around center because originX/Y are 'center'
      imageObjRef.current.set({
        angle: safeRotation
      });
      changed = true;
    }

    if (changed) {
      canvas.requestRenderAll();
    }
  }, [state.panX, state.panY, state.zoom, safeRotation, imageLoadedKey]);

  // Render Markers
  useEffect(() => {
    if (!fabricRef.current || !imageObjRef.current) return;
    const canvas = fabricRef.current;
    const img = imageObjRef.current;

    // Remove existing markers
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.name === 'marker') {
        canvas.remove(obj);
      }
    });

    // Add new markers
    (state.markers || []).forEach(marker => {
      const imgCenterX = img.left || 0;
      const imgCenterY = img.top || 0;

      // marker.x and marker.y are from top-left unscaled image. 
      // Convert to center-relative coordinates
      const cx = marker.x - (img.width || 0) / 2;
      const cy = marker.y - (img.height || 0) / 2;

      // Apply scaling
      const px = cx * (img.scaleX || 1);
      const py = cy * (img.scaleY || 1);

      // Apply rotation
      const rad = safeRotation * (Math.PI / 180);
      const rx = px * Math.cos(rad) - py * Math.sin(rad);
      const ry = px * Math.sin(rad) + py * Math.cos(rad);

      // Absolute position on canvas
      const absoluteX = imgCenterX + rx;
      const absoluteY = imgCenterY + ry;

      const markerColor = marker.color || '#ef4444';
      const circle = new fabric.Circle({
        radius: 0.3,
        fill: markerColor,
        stroke: '#ffffff',
        strokeWidth: 0.05,
        left: absoluteX,
        top: absoluteY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        name: 'marker',
      });

      canvas.add(circle);
    });

    canvas.requestRenderAll();
  }, [state.markers, state.dataUrl, safeRotation, imageLoadedKey]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded border border-slate-700 overflow-hidden ${isAddingMarker ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
    />
  );
};

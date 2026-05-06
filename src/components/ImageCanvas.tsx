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

      if (evt.shiftKey) { // Rotate
        (canvas as any).isRotating = true;
        canvas.selection = false;
        
        const rect = canvas.getElement().getBoundingClientRect();
        const mouseX = evt.clientX - rect.left;
        const mouseY = evt.clientY - rect.top;
        
        const st = useAppStore.getState();
        const currentState = imageIndex === 1 ? st.image1 : st.image2;
        (canvas as any).initialRotation = currentState.rotation || 0;
        
        const vpt = canvas.viewportTransform!;
        const cx = canvas.getWidth() / 2;
        const cy = canvas.getHeight() / 2;
        
        const pivotX = cx * canvas.getZoom() + vpt[4];
        const pivotY = cy * canvas.getZoom() + vpt[5];
        
        (canvas as any).initialAngle = Math.atan2(mouseY - pivotY, mouseX - pivotX);
        
        return;
      }

      if (appState.isAddingMarker && imageObjRef.current) {
        if (opt.target && opt.target.name === 'marker') return;
        
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
      } else if (evt.altKey || opt.e.button === 0) { // Allow drag
        if (!appState.isAddingMarker) {
          if (opt.target && opt.target.name === 'marker') return;

          (canvas as any).isDragging = true;
          canvas.selection = false;
          (canvas as any).lastPosX = evt.clientX;
          (canvas as any).lastPosY = evt.clientY;
        }
      }
    });

    canvas.on('mouse:move', (opt) => {
      if ((canvas as any).isRotating) {
        const e = opt.e as MouseEvent;
        const rect = canvas.getElement().getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const vpt = canvas.viewportTransform!;
        const cx = canvas.getWidth() / 2;
        const cy = canvas.getHeight() / 2;
        
        const pivotX = cx * canvas.getZoom() + vpt[4];
        const pivotY = cy * canvas.getZoom() + vpt[5];
        
        const currentAngle = Math.atan2(mouseY - pivotY, mouseX - pivotX);
        let deltaTheta = (currentAngle - (canvas as any).initialAngle) * (180 / Math.PI);
        
        if (deltaTheta > 180) deltaTheta -= 360;
        if (deltaTheta < -180) deltaTheta += 360;
        
        let newRot = (canvas as any).initialRotation + deltaTheta;
        if (newRot > 180) newRot -= 360;
        if (newRot < -180) newRot += 360;
        
        const st = useAppStore.getState();
        st.updatePanZoom(imageIndex, canvas.getZoom(), vpt[4], vpt[5], newRot);
        
        // Update visually immediately for smoothness
        if (imageObjRef.current) {
          imageObjRef.current.set({ angle: newRot });
          canvas.requestRenderAll();
        }
      } else if ((canvas as any).isDragging) {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform!;
        vpt[4] += e.clientX - (canvas as any).lastPosX;
        vpt[5] += e.clientY - (canvas as any).lastPosY;
        canvas.requestRenderAll();
        (canvas as any).lastPosX = e.clientX;
        (canvas as any).lastPosY = e.clientY;

        const st = useAppStore.getState();
        st.updatePanZoom(imageIndex, canvas.getZoom(), vpt[4], vpt[5], imageIndex === 1 ? (st.image1.rotation || 0) : (st.image2.rotation || 0));
      }
    });

    canvas.on('mouse:up', () => {
      if (!canvas.viewportTransform) return;
      canvas.setViewportTransform(canvas.viewportTransform);
      (canvas as any).isDragging = false;
      (canvas as any).isRotating = false;
      canvas.selection = true;
    });

    canvas.on('mouse:wheel', (opt) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const st = useAppStore.getState();
      const currentState = imageIndex === 1 ? st.image1 : st.image2;

      if (e.shiftKey) {
        // Rotate around mouse
        const delta = e.deltaY;
        const deltaTheta = delta * 0.1; // 0.1 degrees per scroll unit
        
        let newRot = (currentState.rotation || 0) + deltaTheta;
        if (newRot > 180) newRot -= 360;
        if (newRot < -180) newRot += 360;
        
        const vpt = canvas.viewportTransform!;
        const cx = canvas.getWidth() / 2;
        const cy = canvas.getHeight() / 2;
        const pivotX = cx * canvas.getZoom() + vpt[4];
        const pivotY = cy * canvas.getZoom() + vpt[5];
        
        const rect = canvas.getElement().getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const Vx = mouseX - pivotX;
        const Vy = mouseY - pivotY;
        
        const rad = deltaTheta * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        
        const VprimeX = Vx * cos - Vy * sin;
        const VprimeY = Vx * sin + Vy * cos;
        
        const newPanX = vpt[4] + (Vx - VprimeX);
        const newPanY = vpt[5] + (Vy - VprimeY);
        
        st.updatePanZoom(imageIndex, canvas.getZoom(), newPanX, newPanY, newRot);
      } else {
        // Zoom around mouse
        const delta = e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.1) zoom = 0.1;

        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        
        const vpt = canvas.viewportTransform!;
        st.updatePanZoom(imageIndex, canvas.getZoom(), vpt[4], vpt[5], currentState.rotation || 0);
      }
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
      const newVpt = [...canvas.viewportTransform!];
      newVpt[0] = state.zoom;
      newVpt[3] = state.zoom;
      newVpt[4] = state.panX;
      newVpt[5] = state.panY;
      canvas.setViewportTransform(newVpt);
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
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'move',
        moveCursor: 'move',
        name: 'marker',
      });
      
      circle.on('modified', (e) => {
        const target = e.target;
        if (!target) return;
        
        const rx = target.left! - imgCenterX;
        const ry = target.top! - imgCenterY;
        
        const un_rad = -safeRotation * (Math.PI / 180);
        const px = rx * Math.cos(un_rad) - ry * Math.sin(un_rad);
        const py = rx * Math.sin(un_rad) + ry * Math.cos(un_rad);
        
        const cx = px / (img.scaleX || 1);
        const cy = py / (img.scaleY || 1);
        
        const x = cx + (img.width || 0) / 2;
        const y = cy + (img.height || 0) / 2;
        
        useAppStore.getState().updateMarkerPosition(imageIndex, marker.id, x, y);
      });

      canvas.add(circle);
    });

    canvas.requestRenderAll();
  }, [state.markers, state.dataUrl, safeRotation, imageLoadedKey]);

  // Handle snapping to marker
  useEffect(() => {
    const handleCenterMarker = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      const markerId = customEvent.detail.id;
      
      const st = useAppStore.getState();
      const currentState = imageIndex === 1 ? st.image1 : st.image2;
      const marker = currentState.markers.find(m => m.id === markerId);
      
      if (marker && fabricRef.current && imageObjRef.current) {
        const canvas = fabricRef.current;
        const img = imageObjRef.current;
        
        const imgCenterX = img.left || 0;
        const imgCenterY = img.top || 0;

        const cx = marker.x - (img.width || 0) / 2;
        const cy = marker.y - (img.height || 0) / 2;

        const px = cx * (img.scaleX || 1);
        const py = cy * (img.scaleY || 1);

        const rad = safeRotation * (Math.PI / 180);
        const rx = px * Math.cos(rad) - py * Math.sin(rad);
        const ry = px * Math.sin(rad) + py * Math.cos(rad);

        const absoluteX = imgCenterX + rx;
        const absoluteY = imgCenterY + ry;

        const currentZoom = canvas.getZoom();
        const targetZoom = Math.max(currentZoom, 4); // Zoom to 4x, or keep current if higher
        
        const newPanX = (width / 2) - absoluteX * targetZoom;
        const newPanY = (height / 2) - absoluteY * targetZoom;

        console.log(`[ImageCanvas ${imageIndex}] center-marker event!`, {
          markerId,
          marker: { x: marker.x, y: marker.y },
          absolute: { absoluteX, absoluteY },
          canvasDimensions: { width, height },
          zoom: targetZoom,
          newPan: { newPanX, newPanY },
          currentPan: { panX: canvas.viewportTransform![4], panY: canvas.viewportTransform![5] }
        });

        st.updatePanZoom(imageIndex, targetZoom, newPanX, newPanY, safeRotation);
      } else {
        console.log(`[ImageCanvas ${imageIndex}] marker not found or refs missing`, { markerId, hasMarker: !!marker, hasFabric: !!fabricRef.current, hasImg: !!imageObjRef.current });
      }
    };

    window.addEventListener('center-marker', handleCenterMarker);
    return () => {
      window.removeEventListener('center-marker', handleCenterMarker);
    };
  }, [imageIndex, width, height, safeRotation]);

  return (
    <div
      ref={containerRef}
      style={{ filter: `brightness(${state.brightness ?? 100}%) contrast(${state.contrast ?? 100}%)` }}
      className={`relative rounded border border-slate-700 overflow-hidden ${isAddingMarker ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
    />
  );
};

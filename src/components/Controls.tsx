import React from 'react';
import { useAppStore } from '../store';
import { MapPin, Link2, ZoomIn, ZoomOut, Maximize, Trash2, Download, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import clsx from 'clsx';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export const Controls: React.FC = () => {
  const {
    isAddingMarker, toggleAddingMarker,
    syncPanZoom, toggleSyncPanZoom,
    resetPanZoom, clearImages, clearMarkers,
    image1, image2, projectFileHandle, setProjectFileHandle,
    markerSize1, markerSize2,
  } = useAppStore();

  const handleZoom = (direction: 'in' | 'out') => {
    const store = useAppStore.getState();
    const factor = direction === 'in' ? 1.2 : 0.8;
    const newZoom1 = store.image1.zoom * factor;
    const newZoom2 = store.image2.zoom * factor;
    
    if (store.syncPanZoom) {
      store.updatePanZoom(1, newZoom1, store.image1.panX, store.image1.panY, store.image1.rotation);
    } else {
      store.updatePanZoom(1, newZoom1, store.image1.panX, store.image1.panY, store.image1.rotation);
      store.updatePanZoom(2, newZoom2, store.image2.panX, store.image2.panY, store.image2.rotation);
    }
  };

  const handleSave = async () => {
    const data = {
      image1: { ...image1, file: null, brightness: undefined, contrast: undefined },
      image2: { ...image2, file: null, brightness: undefined, contrast: undefined }
    };
    const json = JSON.stringify(data);

    try {
      let handle = projectFileHandle;
      if (!handle) {
        // @ts-ignore
        handle = await window.showSaveFilePicker({
          suggestedName: 'photo-compare-project.json',
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
        });
        setProjectFileHandle(handle);
      }

      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to save project:', err);
        alert('Failed to save project file.');
      }
    }
  };

  const handleLoad = async () => {
    try {
      // @ts-ignore
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        }],
      });
      
      setProjectFileHandle(handle);
      const file = await handle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.image1) {
        useAppStore.setState(state => ({
          image1: { ...state.image1, ...data.image1, rotation: data.image1.rotation || 0, markers: data.image1.markers || [] }
        }));
      }
      if (data.image2) {
        useAppStore.setState(state => ({
          image2: { ...state.image2, ...data.image2, rotation: data.image2.rotation || 0, markers: data.image2.markers || [] }
        }));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Failed to load project file", err);
        alert("Invalid project file");
      }
    }
  };

  const handleExportJPG = async () => {
    if (!image1.dataUrl && !image2.dataUrl) {
      alert("No images are loaded to export.");
      return;
    }

    try {
      let img1: HTMLImageElement | null = null;
      let img2: HTMLImageElement | null = null;

      if (image1.dataUrl) {
        img1 = await loadImage(image1.dataUrl);
      }
      if (image2.dataUrl) {
        img2 = await loadImage(image2.dataUrl);
      }

      let w1 = 0, h1 = 0;
      let w2 = 0, h2 = 0;
      
      let rot1Width = 0, rot1Height = 0;
      let rot2Width = 0, rot2Height = 0;

      const rad1 = ((image1.rotation || 0) * Math.PI) / 180;
      const rad2 = ((image2.rotation || 0) * Math.PI) / 180;

      if (img1) {
        const absCos1 = Math.abs(Math.cos(rad1));
        const absSin1 = Math.abs(Math.sin(rad1));
        rot1Width = Math.round(img1.width * absCos1 + img1.height * absSin1);
        rot1Height = Math.round(img1.width * absSin1 + img1.height * absCos1);
        w1 = rot1Width;
        h1 = rot1Height;
      }

      if (img2) {
        const absCos2 = Math.abs(Math.cos(rad2));
        const absSin2 = Math.abs(Math.sin(rad2));
        rot2Width = Math.round(img2.width * absCos2 + img2.height * absSin2);
        rot2Height = Math.round(img2.width * absSin2 + img2.height * absCos2);
        w2 = rot2Width;
        h2 = rot2Height;
      }

      const exportWidth = w1 + w2;
      const exportHeight = Math.max(h1, h2);

      if (exportWidth === 0 || exportHeight === 0) {
        alert("Failed to determine dimensions for the export image.");
        return;
      }

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportWidth;
      exportCanvas.height = exportHeight;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) {
        alert("Failed to create 2D context for export.");
        return;
      }

      // Fill background color
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim() || '#f5f5f4';
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      // Y offset to vertically center the frame in the export canvas
      const offsetY1 = Math.max(0, (exportHeight - h1) / 2);
      const offsetY2 = Math.max(0, (exportHeight - h2) / 2);

      // Draw Reference Canvas (image1)
      if (img1) {
        ctx.save();
        ctx.translate(rot1Width / 2, offsetY1 + rot1Height / 2);
        ctx.rotate(rad1);
        ctx.filter = `brightness(${image1.brightness ?? 100}%) contrast(${image1.contrast ?? 100}%)`;
        ctx.drawImage(img1, -img1.width / 2, -img1.height / 2, img1.width, img1.height);
        ctx.restore();

        // Draw markers for image 1 (unfiltered)
        ctx.save();
        ctx.translate(rot1Width / 2, offsetY1 + rot1Height / 2);
        ctx.rotate(rad1);
        ctx.filter = 'none';

        const radius = (0.3 / (image1.fitScale || 1)) * markerSize1;
        (image1.markers || []).forEach(marker => {
          const mx = marker.x - img1.width / 2;
          const my = marker.y - img1.height / 2;
          const color = marker.color || '#ef4444';

          ctx.beginPath();
          ctx.arc(mx, my, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.lineWidth = radius / 6;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        });
        ctx.restore();
      }

      // Draw Comparison Canvas (image2)
      const offsetX2 = w1; // rot1Width if img1 is drawn, 0 otherwise
      if (img2) {
        ctx.save();
        ctx.translate(offsetX2 + rot2Width / 2, offsetY2 + rot2Height / 2);
        ctx.rotate(rad2);
        ctx.filter = `brightness(${image2.brightness ?? 100}%) contrast(${image2.contrast ?? 100}%)`;
        ctx.drawImage(img2, -img2.width / 2, -img2.height / 2, img2.width, img2.height);
        ctx.restore();

        // Draw markers for image 2 (unfiltered)
        ctx.save();
        ctx.translate(offsetX2 + rot2Width / 2, offsetY2 + rot2Height / 2);
        ctx.rotate(rad2);
        ctx.filter = 'none';

        const radius = (0.3 / (image2.fitScale || 1)) * markerSize2;
        (image2.markers || []).forEach(marker => {
          const mx = marker.x - img2.width / 2;
          const my = marker.y - img2.height / 2;
          const color = marker.color || '#ef4444';

          ctx.beginPath();
          ctx.arc(mx, my, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.lineWidth = radius / 6;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        });
        ctx.restore();
      }

      const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.9);
      
      let filename = 'photo-compare-export.jpg';
      if (image1.file && image2.file) {
        const name1 = image1.file.name.substring(0, image1.file.name.lastIndexOf('.')) || image1.file.name;
        const name2 = image2.file.name.substring(0, image2.file.name.lastIndexOf('.')) || image2.file.name;
        filename = `compare_${name1}_vs_${name2}.jpg`;
      } else if (image1.file) {
        const name1 = image1.file.name.substring(0, image1.file.name.lastIndexOf('.')) || image1.file.name;
        filename = `compare_${name1}.jpg`;
      } else if (image2.file) {
        const name2 = image2.file.name.substring(0, image2.file.name.lastIndexOf('.')) || image2.file.name;
        filename = `compare_${name2}.jpg`;
      }

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export JPEG:', err);
      alert('Failed to export JPEG image.');
    }
  };

  // Export exactly what the user currently sees: the two on-screen canvases
  // (pan/zoom/rotation already baked into their pixels by Fabric) composited
  // side-by-side, with each panel's brightness/contrast CSS filter re-applied.
  const handleExportCurrentView = () => {
    if (!image1.dataUrl && !image2.dataUrl) {
      alert("No images are loaded to export.");
      return;
    }

    try {
      const getCanvas = (index: 1 | 2): HTMLCanvasElement | null =>
        document.querySelector<HTMLCanvasElement>(`canvas[data-image-index="${index}"]`);

      const canvas1 = image1.dataUrl ? getCanvas(1) : null;
      const canvas2 = image2.dataUrl ? getCanvas(2) : null;

      if (!canvas1 && !canvas2) {
        alert("Could not find the on-screen view to export.");
        return;
      }

      const w1 = canvas1?.width ?? 0;
      const h1 = canvas1?.height ?? 0;
      const w2 = canvas2?.width ?? 0;
      const h2 = canvas2?.height ?? 0;

      const exportWidth = w1 + w2;
      const exportHeight = Math.max(h1, h2);

      if (exportWidth === 0 || exportHeight === 0) {
        alert("Failed to determine dimensions for the export image.");
        return;
      }

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportWidth;
      exportCanvas.height = exportHeight;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) {
        alert("Failed to create 2D context for export.");
        return;
      }

      const bg = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim() || '#f5f5f4';
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      // Draw Reference view (image1), vertically centered, filter baked in
      if (canvas1) {
        ctx.save();
        ctx.filter = `brightness(${image1.brightness ?? 100}%) contrast(${image1.contrast ?? 100}%)`;
        ctx.drawImage(canvas1, 0, Math.max(0, (exportHeight - h1) / 2));
        ctx.restore();
      }

      // Draw Comparison view (image2) to the right of image1
      if (canvas2) {
        ctx.save();
        ctx.filter = `brightness(${image2.brightness ?? 100}%) contrast(${image2.contrast ?? 100}%)`;
        ctx.drawImage(canvas2, w1, Math.max(0, (exportHeight - h2) / 2));
        ctx.restore();
      }

      const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.9);

      let filename = 'photo-compare-view.jpg';
      if (image1.file && image2.file) {
        const name1 = image1.file.name.substring(0, image1.file.name.lastIndexOf('.')) || image1.file.name;
        const name2 = image2.file.name.substring(0, image2.file.name.lastIndexOf('.')) || image2.file.name;
        filename = `view_${name1}_vs_${name2}.jpg`;
      } else if (image1.file) {
        const name1 = image1.file.name.substring(0, image1.file.name.lastIndexOf('.')) || image1.file.name;
        filename = `view_${name1}.jpg`;
      } else if (image2.file) {
        const name2 = image2.file.name.substring(0, image2.file.name.lastIndexOf('.')) || image2.file.name;
        filename = `view_${name2}.jpg`;
      }

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export current view:', err);
      alert('Failed to export current view.');
    }
  };

  const hasImages = image1.dataUrl || image2.dataUrl;

  const secondaryBtn =
    'flex items-center gap-2 px-4 py-1.5 rounded-full bg-raised text-content hover:bg-[#3a3a3a] transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-raised text-sm font-medium';
  const iconBtn =
    'p-2 rounded-full bg-raised text-muted hover:text-content hover:bg-[#3a3a3a] transition-colors active:scale-95';

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3 bg-elevated border-b border-line">
      <div className="flex items-center gap-3">
        <h1 className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-content">
          <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" aria-hidden="true"></span>
          Photo&nbsp;Compare
        </h1>

        <div className="w-px h-6 bg-line mx-1"></div>

        <button onClick={handleSave} disabled={!hasImages} className={secondaryBtn} title="Save project (images & markers)">
          <Download size={16} /> Save
        </button>

        <button onClick={handleLoad} className={secondaryBtn} title="Load project">
          <Upload size={16} /> Load
        </button>

        <button onClick={handleExportJPG} disabled={!hasImages} className={secondaryBtn} title="Export full-resolution JPG with markers">
          <ImageIcon size={16} /> Export JPG
        </button>

        <button onClick={handleExportCurrentView} disabled={!hasImages} className={secondaryBtn} title="Export the current view (pan, zoom, rotation & filters as shown)">
          <Camera size={16} /> Export View
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Signature action — the one green pill, recording-style when live */}
        <button
          onClick={toggleAddingMarker}
          disabled={!hasImages}
          className={clsx(
            'flex items-center gap-2 pl-4 pr-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 active:scale-95',
            !hasImages
              ? 'opacity-40 cursor-not-allowed bg-raised text-muted'
              : isAddingMarker
                ? 'bg-accent hover:bg-accent-hover text-black shadow-[0_0_18px_rgba(29,185,84,0.5)]'
                : 'bg-accent hover:bg-accent-hover text-black hover:scale-105'
          )}
        >
          <MapPin size={18} className={isAddingMarker ? 'animate-pulse' : ''} />
          {isAddingMarker ? 'Placing markers' : 'Add marker'}
        </button>

        <div className="w-px h-8 bg-line mx-1"></div>

        <button
          onClick={toggleSyncPanZoom}
          className={clsx(
            'p-2 rounded-full transition-colors active:scale-95',
            syncPanZoom ? 'bg-accent/20 text-accent' : 'bg-raised text-muted hover:text-content hover:bg-[#3a3a3a]'
          )}
          title="Sync pan, zoom & rotation across both images"
        >
          <Link2 size={20} />
        </button>

        <button onClick={() => handleZoom('in')} className={iconBtn} title="Zoom in">
          <ZoomIn size={20} />
        </button>
        <button onClick={() => handleZoom('out')} className={iconBtn} title="Zoom out">
          <ZoomOut size={20} />
        </button>
        <button onClick={resetPanZoom} className={iconBtn} title="Reset view">
          <Maximize size={20} />
        </button>

        <div className="w-px h-8 bg-line mx-1"></div>

        <button
          onClick={clearMarkers}
          disabled={image1.markers.length === 0 && image2.markers.length === 0}
          className="p-2 rounded-full bg-raised text-muted hover:bg-danger hover:text-white transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-raised disabled:hover:text-muted"
          title="Clear all markers"
        >
          <Trash2 size={20} />
        </button>

        <button
          onClick={clearImages}
          disabled={!hasImages}
          className="px-4 py-1.5 rounded-full bg-raised text-muted hover:bg-danger hover:text-white transition-colors active:scale-95 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-raised disabled:hover:text-muted"
          title="Remove both images"
        >
          Clear images
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useAppStore } from '../store';
import { MapPin, Link2, ZoomIn, ZoomOut, Maximize, Trash2, Download, Upload } from 'lucide-react';
import clsx from 'clsx';

export const Controls: React.FC = () => {
  const {
    isAddingMarker, toggleAddingMarker,
    syncPanZoom, toggleSyncPanZoom,
    resetPanZoom, clearImages, clearMarkers,
    image1, image2, projectFileHandle, setProjectFileHandle
  } = useAppStore();

  const handleZoom = (direction: 'in' | 'out') => {
    const store = useAppStore.getState();
    const factor = direction === 'in' ? 1.2 : 0.8;
    store.updatePanZoom(1, store.image1.zoom * factor, store.image1.panX, store.image1.panY, store.image1.rotation);
    if (!store.syncPanZoom) {
      store.updatePanZoom(2, store.image2.zoom * factor, store.image2.panX, store.image2.panY, store.image2.rotation);
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
      
      if (data.image1 || data.image2) {
        useAppStore.setState(state => ({
          ...(data.image1 && {
            image1: { ...state.image1, ...data.image1, rotation: data.image1.rotation || 0, markers: data.image1.markers || [] }
          }),
          ...(data.image2 && {
            image2: { ...state.image2, ...data.image2, rotation: data.image2.rotation || 0, markers: data.image2.markers || [] }
          }),
        }));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Failed to load project file", err);
        alert("Invalid project file");
      }
    }
  };

  const hasImages = image1.dataUrl || image2.dataUrl;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Photo Compare
        </h1>

        <div className="w-px h-6 bg-slate-700 mx-1"></div>
        
        <button
          onClick={handleSave}
          disabled={!hasImages}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          title="Save Project (Images & Markers)"
        >
          <Download size={16} /> Save
        </button>
        
        <button
          onClick={handleLoad}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-medium"
          title="Load Project"
        >
          <Upload size={16} /> Load
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleAddingMarker}
          disabled={!hasImages}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200',
            !hasImages ? 'opacity-50 cursor-not-allowed bg-slate-700' :
            isAddingMarker ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          )}
        >
          <MapPin size={18} />
          {isAddingMarker ? 'Adding Markers...' : 'Add Marker'}
        </button>

        <div className="w-px h-8 bg-slate-700 mx-2"></div>

        <button
          onClick={toggleSyncPanZoom}
          className={clsx(
            'p-2 rounded-md transition-colors',
            syncPanZoom ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          )}
          title="Sync Pan & Zoom"
        >
          <Link2 size={20} />
        </button>

        <button onClick={() => handleZoom('in')} className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors" title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={() => handleZoom('out')} className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button onClick={resetPanZoom} className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors" title="Reset View">
          <Maximize size={20} />
        </button>

        <div className="w-px h-8 bg-slate-700 mx-2"></div>

        <button
          onClick={clearMarkers}
          disabled={image1.markers.length === 0 && image2.markers.length === 0}
          className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear All Markers"
        >
          <Trash2 size={20} />
        </button>
        
        <button
          onClick={clearImages}
          disabled={!hasImages}
          className="p-2 rounded-md bg-slate-700 text-slate-300 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear Images"
        >
          Clear Images
        </button>
      </div>
    </div>
  );
};

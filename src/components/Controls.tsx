import React, { useRef } from 'react';
import { useAppStore } from '../store';
import { MapPin, Link2, ZoomIn, ZoomOut, Maximize, Trash2, Download, Upload } from 'lucide-react';
import clsx from 'clsx';

export const Controls: React.FC = () => {
  const {
    isAddingMarker, toggleAddingMarker,
    syncPanZoom, toggleSyncPanZoom,
    resetPanZoom, clearImages, clearMarkers,
    image1, image2
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = () => {
    const data = {
      image1: { ...image1, file: null },
      image2: { ...image2, file: null }
    };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photo-compare-project.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);
        
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
      } catch (err) {
        console.error("Failed to parse project file", err);
        alert("Invalid project file");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-medium"
          title="Load Project"
        >
          <Upload size={16} /> Load
        </button>
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          onChange={handleLoad} 
          className="hidden" 
        />
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

import React, { useEffect, useState } from 'react';
import { Controls } from './components/Controls';
import { ImageUploader } from './components/ImageUploader';
import { ImageCanvas } from './components/ImageCanvas';
import { MarkerPanel } from './components/MarkerPanel';
import { useAppStore } from './store';

function App() {
  const { image1, image2, setImage1File, setImage2File } = useAppStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update canvas dimensions based on window resize
  useEffect(() => {
    const updateDimensions = () => {
      // Calculate based on the available space (roughly half width minus padding/panel)
      // Panel is 320px wide (w-80), side padding is 16*2
      const availableWidth = window.innerWidth - 320 - 32;
      const width = Math.max(300, (availableWidth / 2) - 16);
      
      // Header is ~73px tall, top/bottom padding is 16*2
      const height = Math.max(400, window.innerHeight - 73 - 32);
      
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <Controls />
      
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex gap-4 p-4 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900">
          
          {/* Image 1 Container */}
          <div className="flex-1 flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50">
            <div className="p-3 border-b border-slate-700/50 bg-slate-800/80 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-blue-400">Reference Image</h2>
                {image1.dataUrl && (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-slate-400">Rotate:</span>
                    <input 
                      type="range" min="-180" max="180" step="0.5" 
                      value={image1.rotation} 
                      onChange={(e) => useAppStore.getState().updatePanZoom(1, image1.zoom, image1.panX, image1.panY, Number(e.target.value))}
                      className="w-24 accent-blue-500"
                    />
                    <span className="text-xs text-slate-400 w-10">{image1.rotation.toFixed(1)}°</span>
                    <button onClick={() => useAppStore.getState().updatePanZoom(1, image1.zoom, image1.panX, image1.panY, 0)} className="text-xs px-1.5 py-0.5 border border-slate-600 hover:bg-slate-700 rounded text-slate-300" title="Reset Rotation">Reset</button>
                  </div>
                )}
              </div>
              {image1.file && <span className="text-xs text-slate-400 truncate max-w-[150px]">{image1.file.name}</span>}
              {!image1.file && image1.dataUrl && <span className="text-xs text-slate-400 truncate max-w-[150px]">(Loaded Project)</span>}
            </div>
            <div className="flex-1 flex items-center justify-center p-4 relative bg-black/20">
              {!image1.dataUrl ? (
                <ImageUploader 
                  label="Upload Reference Image" 
                  onImageSelected={setImage1File} 
                  className="w-full max-w-md"
                />
              ) : (
                dimensions.width > 0 && <ImageCanvas imageIndex={1} width={dimensions.width} height={dimensions.height} />
              )}
            </div>
          </div>

          {/* Image 2 Container */}
          <div className="flex-1 flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50">
            <div className="p-3 border-b border-slate-700/50 bg-slate-800/80 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-purple-400">Comparison Image</h2>
                {image2.dataUrl && (
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-slate-400">Rotate:</span>
                    <input 
                      type="range" min="-180" max="180" step="0.5" 
                      value={image2.rotation} 
                      onChange={(e) => useAppStore.getState().updatePanZoom(2, image2.zoom, image2.panX, image2.panY, Number(e.target.value))}
                      className="w-24 accent-purple-500"
                    />
                    <span className="text-xs text-slate-400 w-10">{image2.rotation.toFixed(1)}°</span>
                    <button onClick={() => useAppStore.getState().updatePanZoom(2, image2.zoom, image2.panX, image2.panY, 0)} className="text-xs px-1.5 py-0.5 border border-slate-600 hover:bg-slate-700 rounded text-slate-300" title="Reset Rotation">Reset</button>
                  </div>
                )}
              </div>
              {image2.file && <span className="text-xs text-slate-400 truncate max-w-[150px]">{image2.file.name}</span>}
              {!image2.file && image2.dataUrl && <span className="text-xs text-slate-400 truncate max-w-[150px]">(Loaded Project)</span>}
            </div>
            <div className="flex-1 flex items-center justify-center p-4 relative bg-black/20">
              {!image2.dataUrl ? (
                <ImageUploader 
                  label="Upload Comparison Image" 
                  onImageSelected={setImage2File}
                  className="w-full max-w-md"
                />
              ) : (
                dimensions.width > 0 && <ImageCanvas imageIndex={2} width={dimensions.width} height={dimensions.height} />
              )}
            </div>
          </div>
          
        </div>

        <MarkerPanel />
      </div>
    </div>
  );
}

export default App;

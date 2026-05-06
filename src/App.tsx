import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { Controls } from './components/Controls';
import { ImageUploader } from './components/ImageUploader';
import { ImageCanvas } from './components/ImageCanvas';
import { MarkerPanel } from './components/MarkerPanel';
import { useAppStore } from './store';

function App() {
  const { image1, image2, setImage1File, setImage2File, toggleAddingMarker } = useAppStore();
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

  // Add spacebar toggle for adding marker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.code === 'Space' && 
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault(); // Prevent page scrolling
        toggleAddingMarker();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAddingMarker]);

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
                  <div className="flex flex-col gap-1.5 ml-4 border-l border-slate-700/50 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-12">Rotate:</span>
                      <input 
                        type="range" min="-180" max="180" step="0.5" 
                        value={image1.rotation} 
                        onChange={(e) => useAppStore.getState().updatePanZoom(1, image1.zoom, image1.panX, image1.panY, Number(e.target.value))}
                        className="w-16 accent-blue-500"
                      />
                      <span className="text-xs text-slate-400 w-8 text-right">{image1.rotation.toFixed(0)}°</span>
                      <button onClick={() => useAppStore.getState().updatePanZoom(1, image1.zoom, image1.panX, image1.panY, 0)} className="text-xs px-1.5 py-0 border border-slate-600 hover:bg-slate-700 rounded text-slate-300" title="Reset Rotation">⟲</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-12">Filter:</span>
                      <input 
                        type="range" min="0" max="200" step="1" 
                        value={image1.brightness ?? 100} 
                        onChange={(e) => useAppStore.getState().updateFilters(1, Number(e.target.value), image1.contrast ?? 100)}
                        className="w-16 accent-yellow-500"
                        title={`Brightness: ${image1.brightness ?? 100}%`}
                      />
                      <input 
                        type="range" min="0" max="200" step="1" 
                        value={image1.contrast ?? 100} 
                        onChange={(e) => useAppStore.getState().updateFilters(1, image1.brightness ?? 100, Number(e.target.value))}
                        className="w-16 accent-purple-500"
                        title={`Contrast: ${image1.contrast ?? 100}%`}
                      />
                      <button onClick={() => useAppStore.getState().updateFilters(1, 100, 100)} className="text-xs px-1.5 py-0 border border-slate-600 hover:bg-slate-700 rounded text-slate-300" title="Reset Filters">⟲</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {image1.file && <span className="text-xs text-slate-400 truncate max-w-[150px]">{image1.file.name}</span>}
                {!image1.file && image1.dataUrl && <span className="text-xs text-slate-400 truncate max-w-[150px]">(Loaded Project)</span>}
                {image1.dataUrl && (
                  <label className="cursor-pointer text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 flex items-center gap-1 transition-colors" title="Change Image">
                    <Upload size={12} />
                    <span>Change</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setImage1File(file, event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = '';
                      }} 
                    />
                  </label>
                )}
              </div>
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
                  <div className="flex flex-col gap-1.5 ml-4 border-l border-slate-700/50 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-12">Rotate:</span>
                      <input 
                        type="range" min="-180" max="180" step="0.5" 
                        value={image2.rotation} 
                        onChange={(e) => useAppStore.getState().updatePanZoom(2, image2.zoom, image2.panX, image2.panY, Number(e.target.value))}
                        className="w-16 accent-purple-500"
                      />
                      <span className="text-xs text-slate-400 w-8 text-right">{image2.rotation.toFixed(0)}°</span>
                      <button onClick={() => useAppStore.getState().updatePanZoom(2, image2.zoom, image2.panX, image2.panY, 0)} className="text-xs px-1.5 py-0 border border-slate-600 hover:bg-slate-700 rounded text-slate-300" title="Reset Rotation">⟲</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-12">Filter:</span>
                      <input 
                        type="range" min="0" max="200" step="1" 
                        value={image2.brightness ?? 100} 
                        onChange={(e) => useAppStore.getState().updateFilters(2, Number(e.target.value), image2.contrast ?? 100)}
                        className="w-16 accent-yellow-500"
                        title={`Brightness: ${image2.brightness ?? 100}%`}
                      />
                      <input 
                        type="range" min="0" max="200" step="1" 
                        value={image2.contrast ?? 100} 
                        onChange={(e) => useAppStore.getState().updateFilters(2, image2.brightness ?? 100, Number(e.target.value))}
                        className="w-16 accent-purple-500"
                        title={`Contrast: ${image2.contrast ?? 100}%`}
                      />
                      <button onClick={() => useAppStore.getState().updateFilters(2, 100, 100)} className="text-xs px-1.5 py-0 border border-slate-600 hover:bg-slate-700 rounded text-slate-300" title="Reset Filters">⟲</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {image2.file && <span className="text-xs text-slate-400 truncate max-w-[150px]">{image2.file.name}</span>}
                {!image2.file && image2.dataUrl && <span className="text-xs text-slate-400 truncate max-w-[150px]">(Loaded Project)</span>}
                {image2.dataUrl && (
                  <label className="cursor-pointer text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 flex items-center gap-1 transition-colors" title="Change Image">
                    <Upload size={12} />
                    <span>Change</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setImage2File(file, event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = '';
                      }} 
                    />
                  </label>
                )}
              </div>
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

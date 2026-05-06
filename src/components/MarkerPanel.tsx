import React from 'react';
import { useAppStore } from '../store';
import { X } from 'lucide-react';

export const MarkerPanel: React.FC = () => {
  const { image1, image2, removeMarker, updateMarkerLabel, updateMarkerColor } = useAppStore();

  // Combine markers from both images or just show them grouped
  const markers1 = image1.markers;
  const markers2 = image2.markers;

  const allMarkerIds = Array.from(new Set([...markers1.map(m => m.id), ...markers2.map(m => m.id)]));

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full shadow-xl z-10 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">Markers</h2>
        <p className="text-sm text-slate-400">Click on image to add markers</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {allMarkerIds.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">
            No markers added yet
          </div>
        ) : (
          allMarkerIds.map(id => {
            const m1 = markers1.find(m => m.id === id);
            const m2 = markers2.find(m => m.id === id);
            const label = m1?.label || m2?.label || '';
            const color = m1?.color || m2?.color || '#ef4444';

            return (
              <div 
                key={id} 
                onClick={() => window.dispatchEvent(new CustomEvent('center-marker', { detail: { id } }))}
                className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 flex flex-col gap-3 group transition-colors hover:bg-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 font-bold text-sm shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    {label}
                  </div>
                  
                  <input
                    type="text"
                    value={label}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateMarkerLabel(id, e.target.value)}
                    className="bg-slate-900 border border-slate-600 rounded px-2 py-1 flex-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Label..."
                  />
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMarker(id); }}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove marker"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs text-slate-400">Color:</span>
                  <input 
                    type="color" 
                    value={color}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateMarkerColor(id, e.target.value)}
                    className="w-full h-8 cursor-pointer bg-transparent rounded border-none p-0"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

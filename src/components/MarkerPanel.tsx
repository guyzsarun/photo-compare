import React from 'react';
import { useAppStore } from '../store';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface MarkerPanelProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const MarkerPanel: React.FC<MarkerPanelProps> = ({ collapsed, onToggle }) => {
  const { image1, image2, removeMarker, updateMarkerLabel, updateMarkerColor, markerSize1, markerSize2, setMarkerSize } = useAppStore();

  // Combine markers from both images or just show them grouped
  const markers1 = image1.markers;
  const markers2 = image2.markers;

  const allMarkerIds = Array.from(new Set([...markers1.map(m => m.id), ...markers2.map(m => m.id)]));

  if (collapsed) {
    return (
      <div className="w-8 bg-elevated border-l border-line flex flex-col h-full z-10 overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-3 text-muted hover:text-content hover:bg-raised transition-colors"
          title="Expand markers panel"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <span
            className="text-xs text-muted font-semibold tracking-widest select-none"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            MARKERS {allMarkerIds.length > 0 ? `(${allMarkerIds.length})` : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-elevated border-l border-line flex flex-col h-full z-10 overflow-hidden">
      <div className="p-4 border-b border-line flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="font-display text-lg font-bold text-content">Markers</h2>
          <p className="text-sm text-muted">Click an image to place a point</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted shrink-0 w-16">Ref size</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={markerSize1}
              onChange={(e) => setMarkerSize(1, Number(e.target.value))}
              className="flex-1 h-1.5 accent-accent cursor-pointer"
            />
            <span className="text-xs text-muted w-8 text-right shrink-0 tabular-nums">
              {markerSize1.toFixed(1)}×
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-muted shrink-0 w-16">Comp size</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={markerSize2}
              onChange={(e) => setMarkerSize(2, Number(e.target.value))}
              className="flex-1 h-1.5 accent-accent cursor-pointer"
            />
            <span className="text-xs text-muted w-8 text-right shrink-0 tabular-nums">
              {markerSize2.toFixed(1)}×
            </span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="mt-1 p-1 text-muted hover:text-content hover:bg-raised rounded transition-colors"
          title="Collapse markers panel"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-slim p-4 space-y-2">
        {allMarkerIds.length === 0 ? (
          <div className="text-center text-muted text-sm mt-10">
            No markers yet — click an image to add one
          </div>
        ) : (
          allMarkerIds.map(id => {
            const m1 = markers1.find(m => m.id === id);
            const m2 = markers2.find(m => m.id === id);
            const label = m1?.label || m2?.label || '';
            const color = m1?.color || m2?.color || '#1db954';

            return (
              <div
                key={id}
                onClick={() => window.dispatchEvent(new CustomEvent('center-marker', { detail: { id } }))}
                className="bg-raised rounded-lg p-3 border border-line flex flex-col gap-3 group transition-colors hover:bg-[#3a3a3a] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border-2"
                    style={{ backgroundColor: `${color}33`, borderColor: color, color }}
                  >
                    {label}
                  </div>

                  <input
                    type="text"
                    value={label}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateMarkerLabel(id, e.target.value)}
                    className="bg-base border border-line rounded px-2 py-1 flex-1 text-sm text-content placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    placeholder="Label…"
                  />

                  <button
                    onClick={(e) => { e.stopPropagation(); removeMarker(id); }}
                    className="text-muted hover:text-danger p-1 rounded-md hover:bg-base transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove marker"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs text-muted">Color</span>
                  <input
                    type="color"
                    value={color}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateMarkerColor(id, e.target.value)}
                    className="w-full h-7 cursor-pointer bg-transparent rounded border-none p-0"
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

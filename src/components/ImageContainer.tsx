import React from 'react';
import { Upload } from 'lucide-react';
import { useAppStore } from '../store';
import { ImageUploader } from './ImageUploader';
import { ImageCanvas } from './ImageCanvas';
import { readFileAsDataUrl } from '../utils';

interface ImageContainerProps {
  imageIndex: 1 | 2;
  dimensions: { width: number; height: number };
}

export const ImageContainer: React.FC<ImageContainerProps> = ({ imageIndex, dimensions }) => {
  const imageState = useAppStore(s => imageIndex === 1 ? s.image1 : s.image2);
  const setImageFile = useAppStore(s => s.setImageFile);
  const updatePanZoom = useAppStore(s => s.updatePanZoom);
  const updateFilters = useAppStore(s => s.updateFilters);

  const isImage1 = imageIndex === 1;
  const accentClass = isImage1 ? 'text-blue-400' : 'text-purple-400';
  const rotateAccentClass = isImage1 ? 'accent-blue-500' : 'accent-purple-500';
  const label = isImage1 ? 'Reference Image' : 'Comparison Image';
  const uploadLabel = isImage1 ? 'Upload Reference Image' : 'Upload Comparison Image';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataUrl(file);
      setImageFile(imageIndex, file, dataUrl);
    }
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-slate-600/50">
      <div className="p-3 border-b border-slate-700/50 bg-slate-800/80 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className={`font-semibold ${accentClass}`}>{label}</h2>
          {imageState.dataUrl && (
            <div className="flex flex-col gap-1.5 ml-4 border-l border-slate-700/50 pl-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-12">Rotate:</span>
                <input
                  type="range" min="-180" max="180" step="0.5"
                  value={imageState.rotation}
                  onChange={(e) => updatePanZoom(imageIndex, imageState.zoom, imageState.panX, imageState.panY, Number(e.target.value))}
                  className={`w-16 ${rotateAccentClass}`}
                />
                <span className="text-xs text-slate-400 w-8 text-right">{imageState.rotation.toFixed(0)}°</span>
                <button
                  onClick={() => updatePanZoom(imageIndex, imageState.zoom, imageState.panX, imageState.panY, 0)}
                  className="text-xs px-1.5 py-0 border border-slate-600 hover:bg-slate-700 rounded text-slate-300"
                  title="Reset Rotation"
                >⟲</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-12">Filter:</span>
                <input
                  type="range" min="0" max="200" step="1"
                  value={imageState.brightness ?? 100}
                  onChange={(e) => updateFilters(imageIndex, Number(e.target.value), imageState.contrast ?? 100)}
                  className="w-16 accent-yellow-500"
                  title={`Brightness: ${imageState.brightness ?? 100}%`}
                />
                <input
                  type="range" min="0" max="200" step="1"
                  value={imageState.contrast ?? 100}
                  onChange={(e) => updateFilters(imageIndex, imageState.brightness ?? 100, Number(e.target.value))}
                  className="w-16 accent-purple-500"
                  title={`Contrast: ${imageState.contrast ?? 100}%`}
                />
                <button
                  onClick={() => updateFilters(imageIndex, 100, 100)}
                  className="text-xs px-1.5 py-0 border border-slate-600 hover:bg-slate-700 rounded text-slate-300"
                  title="Reset Filters"
                >⟲</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {imageState.file && (
            <span className="text-xs text-slate-400 truncate max-w-[150px]">{imageState.file.name}</span>
          )}
          {!imageState.file && imageState.dataUrl && (
            <span className="text-xs text-slate-400 truncate max-w-[150px]">(Loaded Project)</span>
          )}
          {imageState.dataUrl && (
            <label
              className="cursor-pointer text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 flex items-center gap-1 transition-colors"
              title="Change Image"
            >
              <Upload size={12} />
              <span>Change</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 relative bg-black/20">
        {!imageState.dataUrl ? (
          <ImageUploader
            label={uploadLabel}
            onImageSelected={(file, dataUrl) => setImageFile(imageIndex, file, dataUrl)}
            className="w-full max-w-md"
          />
        ) : (
          dimensions.width > 0 && (
            <ImageCanvas imageIndex={imageIndex} width={dimensions.width} height={dimensions.height} />
          )
        )}
      </div>
    </div>
  );
};

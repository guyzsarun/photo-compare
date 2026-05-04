import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import clsx from 'clsx';

interface ImageUploaderProps {
  label: string;
  onImageSelected: (file: File, dataUrl: string) => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageSelected, className }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(file, e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200',
        isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-400 bg-slate-800',
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="w-12 h-12 mb-4 text-slate-400" />
      <p className="text-lg font-medium text-slate-200">{label}</p>
      <p className="text-sm text-slate-400 mt-2 text-center">
        {isDragActive ? 'Drop the image here...' : 'Drag & drop an image here, or click to select'}
      </p>
    </div>
  );
};

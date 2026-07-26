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
        'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200',
        isDragActive
          ? 'border-accent bg-accent/10'
          : 'border-line hover:border-muted bg-elevated',
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className={clsx('w-12 h-12 mb-4 transition-colors', isDragActive ? 'text-accent' : 'text-muted')} />
      <p className="text-lg font-display font-bold text-content">{label}</p>
      <p className="text-sm text-muted mt-2 text-center">
        {isDragActive ? 'Drop to load' : 'Drag & drop, or click to browse'}
      </p>
    </div>
  );
};

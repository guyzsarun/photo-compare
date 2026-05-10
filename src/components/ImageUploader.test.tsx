import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageUploader } from './ImageUploader';

describe('ImageUploader', () => {
  const mockOnImageSelected = vi.fn();

  beforeEach(() => {
    mockOnImageSelected.mockClear();
  });

  it('should render the component with label', () => {
    render(<ImageUploader label="Upload Test Image" onImageSelected={mockOnImageSelected} />);

    expect(screen.getByText('Upload Test Image')).toBeInTheDocument();
  });

  it('should display drag and drop instruction text', () => {
    render(<ImageUploader label="Upload Test Image" onImageSelected={mockOnImageSelected} />);

    expect(screen.getByText(/Drag & drop an image here/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ImageUploader
        label="Upload Test Image"
        onImageSelected={mockOnImageSelected}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have a hidden file input', () => {
    render(<ImageUploader label="Upload Test Image" onImageSelected={mockOnImageSelected} />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'file');
  });

  it('should have the correct accept attribute for images', () => {
    render(<ImageUploader label="Upload Test Image" onImageSelected={mockOnImageSelected} />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept');
  });

  it('should be properly hidden from visual display', () => {
    render(<ImageUploader label="Upload Test Image" onImageSelected={mockOnImageSelected} />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveStyle({ position: 'absolute', width: '1px', height: '1px' });
  });
});
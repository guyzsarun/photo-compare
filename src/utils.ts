/**
 * Convert image pixel coordinates to absolute canvas position.
 * Accounts for image scale and rotation.
 */
export function imageToCanvasCoords(
  markerX: number,
  markerY: number,
  imgCenterX: number,
  imgCenterY: number,
  imgWidth: number,
  imgHeight: number,
  scaleX: number,
  scaleY: number,
  rotationDeg: number,
): { x: number; y: number } {
  const cx = markerX - imgWidth / 2;
  const cy = markerY - imgHeight / 2;

  const px = cx * scaleX;
  const py = cy * scaleY;

  const rad = rotationDeg * (Math.PI / 180);
  const rx = px * Math.cos(rad) - py * Math.sin(rad);
  const ry = px * Math.sin(rad) + py * Math.cos(rad);

  return { x: imgCenterX + rx, y: imgCenterY + ry };
}

/**
 * Convert an absolute canvas position back to image pixel coordinates.
 * Accounts for image scale and rotation.
 */
export function canvasToImageCoords(
  canvasX: number,
  canvasY: number,
  imgCenterX: number,
  imgCenterY: number,
  imgWidth: number,
  imgHeight: number,
  scaleX: number,
  scaleY: number,
  rotationDeg: number,
): { x: number; y: number } {
  const px = canvasX - imgCenterX;
  const py = canvasY - imgCenterY;

  const rad = -rotationDeg * (Math.PI / 180);
  const rx = px * Math.cos(rad) - py * Math.sin(rad);
  const ry = px * Math.sin(rad) + py * Math.cos(rad);

  return {
    x: rx / scaleX + imgWidth / 2,
    y: ry / scaleY + imgHeight / 2,
  };
}

/** Read a File as a base-64 data URL. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

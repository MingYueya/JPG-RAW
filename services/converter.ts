
import { ImageFile } from '../types';

// Using a CDN link for JSZip as it's a large library best loaded via script or standard CDN
// We can use a dynamic import for better handling if needed, or assume it's available via npm-like import in this environment.
// For this environment, we'll use a standard CDN approach for the ZIP functionality.
import JSZip from 'jszip';

/**
 * Converts any browser-supported image format to JPG using the Canvas API.
 * Done entirely client-side.
 */
export const convertToJpg = (file: File, quality: number = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Fill background with white (for transparency handling in PNG/WEBP)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Blob generation failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Packs multiple blobs into a single ZIP file.
 */
export const createZip = async (imageFiles: ImageFile[]): Promise<Blob> => {
  const zip = new JSZip();
  
  imageFiles.forEach((item) => {
    if (item.convertedBlob) {
      const fileName = item.file.name.split('.')[0] + '.jpg';
      zip.file(fileName, item.convertedBlob);
    }
  });

  return await zip.generateAsync({ type: 'blob' });
};

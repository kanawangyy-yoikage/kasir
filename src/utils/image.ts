import jsQR from 'jsqr';

export interface CompressOptions {
  /** Maximum width or height in pixels. Longer edge is scaled down to this. */
  maxDimension?: number;
  /** JPEG quality 0..1. */
  quality?: number;
  /** Output mime type. */
  type?: string;
}

/**
 * Compress an image File and convert it to a base64 data URL.
 *
 * - Draws the image onto a canvas scaled down to `maxDimension` on the longest edge
 * - Uses canvas.toDataURL(type, quality) for compression
 *
 * Returns a Promise resolving to the data URL, or rejects on error.
 */
export function fileToCompressedDataUrl(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { maxDimension = 1024, quality = 0.8, type = 'image/jpeg' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid'));
      img.onload = () => {
        try {
          const scale = Math.min(
            1,
            maxDimension / Math.max(img.width, img.height)
          );
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas tidak didukung di browser ini'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(type, quality));
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Gagal kompresi gambar'));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Decode a QR code embedded in an image File.
 *
 * Reads the file into an ImageBitmap/ImageData and runs jsQR on it.
 * Returns the decoded string content, or null if no QR was found.
 */
export function decodeQRFromFile(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid'));
      img.onload = () => {
        try {
          // Parse at native resolution for best decode accuracy, capped to a sane size.
          const scale = Math.min(
            1,
            1600 / Math.max(img.width, img.height)
          );
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            reject(new Error('Canvas tidak didukung di browser ini'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, width, height);
          resolve(code ? code.data : null);
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Gagal membaca QR'));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

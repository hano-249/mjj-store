/**
 * Compresses an image File using HTML Canvas:
 * 1. Resizes to max width 800px (maintaining aspect ratio)
 * 2. Compresses with JPEG quality 0.6
 * 3. Converts directly to Base64 Data URL
 * 100% Free - zero Storage or Billing required.
 */
export async function compressImageToBase64(file: File): Promise<{
  base64: string;
  sizeKB: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('الملف المرفوع ليس صورة صالحة'));

      img.onload = () => {
        // Target width: 800px (maintaining aspect ratio)
        const TARGET_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > TARGET_WIDTH) {
          height = Math.round((height * TARGET_WIDTH) / width);
          width = TARGET_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('فشل تهيئة ضاغط الصور'));
        }

        // Fill background to prevent transparent black box in JPEGs
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Base64 Data URL with quality 0.6
        const base64DataUrl = canvas.toDataURL('image/jpeg', 0.6);

        // Approximate size in KB
        const sizeBytes = Math.round((base64DataUrl.length * 3) / 4);
        const sizeKB = Math.round(sizeBytes / 1024);

        resolve({
          base64: base64DataUrl,
          sizeKB,
          width,
          height
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

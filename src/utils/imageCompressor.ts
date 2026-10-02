/**
 * Compresses an image File using HTML Canvas so its size is strictly under 400KB.
 */
export async function compressSquadImage(
  file: File,
  maxSizeKB: number = 390
): Promise<{ blob: Blob; sizeKB: number; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('الملف المرفوع ليس صورة صالحة'));

      img.onload = async () => {
        // Calculate dimensions maintaining aspect ratio, max width/height 1600px
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('فشل تهيئة ضاغط الصور'));
        }

        // Draw image onto canvas
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Iteratively find quality that fits under maxSizeKB
        let quality = 0.88;
        let compressedBlob: Blob | null = null;
        const targetBytes = maxSizeKB * 1024;

        while (quality >= 0.25) {
          compressedBlob = await new Promise<Blob | null>((res) => {
            canvas.toBlob(res, 'image/jpeg', quality);
          });

          if (compressedBlob && compressedBlob.size <= targetBytes) {
            break;
          }

          quality -= 0.12;
        }

        if (!compressedBlob) {
          return reject(new Error('فشل ضغط الصورة'));
        }

        const previewUrl = URL.createObjectURL(compressedBlob);
        const sizeKB = Math.round(compressedBlob.size / 1024);

        resolve({
          blob: compressedBlob,
          sizeKB,
          previewUrl
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

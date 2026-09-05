// Normalizes a user-picked image before upload so that any resolution "just works":
// giant phone/DSLR photos are downscaled to a web-friendly size (keeps aspect ratio,
// no cropping), while small images pass through untouched (+ advanced browser keeps
// original if the transformation is unsupported).
const FALLBACK = /^image\/(jpe?g|png|webp)$/i;

export async function prepareImageFile(file, { maxDimension = 2048, quality = 0.82 } = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const longEdge = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxDimension / longEdge);

    if (scale >= 1) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    }
    bitmap.close();

    const type = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
    const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, ext === 'png' ? undefined : quality));
    if (!blob || !FALLBACK.test(blob.type)) return file;

    const base = file.name.replace(/\.[^.]+$/i, '') || 'image';
    return new File([blob], `${base}.${ext}`, { type: blob.type });
  } catch {
    return file;
  }
}
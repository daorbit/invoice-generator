const MAX_PDF_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_SIDE = 1600;
const JPEG_QUALITY = 0.85;

export interface OrbitAttachment {
  name: string;
  kind: 'image' | 'pdf';
  dataUrl: string;
}

function readDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read that file.')));
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not read that image.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

export async function readAttachment(file: File): Promise<OrbitAttachment> {
  if (file.type === 'application/pdf') {
    if (file.size > MAX_PDF_BYTES) throw new Error('The PDF must be 3 MB or smaller.');
    return { name: file.name, kind: 'pdf', dataUrl: await readDataUrl(file) };
  }
  if (file.type.startsWith('image/')) {
    if (file.size > MAX_IMAGE_BYTES) throw new Error('That photo is too large.');
    return { name: file.name, kind: 'image', dataUrl: await shrinkImage(file) };
  }
  throw new Error('Attach a photo or a PDF.');
}

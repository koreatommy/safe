import { blobToDataUrl } from "./dataUrl";

export type CompressImageOptions = {
  maxEdge: number;
  quality: number;
};

export type CompressedImage = {
  dataUrl: string;
  bytes: number;
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  const webp = await canvasToBlob(canvas, "image/webp", quality);
  if (webp?.type === "image/webp") return webp;
  return canvasToBlob(canvas, "image/jpeg", quality);
}

async function resize(file: Blob, { maxEdge, quality }: CompressImageOptions): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return encode(canvas, quality);
  } finally {
    bitmap.close();
  }
}

const STORABLE_TYPES = ["image/webp", "image/jpeg"];

export class UnsupportedImageError extends Error {
  constructor() {
    super("이 사진 형식은 지원하지 않습니다. JPG 사진을 선택하거나 카메라 설정을 '호환성 우선'으로 바꿔 주세요.");
  }
}

/** Always resolves to a WebP/JPEG Blob; keeps the original only when it is already storable and smaller. */
export async function compressImageBlob(file: Blob, options: CompressImageOptions): Promise<Blob> {
  const compressed = await resize(file, options).catch(() => null);
  const originalStorable = STORABLE_TYPES.includes(file.type);
  if (!compressed || !STORABLE_TYPES.includes(compressed.type)) {
    if (originalStorable) return file;
    throw new UnsupportedImageError();
  }
  return originalStorable && file.size <= compressed.size ? file : compressed;
}

/** Steps through `presets` until the result fits `maxBytes`; returns null if none does. */
export async function compressImageToBudget(
  file: Blob,
  presets: CompressImageOptions[],
  maxBytes: number,
): Promise<Blob | null> {
  for (const preset of presets) {
    const output = await compressImageBlob(file, preset);
    if (output.size <= maxBytes) return output;
  }
  return null;
}

export async function compressImage(file: File, options: CompressImageOptions): Promise<CompressedImage> {
  const output = await compressImageBlob(file, options);
  return { dataUrl: await blobToDataUrl(output), bytes: output.size };
}

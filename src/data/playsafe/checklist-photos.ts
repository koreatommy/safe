import type { CompressImageOptions } from "@/lib/playsafe/compressImage";

export const MAX_PHOTOS_PER_ITEM = 3;

/** Phone camera originals are often 5–15MB; anything larger is rejected before decoding. */
export const MAX_SOURCE_BYTES = 30 * 1024 * 1024;

/** Upper bound per stored photo; keeps 18 items × 3 photos under ~16MB per assessment. */
export const MAX_STORED_BYTES = 300 * 1024;

/** Tried in order until the output fits `MAX_STORED_BYTES`. */
export const PHOTO_PRESETS: CompressImageOptions[] = [
  { maxEdge: 1280, quality: 0.72 },
  { maxEdge: 1024, quality: 0.6 },
  { maxEdge: 800, quality: 0.5 },
];

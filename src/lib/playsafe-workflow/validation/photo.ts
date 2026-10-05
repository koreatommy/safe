import { formatBytes } from "@/lib/playsafe/formatBytes";
import { PHOTO_MIME_TYPES, THUMBNAIL_MAX_BYTES } from "../constants";
import type { FileMeta, PhotoMeta } from "../submissionTypes";

export function isPhotoMimeType(value: unknown): boolean {
  return typeof value === "string" && (PHOTO_MIME_TYPES as readonly string[]).includes(value);
}

function parseFileMeta(raw: unknown): FileMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const { bytes, mimeType } = raw as Record<string, unknown>;
  if (typeof bytes !== "number" || typeof mimeType !== "string") return null;
  return { bytes, mimeType };
}

export function parsePhotoMeta(raw: Record<string, unknown>): PhotoMeta | null {
  const main = parseFileMeta(raw);
  const thumb = parseFileMeta(raw.thumb);
  return main && thumb ? { ...main, thumb } : null;
}

function validateFileMeta(meta: FileMeta, maxBytes: number, label: string): string | null {
  if (!isPhotoMimeType(meta.mimeType)) return `${label}은 JPG 또는 WebP 형식만 등록할 수 있습니다.`;
  if (!Number.isInteger(meta.bytes) || meta.bytes <= 0 || meta.bytes > maxBytes) {
    return `${label} 용량은 ${formatBytes(maxBytes)} 이하여야 합니다.`;
  }
  return null;
}

export function validatePhotoMeta(meta: PhotoMeta, maxBytes: number, label: string): string | null {
  return validateFileMeta(meta, maxBytes, label) ?? validateFileMeta(meta.thumb, THUMBNAIL_MAX_BYTES, `${label} 썸네일`);
}

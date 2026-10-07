import type { EquipmentDraftPhoto } from "@/data/playsafe/types";

export function emptyDraftPhoto(): EquipmentDraftPhoto {
  return { photo: "", name: "", busy: false, error: "" };
}

/** 수량이 줄면 뒤쪽 칸을 버리고, 늘면 빈 칸을 덧붙인다. */
export function resizeDraftPhotos(photos: readonly EquipmentDraftPhoto[], count: number): EquipmentDraftPhoto[] {
  return Array.from({ length: count }, (_, index) => photos[index] ?? emptyDraftPhoto());
}

/** 범위를 벗어난 칸(압축 중 수량이 줄어든 경우)은 무시한다. */
export function patchDraftPhoto(
  photos: readonly EquipmentDraftPhoto[],
  index: number,
  patch: Partial<EquipmentDraftPhoto>,
): EquipmentDraftPhoto[] {
  if (index < 0 || index >= photos.length) return [...photos];
  return photos.map((slot, i) => (i === index ? { ...slot, ...patch } : slot));
}

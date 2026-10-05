"use client";

import { MAX_PHOTOS_PER_ITEM } from "@/data/playsafe/checklist-photos";
import type { CheckPhoto } from "@/data/playsafe/types";
import { formatBytes } from "@/lib/playsafe/formatBytes";
import { PhotoSourceButtons } from "../shared/PhotoSourceButtons";
import { useCheckPhotoPreviews } from "./useCheckPhotoPreviews";
import { useCheckPhotoUpload } from "./useCheckPhotoUpload";

type ChecklistPhotoFieldProps = {
  no: number;
  photos: CheckPhoto[];
  onAdd: (photo: CheckPhoto) => void;
  onRemove: (id: string) => void;
};

export function ChecklistPhotoField({ no, photos, onAdd, onRemove }: ChecklistPhotoFieldProps) {
  const previews = useCheckPhotoPreviews(photos);
  const { busy, error, upload } = useCheckPhotoUpload(photos.length, onAdd);
  const full = photos.length >= MAX_PHOTOS_PER_ITEM;

  return (
    <div className="check-photos">
      <div className="check-photos-head">
        <PhotoSourceButtons multiple disabled={busy || full} onFiles={(files) => void upload(files)} />
        <span className="check-photos-count">
          {busy
            ? "사진 최적화 중…"
            : `위험요소 사진 ${photos.length} / ${MAX_PHOTOS_PER_ITEM}장 · 자동으로 용량을 줄여 저장합니다`}
        </span>
      </div>
      {error && (
        <p className="check-photos-error" role="alert">
          {error}
        </p>
      )}
      {photos.length > 0 && (
        <ul className="check-photos-list">
          {photos.map((photo, order) => (
            <li key={photo.id}>
              {previews[photo.id] ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                <img src={previews[photo.id]} alt={`${no}번 항목 위험요소 사진 ${order + 1}`} />
              ) : (
                <span className="check-photos-missing">불러오는 중</span>
              )}
              <span className="check-photos-size">{formatBytes(photo.bytes)}</span>
              <button
                type="button"
                className="check-photos-remove"
                aria-label={`${no}번 항목 사진 ${order + 1} 삭제`}
                onClick={() => onRemove(photo.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

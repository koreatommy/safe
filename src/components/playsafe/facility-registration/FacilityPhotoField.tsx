"use client";

import { MAX_FACILITY_PHOTOS, PHOTO_MAX_EDGE } from "@/data/playsafe/facility-registration";
import type { FacilityPhoto } from "@/data/playsafe/types";
import { PhotoSourceButtons } from "../shared/PhotoSourceButtons";
import { useFacilityPhotoPicker } from "./useFacilityPhotoPicker";
import "./facility-photos.css";

type FacilityPhotoFieldProps = {
  photos: FacilityPhoto[];
  onChange: (photos: FacilityPhoto[]) => void;
};

export function FacilityPhotoField({ photos, onChange }: FacilityPhotoFieldProps) {
  const { busy, error, remaining, addFiles, remove } = useFacilityPhotoPicker(photos, onChange);

  return (
    <div className="facility-field facility-field-full">
      <span>
        시설 전경사진 ({photos.length}/{MAX_FACILITY_PHOTOS})
      </span>
      <div className="facility-photo">
        {remaining > 0 && (
          <PhotoSourceButtons disabled={busy} multiple onFiles={(files) => void addFiles(files)} />
        )}
        <p className="facility-hint">
          시설 전체가 보이는 사진을 최대 {MAX_FACILITY_PHOTOS}장 등록해 주세요. 최대 10MB, 등록 시 긴 변{" "}
          {PHOTO_MAX_EDGE}px로 자동 최적화됩니다.
        </p>
        {photos.length > 0 && (
          <ul className="facility-photo-list">
            {photos.map((photo, index) => (
              <li key={photo.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview */}
                <img src={photo.photo} alt={`시설 전경사진 ${index + 1}`} />
                <button type="button" className="facility-photo-remove" onClick={() => remove(photo.id)}>
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
        {busy && <p className="facility-hint">사진 최적화 중…</p>}
        {error && (
          <p className="facility-hint facility-photo-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

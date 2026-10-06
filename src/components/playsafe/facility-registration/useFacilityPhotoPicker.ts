"use client";

import { useState } from "react";
import { MAX_FACILITY_PHOTOS, MAX_PHOTO_BYTES, PHOTO_MAX_EDGE, PHOTO_QUALITY } from "@/data/playsafe/facility-registration";
import type { FacilityPhoto } from "@/data/playsafe/types";
import { compressImage, UnsupportedImageError } from "@/lib/playsafe/compressImage";

/** 선택한 사진을 압축해 남은 칸(최대 2장)만큼 추가한다. */
export function useFacilityPhotoPicker(photos: FacilityPhoto[], onChange: (photos: FacilityPhoto[]) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remaining = MAX_FACILITY_PHOTOS - photos.length;

  async function addFiles(files: File[]) {
    const accepted = files.slice(0, Math.max(0, remaining));
    if (accepted.some((file) => !file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES)) {
      setError("10MB 이하 이미지 파일을 선택해 주세요.");
      return;
    }
    setError(files.length > accepted.length ? `시설 전경사진은 최대 ${MAX_FACILITY_PHOTOS}장까지 등록됩니다.` : "");
    setBusy(true);
    try {
      const added = await Promise.all(
        accepted.map(async (file) => {
          const { dataUrl } = await compressImage(file, { maxEdge: PHOTO_MAX_EDGE, quality: PHOTO_QUALITY });
          return { id: crypto.randomUUID(), photo: dataUrl };
        }),
      );
      onChange([...photos, ...added]);
    } catch (cause) {
      setError(cause instanceof UnsupportedImageError ? cause.message : "사진을 읽지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const remove = (id: string) => {
    setError("");
    onChange(photos.filter((photo) => photo.id !== id));
  };

  return { busy, error, remaining, addFiles, remove };
}

"use client";

import { useState } from "react";
import { MAX_PHOTOS_PER_ITEM } from "@/data/playsafe/checklist-photos";
import type { CheckPhoto } from "@/data/playsafe/types";
import { CheckPhotoError, prepareCheckPhoto } from "@/lib/playsafe/prepareCheckPhoto";

export function useCheckPhotoUpload(currentCount: number, onAdd: (photo: CheckPhoto) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (files: File[]) => {
    const room = MAX_PHOTOS_PER_ITEM - currentCount;
    const accepted = files.slice(0, Math.max(0, room));
    const skipped = files.length - accepted.length;
    setError(skipped > 0 ? `사진은 항목당 최대 ${MAX_PHOTOS_PER_ITEM}장까지 등록됩니다.` : "");
    if (accepted.length === 0) return;

    setBusy(true);
    try {
      for (const file of accepted) {
        try {
          onAdd(await prepareCheckPhoto(file));
        } catch (cause) {
          setError(cause instanceof CheckPhotoError ? cause.message : "사진을 읽지 못했습니다.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return { busy, error, upload };
}

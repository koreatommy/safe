"use client";

import { useEffect, useState } from "react";
import type { CheckPhoto } from "@/data/playsafe/types";
import { checklistPhotoStore } from "@/lib/playsafe/photoStore";

/** Resolves stored photo Blobs to object URLs, revoking them when the photo set changes. */
export function useCheckPhotoPreviews(photos: CheckPhoto[]): Record<string, string> {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const key = photos.map((p) => p.id).join(",");

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    const ids = key ? key.split(",") : [];

    void Promise.all(ids.map(async (id) => [id, await checklistPhotoStore.get(id).catch(() => undefined)] as const)).then(
      (entries) => {
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const [id, blob] of entries) {
          if (!blob) continue;
          next[id] = URL.createObjectURL(blob);
          created.push(next[id]);
        }
        setUrls(next);
      },
    );

    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [key]);

  return urls;
}

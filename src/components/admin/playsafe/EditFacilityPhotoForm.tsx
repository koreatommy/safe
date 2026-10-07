"use client";

import { useRef } from "react";
import { MAX_FACILITY_PHOTOS } from "@/data/playsafe/facility-registration";
import type { EditPhoto } from "@/lib/playsafe-workflow/client/adminEditDraft";

type EditFacilityPhotoFormProps = {
  photos: EditPhoto[];
  disabled: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
};

export function EditFacilityPhotoForm({ photos, disabled, onAdd, onRemove }: EditFacilityPhotoFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_FACILITY_PHOTOS - photos.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-white/55 text-xs">
          시설 전경사진 ({photos.length}/{MAX_FACILITY_PHOTOS})
        </p>
        <button
          type="button"
          disabled={disabled || remaining <= 0}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-[#00ff88]/40 bg-[#00ff88]/10 px-3 py-1.5 text-xs text-[#00ff88] hover:bg-[#00ff88]/20 disabled:opacity-40"
        >
          사진 추가
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = "";
            if (files.length > 0) onAdd(files);
          }}
        />
      </div>
      {photos.length === 0 ? (
        <p className="text-sm text-white/45">등록된 전경사진이 없습니다.</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <li key={photo.id} className="space-y-1">
              {photo.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- 서명 URL 또는 브라우저 미리보기라 next/image 대상이 아니다
                <img src={photo.previewUrl} alt={`시설 전경사진 ${index + 1}`} className="h-24 w-24 rounded-lg border border-white/10 object-cover" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-lg border border-white/10 bg-white/5 text-[11px] text-white/40">
                  저장된 사진
                </div>
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemove(photo.id)}
                className="block w-full rounded-md border border-white/15 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10 disabled:opacity-40"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

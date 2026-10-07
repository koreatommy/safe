"use client";

import { useRef } from "react";
import { playTypes } from "@/data/playsafe/play-types";
import { MAX_MEMO_LENGTH } from "@/lib/playsafe-workflow/constants";
import type { EditEquipmentRow } from "@/lib/playsafe-workflow/client/adminEditDraft";
import { MAX_ADMIN_EQUIPMENT } from "@/lib/playsafe-workflow/validation/adminUpdate";
import { EditField, editControlClass } from "./EditField";

type EditEquipmentFormProps = {
  rows: EditEquipmentRow[];
  disabled: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<Pick<EditEquipmentRow, "typeCode" | "date" | "memo">>) => void;
  onPickPhoto: (id: string, file: File) => void;
  onClearPhoto: (id: string) => void;
};

function EquipmentPhotoField({
  row,
  disabled,
  onPickPhoto,
  onClearPhoto,
}: {
  row: EditEquipmentRow;
  disabled: boolean;
  onPickPhoto: (file: File) => void;
  onClearPhoto: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = row.photo.kind === "none" ? null : row.photo.previewUrl;

  return (
    <div className="flex items-center gap-3">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 서명 URL 또는 브라우저 미리보기라 next/image 대상이 아니다
        <img src={previewUrl} alt="" className="h-16 w-16 rounded-lg border border-white/10 object-cover" />
      ) : (
        <div className="grid h-16 w-16 place-items-center rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/40">
          {row.photo.kind === "keep" ? "저장된 사진" : "사진 없음"}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:opacity-40"
        >
          {previewUrl || row.photo.kind === "keep" ? "사진 변경" : "사진 추가"}
        </button>
        {row.photo.kind !== "none" ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onClearPhoto}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 disabled:opacity-40"
          >
            사진 삭제
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onPickPhoto(file);
        }}
      />
    </div>
  );
}

export function EditEquipmentForm({ rows, disabled, onAdd, onRemove, onChange, onPickPhoto, onClearPhoto }: EditEquipmentFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-white/55">기구정보 ({rows.length}대)</p>
        <button
          type="button"
          disabled={disabled || rows.length >= MAX_ADMIN_EQUIPMENT}
          onClick={onAdd}
          className="rounded-lg border border-[#00ff88]/40 bg-[#00ff88]/10 px-3 py-1.5 text-xs text-[#00ff88] hover:bg-[#00ff88]/20 disabled:opacity-40"
        >
          기구 추가
        </button>
      </div>
      {rows.length === 0 ? <p className="text-sm text-white/45">등록된 기구가 없습니다.</p> : null}
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li key={row.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-white/80">{index + 1}번 기구</p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemove(row.id)}
                className="text-xs text-red-300 hover:text-red-200 disabled:opacity-40"
              >
                기구 삭제
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EditField label="기구 유형">
                <select
                  className={editControlClass}
                  value={row.typeCode}
                  onChange={(event) => onChange(row.id, { typeCode: event.target.value })}
                >
                  {playTypes.map((type) => (
                    <option key={type.slug} value={type.slug}>
                      {type.title}
                    </option>
                  ))}
                  {playTypes.some((type) => type.slug === row.typeCode) ? null : (
                    <option value={row.typeCode}>{row.typeCode}</option>
                  )}
                </select>
              </EditField>
              <EditField label="설치일자">
                <input
                  type="date"
                  className={editControlClass}
                  value={row.date}
                  onChange={(event) => onChange(row.id, { date: event.target.value })}
                />
              </EditField>
              <EditField label="메모" className="sm:col-span-2">
                <textarea
                  maxLength={MAX_MEMO_LENGTH}
                  rows={2}
                  className={editControlClass}
                  value={row.memo}
                  onChange={(event) => onChange(row.id, { memo: event.target.value })}
                />
              </EditField>
            </div>
            <EquipmentPhotoField
              row={row}
              disabled={disabled}
              onPickPhoto={(file) => onPickPhoto(row.id, file)}
              onClearPhoto={() => onClearPhoto(row.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

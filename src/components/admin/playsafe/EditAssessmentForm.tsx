"use client";

import { useRef } from "react";
import { checkItems, selectableStatuses } from "@/data/playsafe/checks";
import { MAX_PHOTOS_PER_ITEM } from "@/lib/playsafe-workflow/constants";
import type { EditAssessment, EditPhoto } from "@/lib/playsafe-workflow/client/adminEditDraft";
import { toAnswerStatus, toCheckLabel } from "@/lib/playsafe-workflow/statusLabels";
import type { AnswerStatus } from "@/lib/playsafe-workflow/types";
import { EditField, editControlClass } from "./EditField";

type EditAssessmentFormProps = {
  assessment: EditAssessment;
  disabled: boolean;
  onAssessor: (value: string) => void;
  onEvalDate: (value: string) => void;
  onStatus: (itemCode: string, status: AnswerStatus) => void;
  onMemo: (itemCode: string, memo: string) => void;
  onAddPhotos: (itemCode: string, files: File[]) => void;
  onRemovePhoto: (itemCode: string, photoId: string) => void;
};

const categories = [...new Set(checkItems.map((item) => item.category))];

function statusOptions(current: AnswerStatus): AnswerStatus[] {
  const choices = selectableStatuses.map((label) => toAnswerStatus(label));
  return choices.includes(current) ? choices : [current, ...choices];
}

function RiskPhotos({
  itemCode,
  photos,
  disabled,
  onAddPhotos,
  onRemovePhoto,
}: {
  itemCode: string;
  photos: EditPhoto[];
  disabled: boolean;
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (photoId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-white/50">
          위험요소 사진 ({photos.length}/{MAX_PHOTOS_PER_ITEM})
        </span>
        <button
          type="button"
          disabled={disabled || photos.length >= MAX_PHOTOS_PER_ITEM}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-white/20 px-2 py-1 text-[11px] text-white/75 hover:bg-white/10 disabled:opacity-40"
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
            if (files.length > 0) onAddPhotos(files);
          }}
        />
      </div>
      {photos.length === 0 ? <p className="text-[11px] text-white/40">첨부된 사진이 없습니다.</p> : null}
      <ul className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <li key={photo.id} className="space-y-1">
            {photo.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 서명 URL 또는 브라우저 미리보기라 next/image 대상이 아니다
              <img src={photo.previewUrl} alt={`위험요소 사진 ${index + 1}`} className="h-16 w-16 rounded-lg border border-white/10 object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/40">
                저장된 사진
              </div>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemovePhoto(photo.id)}
              className="block w-full rounded-md border border-white/15 px-1 py-0.5 text-[10px] text-white/65 hover:bg-white/10 disabled:opacity-40"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EditAssessmentForm({
  assessment,
  disabled,
  onAssessor,
  onEvalDate,
  onStatus,
  onMemo,
  onAddPhotos,
  onRemovePhoto,
}: EditAssessmentFormProps) {
  const byCode = new Map(assessment.answers.map((answer) => [answer.itemCode, answer]));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <EditField label="평가자">
          <input className={editControlClass} value={assessment.assessor} onChange={(event) => onAssessor(event.target.value)} />
        </EditField>
        <EditField label="평가일">
          <input type="date" className={editControlClass} value={assessment.evalDate} onChange={(event) => onEvalDate(event.target.value)} />
        </EditField>
      </div>
      {categories.map((category) => (
        <div key={category} className="space-y-2">
          <p className="text-xs font-medium text-white/50">{category}</p>
          <ul className="space-y-2">
            {checkItems
              .filter((item) => item.category === category)
              .map((item) => {
                const answer = byCode.get(item.code);
                if (!answer) return null;
                return (
                  <li key={item.code} className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-sm text-white/85">{item.label}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <EditField label="결과">
                        <select
                          className={editControlClass}
                          value={answer.status}
                          onChange={(event) => onStatus(item.code, event.target.value as AnswerStatus)}
                        >
                          {statusOptions(answer.status).map((status) => (
                            <option key={status} value={status}>
                              {toCheckLabel(status)}
                            </option>
                          ))}
                        </select>
                      </EditField>
                      <EditField label="조치 메모">
                        <input className={editControlClass} value={answer.memo} onChange={(event) => onMemo(item.code, event.target.value)} />
                      </EditField>
                    </div>
                    {answer.status === "risk_found" ? (
                      <RiskPhotos
                        itemCode={item.code}
                        photos={answer.photos}
                        disabled={disabled}
                        onAddPhotos={(files) => onAddPhotos(item.code, files)}
                        onRemovePhoto={(photoId) => onRemovePhoto(item.code, photoId)}
                      />
                    ) : null}
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </div>
  );
}

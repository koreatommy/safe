import { MAX_EQUIPMENT_QUANTITY, MAX_MEMO_LENGTH } from "@/data/playsafe/facility-registration";
import type { EquipmentDraft, EquipmentDraftChange, EquipmentDraftPhotoChange } from "@/data/playsafe/types";
import { EquipmentPhotoField } from "./EquipmentPhotoField";

const quantityOptions = Array.from({ length: MAX_EQUIPMENT_QUANTITY }, (_, index) => index + 1);

type EquipmentDraftFieldsProps = {
  drafts: readonly EquipmentDraft[];
  onChange: EquipmentDraftChange;
  onChangePhoto: EquipmentDraftPhotoChange;
};

export function EquipmentDraftFields({ drafts, onChange, onChangePhoto }: EquipmentDraftFieldsProps) {
  if (drafts.length === 0) {
    return <p className="facility-draft-empty">위에서 기구유형을 선택하면 유형별 입력란이 표시됩니다.</p>;
  }

  return (
    <div className="facility-drafts">
      {drafts.map((draft) => (
        <section key={draft.type} className="facility-draft">
          <h4>{draft.type} · 개별 기구정보</h4>
          <div className="facility-grid">
            <label className="facility-field">
              등록수량
              <select
                value={draft.quantity}
                onChange={(event) =>
                  onChange(draft.type, "quantity", event.target.value === "" ? "" : Number(event.target.value))
                }
              >
                <option value="">미입력 (기본 1개)</option>
                {quantityOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <p className="facility-hint">
                선택사항입니다. 미입력 시 이 유형은 1개로 등록됩니다. 유형당 최대 {MAX_EQUIPMENT_QUANTITY}개이며, 수량만큼 기구사진
                칸이 표시됩니다.
              </p>
            </label>
            <label className="facility-field">
              설치일자
              <input type="date" value={draft.date} onChange={(event) => onChange(draft.type, "date", event.target.value)} />
            </label>
            <label className="facility-field facility-field-full">
              메모
              <textarea
                maxLength={MAX_MEMO_LENGTH}
                value={draft.memo}
                placeholder="이 기구유형의 참고사항을 입력하세요."
                onChange={(event) => onChange(draft.type, "memo", event.target.value)}
              />
              <p className="facility-hint">
                {draft.memo.length}/{MAX_MEMO_LENGTH}자
              </p>
            </label>
            <EquipmentPhotoField draft={draft} onChangePhoto={onChangePhoto} />
          </div>
        </section>
      ))}
    </div>
  );
}

import { PHOTO_MAX_EDGE } from "@/data/playsafe/facility-registration";
import type { EquipmentDraft, EquipmentDraftPhotoChange } from "@/data/playsafe/types";
import { EquipmentPhotoSlot } from "./EquipmentPhotoSlot";
import "./equipment-photo-slots.css";

type EquipmentPhotoFieldProps = {
  draft: EquipmentDraft;
  onChangePhoto: EquipmentDraftPhotoChange;
};

/** 등록수량만큼 사진 칸을 보여주고, 칸 순서대로 개별 기구에 사진이 붙는다. */
export function EquipmentPhotoField({ draft, onChangePhoto }: EquipmentPhotoFieldProps) {
  const filled = draft.photos.filter((slot) => slot.photo).length;

  return (
    <div className="facility-field facility-field-full">
      <span>
        기구사진등록 ({filled}/{draft.photos.length})
      </span>
      <div className="facility-photo">
        <p className="facility-hint">
          등록수량에 맞춰 기구별 사진 칸이 표시됩니다. 각 기구의 실제 사진을 등록해 주세요. 최대 10MB, 등록 시 긴 변{" "}
          {PHOTO_MAX_EDGE}px로 자동 최적화됩니다.
        </p>
        <ul className="equipment-photo-slots">
          {draft.photos.map((slot, index) => (
            <EquipmentPhotoSlot
              key={index}
              label={`${index + 1}번 기구`}
              slot={slot}
              onPatch={(patch) => onChangePhoto(draft.type, index, patch)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

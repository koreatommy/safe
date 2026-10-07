import Image from "next/image";
import { MAX_EQUIPMENT_QUANTITY, MAX_EQUIPMENT_TYPES } from "@/data/playsafe/facility-registration";
import { playTypes } from "@/data/playsafe/play-types";
import { imagePath } from "@/lib/playsafe/assets";

type EquipmentTypePickerProps = {
  selectedTypes: readonly string[];
  onToggle: (type: string, checked: boolean) => boolean;
  onLimit: () => void;
};

export function EquipmentTypePicker({ selectedTypes, onToggle, onLimit }: EquipmentTypePickerProps) {
  return (
    <fieldset className="facility-type-picker">
      <legend>기구유형</legend>
      <p className="facility-hint">
        예시 사진과 설명을 참고해 기구유형을 여러 개 선택할 수 있습니다. 선택한 유형별로 등록수량과 정보를
        입력합니다. 유형은 최대 {MAX_EQUIPMENT_TYPES}개, 유형별 등록수량은 최대 {MAX_EQUIPMENT_QUANTITY}개입니다.
      </p>
      <div className="facility-type-grid">
        {playTypes.map((type, index) => {
          const checked = selectedTypes.includes(type.title);
          const separate = type.group === "unregistered";
          return (
            <label
              key={type.slug}
              className={`facility-type-card${checked ? " selected" : ""}${separate ? " separate" : ""}`}
            >
              <input
                type="checkbox"
                name="equipmentTypeChoice"
                value={type.title}
                checked={checked}
                onChange={(event) => {
                  if (event.target.checked && selectedTypes.length >= MAX_EQUIPMENT_TYPES) {
                    onLimit();
                    return;
                  }
                  onToggle(type.title, event.target.checked);
                }}
              />
              <span className="facility-type-heading">
                <strong>
                  {index + 1}. {type.title}
                  {separate ? <span className="facility-type-badge">별도관리</span> : null}
                </strong>
                <span className="facility-type-check" aria-hidden="true">
                  ✓
                </span>
              </span>
              <span className="facility-type-photos">
                {[1, 2].map((n) => (
                  <Image
                    key={n}
                    src={imagePath(`type-${type.slug}-${n}`)}
                    alt={`${type.title} 예시 ${n}`}
                    width={218}
                    height={164}
                    sizes="(max-width: 720px) 40vw, 180px"
                  />
                ))}
              </span>
              <span className="facility-type-desc">{type.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

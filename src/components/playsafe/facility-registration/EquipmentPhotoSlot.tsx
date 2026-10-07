import type { EquipmentDraftPhoto } from "@/data/playsafe/types";
import { prepareEquipmentPhoto } from "@/lib/playsafe/prepareEquipmentPhoto";
import { PhotoSourceButtons } from "../shared/PhotoSourceButtons";

type EquipmentPhotoSlotProps = {
  label: string;
  slot: EquipmentDraftPhoto;
  onPatch: (patch: Partial<EquipmentDraftPhoto>) => void;
};

function slotStatus(slot: EquipmentDraftPhoto) {
  if (slot.busy) return "사진 최적화 중…";
  if (slot.error) return slot.error;
  if (slot.name) return slot.name;
  return "사진 미등록";
}

export function EquipmentPhotoSlot({ label, slot, onPatch }: EquipmentPhotoSlotProps) {
  async function handleFile(file: File) {
    onPatch({ busy: true, error: "" });
    try {
      onPatch({ ...(await prepareEquipmentPhoto(file)), busy: false });
    } catch (cause) {
      onPatch({ busy: false, error: cause instanceof Error ? cause.message : "사진을 읽지 못했습니다." });
    }
  }

  return (
    <li className={`equipment-photo-slot${slot.photo ? " filled" : ""}`}>
      <strong className="equipment-photo-slot-label">{label}</strong>
      {slot.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL preview
        <img className="facility-photo-preview" src={slot.photo} alt={`${label} 기구사진 미리보기`} />
      ) : null}
      <PhotoSourceButtons disabled={slot.busy} onFiles={([file]) => void handleFile(file)} />
      <p className="facility-hint equipment-photo-slot-status" role={slot.error ? "alert" : undefined}>
        {slotStatus(slot)}
      </p>
      {(slot.photo || slot.error) && !slot.busy && (
        <button type="button" className="btn" onClick={() => onPatch({ photo: "", name: "", error: "" })}>
          사진 삭제
        </button>
      )}
    </li>
  );
}

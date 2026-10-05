import { MAX_PHOTO_BYTES, PHOTO_MAX_EDGE, PHOTO_QUALITY } from "@/data/playsafe/facility-registration";
import type { EquipmentDraft } from "@/data/playsafe/types";
import { compressImage, UnsupportedImageError } from "@/lib/playsafe/compressImage";
import { formatBytes } from "@/lib/playsafe/formatBytes";
import { PhotoSourceButtons } from "../shared/PhotoSourceButtons";

type EquipmentPhotoFieldProps = {
  draft: EquipmentDraft;
  onChange: <K extends keyof EquipmentDraft>(type: string, field: K, value: EquipmentDraft[K]) => void;
};

function photoStatus(draft: EquipmentDraft) {
  if (draft.photoBusy) return "사진 최적화 중…";
  if (draft.photoError) return draft.photoError;
  if (draft.photoName) return draft.photoName;
  return "사진 미등록";
}

export function EquipmentPhotoField({ draft, onChange }: EquipmentPhotoFieldProps) {
  const set = <K extends keyof EquipmentDraft>(field: K, value: EquipmentDraft[K]) => onChange(draft.type, field, value);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES) {
      set("photoError", "10MB 이하 이미지 파일을 선택해 주세요.");
      set("photoBusy", false);
      return;
    }
    set("photoError", "");
    set("photoBusy", true);
    try {
      const { dataUrl, bytes } = await compressImage(file, { maxEdge: PHOTO_MAX_EDGE, quality: PHOTO_QUALITY });
      set("photo", dataUrl);
      set("photoName", `${file.name} (${formatBytes(file.size)} → ${formatBytes(bytes)})`);
    } catch (cause) {
      set("photoError", cause instanceof UnsupportedImageError ? cause.message : "사진을 읽지 못했습니다.");
    } finally {
      set("photoBusy", false);
    }
  }

  function clearPhoto() {
    set("photo", "");
    set("photoName", "");
    set("photoError", "");
    set("photoBusy", false);
  }

  return (
    <div className="facility-field facility-field-full">
      <span>기구사진등록</span>
      <div className="facility-photo">
        <PhotoSourceButtons disabled={draft.photoBusy} onFiles={([file]) => void handleFile(file)} />
        <p className="facility-hint">
          이 유형의 실제 기구사진을 등록해 주세요. 최대 10MB, 등록 시 긴 변 {PHOTO_MAX_EDGE}px로 자동 최적화됩니다.
        </p>
        {draft.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL preview
          <img className="facility-photo-preview" src={draft.photo} alt="개별 기구사진 미리보기" />
        ) : null}
        <p className="facility-hint">{photoStatus(draft)}</p>
        {(draft.photo || draft.photoError) && !draft.photoBusy && (
          <button type="button" className="btn" onClick={clearPhoto}>
            사진 삭제
          </button>
        )}
      </div>
    </div>
  );
}

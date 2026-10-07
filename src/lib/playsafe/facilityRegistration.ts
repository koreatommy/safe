import { MAX_EQUIPMENT_QUANTITY, NOT_ELIGIBLE_MESSAGE } from "@/data/playsafe/facility-registration";
import type { EquipmentDraft, EquipmentRow, FacilityManagerInfo, RegistrationProblem } from "@/data/playsafe/types";
import { resizeDraftPhotos } from "./equipmentDraftPhotos";

export function registrationProblem(
  information: FacilityManagerInfo,
  allEligible: boolean,
  equipment: readonly EquipmentRow[],
): RegistrationProblem | null {
  if (!information.facilityName.trim()) return { message: "시설명을 입력해 주세요.", step: "step1" };
  if (!allEligible) return { message: NOT_ELIGIBLE_MESSAGE, step: "step2" };
  if (equipment.length === 0) return { message: "놀이기구를 1개 이상 등록해 주세요.", step: "step3" };
  return null;
}

export function registrationQuantity(value: EquipmentDraft["quantity"]): number {
  return value === "" ? 1 : Number(value);
}

export function totalQuantity(records: readonly EquipmentDraft[]): number {
  return records.reduce((sum, record) => sum + registrationQuantity(record.quantity), 0);
}

export function validateDrafts(records: readonly EquipmentDraft[]): string {
  if (
    records.some((record) => {
      const quantity = registrationQuantity(record.quantity);
      return !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_EQUIPMENT_QUANTITY;
    })
  ) {
    return `각 유형의 등록수량은 1~${MAX_EQUIPMENT_QUANTITY}개여야 합니다.`;
  }

  const photos = records.flatMap((record) => record.photos);
  if (photos.some((slot) => slot.busy)) {
    return "사진을 불러오는 중입니다. 완료 후 확인해 주세요.";
  }

  if (photos.some((slot) => slot.error)) {
    return "사진 오류가 있는 기구의 사진을 다시 선택하거나 삭제해 주세요.";
  }

  return "";
}

/** 사진 칸 수로 쓸 수 있도록 1~최대 수량 범위로 맞춘 등록수량. */
export function photoSlotCount(value: EquipmentDraft["quantity"]): number {
  const quantity = registrationQuantity(value);
  return Number.isInteger(quantity) ? Math.min(Math.max(quantity, 1), MAX_EQUIPMENT_QUANTITY) : 1;
}

export function createEquipmentDraft(type: string): EquipmentDraft {
  return {
    type,
    quantity: "",
    date: "",
    memo: "",
    photos: resizeDraftPhotos([], 1),
  };
}

export function buildRows(records: readonly EquipmentDraft[]): EquipmentRow[] {
  const rows: EquipmentRow[] = [];

  for (const record of records) {
    const count = registrationQuantity(record.quantity);
    for (let index = 0; index < count; index += 1) {
      rows.push({
        id: crypto.randomUUID(),
        type: record.type,
        date: record.date,
        memo: record.memo,
        photo: record.photos[index]?.photo ?? "",
      });
    }
  }

  return rows;
}

export function buildExportPayload(
  information: FacilityManagerInfo,
  answers: readonly string[],
  equipment: readonly EquipmentRow[],
) {
  return {
    information: {
      managerName: information.managerName,
      phone: information.phone,
      email: information.email,
      facilityName: information.facilityName,
      facilityNo: information.facilityNo,
      place: information.place,
      placeEtc: information.placeEtc,
      postcode: information.postcode,
      address: information.address,
      detailAddress: information.detailAddress,
      water: information.water,
      indoor: information.indoor,
    },
    answers: [...answers],
    equipment: equipment.map((row) => ({ ...row })),
  };
}

export function downloadRegistrationJson(payload: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "facility-registration.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import type { AdminRegistrationDetail } from "@/lib/playsafe-workflow/adminTypes";

type EquipmentRow = AdminRegistrationDetail["registration"]["equipment"][number];

export type EquipmentUnit = EquipmentRow & { number: number };

export type EquipmentGroup = {
  key: string;
  type: string;
  typeCode: string;
  date: string;
  memo: string;
  units: EquipmentUnit[];
};

/** 등록수량 N은 같은 내용의 연속된 행 N개로 저장되므로, 연속 구간을 한 묶음으로 되돌린다. */
export function groupEquipment(rows: readonly EquipmentRow[]): EquipmentGroup[] {
  const groups: EquipmentGroup[] = [];
  rows.forEach((row, index) => {
    const unit = { ...row, number: index + 1 };
    const last = groups.at(-1);
    if (last && last.typeCode === row.typeCode && last.type === row.type && last.date === row.date && last.memo === row.memo) {
      last.units.push(unit);
      return;
    }
    groups.push({ key: row.id, type: row.type, typeCode: row.typeCode, date: row.date, memo: row.memo, units: [unit] });
  });
  return groups;
}

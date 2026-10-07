import { AttachmentPreview } from "@/components/admin/AttachmentPreview";
import { isUnregisteredTypeCode } from "@/data/playsafe/play-types";
import type { AdminRegistrationDetail } from "@/lib/playsafe-workflow/adminTypes";
import { DetailSection } from "./DetailSection";
import { orDash } from "./format";
import { groupEquipment, type EquipmentUnit } from "./groupEquipment";

type Equipment = AdminRegistrationDetail["registration"]["equipment"];

function UnitThumb({ unit }: { unit: EquipmentUnit }) {
  return (
    <li className="flex flex-col items-center gap-1">
      {unit.photoUrl ? (
        <AttachmentPreview name={`equipment-${unit.number}.jpg`} url={unit.photoUrl} thumbUrl={unit.photoThumbUrl} />
      ) : (
        <div className="w-16 h-16 shrink-0 rounded-lg border border-white/10 bg-white/5 grid place-items-center text-[10px] text-white/40">
          사진 없음
        </div>
      )}
      <span className="text-[11px] text-white/50">{unit.number}번</span>
    </li>
  );
}

export function EquipmentSection({ equipment, closed }: { equipment: Equipment; closed: boolean }) {
  const groups = groupEquipment(equipment);

  return (
    <DetailSection title={`기구정보 (${equipment.length}대)`}>
      {equipment.length === 0 ? (
        <p className="text-white/50">
          {closed ? "판단 기준을 충족하지 않아 기구정보 없이 종결되었습니다." : "등록된 기구가 없습니다."}
        </p>
      ) : (
        <ul className="divide-y divide-white/10">
          {groups.map((group) => {
            const withPhoto = group.units.filter((unit) => unit.photoUrl).length;
            return (
              <li key={group.key} className="space-y-2 py-3 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="text-white font-medium">
                    {group.type} · {group.units.length}대
                    {isUnregisteredTypeCode(group.typeCode) ? (
                      <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] text-amber-300">
                        별도관리
                      </span>
                    ) : null}
                  </p>
                  <p className="text-white/60 text-xs">
                    설치일자 {orDash(group.date)} · 사진 {withPhoto}/{group.units.length}장
                  </p>
                  {group.memo ? (
                    <p className="text-white/70 text-xs whitespace-pre-wrap break-words">{group.memo}</p>
                  ) : null}
                </div>
                <ul className="flex flex-wrap gap-3">
                  {group.units.map((unit) => (
                    <UnitThumb key={unit.id} unit={unit} />
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </DetailSection>
  );
}

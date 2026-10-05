import { AttachmentPreview } from "@/components/admin/AttachmentPreview";
import type { AdminRegistrationDetail } from "@/lib/playsafe-workflow/adminTypes";
import { DetailSection } from "./DetailSection";
import { orDash } from "./format";

type Equipment = AdminRegistrationDetail["registration"]["equipment"];

export function EquipmentSection({ equipment, closed }: { equipment: Equipment; closed: boolean }) {
  return (
    <DetailSection title={`기구정보 (${equipment.length}대)`}>
      {equipment.length === 0 ? (
        <p className="text-white/50">
          {closed ? "판단 기준을 충족하지 않아 기구정보 없이 종결되었습니다." : "등록된 기구가 없습니다."}
        </p>
      ) : (
        <ul className="divide-y divide-white/10">
          {equipment.map((row, index) => (
            <li key={row.id} className="flex items-start gap-4 py-2 first:pt-0 last:pb-0">
              {row.photoUrl ? (
                <AttachmentPreview name={`equipment-${index + 1}.jpg`} url={row.photoUrl} thumbUrl={row.photoThumbUrl} />
              ) : (
                <div className="w-16 h-16 shrink-0 rounded-lg border border-white/10 bg-white/5 grid place-items-center text-[10px] text-white/40">
                  사진 없음
                </div>
              )}
              <div className="min-w-0 space-y-0.5">
                <p className="text-white font-medium">
                  {index + 1}. {row.type}
                </p>
                <p className="text-white/60 text-xs">설치일자 {orDash(row.date)}</p>
                {row.memo ? <p className="text-white/70 text-xs whitespace-pre-wrap break-words">{row.memo}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DetailSection>
  );
}

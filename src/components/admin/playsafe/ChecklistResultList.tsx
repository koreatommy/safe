import { checkItems } from "@/data/playsafe/checks";
import type { AssessmentView } from "@/lib/playsafe-workflow/adminTypes";
import { toCheckLabel } from "@/lib/playsafe-workflow/statusLabels";
import type { AnswerStatus } from "@/lib/playsafe-workflow/types";
import { DetailSection } from "./DetailSection";
import { RiskPhotoThumbnails } from "./RiskPhotoThumbnails";

const STATUS_TONES: Record<AnswerStatus, string> = {
  unrecorded: "bg-white/5 text-white/40",
  risk_found: "bg-red-500/15 text-red-200",
  no_risk: "bg-[#00ff88]/10 text-[#00ff88]",
  not_applicable: "bg-white/10 text-white/60",
};

export function ChecklistResultList({ assessment }: { assessment: AssessmentView }) {
  const answers = new Map(assessment.answers.map((answer) => [answer.itemCode, answer]));
  const categories = [...new Set(checkItems.map((item) => item.category))];

  return (
    <DetailSection title={`위험요소 체크리스트 (${checkItems.length}개 항목)`}>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category} className="space-y-2">
            <p className="text-white/50 text-xs font-medium">{category}</p>
            <ul className="space-y-2">
              {checkItems
                .filter((item) => item.category === category)
                .map((item) => {
                  const answer = answers.get(item.code);
                  const status = answer?.status ?? "unrecorded";
                  const photos = assessment.photos.filter((photo) => photo.itemCode === item.code);
                  return (
                    <li key={item.code} className="rounded-lg border border-white/10 bg-black/20 p-2.5 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/85">{item.label}</span>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${STATUS_TONES[status]}`}>
                          {toCheckLabel(status)}
                        </span>
                      </div>
                      {answer?.memo ? (
                        <p className="text-white/70 text-xs whitespace-pre-wrap break-words">조치 메모: {answer.memo}</p>
                      ) : null}
                      {status === "risk_found" ? <RiskPhotoThumbnails itemCode={item.code} photos={photos} /> : null}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}

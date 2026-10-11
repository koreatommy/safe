import type { RegistrationStatus } from "@/lib/playsafe-workflow/types";

export function AssessmentBadge({ status, assessed }: { status: RegistrationStatus; assessed: boolean }) {
  if (status === "not_target" && !assessed) return <span className="text-xs text-white/30">-</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
        assessed ? "border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88]" : "border-amber-400/40 bg-amber-400/10 text-amber-200"
      }`}
    >
      {assessed ? "완료" : "미실시"}
    </span>
  );
}

import type { RegistrationStatus } from "@/lib/playsafe-workflow/types";

export function TargetBadge({ status }: { status: RegistrationStatus }) {
  const target = status !== "not_target";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
        target ? "border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88]" : "border-white/20 bg-white/5 text-white/50"
      }`}
    >
      {target ? "대상" : "비대상"}
    </span>
  );
}

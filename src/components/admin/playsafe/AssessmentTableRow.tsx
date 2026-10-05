import type { KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { AdminAssessmentRow } from "@/lib/playsafe-workflow/adminTypes";
import { AssessmentResultPanel } from "./AssessmentResultPanel";
import { formatDateTime, orDash } from "./format";

type AssessmentTableRowProps = {
  no: number;
  row: AdminAssessmentRow;
  open: boolean;
  onToggle: () => void;
};

export const ASSESSMENT_COLUMN_COUNT = 8;

export function AssessmentTableRow({ no, row, open, onToggle }: AssessmentTableRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onToggle();
  };

  return (
    <>
      <tr
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className={`cursor-pointer border-b border-white/10 transition-colors focus:outline-none focus-visible:bg-white/[0.06] ${
          open ? "bg-[#00ff88]/[0.06]" : "hover:bg-white/[0.04]"
        }`}
      >
        <td className="px-3 py-3 text-center text-white/50 tabular-nums">{no}</td>
        <td className="px-3 py-3 text-white/70 tabular-nums">{orDash(row.facilityNo)}</td>
        <td className="px-3 py-3 text-white font-medium">
          <span className="flex items-center gap-2 min-w-0">
            <ChevronDown className={`w-4 h-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
            <span className="truncate">{row.facilityName}</span>
          </span>
        </td>
        <td className="px-3 py-3 text-white/70 truncate">{orDash(row.assessor)}</td>
        <td className="px-3 py-3 text-white/70 whitespace-nowrap tabular-nums">{orDash(row.evalDate)}</td>
        <td className="px-3 py-3 text-white/70 truncate">{orDash(row.submitterName)}</td>
        <td className="px-3 py-3 text-center">
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap ${
              row.riskItems ? "border-red-400/40 bg-red-500/10 text-red-200" : "border-white/15 bg-white/5 text-white/60"
            }`}
          >
            {row.riskItems}건
          </span>
        </td>
        <td className="px-3 py-3 text-white/60 whitespace-nowrap tabular-nums">{formatDateTime(row.submittedAt)}</td>
      </tr>
      {open && (
        <tr className="border-b border-white/10 bg-black/10">
          <td colSpan={ASSESSMENT_COLUMN_COUNT} className="p-4">
            <AssessmentResultPanel registrationId={row.registrationId} />
          </td>
        </tr>
      )}
    </>
  );
}

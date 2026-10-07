import type { KeyboardEvent } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import type { AdminRegistrationRow } from "@/lib/playsafe-workflow/adminTypes";
import { RegistrationDetailPanel } from "./RegistrationDetailPanel";
import { TargetBadge } from "./TargetBadge";
import { formatDateTime, orDash } from "./format";

type RegistrationTableRowProps = {
  no: number;
  row: AdminRegistrationRow;
  open: boolean;
  onToggle: () => void;
  onOpenAssessment: () => void;
  deleting: boolean;
  onDelete: () => void;
};

export const REGISTRATION_COLUMN_COUNT = 7;

export function RegistrationTableRow({
  no,
  row,
  open,
  onToggle,
  onOpenAssessment,
  deleting,
  onDelete,
}: RegistrationTableRowProps) {
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
        <td className="px-3 py-3 text-white/70 truncate">{orDash(row.address)}</td>
        <td className="px-3 py-3 text-center">
          <TargetBadge status={row.status} />
        </td>
        <td className="px-3 py-3 text-white/60 whitespace-nowrap tabular-nums">{formatDateTime(row.createdAt)}</td>
        <td className="px-3 py-3 text-center">
          <button
            type="button"
            disabled={deleting}
            aria-label={`${row.facilityName} 삭제`}
            title="삭제"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            onKeyDown={(event) => event.stopPropagation()}
            className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-white/10 bg-black/10">
          <td colSpan={REGISTRATION_COLUMN_COUNT} className="p-4">
            <RegistrationDetailPanel registrationId={row.id} onOpenAssessment={onOpenAssessment} />
          </td>
        </tr>
      )}
    </>
  );
}

import type { ReactNode } from "react";

export const editControlClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#00ff88]/70";

export function EditField({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block min-w-0 text-xs text-white/55 ${className}`}>
      {label}
      {children}
    </label>
  );
}

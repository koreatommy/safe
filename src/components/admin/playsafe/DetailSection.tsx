import type { ReactNode } from "react";

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-white/85">
        <span aria-hidden className="h-3.5 w-1 rounded-full bg-[#00ff88]/70" />
        {title}
      </h3>
      <div className="rounded-lg bg-white/5 border border-white/10 p-4">{children}</div>
    </section>
  );
}

export function InfoGrid({ items }: { items: ReadonlyArray<[string, string]> }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
      {items.map(([label, value]) => (
        <div key={label} className="flex gap-3 min-w-0">
          <dt className="w-28 shrink-0 text-white/50">{label}</dt>
          <dd className="min-w-0 break-words text-white/85">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

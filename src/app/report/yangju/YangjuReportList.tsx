import Link from "next/link";
import { ChevronRight, FileText, MapPin } from "lucide-react";
import { YANGJU_REPORTS } from "./yangju-reports";

export function YangjuReportList() {
  return (
    <section aria-labelledby="yangju-report-list-heading" className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#3772b8] uppercase">
            Reports
          </p>
          <h2
            className="yangju-report-list-section-title mt-1 text-[#1a2744]"
            id="yangju-report-list-heading"
          >
            보고서 바로가기
          </h2>
        </div>
        <p className="yangju-report-list-meta hidden text-[#6b7280] sm:block">
          전체 PDF 보고서를 바로 열어볼 수 있습니다.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {YANGJU_REPORTS.map((report, index) => (
        <li key={report.id}>
          <Link
            className="group flex h-full flex-col rounded-2xl border border-[#ebedf0] bg-white p-5 shadow-[0_2px_12px_rgba(26,39,68,0.06)] transition hover:-translate-y-0.5 hover:border-[#3772b8]/40 hover:shadow-[0_8px_24px_rgba(26,39,68,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3772b8]"
            href={report.href}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f0fa] text-[#3772b8] transition group-hover:bg-[#3772b8] group-hover:text-white">
                <FileText aria-hidden className="size-5" />
              </span>
              <div className="flex items-center gap-1.5">
                {report.isNew ? (
                  <span className="report-new-badge rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    New
                  </span>
                ) : null}
                <span className="rounded-full bg-[#1a2744] px-2.5 py-1 text-xs font-semibold text-white">
                  #{index + 1}
                </span>
              </div>
            </div>

            <p className="yangju-report-list-subtitle text-[#3772b8]">
              {report.subtitle}
            </p>
            <p className="yangju-report-list-title mt-1 text-[#1a2744] group-hover:text-[#3772b8]">
              {report.title}
            </p>

            <div className="yangju-report-list-meta mt-4 flex items-center justify-between border-t border-[#ebedf0] pt-4 text-[#6b7280]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4 shrink-0" />
                양주시
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-[#3772b8] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                보고서 열기
                <ChevronRight aria-hidden className="size-4" />
              </span>
            </div>
          </Link>
        </li>
      ))}
      </ul>
    </section>
  );
}

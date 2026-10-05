import { GimpoRiskReportList } from "./GimpoRiskReportList";
import { GIMPO_RISK_REPORTS } from "./gimpo-risk-reports";

export default function GimpoRiskReportsPage() {
  return (
    <div className="gimpo-risk-reports relative min-h-screen bg-[#f7f8fa]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#e8f0fa] to-transparent"
      />

      <main className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2744] via-[#2d3f5e] to-[#3772b8] px-6 py-8 text-white shadow-[0_8px_32px_rgba(26,39,68,0.2)] sm:px-8 sm:py-10">
          <p className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
            Gimpo · Safety Assessment
          </p>
          <h1 className="gimpo-risk-reports-hero-title mt-3">
            김포시 신종유사놀이시설 안전성 평가 보고서
          </h1>
          <p className="gimpo-risk-reports-hero-desc mt-3 max-w-xl text-white/85">
            김포시 신종·유사 어린이놀이시설 대상 안전성 평가 결과를 시설별로
            확인할 수 있습니다. 카드를 선택하면 전체 보고서가 열립니다.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <dt className="text-[11px] text-white/55">등록 보고서</dt>
              <dd className="mt-0.5 text-xl font-bold">{GIMPO_RISK_REPORTS.length}건</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <dt className="text-[11px] text-white/55">지역</dt>
              <dd className="mt-0.5 text-xl font-bold">김포시</dd>
            </div>
          </dl>
        </header>

        <GimpoRiskReportList />

        <footer className="mt-10 text-center text-xs text-[#6b7280]">
          보고서는 인쇄·PDF 저장이 가능한 독립 HTML 형식으로 제공됩니다.
        </footer>
      </main>
    </div>
  );
}

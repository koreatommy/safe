"use client";

import Link from "next/link";
import { Chart, registerables, type ChartConfiguration } from "chart.js";
import {
  BarChart3,
  ChevronRight,
  Droplets,
  FileBarChart2,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import {
  YANGJU_COMBINED_JUDGMENT,
  YANGJU_REPORT_SUMMARIES,
  YANGJU_TOTAL_FACILITIES,
  type YangjuReportSummary,
} from "./yangju-summary-data";

Chart.register(...registerables);

const CHART_FONT = "'Noto Sans KR', system-ui, sans-serif";

const COLORS = {
  navy: "#1a2744",
  blue: "#3772b8",
  blueLight: "#5a8fd4",
  green: "#2e7d32",
  caution: "#f9a825",
  repair: "#c62828",
  slate: "#6b7280",
};

const REPORT_ICONS: Record<string, LucideIcon> = {
  "school-opening": GraduationCap,
  "water-play202606": Droplets,
  report2: FileBarChart2,
};

const REPORT_ACCENT: Record<string, string> = {
  "school-opening": "border-l-[#3772b8] bg-[#f4f8fd]",
  "water-play202606": "border-l-[#5a8fd4] bg-[#f3f9fc]",
  report2: "border-l-[#1a2744] bg-[#f6f7fa]",
};

function useChart(
  configFactory: () => ChartConfiguration | null,
  deps: unknown[],
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = configFactory();
    if (!config) return;

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvas, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}

function chartBaseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    font: { family: CHART_FONT },
  } as const;
}

function chartYMax(values: number[]) {
  const peak = Math.max(...values, 1);
  if (peak <= 25) return 25;
  if (peak <= 50) return 50;
  return Math.ceil(peak / 20) * 20;
}

function StatCard({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "good" | "caution" | "repair" | "alert";
}) {
  const styles = {
    default: {
      value: "text-[#1a2744]",
      wrap: "bg-white/80 border-[#e2e8f0]",
      dot: "bg-[#3772b8]",
    },
    good: {
      value: "text-[#2e7d32]",
      wrap: "bg-[#f1faf2] border-[#c8e6c9]",
      dot: "bg-[#2e7d32]",
    },
    caution: {
      value: "text-[#e65100]",
      wrap: "bg-[#fffbf0] border-[#ffe082]",
      dot: "bg-[#f9a825]",
    },
    repair: {
      value: "text-[#c62828]",
      wrap: "bg-[#fff5f5] border-[#ffcdd2]",
      dot: "bg-[#c62828]",
    },
    alert: {
      value: "text-[#c62828]",
      wrap: "bg-[#fff5f5] border-[#f5c6c6]",
      dot: "bg-[#c62828]",
    },
  }[tone];

  return (
    <div
      className={`flex min-h-[4.25rem] flex-col justify-center rounded-xl border px-3 py-2.5 sm:min-h-[4.75rem] sm:px-3.5 sm:py-3 ${styles.wrap}`}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${styles.dot}`} />
        <p className="yangju-summary-stat-label text-[#6b7280]">{label}</p>
      </div>
      <p className={`yangju-summary-stat-value ${styles.value}`}>{value}</p>
    </div>
  );
}

function ReportSummaryCard({ report }: { report: YangjuReportSummary }) {
  const Icon = REPORT_ICONS[report.id] ?? BarChart3;
  const accent = REPORT_ACCENT[report.id] ?? "border-l-[#3772b8] bg-[#f8fafc]";

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8ecf2] border-l-4 shadow-[0_1px_8px_rgba(26,39,68,0.04)] ${accent}`}
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3772b8] shadow-sm ring-1 ring-[#e2e8f0]">
          <Icon aria-hidden className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#1a2744] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
              {report.shortLabel}
            </span>
          </div>
          <h3 className="yangju-summary-card-title mt-2 line-clamp-2 text-[#1a2744]">
            {report.title}
          </h3>
        </div>
      </div>

      <div className="mt-auto border-t border-[#e8ecf2]/80 bg-white/60 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        {report.judgment && !report.waterPlay ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <StatCard label="점검 대상" tone="default" value={report.judgment.total} />
            <StatCard label="양호" tone="good" value={report.judgment.good} />
            <StatCard label="요주의" tone="caution" value={report.judgment.caution} />
            <StatCard label="요수리" tone="repair" value={report.judgment.repair} />
          </div>
        ) : null}

        {report.waterPlay ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <StatCard label="점검 시설" tone="default" value={report.waterPlay.facilities} />
            <StatCard label="지적사항" tone="alert" value={report.waterPlay.issues} />
            <StatCard label="시정완료" tone="default" value={report.waterPlay.corrected} />
            <StatCard label="조치예정" tone="good" value={report.waterPlay.scheduled} />
          </div>
        ) : null}

        <Link
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#d6e2f5] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#3772b8] transition hover:border-[#3772b8]/40 hover:bg-[#f4f8fd] sm:mt-4"
          href={report.href}
        >
          보고서 열기
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>
    </article>
  );
}

function ChartPanel({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#e8ecf2] bg-white shadow-[0_1px_8px_rgba(26,39,68,0.04)] ${className}`}
    >
      <div className="border-b border-[#eef1f5] bg-gradient-to-r from-[#f8fafc] to-white px-4 py-3.5 sm:px-5">
        <h3 className="yangju-summary-chart-title text-[#1a2744]">{title}</h3>
        <p className="yangju-summary-chart-desc mt-1 text-[#6b7280]">{description}</p>
      </div>
      <div className="overflow-hidden p-3 sm:p-4">{children}</div>
    </div>
  );
}

export function YangjuSummaryDashboard() {
  const facilityCounts = YANGJU_REPORT_SUMMARIES.map(
    (r) => r.judgment?.total ?? r.waterPlay?.facilities ?? 0,
  );
  const facilityYMax = chartYMax(facilityCounts);

  const facilitiesChartRef = useChart(
    () => ({
      type: "bar",
      data: {
        labels: YANGJU_REPORT_SUMMARIES.map((r) => r.shortLabel),
        datasets: [
          {
            label: "점검 대상 시설 (개소)",
            data: facilityCounts,
            backgroundColor: [COLORS.blue, COLORS.blueLight, COLORS.navy],
            borderRadius: 10,
            borderSkipped: false,
            maxBarThickness: 72,
          },
        ],
      },
      options: {
        ...chartBaseOptions(),
        plugins: {
          legend: { display: false },
          tooltip: {
            titleFont: { family: CHART_FONT, size: 13, weight: "bold" },
            bodyFont: { family: CHART_FONT, size: 12 },
            callbacks: { label: (ctx) => ` ${ctx.parsed.y}개소` },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: CHART_FONT, size: 12, weight: 600 },
              color: COLORS.navy,
            },
          },
          y: {
            beginAtZero: true,
            max: facilityYMax,
            ticks: {
              stepSize: facilityYMax <= 25 ? 5 : facilityYMax <= 50 ? 10 : 20,
              color: COLORS.slate,
              font: { family: CHART_FONT, size: 11 },
            },
            grid: { color: "rgba(26,39,68,0.06)" },
          },
        },
      },
    }),
    [facilityYMax],
  );

  const judgmentChartRef = useChart(
    () => ({
      type: "doughnut",
      data: {
        labels: ["양호", "요주의", "요수리"],
        datasets: [
          {
            data: [
              YANGJU_COMBINED_JUDGMENT.good,
              YANGJU_COMBINED_JUDGMENT.caution,
              YANGJU_COMBINED_JUDGMENT.repair,
            ],
            backgroundColor: [COLORS.green, COLORS.caution, COLORS.repair],
            borderWidth: 3,
            borderColor: "#fff",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        ...chartBaseOptions(),
        cutout: "58%",
        layout: { padding: { top: 4, bottom: 4 } },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 12,
              usePointStyle: true,
              pointStyle: "circle",
              font: { family: CHART_FONT, size: 11 },
              color: COLORS.navy,
            },
          },
          tooltip: {
            titleFont: { family: CHART_FONT, size: 13, weight: "bold" },
            bodyFont: { family: CHART_FONT, size: 12 },
            callbacks: {
              label: (ctx) => {
                const total = YANGJU_COMBINED_JUDGMENT.total;
                const value = ctx.parsed;
                const pct = total ? ((value / total) * 100).toFixed(1) : "0";
                return ` ${ctx.label}: ${value}개소 (${pct}%)`;
              },
            },
          },
        },
      },
    }),
    [YANGJU_COMBINED_JUDGMENT.good, YANGJU_COMBINED_JUDGMENT.caution, YANGJU_COMBINED_JUDGMENT.repair],
  );

  return (
    <section
      aria-labelledby="yangju-summary-heading"
      className="yangju-summary-dashboard mb-8 rounded-2xl border border-[#e3e8ef] bg-gradient-to-b from-white to-[#f8fafc] shadow-[0_4px_24px_rgba(26,39,68,0.07)] sm:mb-10"
    >
      <div className="border-b border-[#e8ecf2] bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <p className="yangju-summary-eyebrow uppercase text-[#3772b8]">종합 현황</p>
            <h2
              className="yangju-summary-title mt-1.5 text-[#1a2744]"
              id="yangju-summary-heading"
            >
              양주시 점검 보고서 통합 요약
            </h2>
            <p className="yangju-summary-desc mt-2 max-w-2xl text-[#6b7280]">
              3개 보고서의 점검 대상 시설 및 판정·지적 현황을 한눈에 확인할 수 있습니다.
            </p>
          </div>

          <div className="relative w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2744] via-[#2d3f5e] to-[#3772b8] text-white shadow-[0_8px_24px_rgba(26,39,68,0.22)] lg:w-[min(100%,26rem)] xl:w-[28rem]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative flex flex-col sm:flex-row sm:items-stretch">
              <div className="px-5 py-4 sm:flex sm:items-center sm:px-6 sm:py-5">
                <div>
                  <p className="yangju-summary-total-label text-white/75">
                    전체 점검 대상 시설 합계
                  </p>
                  <p className="yangju-summary-total-value mt-1 text-white">
                    {YANGJU_TOTAL_FACILITIES}
                    <span className="ml-1.5 text-base font-semibold text-white/90 sm:text-lg">
                      개소
                    </span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/15 border-t border-white/15 sm:flex sm:flex-1 sm:border-l sm:border-t-0">
                {YANGJU_REPORT_SUMMARIES.map((r) => (
                  <div
                    className="flex min-w-0 flex-col items-center justify-center px-3 py-3 text-center sm:px-4 sm:py-5"
                    key={r.id}
                  >
                    <p className="whitespace-nowrap text-[11px] text-white/65 sm:text-xs">
                      {r.shortLabel}
                    </p>
                    <p className="mt-1 text-base font-bold tabular-nums text-white sm:text-lg">
                      {r.judgment?.total ?? r.waterPlay?.facilities ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-6">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          <ChartPanel
            description="개학기 · 물놀이형 · 상반기 비교"
            title="보고서별 점검 시설 수"
          >
            <div className="relative h-48 sm:h-56 lg:h-60">
              <canvas aria-label="보고서별 점검 시설 수 차트" ref={facilitiesChartRef} />
            </div>
          </ChartPanel>

          <ChartPanel
            description={`총 ${YANGJU_COMBINED_JUDGMENT.total}개소 · 3개 보고서 통합`}
            title="종합 판정 분포 (전체)"
          >
            <div className="relative mx-auto h-52 max-w-sm sm:h-60 sm:max-w-md lg:h-64">
              <canvas aria-label="종합 판정 분포 차트" ref={judgmentChartRef} />
            </div>
          </ChartPanel>
        </div>

        <div className="grid items-stretch gap-4 sm:gap-5 lg:grid-cols-3">
          {YANGJU_REPORT_SUMMARIES.map((report) => (
            <ReportSummaryCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </section>
  );
}

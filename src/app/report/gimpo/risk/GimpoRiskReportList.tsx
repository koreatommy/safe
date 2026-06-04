"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, FileText, MapPin, Search, X } from "lucide-react";
import { GIMPO_RISK_REPORTS } from "./gimpo-risk-reports";

function normalizeQuery(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function GimpoRiskReportList() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return GIMPO_RISK_REPORTS;

    return GIMPO_RISK_REPORTS.filter((report) => {
      const haystack = normalizeQuery(
        `${report.facility} ${report.subtitle} ${report.keywords}`,
      );
      return haystack.includes(q);
    });
  }, [query]);

  const hasQuery = normalizeQuery(query).length > 0;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#6b7280]"
        />
        <input
          aria-label="시설명으로 보고서 검색"
          className="w-full rounded-xl border border-[#d1d5db] bg-white py-3.5 pl-12 pr-12 text-[15px] text-[#111827] shadow-sm outline-none transition placeholder:text-[#9ca3af] focus:border-[#3772b8] focus:ring-2 focus:ring-[#3772b8]/25"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="시설명으로 검색 (예: 플레이맘, 키즈풀)"
          type="search"
          value={query}
        />
        {hasQuery ? (
          <button
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#6b7280] transition hover:bg-[#ebedf0] hover:text-[#374151]"
            onClick={() => setQuery("")}
            type="button"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <p className="text-sm text-[#6b7280]">
        {hasQuery ? (
          <>
            검색 결과{" "}
            <span className="font-semibold text-[#1a2744]">{filtered.length}</span>
            건 / 전체 {GIMPO_RISK_REPORTS.length}건
          </>
        ) : (
          <>총 {GIMPO_RISK_REPORTS.length}개 시설 보고서</>
        )}
      </p>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed border-[#d1d5db] bg-white px-6 py-14 text-center"
          role="status"
        >
          <p className="text-base font-medium text-[#374151]">
            검색 결과가 없습니다
          </p>
          <p className="mt-2 text-sm text-[#6b7280]">
            다른 키워드로 다시 검색하거나 검색어를 지워 주세요.
          </p>
          <button
            className="mt-5 rounded-lg bg-[#1a2744] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d3f5e]"
            onClick={() => setQuery("")}
            type="button"
          >
            전체 목록 보기
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((report) => (
            <li key={report.id}>
              <Link
                className="group flex h-full flex-col rounded-2xl border border-[#ebedf0] bg-white p-5 shadow-[0_2px_12px_rgba(26,39,68,0.06)] transition hover:-translate-y-0.5 hover:border-[#3772b8]/40 hover:shadow-[0_8px_24px_rgba(26,39,68,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3772b8]"
                href={report.href}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f0fa] text-[#3772b8] transition group-hover:bg-[#3772b8] group-hover:text-white">
                    <FileText aria-hidden className="size-5" />
                  </span>
                  <span className="rounded-full bg-[#1a2744] px-2.5 py-1 text-xs font-semibold text-white">
                    #{report.id}
                  </span>
                </div>

                <p className="text-xs font-medium tracking-wide text-[#3772b8]">
                  {report.subtitle}
                </p>
                <h2 className="mt-1 text-lg font-bold leading-snug text-[#1a2744] group-hover:text-[#3772b8]">
                  {report.facility}
                </h2>

                <div className="mt-4 flex items-center justify-between border-t border-[#ebedf0] pt-4 text-sm text-[#6b7280]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin aria-hidden className="size-4 shrink-0" />
                    김포시
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
      )}
    </div>
  );
}

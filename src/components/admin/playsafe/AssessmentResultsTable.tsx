"use client";

import { useState } from "react";
import { usePlaysafeAssessmentsAdmin } from "@/hooks/usePlaysafeAssessmentsAdmin";
import { AssessmentSearchBar } from "./AssessmentSearchBar";
import { ASSESSMENT_COLUMN_COUNT, AssessmentTableRow } from "./AssessmentTableRow";
import { Pagination } from "./Pagination";
import "./playsafe-admin.css";

const COLUMNS = [
  { label: "No", className: "w-16 text-center" },
  { label: "임시시설번호", className: "w-28" },
  { label: "시설명", className: "" },
  { label: "평가자", className: "w-28" },
  { label: "평가일", className: "w-28" },
  { label: "입력자", className: "w-28" },
  { label: "위험요소", className: "w-24 text-center" },
  { label: "제출일", className: "w-44" },
] as const;

export function AssessmentResultsTable({ initialRegistrationId }: { initialRegistrationId?: string | null }) {
  const { assessments, total, page, pageSize, setPage, search, setSearch, isLoading, error } =
    usePlaysafeAssessmentsAdmin(initialRegistrationId);
  const [openId, setOpenId] = useState<string | null>(initialRegistrationId ?? null);

  const isFiltered = search.keyword !== "" || Boolean(search.registrationId);
  const emptyMessage = isFiltered ? "검색 조건에 맞는 안전성평가가 없습니다." : "등록된 안전성평가가 없습니다.";
  const message = isLoading ? "로딩 중..." : assessments.length === 0 ? emptyMessage : null;

  return (
    <div className="playsafe-admin space-y-6 min-w-0">
      <AssessmentSearchBar
        value={search}
        onSearch={(next) => {
          setOpenId(null);
          setSearch(next);
        }}
      />

      {search.registrationId && (
        <p className="text-white/60 text-xs sm:text-sm">선택한 시설의 평가만 표시 중입니다. 초기화하면 전체 목록을 볼 수 있습니다.</p>
      )}

      {error && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100/90 text-sm">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[960px] table-fixed text-sm">
          <thead className="bg-white/[0.04] text-white/60 text-xs">
            <tr className="border-b border-white/10">
              {COLUMNS.map((column) => (
                <th key={column.label} scope="col" className={`px-3 py-3 text-left font-medium ${column.className}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {message ? (
              <tr>
                <td colSpan={ASSESSMENT_COLUMN_COUNT} className="py-12 text-center text-white/60">
                  {message}
                </td>
              </tr>
            ) : (
              assessments.map((row, index) => (
                <AssessmentTableRow
                  key={row.id}
                  no={total - (page - 1) * pageSize - index}
                  row={row}
                  open={openId === row.registrationId}
                  onToggle={() => setOpenId(openId === row.registrationId ? null : row.registrationId)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-white/50 text-xs sm:text-sm">총 {total}건의 안전성평가가 있습니다.</p>
        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onChange={(next) => {
            setOpenId(null);
            setPage(next);
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { usePlaysafeRegistrationsAdmin } from "@/hooks/usePlaysafeRegistrationsAdmin";
import { Pagination } from "./Pagination";
import { RegistrationSearchBar } from "./RegistrationSearchBar";
import { REGISTRATION_COLUMN_COUNT, RegistrationTableRow } from "./RegistrationTableRow";
import "./playsafe-admin.css";

const COLUMNS = [
  { label: "No", className: "w-16 text-center" },
  { label: "임시시설번호", className: "w-28" },
  { label: "시설명", className: "" },
  { label: "주소", className: "" },
  { label: "평가대상여부", className: "w-28 text-center" },
  { label: "등록일", className: "w-44" },
] as const;

export function FacilityRegistrationsTable({ onOpenAssessment }: { onOpenAssessment: (registrationId: string) => void }) {
  const { registrations, total, page, pageSize, setPage, search, setSearch, isLoading, error } =
    usePlaysafeRegistrationsAdmin();
  const [openId, setOpenId] = useState<string | null>(null);

  const isFiltered = search.keyword !== "" || search.target !== "all";
  const emptyMessage = isFiltered ? "검색 조건에 맞는 시설정보가 없습니다." : "입력된 시설정보가 없습니다.";
  const message = isLoading ? "로딩 중..." : registrations.length === 0 ? emptyMessage : null;

  return (
    <div className="playsafe-admin space-y-6 min-w-0">
      <RegistrationSearchBar
        value={search}
        onSearch={(next) => {
          setOpenId(null);
          setSearch(next);
        }}
      />

      {error && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100/90 text-sm">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[860px] table-fixed text-sm">
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
                <td colSpan={REGISTRATION_COLUMN_COUNT} className="py-12 text-center text-white/60">
                  {message}
                </td>
              </tr>
            ) : (
              registrations.map((row, index) => (
                <RegistrationTableRow
                  key={row.id}
                  no={total - (page - 1) * pageSize - index}
                  row={row}
                  open={openId === row.id}
                  onToggle={() => setOpenId(openId === row.id ? null : row.id)}
                  onOpenAssessment={() => onOpenAssessment(row.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-white/50 text-xs sm:text-sm">총 {total}건의 시설정보가 있습니다.</p>
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

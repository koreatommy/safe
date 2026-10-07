"use client";

import { useState } from "react";
import { usePlaysafeRegistrationsAdmin } from "@/hooks/usePlaysafeRegistrationsAdmin";
import { dropCachedDetail } from "@/lib/playsafe-workflow/client/adminDetailCache";
import { Pagination } from "./Pagination";
import { RegistrationEditModal } from "./RegistrationEditModal";
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
  { label: "관리", className: "w-28 text-center" },
] as const;

const DELETE_CONFIRM =
  "이 시설의 등록정보, 기구정보, 안전성평가 결과와 모든 사진을 삭제할까요? 되돌릴 수 없습니다.";

export function FacilityRegistrationsTable({ onOpenAssessment }: { onOpenAssessment: (registrationId: string) => void }) {
  const { registrations, total, page, pageSize, setPage, search, setSearch, remove, reload, isLoading, error } =
    usePlaysafeRegistrationsAdmin();
  const [openId, setOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailEpoch, setDetailEpoch] = useState(0);

  const confirmDelete = async (id: string, facilityName: string) => {
    if (!window.confirm(`[${facilityName}]\n${DELETE_CONFIRM}`)) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      await remove(id);
      if (openId === id) setOpenId(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "삭제하지 못했습니다.");
    } finally {
      setDeletingId(null);
    }
  };
  const notice = deleteError ?? error;

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

      {notice && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100/90 text-sm">{notice}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[920px] table-fixed text-sm">
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
                  deleting={deletingId === row.id}
                  onDelete={() => void confirmDelete(row.id, row.facilityName)}
                  onEdit={() => setEditingId(row.id)}
                  detailEpoch={detailEpoch}
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
      {editingId ? (
        <RegistrationEditModal
          registrationId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={async () => {
            dropCachedDetail(editingId);
            setDetailEpoch((epoch) => epoch + 1);
            setEditingId(null);
            await reload();
          }}
        />
      ) : null}
    </div>
  );
}

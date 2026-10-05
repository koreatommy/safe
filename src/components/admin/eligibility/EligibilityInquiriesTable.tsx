"use client";

import { useState } from "react";
import { ChevronDown, Paperclip } from "lucide-react";
import { useEligibilityInquiriesAdmin } from "@/hooks/useEligibilityInquiriesAdmin";
import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS } from "@/lib/eligibility-inquiry/constants";
import type { InquiryStatus } from "@/lib/eligibility-inquiry/types";
import { EligibilityInquiryDetail } from "./EligibilityInquiryDetail";

const FILTERS = ["all", ...INQUIRY_STATUSES] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export function EligibilityInquiriesTable() {
  const { inquiries, filter, setFilter, isLoading, error, busyId, updateStatus, saveNote, remove } =
    useEligibilityInquiriesAdmin();
  const [openId, setOpenId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    if (window.confirm("이 문의와 첨부파일을 삭제할까요? 되돌릴 수 없습니다.")) void remove(id);
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border transition-all text-sm ${
              filter === s
                ? "bg-[#00ff88]/20 border-[#00ff88] text-white"
                : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
            }`}
          >
            {s === "all" ? "전체" : INQUIRY_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100/90 text-sm">{error}</div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-white/70 text-sm">로딩 중...</div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-12 text-white/70 text-sm">접수된 문의가 없습니다.</div>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((q) => {
            const open = openId === q.id;
            return (
              <li key={q.id} className={`rounded-xl border bg-white/[0.03] ${open ? "border-[#00ff88]/40" : "border-white/10"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : q.id)}
                    aria-expanded={open}
                    className="flex-1 min-w-0 flex items-start gap-3 text-left"
                  >
                    <ChevronDown className={`w-4 h-4 mt-1 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate flex items-center gap-2">
                        {q.title}
                        {q.attachments.length > 0 && <Paperclip className="w-3.5 h-3.5 text-white/40 shrink-0" />}
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {q.name} · {formatDate(q.created_at)}
                      </p>
                    </div>
                  </button>
                  <select
                    value={q.status}
                    disabled={busyId === q.id}
                    onChange={(e) => void updateStatus(q.id, e.target.value as InquiryStatus)}
                    className="self-start sm:self-center rounded-lg border border-white/20 bg-black/40 text-white text-xs px-2 py-1.5"
                    aria-label="처리 상태"
                  >
                    {INQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>{INQUIRY_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                {open && (
                  <div className="border-t border-white/10 p-4">
                    <EligibilityInquiryDetail
                      key={q.admin_note ?? ""}
                      inquiry={q}
                      busy={busyId === q.id}
                      onSaveNote={saveNote}
                      onDelete={confirmDelete}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="text-white/50 text-xs sm:text-sm">총 {inquiries.length}건의 문의가 있습니다.</div>
    </div>
  );
}

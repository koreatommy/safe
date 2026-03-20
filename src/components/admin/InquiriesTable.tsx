"use client";

import { useInquiries } from "@/hooks/useInquiries";
import { InquiryCard } from "./InquiryCard";
import { InquiryDesktopTable } from "./InquiryDesktopTable";

function getStatusText(status: string) {
  switch (status) {
    case "completed": return "완료";
    case "processing": return "처리중";
    default: return "대기";
  }
}

export function InquiriesTable() {
  const {
    inquiries, isLoading, filter, setFilter,
    updatingId, deletingId,
    handleStatusChange, handleDelete, addMemo, deleteMemo, appendInquiryAttachments,
  } = useInquiries();

  return (
    <div className="space-y-6 min-w-0">
      {/* 필터 버튼 */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "processing", "completed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border transition-all text-sm ${
              filter === status
                ? "bg-[#00ff88]/20 border-[#00ff88] text-white"
                : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
            }`}
          >
            {status === "all" ? "전체" : getStatusText(status)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-white/70 text-sm">로딩 중...</div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-12 text-white/70 text-sm">문의 내역이 없습니다.</div>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
          <div className="md:hidden space-y-3">
            {inquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                updatingId={updatingId}
                deletingId={deletingId}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onAddMemo={addMemo}
                onDeleteMemo={deleteMemo}
                onAppendAttachments={appendInquiryAttachments}
              />
            ))}
          </div>

          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block">
            <InquiryDesktopTable
              inquiries={inquiries}
              updatingId={updatingId}
              deletingId={deletingId}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onAddMemo={addMemo}
            onDeleteMemo={deleteMemo}
            onAppendAttachments={appendInquiryAttachments}
          />
          </div>
        </>
      )}

      <div className="text-white/50 text-xs sm:text-sm">
        총 {inquiries.length}건의 문의가 있습니다.
      </div>
    </div>
  );
}

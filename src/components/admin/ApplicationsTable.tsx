"use client";

import { useApplications } from "@/hooks/useApplications";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationDesktopTable } from "./ApplicationDesktopTable";

function getStatusText(status: string) {
  switch (status) {
    case "confirmed": return "확정";
    case "cancelled": return "취소";
    default: return "대기";
  }
}

export function ApplicationsTable() {
  const {
    applications, isLoading, filter, setFilter,
    updatingId, deletingId, uploadingFileId,
    handleStatusChange, handleDelete, saveCertificateNumber,
    uploadFile, updateFile, deleteFile,
  } = useApplications();

  return (
    <div className="space-y-6 min-w-0">
      {/* 필터 버튼 */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((status) => (
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
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-white/70 text-sm">신청 내역이 없습니다.</div>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
          <div className="md:hidden space-y-3">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                updatingId={updatingId}
                deletingId={deletingId}
                uploadingFileId={uploadingFileId}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onSaveCertificateNumber={saveCertificateNumber}
                onUploadFile={uploadFile}
                onUpdateFile={updateFile}
                onDeleteFile={deleteFile}
              />
            ))}
          </div>

          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block">
            <ApplicationDesktopTable
              applications={applications}
              updatingId={updatingId}
              deletingId={deletingId}
              uploadingFileId={uploadingFileId}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onSaveCertificateNumber={saveCertificateNumber}
              onUploadFile={uploadFile}
              onUpdateFile={updateFile}
              onDeleteFile={deleteFile}
            />
          </div>
        </>
      )}

      <div className="text-white/50 text-xs sm:text-sm">
        총 {applications.length}건의 신청이 있습니다.
      </div>
    </div>
  );
}

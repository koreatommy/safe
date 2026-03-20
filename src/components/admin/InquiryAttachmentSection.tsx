"use client";

import { useState } from "react";
import { Paperclip, Upload } from "lucide-react";
import { FileDropZone } from "@/components/forms/FileDropZone";
import { parseAttachmentUrls } from "@/hooks/useInquiries";
import { AttachmentPreview } from "./AttachmentPreview";

const MAX_TOTAL = 10;

interface InquiryAttachmentSectionProps {
  inquiryId: string;
  attachmentUrlsRaw: unknown;
  updatingId: string | null;
  onAppendAttachments: (inquiryId: string, files: File[]) => Promise<boolean>;
  /** 카드(모바일) vs 테이블 상세 행 */
  variant?: "card" | "table";
}

export function InquiryAttachmentSection({
  inquiryId,
  attachmentUrlsRaw,
  updatingId,
  onAppendAttachments,
  variant = "card",
}: InquiryAttachmentSectionProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const attachments = parseAttachmentUrls(attachmentUrlsRaw);
  const remainingSlots = Math.max(0, MAX_TOTAL - attachments.length);
  const busy = updatingId === inquiryId;

  const labelClass =
    variant === "table"
      ? "admin-detail-label text-white/90 text-[0.8125rem] flex items-center gap-2"
      : "admin-detail-label text-white/50 text-[0.9375rem] flex items-center gap-2";

  const handleAppend = async () => {
    if (pendingFiles.length === 0) return;
    const ok = await onAppendAttachments(inquiryId, pendingFiles);
    if (ok) setPendingFiles([]);
  };

  return (
    <div className="space-y-3">
      <p className={labelClass}>
        <Paperclip className={`${variant === "table" ? "w-3.5 h-3.5" : "w-4 h-4"} text-white/40 flex-shrink-0`} />
        첨부파일
      </p>

      {attachments.length > 0 ? (
        <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 flex flex-wrap gap-4">
          {attachments.map((entry, idx) => (
            <AttachmentPreview key={`${entry.url}-${idx}`} name={entry.name} url={entry.url} />
          ))}
        </div>
      ) : (
        <p className="text-white/60 text-xs">첨부파일이 없습니다.</p>
      )}

      {remainingSlots > 0 ? (
        <div className="space-y-2 pt-1">
          <p className="text-white/45 text-xs">
            관리자 추가 첨부 · PDF, 이미지, 문서, ZIP, TXT (최대 20MB, 합계 {MAX_TOTAL}개까지)
          </p>
          <FileDropZone
            files={pendingFiles}
            onFilesChange={setPendingFiles}
            maxFiles={remainingSlots}
          />
          <button
            type="button"
            onClick={handleAppend}
            disabled={busy || pendingFiles.length === 0}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#00ff88]/15 border border-[#00ff88]/60 text-[#00ff88] text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 flex-shrink-0" />
            선택한 파일 업로드
          </button>
        </div>
      ) : (
        <p className="text-white/45 text-xs">첨부 상한({MAX_TOTAL}개)에 도달했습니다.</p>
      )}
    </div>
  );
}

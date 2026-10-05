"use client";

import { useState } from "react";
import { Mail, Paperclip, Phone } from "lucide-react";
import { AttachmentPreview } from "@/components/admin/AttachmentPreview";
import { INQUIRY_LIMITS } from "@/lib/eligibility-inquiry/constants";
import type { EligibilityInquiry } from "@/lib/eligibility-inquiry/types";

interface EligibilityInquiryDetailProps {
  inquiry: EligibilityInquiry;
  busy: boolean;
  onSaveNote: (id: string, note: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}

export function EligibilityInquiryDetail({ inquiry, busy, onSaveNote, onDelete }: EligibilityInquiryDetailProps) {
  const [note, setNote] = useState(inquiry.admin_note ?? "");
  const dirty = note.trim() !== (inquiry.admin_note ?? "");

  return (
    <div className="space-y-4 text-sm text-white/85">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-white/70">
        <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-1.5 hover:text-[#00ff88]">
          <Mail className="w-3.5 h-3.5" /> {inquiry.email}
        </a>
        <a href={`tel:${inquiry.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#00ff88]">
          <Phone className="w-3.5 h-3.5" /> {inquiry.phone}
        </a>
      </div>

      <p className="whitespace-pre-wrap break-words rounded-lg bg-white/5 border border-white/10 p-3 leading-relaxed">
        {inquiry.content}
      </p>

      <div className="space-y-2">
        <p className="flex items-center gap-2 text-white/60 text-xs">
          <Paperclip className="w-3.5 h-3.5" /> 첨부파일 {inquiry.attachments.length}개
        </p>
        {inquiry.attachments.length > 0 && (
          <div className="flex flex-wrap gap-4 rounded-lg bg-white/5 border border-white/10 p-3">
            {inquiry.attachments.map((file) =>
              file.url ? (
                <AttachmentPreview key={file.path} name={file.name} url={file.url} />
              ) : (
                <span key={file.path} className="text-xs text-amber-200/80">{file.name} (링크 생성 실패)</span>
              ),
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={`note-${inquiry.id}`} className="text-white/60 text-xs">관리자 메모 (답변 내용·처리 이력)</label>
        <textarea
          id={`note-${inquiry.id}`}
          value={note}
          maxLength={INQUIRY_LIMITS.adminNote}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-white/15 bg-black/30 p-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/60"
        />
        <div className="flex flex-wrap gap-2 justify-between">
          <button
            type="button"
            disabled={busy || !dirty}
            onClick={() => void onSaveNote(inquiry.id, note)}
            className="rounded-lg border border-[#00ff88]/50 bg-[#00ff88]/10 px-3 py-1.5 text-xs text-[#00ff88] hover:bg-[#00ff88]/20 disabled:opacity-40"
          >
            메모 저장
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(inquiry.id)}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-40"
          >
            문의 삭제
          </button>
        </div>
      </div>
    </div>
  );
}

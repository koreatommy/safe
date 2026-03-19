"use client";

import { useState } from "react";
import {
  Mail, Phone, Building2, Calendar, CheckCircle, Clock,
  Trash2, Edit2, ChevronDown, ChevronUp, Save, X, MessageSquare,
  StickyNote, Paperclip,
} from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import type { Inquiry } from "@/hooks/useInquiries";
import { parseAttachmentUrls } from "@/hooks/useInquiries";
import { AttachmentPreview } from "./AttachmentPreview";

interface InquiryCardProps {
  inquiry: Inquiry;
  updatingId: string | null;
  deletingId: string | null;
  onStatusChange: (id: string, status: Inquiry["status"]) => void;
  onDelete: (id: string, name: string) => void;
  onSaveNotes: (id: string, notes: string | null) => Promise<boolean>;
}

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-[#00ff88]", bg: "bg-[#00ff88]/20", label: "완료" },
  processing: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20", label: "처리중" },
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-amber-500/20", label: "대기" },
} as const;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export function InquiryCard({
  inquiry, updatingId, deletingId,
  onStatusChange, onDelete, onSaveNotes,
}: InquiryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(inquiry.notes || "");

  const status = statusConfig[inquiry.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const attachments = parseAttachmentUrls(inquiry.attachment_urls);

  const handleSaveNotes = async () => {
    const success = await onSaveNotes(inquiry.id, notesInput.trim() || null);
    if (success) setEditingNotes(false);
  };

  const handleDeleteNotes = async () => {
    if (!confirm("관리자 메모를 삭제하시겠습니까?")) return;
    const success = await onSaveNotes(inquiry.id, null);
    if (success) {
      setEditingNotes(false);
      setNotesInput("");
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
      {/* 카드 헤더 */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-white truncate text-[0.9375rem]">
                {inquiry.name}
              </p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs mt-1">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{inquiry.affiliation}</span>
            </div>
            <p className="text-white/70 text-sm mt-2 line-clamp-2">
              {inquiry.inquiry}
            </p>
            <div className="flex items-center gap-3 text-white/50 text-xs mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(inquiry.created_at)}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 text-white/40 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* 확장 영역 */}
      {expanded && (
        <div className="admin-detail-content border-t border-white/10 bg-white/[0.02]">
          {/* 연락처 */}
          <div className="px-4 py-3 space-y-2.5 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
              <a href={`mailto:${inquiry.email}`} className="text-white/80 truncate">{inquiry.email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
              <a href={`tel:${inquiry.phone}`} className="text-white/80">{formatPhoneNumber(inquiry.phone)}</a>
            </div>
          </div>

          {/* 문의내용 전체 */}
          <div className="px-4 py-3 border-b border-white/5 space-y-3">
            <p className="admin-detail-label text-white/50 text-[0.9375rem] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-white/40 flex-shrink-0" />
              문의사항 내용
            </p>
            <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{inquiry.inquiry}</p>
            </div>
          </div>

          {/* 관리자 메모 */}
          <div className="px-4 py-3 border-b border-white/5 space-y-3">
            <p className="admin-detail-label text-white/50 text-[0.9375rem] flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-white/40 flex-shrink-0" />
              관리자 메모
            </p>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] resize-none"
                  placeholder="관리자 메모를 입력하세요"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={updatingId === inquiry.id}
                    className="px-3 py-1.5 rounded-lg bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88] text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> 저장
                  </button>
                  <button
                    onClick={() => { setEditingNotes(false); setNotesInput(inquiry.notes || ""); }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> 취소
                  </button>
                  <button
                    onClick={handleDeleteNotes}
                    disabled={updatingId === inquiry.id}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-xs flex items-center gap-1.5 disabled:opacity-50 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 삭제
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white/70 whitespace-pre-wrap flex-1 min-w-0">
                    {inquiry.notes || "메모가 없습니다."}
                  </p>
                  <button
                    onClick={() => { setEditingNotes(true); setNotesInput(inquiry.notes || ""); }}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white flex-shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {inquiry.notes_updated_at && (
                  <p className="text-white/45 text-xs flex items-center gap-1.5">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    {formatDate(inquiry.notes_updated_at)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 첨부파일 */}
          {attachments.length > 0 && (
            <div className="px-4 py-3 border-b border-white/5 space-y-3">
              <p className="admin-detail-label text-white/50 text-[0.9375rem] flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-white/40 flex-shrink-0" />
                첨부파일
              </p>
              <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 flex flex-wrap gap-4">
                {attachments.map((entry, idx) => (
                  <AttachmentPreview key={`${entry.url}-${idx}`} name={entry.name} url={entry.url} />
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="px-4 py-3 flex items-center gap-3">
            <select
              value={inquiry.status}
              onChange={(e) => onStatusChange(inquiry.id, e.target.value as Inquiry["status"])}
              disabled={updatingId === inquiry.id}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-[#00ff88] disabled:opacity-50"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            >
              <option value="pending" style={{ backgroundColor: "#1b1f2a" }}>대기</option>
              <option value="processing" style={{ backgroundColor: "#1b1f2a" }}>처리중</option>
              <option value="completed" style={{ backgroundColor: "#1b1f2a" }}>완료</option>
            </select>
            <button
              onClick={() => onDelete(inquiry.id, inquiry.name)}
              disabled={deletingId === inquiry.id}
              className="p-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 disabled:opacity-50 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

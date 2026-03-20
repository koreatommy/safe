"use client";

import { useState, Fragment } from "react";
import {
  Mail, Phone, Building2, Calendar, CheckCircle, Clock,
  Trash2,   MessageSquare, StickyNote, Send,
} from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import type { Inquiry, InquiryMemo } from "@/hooks/useInquiries";
import { InquiryAttachmentSection } from "./InquiryAttachmentSection";

interface Props {
  inquiries: Inquiry[];
  updatingId: string | null;
  deletingId: string | null;
  onStatusChange: (id: string, status: Inquiry["status"]) => void;
  onDelete: (id: string, name: string) => void;
  onAddMemo: (inquiryId: string, body: string) => Promise<boolean>;
  onDeleteMemo: (inquiryId: string, memoId: string) => Promise<boolean>;
  onAppendAttachments: (inquiryId: string, files: File[]) => Promise<boolean>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4 text-[#00ff88]" />;
    case "processing": return <Clock className="w-4 h-4 text-blue-400" />;
    default: return <Clock className="w-4 h-4 text-yellow-400" />;
  }
}

export function InquiryDesktopTable({
  inquiries, updatingId, deletingId,
  onStatusChange, onDelete, onAddMemo, onDeleteMemo, onAppendAttachments,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [memoInput, setMemoInput] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const handleAddMemo = async (inquiryId: string) => {
    const body = memoInput[inquiryId]?.trim();
    if (!body) return;
    const success = await onAddMemo(inquiryId, body);
    if (success) setMemoInput((prev) => ({ ...prev, [inquiryId]: "" }));
  };

  const handleDeleteMemo = async (inquiryId: string, memoId: string) => {
    if (!confirm("이 메모를 삭제하시겠습니까?")) return;
    await onDeleteMemo(inquiryId, memoId);
  };

  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border border-white/5">
      <table className="w-full min-w-[800px]" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-3 text-white/90 font-medium whitespace-nowrap" style={{ fontSize: "0.8125rem", width: "5%", minWidth: "72px" }}>이름</th>
            <th className="text-left py-3 px-3 text-white/90 font-medium whitespace-nowrap" style={{ fontSize: "0.8125rem", width: "14%", minWidth: "120px" }}>이메일</th>
            <th className="text-left py-3 px-3 text-white/90 font-medium whitespace-nowrap" style={{ fontSize: "0.8125rem", width: "10%", minWidth: "100px" }}>전화번호</th>
            <th className="text-left py-3 px-3 text-white/90 font-medium whitespace-nowrap" style={{ fontSize: "0.8125rem", width: "10%", minWidth: "80px" }}>소속</th>
            <th className="text-left py-3 px-3 text-white/90 font-medium" style={{ fontSize: "0.8125rem", width: "28%", minWidth: "160px", maxWidth: "280px" }}>문의사항</th>
            <th className="text-left py-3 px-3 text-white/90 font-medium whitespace-nowrap" style={{ fontSize: "0.8125rem", width: "10%", minWidth: "80px" }}>상태</th>
            <th className="text-left py-3 px-3 text-white/90 font-medium whitespace-nowrap" style={{ fontSize: "0.8125rem", width: "12%", minWidth: "100px" }}>등록일시</th>
            <th className="text-left py-3 px-3 text-white/90 font-medium whitespace-nowrap" style={{ fontSize: "0.8125rem", width: "6%", minWidth: "68px" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <Fragment key={inquiry.id}>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 text-white/90 truncate" style={{ fontSize: "0.8125rem", maxWidth: "72px" }} title={inquiry.name}>{inquiry.name}</td>
                <td className="py-3 px-3 text-white/80" style={{ fontSize: "0.8125rem" }}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <span className="truncate" title={inquiry.email}>{inquiry.email}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-white/80 whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    {formatPhoneNumber(inquiry.phone)}
                  </div>
                </td>
                <td className="py-3 px-3 text-white/80" style={{ fontSize: "0.8125rem" }}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <span className="truncate" title={inquiry.affiliation}>{inquiry.affiliation}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-white/80" style={{ fontSize: "0.8125rem", maxWidth: "280px" }}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <button onClick={() => toggleExpand(inquiry.id)} className="text-left hover:text-[#00ff88] transition-colors truncate block w-full" title={inquiry.inquiry}>
                      {inquiry.inquiry.length > 36 ? `${inquiry.inquiry.substring(0, 36)}...` : inquiry.inquiry}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3" style={{ fontSize: "0.8125rem" }}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(inquiry.status)}
                    <select
                      value={inquiry.status}
                      onChange={(e) => onStatusChange(inquiry.id, e.target.value as Inquiry["status"])}
                      disabled={updatingId === inquiry.id}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white/90 text-sm focus:outline-none focus:border-[#00ff88] disabled:opacity-50"
                    >
                      <option value="pending">대기</option>
                      <option value="processing">처리중</option>
                      <option value="completed">완료</option>
                    </select>
                  </div>
                </td>
                <td className="py-3 px-3 text-white/70 whitespace-nowrap" style={{ fontSize: "0.8125rem" }}>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    {formatDate(inquiry.created_at)}
                  </div>
                </td>
                <td className="py-3 px-3" style={{ fontSize: "0.8125rem" }}>
                  <button
                    onClick={() => onDelete(inquiry.id, inquiry.name)}
                    disabled={deletingId === inquiry.id}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-400 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              {expandedId === inquiry.id && (
                <tr className="border-b border-white/5">
                  <td colSpan={8} className="py-4 px-4 bg-white/5">
                    <div className="admin-detail-content space-y-4">
                      <div className="space-y-3">
                        <h4 className="admin-detail-label text-white/90 text-[0.8125rem] flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                          문의사항 내용
                        </h4>
                        <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
                          <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{inquiry.inquiry}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="admin-detail-label text-white/90 text-[0.8125rem] flex items-center gap-2">
                          <StickyNote className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                          관리자 메모
                        </h4>
                        <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                          <ul className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                            {(inquiry.memo_entries ?? []).length === 0 ? (
                              <li className="px-3 py-4 text-white/45 text-xs">메모가 없습니다.</li>
                            ) : (
                              (inquiry.memo_entries ?? []).map((memo: InquiryMemo) => (
                                <li key={memo.id} className="px-3 py-2.5 flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-white/80 text-[0.8125rem] whitespace-pre-wrap">{memo.body}</p>
                                    <p className="text-white/45 text-xs mt-1 flex items-center gap-1.5">
                                      <Clock className="w-3 h-3 flex-shrink-0" />
                                      {formatDate(memo.created_at)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMemo(inquiry.id, memo.id)}
                                    disabled={updatingId === inquiry.id}
                                    className="p-1.5 rounded hover:bg-red-500/20 text-red-400/80 hover:text-red-400 disabled:opacity-50 flex-shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </li>
                              ))
                            )}
                          </ul>
                          <div className="p-2 border-t border-white/5 flex gap-2">
                            <textarea
                              value={memoInput[inquiry.id] ?? ""}
                              onChange={(e) => setMemoInput((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                              rows={2}
                              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] resize-none text-[0.8125rem]"
                              placeholder="새 메모 입력..."
                            />
                            <button
                              type="button"
                              onClick={() => handleAddMemo(inquiry.id)}
                              disabled={updatingId === inquiry.id || !(memoInput[inquiry.id]?.trim())}
                              className="px-3 py-2 rounded-lg bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88] text-xs flex items-center gap-1.5 disabled:opacity-50 self-end"
                            >
                              <Send className="w-3.5 h-3.5" /> 저장
                            </button>
                          </div>
                        </div>
                      </div>
                      <InquiryAttachmentSection
                        inquiryId={inquiry.id}
                        attachmentUrlsRaw={inquiry.attachment_urls}
                        updatingId={updatingId}
                        onAppendAttachments={onAppendAttachments}
                        variant="table"
                      />
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

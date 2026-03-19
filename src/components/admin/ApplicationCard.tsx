"use client";

import { useState } from "react";
import {
  Mail, Phone, Building2, Calendar, CheckCircle, XCircle,
  Clock, Trash2, FileText, Edit2, Upload, Download, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import type { Application } from "@/hooks/useApplications";

interface ApplicationCardProps {
  app: Application;
  updatingId: string | null;
  deletingId: string | null;
  uploadingFileId: string | null;
  onStatusChange: (id: string, status: Application["status"]) => void;
  onDelete: (id: string, name: string) => void;
  onSaveCertificateNumber: (id: string, value: string | null) => Promise<boolean>;
  onUploadFile: (id: string, file: File) => void;
  onUpdateFile: (id: string, file: File) => void;
  onDeleteFile: (id: string, fileUrl: string) => void;
}

const statusConfig = {
  confirmed: { icon: CheckCircle, color: "text-[#00ff88]", bg: "bg-[#00ff88]/20", label: "확정" },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20", label: "취소" },
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-amber-500/20", label: "대기" },
} as const;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ApplicationCard({
  app, updatingId, deletingId, uploadingFileId,
  onStatusChange, onDelete, onSaveCertificateNumber,
  onUploadFile, onUpdateFile, onDeleteFile,
}: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingCert, setEditingCert] = useState(false);
  const [certInput, setCertInput] = useState(app.certificate_number || "");

  const status = statusConfig[app.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const handleSaveCert = async () => {
    const success = await onSaveCertificateNumber(app.id, certInput.trim() || null);
    if (success) setEditingCert(false);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
      {/* 카드 헤더: 핵심 정보 */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-white truncate text-[0.9375rem]">
                {app.name}
              </p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs mt-1">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{app.affiliation}</span>
            </div>
            <div className="flex items-center gap-3 text-white/50 text-xs mt-1.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(app.created_at)}
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
        <div className="border-t border-white/10 bg-white/[0.02]">
          {/* 연락처 정보 */}
          <div className="px-4 py-3 space-y-2.5 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
              <a href={`mailto:${app.email}`} className="text-white/80 truncate">{app.email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
              <a href={`tel:${app.phone}`} className="text-white/80">{formatPhoneNumber(app.phone || "")}</a>
            </div>
          </div>

          {/* 수료증 번호 */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-white/50 text-xs mb-2">수료증번호</p>
            {editingCert ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00ff88]"
                  placeholder="수료증 번호 입력"
                  autoFocus
                />
                <button
                  onClick={handleSaveCert}
                  disabled={updatingId === app.id}
                  className="p-1.5 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditingCert(false); setCertInput(app.certificate_number || ""); }}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">
                  {app.certificate_number || "-"}
                </span>
                <button
                  onClick={() => { setEditingCert(true); setCertInput(app.certificate_number || ""); }}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 수료증 파일 */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-white/50 text-xs mb-2">수료증 파일</p>
            {app.certificate_file_url ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00ff88] flex-shrink-0" />
                  <span className="text-[#00ff88] text-sm font-medium">업로드 완료</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.open(app.certificate_file_url || "", "_blank")}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs"
                  >
                    미리보기
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = app.certificate_file_url || "";
                      link.download = `수료증_${app.name}.pdf`;
                      link.target = "_blank";
                      link.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs"
                  >
                    다운로드
                  </button>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUpdateFile(app.id, file);
                        e.target.value = "";
                      }}
                      disabled={uploadingFileId === app.id}
                      className="hidden"
                    />
                    <span className={`inline-flex px-3 py-1.5 rounded-lg border text-xs ${
                      uploadingFileId === app.id
                        ? "bg-white/5 border-white/10 text-white/40"
                        : "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 cursor-pointer"
                    }`}>
                      {uploadingFileId === app.id ? "업로드 중..." : "수정"}
                    </span>
                  </label>
                  <button
                    onClick={() => onDeleteFile(app.id, app.certificate_file_url || "")}
                    disabled={uploadingFileId === app.id}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-xs disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadFile(app.id, file);
                    e.target.value = "";
                  }}
                  disabled={uploadingFileId === app.id}
                  className="hidden"
                />
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                  uploadingFileId === app.id
                    ? "bg-white/5 border-white/10 text-white/40"
                    : "bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88] cursor-pointer"
                }`}>
                  {uploadingFileId === app.id ? (
                    <><Clock className="w-3.5 h-3.5 animate-spin" /> 업로드 중...</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5" /> PDF 파일 업로드</>
                  )}
                </span>
              </label>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="px-4 py-3 flex items-center gap-3">
            <select
              value={app.status}
              onChange={(e) => onStatusChange(app.id, e.target.value as Application["status"])}
              disabled={updatingId === app.id}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-[#00ff88] disabled:opacity-50"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            >
              <option value="pending" style={{ backgroundColor: "#1b1f2a" }}>대기</option>
              <option value="confirmed" style={{ backgroundColor: "#1b1f2a" }}>확정</option>
              <option value="cancelled" style={{ backgroundColor: "#1b1f2a" }}>취소</option>
            </select>
            <button
              onClick={() => onDelete(app.id, app.name)}
              disabled={deletingId === app.id}
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

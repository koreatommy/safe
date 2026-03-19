"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, Building2, Calendar, CheckCircle, XCircle,
  Clock, Trash2, FileText, Edit2, Upload, Download, X,
} from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import type { Application } from "@/hooks/useApplications";

interface Props {
  applications: Application[];
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export function ApplicationDesktopTable({
  applications, updatingId, deletingId, uploadingFileId,
  onStatusChange, onDelete, onSaveCertificateNumber,
  onUploadFile, onUpdateFile, onDeleteFile,
}: Props) {
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [certificateNumberInput, setCertificateNumberInput] = useState<Record<string, string>>({});

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_table_column_widths");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      name: 120, email: 220, phone: 160, affiliation: 250,
      certificate: 200, certificateFile: 180, status: 120, date: 180, manage: 200,
    };
  });

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_table_column_widths", JSON.stringify(columnWidths));
    }
  }, [columnWidths]);

  const handleResizeStart = useCallback((columnKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(columnKey);
    setResizeStartX(e.clientX);
    setResizeStartWidth(columnWidths[columnKey] || 150);
  }, [columnWidths]);

  useEffect(() => {
    if (!resizingColumn) return;
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const diff = e.clientX - resizeStartX;
      setColumnWidths((prev) => ({ ...prev, [resizingColumn]: Math.max(80, resizeStartWidth + diff) }));
    };
    const handleMouseUp = () => {
      setResizingColumn(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  const handleCertEdit = (id: string, currentValue: string | null) => {
    setEditingCertificateId(id);
    setCertificateNumberInput((prev) => ({ ...prev, [id]: currentValue || "" }));
  };

  const handleCertSave = async (id: string) => {
    const success = await onSaveCertificateNumber(id, certificateNumberInput[id]?.trim() || null);
    if (success) {
      setEditingCertificateId(null);
      setCertificateNumberInput((prev) => { const s = { ...prev }; delete s[id]; return s; });
    }
  };

  const handleCertCancel = (id: string) => {
    setEditingCertificateId(null);
    setCertificateNumberInput((prev) => { const s = { ...prev }; delete s[id]; return s; });
  };

  const columns = [
    { key: "name", label: "이름" },
    { key: "email", label: "이메일" },
    { key: "phone", label: "전화번호" },
    { key: "affiliation", label: "소속" },
    { key: "certificate", label: "수료증번호" },
    { key: "certificateFile", label: "수료증" },
    { key: "status", label: "상태" },
    { key: "date", label: "신청일시" },
    { key: "manage", label: "관리" },
  ];

  const ResizeHandle = ({ columnKey }: { columnKey: string }) => (
    <div
      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#00ff88] opacity-0 group-hover:opacity-100 transition-opacity"
      onMouseDown={(e) => handleResizeStart(columnKey, e)}
      style={{ userSelect: "none" }}
    />
  );

  return (
    <div className="min-w-0 w-full overflow-x-auto rounded-lg border border-white/5" style={{ cursor: resizingColumn ? "col-resize" : "default" }}>
      <table
        className="w-full"
        style={{
          tableLayout: "fixed",
          borderCollapse: "collapse",
          minWidth: Object.values(columnWidths).reduce((sum, w) => sum + w, 0) + "px",
        }}
      >
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-4 px-2 text-white/90 font-medium relative group"
                style={{ fontSize: "0.875rem", width: `${columnWidths[col.key]}px` }}
              >
                <div className="flex items-center justify-between">
                  <span>{col.label}</span>
                  {col.key !== "manage" && <ResizeHandle columnKey={col.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => (
            <motion.tr
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="py-4 px-2 text-white" style={{ fontSize: "0.875rem", width: `${columnWidths.name}px` }}>
                <div className="truncate" title={app.name}>{app.name}</div>
              </td>
              <td className="py-4 px-2 text-white/80" style={{ fontSize: "0.875rem", width: `${columnWidths.email}px` }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <span className="truncate" title={app.email}>{app.email}</span>
                </div>
              </td>
              <td className="py-4 px-2 text-white/80" style={{ fontSize: "0.875rem", width: `${columnWidths.phone}px` }}>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <span className="truncate">{formatPhoneNumber(app.phone || "")}</span>
                </div>
              </td>
              <td className="py-4 px-2 text-white/80" style={{ fontSize: "0.875rem", width: `${columnWidths.affiliation}px` }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <span className="truncate" title={app.affiliation}>{app.affiliation}</span>
                </div>
              </td>
              {/* 수료증 번호 */}
              <td className="py-4 px-2" style={{ fontSize: "0.875rem", width: `${columnWidths.certificate}px` }}>
                {editingCertificateId === app.id ? (
                  <div className="flex items-center gap-1 min-w-0">
                    <input
                      type="text"
                      value={certificateNumberInput[app.id] || ""}
                      onChange={(e) => setCertificateNumberInput((p) => ({ ...p, [app.id]: e.target.value }))}
                      className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00ff88]"
                      placeholder="수료증 번호 입력"
                      autoFocus
                    />
                    <button onClick={() => handleCertSave(app.id)} disabled={updatingId === app.id}
                      className="p-1.5 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] disabled:opacity-50 flex-shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleCertCancel(app.id)} disabled={updatingId === app.id}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 disabled:opacity-50 flex-shrink-0">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <span className="text-white/80 truncate">{app.certificate_number || "-"}</span>
                    <button onClick={() => handleCertEdit(app.id, app.certificate_number)}
                      className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white flex-shrink-0">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </td>
              {/* 수료증 파일 */}
              <td className="py-4 px-2" style={{ fontSize: "0.875rem", width: `${columnWidths.certificateFile}px` }}>
                <div className="flex items-center gap-2 min-w-0">
                  {app.certificate_file_url ? (
                    <>
                      <FileText className="w-4 h-4 text-[#00ff88] flex-shrink-0" />
                      <span className="text-[#00ff88] text-xs font-medium truncate flex-1 min-w-0">업로드 완료</span>
                      <button onClick={() => window.open(app.certificate_file_url || "", "_blank")} disabled={uploadingFileId === app.id}
                        className="p-1 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 disabled:opacity-50 flex-shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { const l = document.createElement("a"); l.href = app.certificate_file_url || ""; l.download = `수료증_${app.name}.pdf`; l.target = "_blank"; l.click(); }}
                        disabled={uploadingFileId === app.id}
                        className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/60 disabled:opacity-50 flex-shrink-0">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <label className="cursor-pointer flex-shrink-0">
                        <input type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpdateFile(app.id, f); e.target.value = ""; }} disabled={uploadingFileId === app.id} className="hidden" />
                        <span className={`inline-flex items-center justify-center p-1 rounded-lg border transition-all ${uploadingFileId === app.id ? "bg-white/5 border-white/10 text-white/40" : "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 cursor-pointer"}`}>
                          {uploadingFileId === app.id ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />}
                        </span>
                      </label>
                      <button onClick={() => onDeleteFile(app.id, app.certificate_file_url || "")} disabled={uploadingFileId === app.id}
                        className="p-1 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 disabled:opacity-50 flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="text-white/60 text-xs truncate flex-1 min-w-0">미등록</span>
                      <label className="cursor-pointer flex-shrink-0">
                        <input type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadFile(app.id, f); e.target.value = ""; }} disabled={uploadingFileId === app.id} className="hidden" />
                        <span className={`inline-flex items-center justify-center p-1 rounded-lg border transition-all ${uploadingFileId === app.id ? "bg-white/5 border-white/10 text-white/40" : "bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88] cursor-pointer"}`}>
                          {uploadingFileId === app.id ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </td>
              {/* 상태 */}
              <td className="py-4 px-2" style={{ fontSize: "0.875rem", width: `${columnWidths.status}px` }}>
                <div className="flex items-center gap-2">
                  {app.status === "confirmed" ? <CheckCircle className="w-4 h-4 text-[#00ff88]" /> :
                   app.status === "cancelled" ? <XCircle className="w-4 h-4 text-red-400" /> :
                   <Clock className="w-4 h-4 text-yellow-400" />}
                  <span className="text-white/80">
                    {app.status === "confirmed" ? "확정" : app.status === "cancelled" ? "취소" : "대기"}
                  </span>
                </div>
              </td>
              {/* 신청일시 */}
              <td className="py-4 px-2 text-white/70" style={{ fontSize: "0.875rem", width: `${columnWidths.date}px` }}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <span className="truncate">{formatDate(app.created_at)}</span>
                </div>
              </td>
              {/* 관리 */}
              <td className="py-4 px-2" style={{ fontSize: "0.875rem", width: `${columnWidths.manage}px` }}>
                <div className="flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value as Application["status"])}
                    disabled={updatingId === app.id}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00ff88] disabled:opacity-50"
                    style={{ fontSize: "0.875rem", backgroundColor: "rgba(0, 0, 0, 0.3)" }}
                  >
                    <option value="pending" style={{ backgroundColor: "#1b1f2a" }}>대기</option>
                    <option value="confirmed" style={{ backgroundColor: "#1b1f2a" }}>확정</option>
                    <option value="cancelled" style={{ backgroundColor: "#1b1f2a" }}>취소</option>
                  </select>
                  <button
                    onClick={() => onDelete(app.id, app.name)}
                    disabled={deletingId === app.id}
                    className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 disabled:opacity-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

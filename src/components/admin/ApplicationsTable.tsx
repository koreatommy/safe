"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock, Trash2, MoreVertical, FileText, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPhoneNumber } from "@/lib/utils";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
  certificate_number: string | null;
  created_at: string;
  updated_at: string;
}

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [certificateNumberInput, setCertificateNumberInput] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("safe_education_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("데이터 조회 오류:", error);
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error("예상치 못한 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-[#00ff88]" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "확정";
      case "cancelled":
        return "취소";
      default:
        return "대기";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (id: string, newStatus: "pending" | "confirmed" | "cancelled") => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("safe_education_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.error("상태 변경 오류:", error);
        alert("상태 변경에 실패했습니다.");
        return;
      }

      // 로컬 상태 업데이트
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      alert("상태 변경에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name}님의 신청을 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("safe_education_applications")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("삭제 오류:", error);
        alert("삭제에 실패했습니다.");
        return;
      }

      // 로컬 상태에서 제거
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCertificateNumberChange = (id: string, value: string) => {
    setCertificateNumberInput((prev) => ({ ...prev, [id]: value }));
  };

  const handleCertificateNumberSave = async (id: string) => {
    const certificateNumber = certificateNumberInput[id]?.trim() || null;
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("safe_education_applications")
        .update({ certificate_number: certificateNumber })
        .eq("id", id);

      if (error) {
        console.error("수료증 번호 저장 오류:", error);
        alert("수료증 번호 저장에 실패했습니다.");
        return;
      }

      // 로컬 상태 업데이트
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, certificate_number: certificateNumber } : app
        )
      );
      setEditingCertificateId(null);
      setCertificateNumberInput((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      alert("수료증 번호 저장에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCertificateNumberEdit = (id: string, currentValue: string | null) => {
    setEditingCertificateId(id);
    setCertificateNumberInput((prev) => ({
      ...prev,
      [id]: currentValue || "",
    }));
  };

  const handleCertificateNumberCancel = (id: string) => {
    setEditingCertificateId(null);
    setCertificateNumberInput((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const filteredCount = applications.length;
  const totalCount = filter === "all" ? filteredCount : applications.length;

  return (
    <div className="space-y-6" style={{ width: '100%', overflow: 'visible' }}>
      {/* 필터 버튼 */}
      <div className="flex flex-wrap gap-3">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === status
                ? "bg-[#00ff88]/20 border-[#00ff88] text-white"
                : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
            }`}
            style={{ fontSize: '0.875rem' }}
          >
            {status === "all" ? "전체" : getStatusText(status)}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="text-center py-12 text-white/70" style={{ fontSize: '0.875rem' }}>로딩 중...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-white/70" style={{ fontSize: '0.875rem' }}>신청 내역이 없습니다.</div>
      ) : (
        <div className="w-full overflow-hidden">
          <table className="w-full" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }} role="table">
            <thead role="rowgroup">
              <tr className="border-b border-white/10" role="row">
                <th className="text-left py-4 px-2 text-white/90 font-medium" style={{ fontSize: '0.875rem', width: '8%' }} role="columnheader" scope="col">이름</th>
                <th className="text-left py-4 px-2 text-white/90 font-medium" style={{ fontSize: '0.875rem', width: '15%' }} role="columnheader" scope="col">이메일</th>
                <th className="text-left py-4 px-2 text-white/90 font-medium" style={{ fontSize: '0.875rem', width: '12%' }} role="columnheader" scope="col">전화번호</th>
                <th className="text-left py-4 px-2 text-white/90 font-medium" style={{ fontSize: '0.875rem', width: '18%' }} role="columnheader" scope="col">소속</th>
                <th className="text-left py-4 px-2 text-white/90 font-medium" style={{ fontSize: '0.875rem', width: '12%' }} role="columnheader" scope="col">수료증번호</th>
                <th className="text-left py-4 px-2 text-white/90 font-medium" style={{ fontSize: '0.875rem', width: '8%' }} role="columnheader" scope="col">상태</th>
                <th className="text-left py-4 px-2 text-white/90 font-medium" style={{ fontSize: '0.875rem', width: '12%' }} role="columnheader" scope="col">신청일시</th>
                <th className="text-left py-4 px-2 text-white/90 font-medium" style={{ fontSize: '0.875rem', width: '15%' }} role="columnheader" scope="col">관리</th>
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
                  <td className="py-4 px-2 text-white" style={{ fontSize: '0.875rem' }}>
                    <div className="truncate" title={app.name}>{app.name}</div>
                  </td>
                  <td className="py-4 px-2 text-white/80" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="truncate" title={app.email}>{app.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-white/80" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="truncate">{formatPhoneNumber(app.phone || '')}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-white/80" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="truncate" title={app.affiliation}>{app.affiliation}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2" style={{ fontSize: '0.875rem' }}>
                    {editingCertificateId === app.id ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <input
                          type="text"
                          value={certificateNumberInput[app.id] || ""}
                          onChange={(e) => handleCertificateNumberChange(app.id, e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00ff88] transition-all"
                          placeholder="번호 입력"
                          style={{ fontSize: '0.75rem' }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleCertificateNumberSave(app.id)}
                          disabled={updatingId === app.id}
                          className="p-1 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/30 hover:border-[#00ff88] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="저장"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCertificateNumberCancel(app.id)}
                          disabled={updatingId === app.id}
                          className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="취소"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                        <span className="text-white/80 truncate text-xs" title={app.certificate_number || "-"}>
                          {app.certificate_number || "-"}
                        </span>
                        <button
                          onClick={() => handleCertificateNumberEdit(app.id, app.certificate_number)}
                          className="p-0.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex-shrink-0"
                          title="수정"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-2" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(app.status)}
                      <span className="text-white/80 text-xs">{getStatusText(app.status)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-white/70" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                      <span className="text-xs truncate">{formatDate(app.created_at)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as "pending" | "confirmed" | "cancelled")}
                        disabled={updatingId === app.id}
                        className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00ff88] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontSize: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                      >
                        <option value="pending" style={{ backgroundColor: '#1b1f2a' }}>대기</option>
                        <option value="confirmed" style={{ backgroundColor: '#1b1f2a' }}>확정</option>
                        <option value="cancelled" style={{ backgroundColor: '#1b1f2a' }}>취소</option>
                      </select>
                      <button
                        onClick={() => handleDelete(app.id, app.name)}
                        disabled={deletingId === app.id}
                        className="p-1 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 통계 */}
      <div className="text-white/70 text-sm">
        총 {filteredCount}건의 신청이 있습니다.
      </div>
    </div>
  );
}


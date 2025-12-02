"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock, Trash2, MoreVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filteredCount = applications.length;
  const totalCount = filter === "all" ? filteredCount : applications.length;

  return (
    <div className="space-y-6">
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem' }}>이름</th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem' }}>이메일</th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem' }}>전화번호</th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem' }}>소속</th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem' }}>상태</th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem' }}>신청일시</th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem' }}>관리</th>
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
                  <td className="py-4 px-4 text-white" style={{ fontSize: '0.875rem' }}>{app.name}</td>
                  <td className="py-4 px-4 text-white/80" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/40" />
                      {app.email}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-white/80" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/40" />
                      {app.phone}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-white/80" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-white/40" />
                      {app.affiliation}
                    </div>
                  </td>
                  <td className="py-4 px-4" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(app.status)}
                      <span className="text-white/80">{getStatusText(app.status)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-white/70" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40" />
                      {formatDate(app.created_at)}
                    </div>
                  </td>
                  <td className="py-4 px-4" style={{ fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as "pending" | "confirmed" | "cancelled")}
                        disabled={updatingId === app.id}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00ff88] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontSize: '0.875rem', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                      >
                        <option value="pending" style={{ backgroundColor: '#1b1f2a' }}>대기</option>
                        <option value="confirmed" style={{ backgroundColor: '#1b1f2a' }}>확정</option>
                        <option value="cancelled" style={{ backgroundColor: '#1b1f2a' }}>취소</option>
                      </select>
                      <button
                        onClick={() => handleDelete(app.id, app.name)}
                        disabled={deletingId === app.id}
                        className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="삭제"
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
      )}

      {/* 통계 */}
      <div className="text-white/70 text-sm">
        총 {filteredCount}건의 신청이 있습니다.
      </div>
    </div>
  );
}


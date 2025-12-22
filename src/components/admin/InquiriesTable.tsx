"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock, Trash2, Edit2, MessageSquare, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPhoneNumber } from "@/lib/utils";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  inquiry: string;
  status: "pending" | "processing" | "completed";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function InquiriesTable() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "completed">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<Record<string, string>>({});
  const [expandedInquiryId, setExpandedInquiryId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("safe_contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("데이터 조회 오류:", error);
        console.error("에러 상세:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      setInquiries(data || []);
    } catch (error) {
      console.error("예상치 못한 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-[#00ff88]" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료";
      case "processing":
        return "처리중";
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

  const handleStatusChange = async (id: string, newStatus: "pending" | "processing" | "completed") => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("safe_contact_inquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.error("상태 변경 오류:", error);
        alert("상태 변경에 실패했습니다.");
        return;
      }

      setInquiries((prev) =>
        prev.map((inquiry) => (inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry))
      );
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      alert("상태 변경에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name}님의 문의사항을 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("safe_contact_inquiries")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("삭제 오류:", error);
        alert("삭제에 실패했습니다.");
        return;
      }

      setInquiries((prev) => prev.filter((inquiry) => inquiry.id !== id));
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleNotesEdit = (id: string, currentNotes: string | null) => {
    setEditingNotesId(id);
    setNotesInput((prev) => ({
      ...prev,
      [id]: currentNotes || "",
    }));
  };

  const handleNotesSave = async (id: string) => {
    const notes = notesInput[id]?.trim() || null;
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("safe_contact_inquiries")
        .update({ notes })
        .eq("id", id);

      if (error) {
        console.error("메모 저장 오류:", error);
        alert("메모 저장에 실패했습니다.");
        return;
      }

      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, notes } : inquiry
        )
      );
      setEditingNotesId(null);
      setNotesInput((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      alert("메모 저장에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotesCancel = (id: string) => {
    setEditingNotesId(null);
    setNotesInput((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const toggleInquiryExpansion = (id: string) => {
    setExpandedInquiryId(expandedInquiryId === id ? null : id);
  };

  return (
    <div className="space-y-6" style={{ width: '100%', overflow: 'visible' }}>
      {/* 필터 버튼 */}
      <div className="flex flex-wrap gap-3">
        {(["all", "pending", "processing", "completed"] as const).map((status) => (
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
      ) : inquiries.length === 0 ? (
        <div className="text-center py-12 text-white/70" style={{ fontSize: '0.875rem' }}>문의 내역이 없습니다.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table 
            className="w-full" 
            style={{ 
              borderCollapse: 'collapse'
            }} 
          >
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem', minWidth: '100px' }}>
                  이름
                </th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem', minWidth: '180px' }}>
                  이메일
                </th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem', minWidth: '140px' }}>
                  전화번호
                </th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem', minWidth: '180px' }}>
                  소속
                </th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem', minWidth: '300px' }}>
                  문의사항
                </th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem', minWidth: '100px' }}>
                  상태
                </th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem', minWidth: '150px' }}>
                  등록일시
                </th>
                <th className="text-left py-4 px-4 text-white/90 font-medium" style={{ fontSize: '0.875rem', minWidth: '200px' }}>
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <>
                  <tr 
                    key={inquiry.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-white/90" style={{ fontSize: '0.875rem' }}>
                      {inquiry.name}
                    </td>
                    <td className="py-4 px-4 text-white/80" style={{ fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-white/40" />
                        {inquiry.email}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/80" style={{ fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-white/40" />
                        {formatPhoneNumber(inquiry.phone)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/80" style={{ fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-white/40" />
                        {inquiry.affiliation}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/80" style={{ fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-white/40" />
                        <button
                          onClick={() => toggleInquiryExpansion(inquiry.id)}
                          className="text-left hover:text-[#00ff88] transition-colors truncate max-w-[250px]"
                          title={inquiry.inquiry}
                        >
                          {inquiry.inquiry.length > 30 
                            ? `${inquiry.inquiry.substring(0, 30)}...` 
                            : inquiry.inquiry}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4" style={{ fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(inquiry.status)}
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusChange(inquiry.id, e.target.value as "pending" | "processing" | "completed")}
                          disabled={updatingId === inquiry.id}
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white/90 text-sm focus:outline-none focus:border-[#00ff88] disabled:opacity-50"
                        >
                          <option value="pending">대기</option>
                          <option value="processing">처리중</option>
                          <option value="completed">완료</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/70" style={{ fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-white/40" />
                        {formatDate(inquiry.created_at)}
                      </div>
                    </td>
                    <td className="py-4 px-4" style={{ fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(inquiry.id, inquiry.name)}
                          disabled={deletingId === inquiry.id}
                          className="p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* 문의사항 상세 확장 */}
                  {expandedInquiryId === inquiry.id && (
                    <tr key={`${inquiry.id}-detail`} className="border-b border-white/5">
                      <td colSpan={8} className="py-4 px-4 bg-white/5">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-white/90 font-medium mb-2" style={{ fontSize: '0.875rem' }}>
                              문의사항 내용
                            </h4>
                            <p className="text-white/70 whitespace-pre-wrap" style={{ fontSize: '0.875rem' }}>
                              {inquiry.inquiry}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-white/90 font-medium mb-2" style={{ fontSize: '0.875rem' }}>
                              관리자 메모
                            </h4>
                            {editingNotesId === inquiry.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={notesInput[inquiry.id] || ""}
                                  onChange={(e) => setNotesInput((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                                  rows={3}
                                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] resize-none"
                                  placeholder="관리자 메모를 입력하세요"
                                  style={{ fontSize: '0.875rem' }}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleNotesSave(inquiry.id)}
                                    disabled={updatingId === inquiry.id}
                                    className="px-3 py-1.5 rounded-lg bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88]/30 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    style={{ fontSize: '0.875rem' }}
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    저장
                                  </button>
                                  <button
                                    onClick={() => handleNotesCancel(inquiry.id)}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors flex items-center gap-1.5"
                                    style={{ fontSize: '0.875rem' }}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between">
                                <p className="text-white/70 whitespace-pre-wrap flex-1" style={{ fontSize: '0.875rem' }}>
                                  {inquiry.notes || "메모가 없습니다."}
                                </p>
                                <button
                                  onClick={() => handleNotesEdit(inquiry.id, inquiry.notes)}
                                  className="ml-4 p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
                                  title="메모 수정"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


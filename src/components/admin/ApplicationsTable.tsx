"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Building2, Calendar, CheckCircle, XCircle, Clock, Trash2, MoreVertical, FileText, Edit2, GripVertical, Upload, Download, X } from "lucide-react";
import { supabase, getSupabaseProjectId } from "@/lib/supabase";
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
  certificate_file_url: string | null;
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
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  
  // 컬럼 너비 상태 (로컬 스토리지에서 불러오기)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_table_column_widths');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // 기본값 사용
        }
      }
    }
    return {
      name: 120,
      email: 220,
      phone: 160,
      affiliation: 250,
      certificate: 200,
      certificateFile: 180,
      status: 120,
      date: 180,
      manage: 200,
    };
  });

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const tableRef = useRef<HTMLTableElement>(null);

  // 컬럼 너비 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_table_column_widths', JSON.stringify(columnWidths));
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
      const newWidth = Math.max(80, resizeStartWidth + diff); // 최소 80px
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

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

  const handleFileUpload = async (id: string, file: File) => {
    // 1. 파일 유효성 검사
    if (!file.type.includes('pdf')) {
      alert('PDF 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setUploadingFileId(id);
    let uploadedFilePath: string | null = null;

    try {
      console.log('[파일 업로드] ========== 시작 ==========');
      console.log('[파일 업로드] 파일명:', file.name);
      console.log('[파일 업로드] 파일 크기:', (file.size / 1024).toFixed(2), 'KB');

      // 2. Storage에 직접 업로드 시도
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = fileName;
      uploadedFilePath = filePath;

      console.log('[파일 업로드] 생성된 파일 경로:', filePath);
      console.log('[파일 업로드] Storage에 업로드 시도 중...');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('[파일 업로드] ❌ 업로드 실패:', uploadError);
        const errorMsg = uploadError.message || String(uploadError);
        const errorMsgLower = errorMsg.toLowerCase();
        
        let errorMessage = '파일 업로드에 실패했습니다.';
        if (errorMsgLower.includes('bucket not found') || errorMsgLower.includes('bucket does not exist')) {
          errorMessage = 'Storage 버킷을 찾을 수 없습니다. 관리자에게 문의하세요.';
        } else if (errorMsgLower.includes('row-level security') || errorMsgLower.includes('policy')) {
          errorMessage = '파일 업로드 권한이 없습니다.';
        } else if (errorMsgLower.includes('payload too large')) {
          errorMessage = '파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.';
        } else {
          errorMessage = `파일 업로드 실패: ${errorMsg}`;
        }
        
        alert(errorMessage);
        setUploadingFileId(null);
        return;
      }

      if (!uploadData) {
        console.error('[파일 업로드] 응답 데이터 없음');
        alert('파일 업로드 응답을 받지 못했습니다.');
        setUploadingFileId(null);
        return;
      }

      console.log('[파일 업로드] ✅ Storage 업로드 성공:', uploadData);

      // 3. 업로드 성공 후 파일 존재 여부 확인
      console.log('[파일 업로드] 업로드된 파일 검증 중...');
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      // 파일 접근 가능 여부 확인 (HEAD 요청으로 검증)
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`파일 검증 실패: ${response.status}`);
        }
        console.log('[파일 업로드] ✅ 파일 검증 성공:', publicUrl);
      } catch (verifyError) {
        console.error('[파일 업로드] ❌ 파일 검증 실패:', verifyError);
        // 파일이 없으면 삭제 시도
        await supabase.storage.from('certificates').remove([filePath]);
        alert('업로드된 파일을 확인할 수 없습니다. 다시 시도해주세요.');
        setUploadingFileId(null);
        return;
      }

      // 4. DB에 URL 저장
      console.log('[파일 업로드] DB 업데이트 중...');
      const { error: updateError } = await supabase
        .from("safe_education_applications")
        .update({ certificate_file_url: publicUrl })
        .eq("id", id);

      if (updateError) {
        console.error('[파일 업로드] ❌ DB 업데이트 오류:', updateError);
        // DB 업데이트 실패 시 업로드된 파일 삭제
        await supabase.storage.from('certificates').remove([filePath]);
        alert('파일 정보 저장에 실패했습니다. 다시 시도해주세요.');
        setUploadingFileId(null);
        return;
      }

      console.log('[파일 업로드] ✅ DB 업데이트 성공');

      // 5. 로컬 상태 업데이트
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, certificate_file_url: publicUrl } : app
        )
      );

      console.log('[파일 업로드] ✅ 전체 프로세스 완료');
      console.log('[파일 업로드] ========== 종료 ==========');
      
    } catch (error) {
      console.error('[파일 업로드] ❌ 예상치 못한 오류:', error);
      // 에러 발생 시 업로드된 파일이 있으면 삭제
      if (uploadedFilePath) {
        try {
          await supabase.storage.from('certificates').remove([uploadedFilePath]);
        } catch (cleanupError) {
          console.error('[파일 업로드] 파일 정리 실패:', cleanupError);
        }
      }
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingFileId(null);
    }
  };

  const handleFileUpdate = async (id: string, file: File) => {
    // 기존 파일이 있을 때 새 파일로 교체
    const application = applications.find(app => app.id === id);
    const existingFileUrl = application?.certificate_file_url;

    // 파일 유효성 검사
    if (!file.type.includes('pdf')) {
      alert('PDF 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setUploadingFileId(id);
    let uploadedFilePath: string | null = null;
    let oldFilePath: string | null = null;

    try {
      console.log('[파일 수정] ========== 시작 ==========');
      
      // 기존 파일 경로 추출
      if (existingFileUrl) {
        try {
          const url = new URL(existingFileUrl);
          const pathParts = url.pathname.split('/');
          const certificatesIndex = pathParts.indexOf('certificates');
          if (certificatesIndex !== -1 && certificatesIndex < pathParts.length - 1) {
            oldFilePath = pathParts.slice(certificatesIndex + 1).join('/');
            console.log('[파일 수정] 기존 파일 경로:', oldFilePath);
          }
        } catch (urlError) {
          console.warn('[파일 수정] 기존 파일 URL 파싱 실패:', urlError);
        }
      }

      // 새 파일 업로드
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = fileName;
      uploadedFilePath = filePath;

      console.log('[파일 수정] 새 파일 업로드 중...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('[파일 수정] ❌ 업로드 실패:', uploadError);
        alert('파일 업로드에 실패했습니다.');
        setUploadingFileId(null);
        return;
      }

      if (!uploadData) {
        console.error('[파일 수정] 응답 데이터 없음');
        alert('파일 업로드 응답을 받지 못했습니다.');
        setUploadingFileId(null);
        return;
      }

      console.log('[파일 수정] ✅ 새 파일 업로드 성공');

      // 새 파일 검증
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`파일 검증 실패: ${response.status}`);
        }
        console.log('[파일 수정] ✅ 새 파일 검증 성공');
      } catch (verifyError) {
        console.error('[파일 수정] ❌ 새 파일 검증 실패:', verifyError);
        await supabase.storage.from('certificates').remove([filePath]);
        alert('업로드된 파일을 확인할 수 없습니다.');
        setUploadingFileId(null);
        return;
      }

      // DB 업데이트
      console.log('[파일 수정] DB 업데이트 중...');
      const { error: updateError } = await supabase
        .from("safe_education_applications")
        .update({ certificate_file_url: publicUrl })
        .eq("id", id);

      if (updateError) {
        console.error('[파일 수정] ❌ DB 업데이트 오류:', updateError);
        await supabase.storage.from('certificates').remove([filePath]);
        alert('파일 정보 저장에 실패했습니다.');
        setUploadingFileId(null);
        return;
      }

      console.log('[파일 수정] ✅ DB 업데이트 성공');

      // 기존 파일 삭제 (DB 업데이트 성공 후)
      if (oldFilePath) {
        try {
          const { error: deleteError } = await supabase.storage
            .from('certificates')
            .remove([oldFilePath]);
          if (deleteError) {
            console.warn('[파일 수정] 기존 파일 삭제 실패 (무시):', deleteError);
          } else {
            console.log('[파일 수정] ✅ 기존 파일 삭제 성공');
          }
        } catch (deleteError) {
          console.warn('[파일 수정] 기존 파일 삭제 중 오류 (무시):', deleteError);
        }
      }

      // 로컬 상태 업데이트
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, certificate_file_url: publicUrl } : app
        )
      );

      console.log('[파일 수정] ✅ 전체 프로세스 완료');
      console.log('[파일 수정] ========== 종료 ==========');

    } catch (error) {
      console.error('[파일 수정] ❌ 예상치 못한 오류:', error);
      // 새로 업로드된 파일이 있으면 삭제
      if (uploadedFilePath) {
        try {
          await supabase.storage.from('certificates').remove([uploadedFilePath]);
        } catch (cleanupError) {
          console.error('[파일 수정] 파일 정리 실패:', cleanupError);
        }
      }
      alert('파일 수정 중 오류가 발생했습니다.');
    } finally {
      setUploadingFileId(null);
    }
  };

  const handleFileDelete = async (id: string, fileUrl: string) => {
    if (!confirm('수료증 파일을 삭제하시겠습니까?')) {
      return;
    }

    setUploadingFileId(id);
    let filePath: string | null = null;
    const originalFileUrl = fileUrl; // 롤백용

    try {
      console.log('[파일 삭제] ========== 시작 ==========');
      
      // 파일 경로 추출
      try {
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split('/');
        const certificatesIndex = pathParts.indexOf('certificates');
        if (certificatesIndex === -1 || certificatesIndex === pathParts.length - 1) {
          alert('파일 경로를 찾을 수 없습니다.');
          setUploadingFileId(null);
          return;
        }
        filePath = pathParts.slice(certificatesIndex + 1).join('/');
        console.log('[파일 삭제] 파일 경로:', filePath);
      } catch (urlError) {
        console.error('[파일 삭제] URL 파싱 오류:', urlError);
        alert('파일 URL이 유효하지 않습니다.');
        setUploadingFileId(null);
        return;
      }

      // Storage에서 파일 삭제
      console.log('[파일 삭제] Storage에서 파일 삭제 중...');
      const { error: deleteError } = await supabase.storage
        .from('certificates')
        .remove([filePath]);

      if (deleteError) {
        console.error('[파일 삭제] ❌ Storage 삭제 오류:', deleteError);
        const errorMsg = deleteError.message || String(deleteError);
        // 파일이 이미 없을 수도 있으므로 DB는 업데이트 시도
        console.warn('[파일 삭제] Storage 삭제 실패했지만 DB 업데이트는 시도합니다.');
      } else {
        console.log('[파일 삭제] ✅ Storage에서 파일 삭제 성공');
      }

      // DB에서 URL 제거
      console.log('[파일 삭제] DB 업데이트 중...');
      const { error: updateError } = await supabase
        .from("safe_education_applications")
        .update({ certificate_file_url: null })
        .eq("id", id);

      if (updateError) {
        console.error('[파일 삭제] ❌ DB 업데이트 오류:', updateError);
        // DB 업데이트 실패 시 롤백 불가 (이미 Storage에서 삭제됨)
        alert('파일 정보 삭제에 실패했습니다. 파일은 이미 삭제되었습니다.');
        setUploadingFileId(null);
        return;
      }

      console.log('[파일 삭제] ✅ DB 업데이트 성공');

      // 로컬 상태 업데이트
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, certificate_file_url: null } : app
        )
      );

      console.log('[파일 삭제] ✅ 전체 프로세스 완료');
      console.log('[파일 삭제] ========== 종료 ==========');

    } catch (error) {
      console.error('[파일 삭제] ❌ 예상치 못한 오류:', error);
      alert('파일 삭제 중 오류가 발생했습니다.');
    } finally {
      setUploadingFileId(null);
    }
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
        <div className="w-full overflow-x-auto" style={{ cursor: resizingColumn ? 'col-resize' : 'default' }}>
          <table 
            ref={tableRef}
            className="w-full" 
            style={{ 
              tableLayout: 'fixed', 
              borderCollapse: 'collapse', 
              minWidth: Object.values(columnWidths).reduce((sum, width) => sum + width, 0) + 'px'
            }} 
            role="table"
          >
            <thead role="rowgroup">
              <tr className="border-b border-white/10" role="row">
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative group" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.name}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  <div className="flex items-center justify-between">
                    <span>이름</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#00ff88] opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart('name', e)}
                      style={{ userSelect: 'none' }}
                    />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative group" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.email}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  <div className="flex items-center justify-between">
                    <span>이메일</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#00ff88]/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart('email', e)}
                    />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative group" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.phone}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  <div className="flex items-center justify-between">
                    <span>전화번호</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#00ff88]/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart('phone', e)}
                    />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative group" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.affiliation}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  <div className="flex items-center justify-between">
                    <span>소속</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#00ff88]/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart('affiliation', e)}
                    />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative group" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.certificate}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  <div className="flex items-center justify-between">
                    <span>수료증번호</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#00ff88]/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart('certificate', e)}
                    />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative group" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.certificateFile}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  <div className="flex items-center justify-between">
                    <span>수료증</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#00ff88]/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart('certificateFile', e)}
                    />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative group" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.status}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  <div className="flex items-center justify-between">
                    <span>상태</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#00ff88]/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart('status', e)}
                    />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative group" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.date}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  <div className="flex items-center justify-between">
                    <span>신청일시</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#00ff88]/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart('date', e)}
                    />
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-2 text-white/90 font-medium relative" 
                  style={{ fontSize: '0.875rem', width: `${columnWidths.manage}px` }} 
                  role="columnheader" 
                  scope="col"
                >
                  관리
                </th>
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
                  <td className="py-4 px-2 text-white" style={{ fontSize: '0.875rem', width: `${columnWidths.name}px` }}>
                    <div className="truncate" title={app.name}>{app.name}</div>
                  </td>
                  <td className="py-4 px-2 text-white/80" style={{ fontSize: '0.875rem', width: `${columnWidths.email}px` }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="truncate" title={app.email}>{app.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-white/80" style={{ fontSize: '0.875rem', width: `${columnWidths.phone}px` }}>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="truncate">{formatPhoneNumber(app.phone || '')}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-white/80" style={{ fontSize: '0.875rem', width: `${columnWidths.affiliation}px` }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="truncate" title={app.affiliation}>{app.affiliation}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2" style={{ fontSize: '0.875rem', width: `${columnWidths.certificate}px` }}>
                    {editingCertificateId === app.id ? (
                      <div className="flex items-center gap-1 min-w-0">
                        <input
                          type="text"
                          value={certificateNumberInput[app.id] || ""}
                          onChange={(e) => handleCertificateNumberChange(app.id, e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00ff88] transition-all"
                          placeholder="수료증 번호 입력"
                          style={{ fontSize: '0.875rem' }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleCertificateNumberSave(app.id)}
                          disabled={updatingId === app.id}
                          className="p-1.5 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/30 hover:border-[#00ff88] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="저장"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCertificateNumberCancel(app.id)}
                          disabled={updatingId === app.id}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="취소"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                        <span className="text-white/80 truncate" title={app.certificate_number || "-"}>
                          {app.certificate_number || "-"}
                        </span>
                        <button
                          onClick={() => handleCertificateNumberEdit(app.id, app.certificate_number)}
                          className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all flex-shrink-0"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-2" style={{ fontSize: '0.875rem', width: `${columnWidths.certificateFile}px` }}>
                    <div className="flex items-center gap-2 min-w-0">
                      {app.certificate_file_url ? (
                        <>
                          {/* 업로드 완료 상태 표시 */}
                          <FileText className="w-4 h-4 text-[#00ff88] flex-shrink-0" />
                          <span className="text-[#00ff88] text-xs font-medium truncate flex-1 min-w-0" title="업로드 완료">
                            업로드 완료
                          </span>
                          
                          {/* 미리보기 버튼 */}
                          <button
                            onClick={() => window.open(app.certificate_file_url || '', '_blank')}
                            disabled={uploadingFileId === app.id}
                            className="p-1 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            title="미리보기"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* 다운로드 버튼 */}
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = app.certificate_file_url || '';
                              link.download = `수료증_${app.name}.pdf`;
                              link.target = '_blank';
                              link.click();
                            }}
                            disabled={uploadingFileId === app.id}
                            className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            title="다운로드"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* 수정 버튼 (파일 재업로드) */}
                          <label className="cursor-pointer flex-shrink-0">
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpdate(app.id, file);
                                }
                                e.target.value = '';
                              }}
                              disabled={uploadingFileId === app.id}
                              className="hidden"
                            />
                            <span
                              className={`inline-flex items-center justify-center p-1 rounded-lg border transition-all ${
                                uploadingFileId === app.id
                                  ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                                  : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-500 cursor-pointer'
                              }`}
                              title="수정"
                            >
                              {uploadingFileId === app.id ? (
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Edit2 className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </label>
                          
                          {/* 삭제 버튼 */}
                          <button
                            onClick={() => handleFileDelete(app.id, app.certificate_file_url || '')}
                            disabled={uploadingFileId === app.id}
                            className="p-1 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            title="삭제"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* 파일이 없을 때 */}
                          <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                          <span className="text-white/60 text-xs truncate flex-1 min-w-0">미등록</span>
                          <label className="cursor-pointer flex-shrink-0">
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(app.id, file);
                                }
                                e.target.value = '';
                              }}
                              disabled={uploadingFileId === app.id}
                              className="hidden"
                            />
                            <span
                              className={`inline-flex items-center justify-center p-1 rounded-lg border transition-all ${
                                uploadingFileId === app.id
                                  ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                                  : 'bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/30 hover:border-[#00ff88] cursor-pointer'
                              }`}
                              title="업로드"
                            >
                              {uploadingFileId === app.id ? (
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </label>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-2" style={{ fontSize: '0.875rem', width: `${columnWidths.status}px` }}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(app.status)}
                      <span className="text-white/80">{getStatusText(app.status)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-white/70" style={{ fontSize: '0.875rem', width: `${columnWidths.date}px` }}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/40 flex-shrink-0" />
                      <span className="truncate">{formatDate(app.created_at)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2" style={{ fontSize: '0.875rem', width: `${columnWidths.manage}px` }}>
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
                        className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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


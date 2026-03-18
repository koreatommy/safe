"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Search, FileText, CheckCircle2, AlertCircle, Download, Eye } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhoneNumber, normalizePhoneNumber } from "@/lib/utils";

interface CertificateLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CertificateData {
  name: string;
  phone: string;
  email: string;
  affiliation: string;
  certificateNumber: string;
  issueDate: string;
  courseName: string;
  status: string;
  certificateFileUrl: string | null;
}

export function CertificateLookupModal({
  isOpen,
  onClose,
}: CertificateLookupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 필드인 경우 자동 포맷팅
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setNotFound(false);
    setCertificateData(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else {
      const phoneNumbers = normalizePhoneNumber(formData.phone);
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.phone = "올바른 전화번호를 입력해주세요. (10-11자리)";
      } else if (!/^01[0-9]|02/.test(phoneNumbers)) {
        newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!validate()) {
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setCertificateData(null);
    setErrors({});

    try {
      // 전화번호 정규화 (하이픈 제거 후 비교)
      const normalizedPhone = normalizePhoneNumber(formData.phone.trim());
      const searchName = formData.name.trim();
      
      console.log('[수료증 조회] 검색 시작:', { name: searchName, phone: normalizedPhone });
      
      // 이름으로 조회 (상태 필터 제거 - 모든 상태에서 조회 가능)
      // 이름은 정확 일치로 조회하되, DB에 저장된 값도 trim 처리 필요
      const { data: applications, error } = await supabase
        .from("safe_education_applications")
        .select("*");
      
      if (error) {
        console.error("수료증 조회 오류:", error);
        setErrors({ submit: "조회 중 오류가 발생했습니다. 다시 시도해주세요." });
        setIsSearching(false);
        return;
      }
      
      console.log('[수료증 조회] 전체 조회 결과:', applications?.length || 0, '건');
      if (applications && applications.length > 0) {
        console.log('[수료증 조회] 찾은 신청자들:', applications.map(a => ({ 
          name: a.name, 
          status: a.status, 
          phone: a.phone 
        })));
      }
      
      // 이름으로 필터링 (정확 일치, 양쪽 모두 trim 처리)
      const nameFiltered = applications?.filter((item) => {
        const itemName = (item.name || '').trim();
        return itemName === searchName;
      });
      
      console.log('[수료증 조회] 이름 일치 결과:', nameFiltered?.length || 0, '건');
      if (nameFiltered && nameFiltered.length > 0) {
        console.log('[수료증 조회] 이름 일치 신청자들:', nameFiltered.map(a => ({ 
          name: a.name, 
          status: a.status, 
          phone: a.phone 
        })));
      }
      
      // 이름과 전화번호 모두 일치하는 항목 찾기
      const matchingData = nameFiltered?.find((item) => {
        const itemPhone = normalizePhoneNumber(item.phone || '');
        const phoneMatch = itemPhone === normalizedPhone;
        
        console.log('[수료증 조회] 전화번호 비교:', {
          itemName: (item.name || '').trim(),
          itemPhone,
          normalizedPhone,
          phoneMatch,
          status: item.status
        });
        
        return phoneMatch;
      });

      if (!matchingData) {
        setNotFound(true);
        setIsSearching(false);
        return;
      }

      const issueDate = new Date(matchingData.updated_at || matchingData.created_at);
      const formattedDate = issueDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // 전화번호 포맷팅
      const formattedPhone = formatPhoneNumber(matchingData.phone || '');

      setCertificateData({
        name: matchingData.name,
        phone: formattedPhone,
        email: matchingData.email,
        affiliation: matchingData.affiliation,
        certificateNumber: matchingData.certificate_number || `CERT-${matchingData.id.slice(0, 8).toUpperCase()}`,
        issueDate: formattedDate,
        courseName: "신종놀이시설 안전성평가 교육",
        status: matchingData.status,
        certificateFileUrl: matchingData.certificate_file_url || null,
      });
    } catch (error) {
      console.error("수료증 조회 오류:", error);
      setErrors({ submit: "조회 중 오류가 발생했습니다. 다시 시도해주세요." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", phone: "" });
    setErrors({});
    setNotFound(false);
    setCertificateData(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md"
          />

          {/* 모달 컨텐츠 */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="pointer-events-auto w-full max-w-md max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="p-0 flex flex-col max-h-[85vh]">
                {/* 헤더 */}
                <div className="p-5 md:p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#00ff88]" />
                      </div>
                      <div>
                        <h2 
                          className="font-bold text-white whitespace-nowrap"
                          style={{ fontSize: '18px' }}
                        >
                          수료증 조회
                        </h2>
                        <p className="text-white/60 mt-1" style={{ fontSize: '13px' }}>
                          이름과 전화번호로 조회하세요
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-9 h-9 rounded-lg glass-panel border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all"
                      aria-label="닫기"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 컨텐츠 */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
                  {/* 조회 폼 */}
                  {!certificateData && (
                    <div className="space-y-4">
                      {/* 이름 입력 */}
                      <div>
                        <label
                          htmlFor="lookup-name"
                          className="flex items-center gap-2 text-white/90 font-medium mb-2"
                          style={{ fontSize: '14px' }}
                        >
                          <User className="w-4 h-4 text-[#00ff88]" />
                          이름 <span className="text-[#00ff88]">*</span>
                        </label>
                        <input
                          type="text"
                          id="lookup-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
                          style={{ fontSize: '15px' }}
                          placeholder="이름을 입력해주세요"
                          disabled={isSearching}
                        />
                        {errors.name && (
                          <p className="text-red-400 mt-1" style={{ fontSize: '13px' }}>{errors.name}</p>
                        )}
                      </div>

                      {/* 전화번호 입력 */}
                      <div>
                        <label
                          htmlFor="lookup-phone"
                          className="flex items-center gap-2 text-white/90 font-medium mb-2"
                          style={{ fontSize: '14px' }}
                        >
                          <Phone className="w-4 h-4 text-[#00ff88]" />
                          전화번호 <span className="text-[#00ff88]">*</span>
                        </label>
                        <input
                          type="tel"
                          id="lookup-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
                          style={{ fontSize: '15px' }}
                          placeholder="010-1234-5678"
                          disabled={isSearching}
                        />
                        {errors.phone && (
                          <p className="text-red-400 mt-1" style={{ fontSize: '13px' }}>{errors.phone}</p>
                        )}
                      </div>

                      {/* 제출 에러 메시지 */}
                      {errors.submit && (
                        <div className="text-red-400 text-center" style={{ fontSize: '13px' }}>
                          {errors.submit}
                        </div>
                      )}

                      {/* 조회 결과 없음 */}
                      {notFound && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-amber-200 mb-1" style={{ fontSize: '14px' }}>
                              조회 결과가 없습니다
                            </p>
                            <p className="text-amber-200/70" style={{ fontSize: '13px' }}>
                              입력하신 정보를 다시 확인해주세요.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 조회 버튼 */}
                      <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="w-full py-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontSize: '15px' }}
                      >
                        {isSearching ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
                            조회 중...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            조회하기
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 조회 결과 */}
                  {certificateData && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-[#00ff88] mb-2" style={{ fontSize: '14px' }}>
                            수료증을 찾았습니다
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 p-4 rounded-xl glass-panel border border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60" style={{ fontSize: '13px' }}>이름</span>
                          <span className="font-medium text-white" style={{ fontSize: '15px' }}>
                            {certificateData.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60" style={{ fontSize: '13px' }}>전화번호</span>
                          <span className="font-medium text-white" style={{ fontSize: '15px' }}>
                            {certificateData.phone}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60" style={{ fontSize: '13px' }}>이메일</span>
                          <span className="font-medium text-white" style={{ fontSize: '15px' }}>
                            {certificateData.email}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60" style={{ fontSize: '13px' }}>소속</span>
                          <span className="font-medium text-white" style={{ fontSize: '15px' }}>
                            {certificateData.affiliation}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60" style={{ fontSize: '13px' }}>수료증 번호</span>
                          <span className="font-medium text-white" style={{ fontSize: '15px' }}>
                            {certificateData.certificateNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60" style={{ fontSize: '13px' }}>과정명</span>
                          <span className="font-medium text-white" style={{ fontSize: '15px' }}>
                            {certificateData.courseName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60" style={{ fontSize: '13px' }}>발급일</span>
                          <span className="font-medium text-white" style={{ fontSize: '15px' }}>
                            {certificateData.issueDate}
                          </span>
                        </div>
                      </div>

                      {/* 수료증 파일 미리보기 및 다운로드 */}
                      {certificateData.certificateFileUrl && (
                        <div className="p-4 rounded-xl glass-panel border border-white/10 space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-[#00ff88]" />
                            <h3 className="font-medium text-white" style={{ fontSize: '15px' }}>
                              수료증 파일
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            {/* 미리보기 버튼 */}
                            <button
                              onClick={() => window.open(certificateData.certificateFileUrl || '', '_blank')}
                              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500 transition-all font-medium flex items-center justify-center gap-2"
                              style={{ fontSize: '14px' }}
                            >
                              <Eye className="w-4 h-4" />
                              미리보기
                            </button>
                            {/* 다운로드 버튼 */}
                            <button
                              onClick={async () => {
                                if (!certificateData.certificateFileUrl) return;
                                
                                try {
                                  // 파일을 fetch로 가져와서 Blob으로 변환
                                  const response = await fetch(certificateData.certificateFileUrl);
                                  if (!response.ok) {
                                    throw new Error('파일 다운로드 실패');
                                  }
                                  
                                  const blob = await response.blob();
                                  
                                  // Blob URL 생성
                                  const blobUrl = URL.createObjectURL(blob);
                                  
                                  // 다운로드 링크 생성
                                  const link = document.createElement('a');
                                  link.href = blobUrl;
                                  link.download = `수료증_${certificateData.name}_${certificateData.certificateNumber}.pdf`;
                                  document.body.appendChild(link);
                                  link.click();
                                  
                                  // 정리
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(blobUrl);
                                } catch (error) {
                                  console.error('파일 다운로드 오류:', error);
                                  alert('파일 다운로드에 실패했습니다.');
                                }
                              }}
                              className="flex-1 py-2.5 px-4 rounded-lg bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/30 hover:border-[#00ff88] transition-all font-medium flex items-center justify-center gap-2"
                              style={{ fontSize: '14px' }}
                            >
                              <Download className="w-4 h-4" />
                              다운로드
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 수료증 파일이 없는 경우 안내 메시지 */}
                      {!certificateData.certificateFileUrl && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-white/60 text-center" style={{ fontSize: '13px' }}>
                            수료증 파일이 등록되지 않았습니다.
                          </p>
                        </div>
                      )}

                      <button
                        onClick={handleReset}
                        className="w-full py-3 rounded-xl glass-panel border border-white/10 text-white hover:bg-white/10 transition-all font-medium"
                        style={{ fontSize: '15px' }}
                      >
                        다시 조회하기
                      </button>
                    </div>
                  )}
                </div>

                {/* 푸터 */}
                {!certificateData && (
                  <div className="p-5 md:p-6 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
                    <button
                      onClick={onClose}
                      className="w-full py-3 rounded-xl glass-panel border border-white/10 text-white hover:bg-white/10 transition-all font-medium"
                      style={{ fontSize: '15px' }}
                    >
                      닫기
                    </button>
                  </div>
                )}
              </GlassPanel>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}


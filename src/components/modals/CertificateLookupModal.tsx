"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Search, FileText, CheckCircle2, AlertCircle } from "lucide-react";
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
      
      const { data: applications, error } = await supabase
        .from("safe_education_applications")
        .select("*")
        .eq("name", formData.name.trim())
        .eq("status", "confirmed");
      
      if (error) {
        console.error("수료증 조회 오류:", error);
        setErrors({ submit: "조회 중 오류가 발생했습니다. 다시 시도해주세요." });
        setIsSearching(false);
        return;
      }
      
      // 클라이언트 측에서 전화번호 비교 (DB에 저장된 형식이 다를 수 있음)
      const matchingData = applications?.find((item) => {
        const itemPhone = normalizePhoneNumber(item.phone || '');
        return itemPhone === normalizedPhone;
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
                        <h2 className="text-sm md:text-base font-bold text-white whitespace-nowrap">
                          수료증 조회
                        </h2>
                        <p className="text-xs text-white/60 mt-0.5">
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
                          placeholder="이름을 입력해주세요"
                          disabled={isSearching}
                        />
                        {errors.name && (
                          <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* 전화번호 입력 */}
                      <div>
                        <label
                          htmlFor="lookup-phone"
                          className="flex items-center gap-2 text-white/90 font-medium mb-2"
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
                          placeholder="010-1234-5678"
                          disabled={isSearching}
                        />
                        {errors.phone && (
                          <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      {/* 제출 에러 메시지 */}
                      {errors.submit && (
                        <div className="text-red-400 text-sm text-center">
                          {errors.submit}
                        </div>
                      )}

                      {/* 조회 결과 없음 */}
                      {notFound && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-200 mb-1">
                              조회 결과가 없습니다
                            </p>
                            <p className="text-xs text-amber-200/70">
                              입력하신 정보를 다시 확인해주세요.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 조회 버튼 */}
                      <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="w-full py-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <p className="text-sm font-medium text-[#00ff88] mb-2">
                            수료증을 찾았습니다
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 p-4 rounded-xl glass-panel border border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/60">이름</span>
                          <span className="text-sm font-medium text-white">
                            {certificateData.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/60">전화번호</span>
                          <span className="text-sm font-medium text-white">
                            {certificateData.phone}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/60">이메일</span>
                          <span className="text-sm font-medium text-white">
                            {certificateData.email}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/60">소속</span>
                          <span className="text-sm font-medium text-white">
                            {certificateData.affiliation}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/60">수료증 번호</span>
                          <span className="text-sm font-medium text-white">
                            {certificateData.certificateNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/60">과정명</span>
                          <span className="text-sm font-medium text-white">
                            {certificateData.courseName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/60">발급일</span>
                          <span className="text-sm font-medium text-white">
                            {certificateData.issueDate}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleReset}
                        className="w-full py-3 rounded-xl glass-panel border border-white/10 text-white hover:bg-white/10 transition-all font-medium text-sm"
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
                      className="w-full py-3 rounded-xl glass-panel border border-white/10 text-white hover:bg-white/10 transition-all font-medium text-sm"
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


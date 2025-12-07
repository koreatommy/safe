"use client";

import { useState } from "react";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Building2, Send, ChevronDown, Shield, FileText, Clock, Users, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

export function EducationApplicationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    affiliation: "",
    privacyAgreed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (!formData.affiliation.trim()) {
      newErrors.affiliation = "소속을 입력해주세요.";
    }

    if (!formData.privacyAgreed) {
      newErrors.privacyAgreed = "개인정보 수집·이용에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('safe_education_applications')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            affiliation: formData.affiliation,
          }
        ])
        .select();

      if (error) {
        console.error('Supabase 저장 오류:', error);
        console.error('에러 상세:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        let errorMessage = '신청 저장 중 오류가 발생했습니다. 다시 시도해주세요.';
        
        // 환경 변수 관련 에러 체크
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
          errorMessage = '서버 설정 오류가 발생했습니다. 관리자에게 문의해주세요.';
        } else if (error.message?.includes('JWT') || error.code === 'PGRST301') {
          errorMessage = '인증 오류가 발생했습니다. 페이지를 새로고침 후 다시 시도해주세요.';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
        }
        
        setErrors({ submit: errorMessage });
        setIsSubmitting(false);
        return;
      }

      console.log('저장된 데이터:', data);
      
      // 폭죽 효과
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // 중앙에서 폭발하는 효과
      confetti({
        ...defaults,
        particleCount: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#00ff88', '#39ff14', '#ffffff', '#b7d7ff', '#c4f2ff']
      });
      
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // 3초 후 폼 초기화
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", affiliation: "", privacyAgreed: false });
    }, 3000);
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      setErrors({ submit: '신청 저장 중 오류가 발생했습니다. 다시 시도해주세요.' });
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 rounded-full bg-[#00ff88]/20 flex items-center justify-center mx-auto mb-6">
          <Send className="w-10 h-10 text-[#00ff88]" />
        </div>
        <h3 className="text-white text-2xl font-medium mb-4">
          신청이 완료되었습니다!
        </h3>
        <p className="text-white/70 text-lg">
          접수 확인 후 개별 안내 문자를 발송해드리겠습니다.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 이름 */}
        <div>
          <label
            htmlFor="name"
            className="flex items-center gap-2 text-white/90 font-medium mb-2"
          >
            <User className="w-4 h-4 text-[#00ff88]" />
            이름 <span className="text-[#00ff88]">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
            placeholder="이름을 입력해주세요"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* 이메일 */}
        <div>
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-white/90 font-medium mb-2"
          >
            <Mail className="w-4 h-4 text-[#00ff88]" />
            이메일 <span className="text-[#00ff88]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* 전화번호 */}
        <div>
          <label
            htmlFor="phone"
            className="flex items-center gap-2 text-white/90 font-medium mb-2"
          >
            <Phone className="w-4 h-4 text-[#00ff88]" />
            전화번호 <span className="text-[#00ff88]">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
            placeholder="010-1234-5678"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* 소속 */}
        <div>
          <label
            htmlFor="affiliation"
            className="flex items-center gap-2 text-white/90 font-medium mb-2"
          >
            <Building2 className="w-4 h-4 text-[#00ff88]" />
            소속 <span className="text-[#00ff88]">*</span>
          </label>
          <input
            type="text"
            id="affiliation"
            name="affiliation"
            value={formData.affiliation}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl glass-panel border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#00ff88] transition-all"
            placeholder="소속 기관 또는 회사명"
          />
          {errors.affiliation && (
            <p className="text-red-400 text-sm mt-1">{errors.affiliation}</p>
          )}
        </div>
      </div>

      {/* 제출 에러 메시지 */}
      {errors.submit && (
        <div className="text-red-400 text-sm text-center">{errors.submit}</div>
      )}

      {/* 개인정보 동의 및 제출 버튼 */}
      <div className="pt-4 space-y-4">
        {/* 체크박스와 자세히 보기 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 justify-center">
            <input
              type="checkbox"
              id="privacyAgreed"
              name="privacyAgreed"
              checked={formData.privacyAgreed}
              onChange={handleChange}
              className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-[#00ff88] focus:ring-[#00ff88] focus:ring-offset-0 cursor-pointer"
            />
            <div className="flex-1">
              <label
                htmlFor="privacyAgreed"
                className="text-white/80 text-sm cursor-pointer"
              >
                <span className="text-[#00ff88]">*</span> 개인정보 수집·이용 동의서에 동의합니다.
              </label>
              <button
                type="button"
                onClick={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
                className="mt-1 text-xs text-[#00ff88] hover:text-white transition-colors flex items-center gap-1"
              >
                {isPrivacyExpanded ? "접기" : "자세히 보기"}
                <motion.div
                  animate={{ rotate: isPrivacyExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
              </button>
            </div>
          </div>
          
          {errors.privacyAgreed && (
            <p className="text-red-400 text-sm text-center">{errors.privacyAgreed}</p>
          )}
        </div>

        {/* 인라인 확장 동의서 내용 */}
        <AnimatePresence>
          {isPrivacyExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="glass-panel p-4 md:p-6 rounded-xl border border-white/10 max-h-[60vh] overflow-y-auto space-y-3">
                {/* 헤더 */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#00ff88]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">개인정보 수집·이용 동의서</h3>
                    <p className="text-xs text-white/60">한국창의융합연구원</p>
                  </div>
                </div>

                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  「개인정보 보호법」에 따라 교육 신청 및 운영을 위한 최소한의 개인정보를 수집합니다.
                </p>

                {/* 동의서 내용 */}
                <PrivacyContent 
                  expandedSections={expandedSections}
                  setExpandedSections={setExpandedSections}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex justify-center">
          <GlowCapsuleButton
            type="submit"
            className="w-full md:w-auto text-lg md:text-xl px-10 md:px-12 py-4 md:py-5 group"
            onClick={(e) => {
              // 버튼 클릭 시 폼 제출
            }}
          >
            <span className="flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  제출 중...
                </>
              ) : (
                <>
                  지금 바로 신청하기
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </GlowCapsuleButton>
        </div>
      </div>
    </form>
  );
}

// 개인정보 동의서 내용 컴포넌트
interface PrivacyContentProps {
  expandedSections: number[];
  setExpandedSections: React.Dispatch<React.SetStateAction<number[]>>;
}

function PrivacyContent({ expandedSections, setExpandedSections }: PrivacyContentProps) {
  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="space-y-2">
      {/* 섹션 1 */}
      <AccordionSection
        id={1}
        icon={<FileText className="w-3.5 h-3.5" />}
        title="수집·이용 목적"
        isExpanded={expandedSections.includes(1)}
        onToggle={() => toggleSection(1)}
      >
        <ul className="space-y-1.5 text-xs text-white/70">
          <li className="flex gap-2"><span className="text-[#00ff88]">•</span> 교육 신청 접수 및 본인 확인</li>
          <li className="flex gap-2"><span className="text-[#00ff88]">•</span> 교육 일정 안내, 운영관리, 참여 확인</li>
          <li className="flex gap-2"><span className="text-[#00ff88]">•</span> 교육 관련 공지사항 전달 및 사후 안내</li>
          <li className="flex gap-2"><span className="text-[#00ff88]">•</span> 교육 품질 향상 및 내부 서비스 개선(통계 목적)</li>
        </ul>
      </AccordionSection>

      {/* 섹션 2 */}
      <AccordionSection
        id={2}
        icon={<Database className="w-3.5 h-3.5" />}
        title="수집하는 개인정보 항목"
        badge="필수"
        isExpanded={expandedSections.includes(2)}
        onToggle={() => toggleSection(2)}
      >
        <div className="space-y-3">
          <div className="p-2.5 rounded-lg bg-[#00ff88]/5 border border-[#00ff88]/20">
            <p className="text-xs font-semibold text-[#00ff88] mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              필수항목
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs text-white/80">
              <span className="px-2 py-1 rounded bg-white/5">성명</span>
              <span className="px-2 py-1 rounded bg-white/5">연락처</span>
              <span className="px-2 py-1 rounded bg-white/5">이메일</span>
              <span className="px-2 py-1 rounded bg-white/5">소속</span>
              <span className="px-2 py-1 rounded bg-white/5">신청 프로그램</span>
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* 섹션 3 */}
      <AccordionSection
        id={3}
        icon={<Clock className="w-3.5 h-3.5" />}
        title="보유 및 이용 기간"
        isExpanded={expandedSections.includes(3)}
        onToggle={() => toggleSection(3)}
      >
        <ul className="space-y-1.5 text-xs text-white/70">
          <li className="flex gap-2">
            <Clock className="w-3 h-3 text-[#00ff88] mt-0.5 flex-shrink-0" />
            <span>교육 종료일로부터 <span className="text-[#00ff88] font-semibold">3년간 보관</span> 후 즉시 파기</span>
          </li>
          <li className="flex gap-2"><span className="text-[#00ff88]">•</span> 관계 법령에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관</li>
        </ul>
      </AccordionSection>

      {/* 섹션 4 */}
      <AccordionSection
        id={4}
        icon={<Users className="w-3.5 h-3.5" />}
        title="제3자 제공 (해당 시)"
        isExpanded={expandedSections.includes(4)}
        onToggle={() => toggleSection(4)}
      >
        <div className="space-y-2 text-xs text-white/70">
          <p>교육 운영에 필요한 범위 내에서 아래 기관에 개인정보를 제공할 수 있습니다.</p>
          <div className="space-y-1.5">
            <div className="flex gap-2"><span className="text-[#00ff88] font-medium">제공받는 자:</span> <span>교육 관련 행정기관, 지자체 또는 협력 교육기관</span></div>
            <div className="flex gap-2"><span className="text-[#00ff88] font-medium">제공 목적:</span> <span>교육 실적 제출, 운영 협조, 행정업무 처리</span></div>
            <div className="flex gap-2"><span className="text-[#00ff88] font-medium">제공 항목:</span> <span>성명, 연락처, 소속, 참여 여부</span></div>
          </div>
        </div>
      </AccordionSection>

      {/* 섹션 5 */}
      <AccordionSection
        id={5}
        icon={<AlertCircle className="w-3.5 h-3.5" />}
        title="동의 거부권"
        badge="중요"
        isExpanded={expandedSections.includes(5)}
        onToggle={() => toggleSection(5)}
      >
        <ul className="space-y-1.5 text-xs text-white/70">
          <li className="flex gap-2"><span className="text-[#00ff88]">•</span> 정보주체는 개인정보 제공에 대해 동의를 거부할 수 있습니다.</li>
          <li className="flex gap-2">
            <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
            <span>다만, <span className="text-amber-300 font-semibold">필수항목에 대한 동의가 없을 경우</span> 교육 신청 접수 및 참여가 제한될 수 있습니다.</span>
          </li>
        </ul>
      </AccordionSection>
    </div>
  );
}

// 아코디언 섹션 컴포넌트
interface AccordionSectionProps {
  id: number;
  icon: React.ReactNode;
  title: string;
  badge?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({
  icon,
  title,
  badge,
  isExpanded,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden glass-panel">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-2.5 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88]">
            {icon}
          </div>
          <span className="text-xs font-semibold text-white">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-white/60" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-2.5 pt-0 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


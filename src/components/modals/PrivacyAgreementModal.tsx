"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Shield, FileText, Clock, Users, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useState } from "react";

interface PrivacyAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyAgreementModal({
  isOpen,
  onClose,
}: PrivacyAgreementModalProps) {
  const [expandedSections, setExpandedSections] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const expandAll = () => {
    setExpandedSections([1, 2, 3, 4, 5, 6, 7]);
  };

  const collapseAll = () => {
    setExpandedSections([]);
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
              className="pointer-events-auto w-full max-w-3xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassPanel className="p-0 flex flex-col max-h-[85vh]">
                {/* 헤더 */}
                <div className="p-5 md:p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#00ff88]" />
                      </div>
                      <div>
                        <h2 className="text-sm md:text-base font-bold text-white whitespace-nowrap">
                          개인정보 수집·이용 동의서
                        </h2>
                        <p className="text-xs text-white/60 mt-0.5">
                          한국창의융합연구원
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
                  
                  <p className="text-xs text-white/70 leading-relaxed">
                    「개인정보 보호법」에 따라 교육 신청 및 운영을 위한 최소한의 개인정보를 수집합니다.
                  </p>

                  {/* 전체 펼치기/접기 버튼 */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={expandAll}
                      className="text-xs text-white/60 hover:text-[#00ff88] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                      전체 펼치기
                    </button>
                    <button
                      onClick={collapseAll}
                      className="text-xs text-white/60 hover:text-[#00ff88] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                    >
                      전체 접기
                    </button>
                  </div>
                </div>

                {/* 컨텐츠 */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-3">
                  {/* 섹션 1 */}
                  <AccordionSection
                    id={1}
                    icon={<FileText className="w-4 h-4" />}
                    title="수집·이용 목적"
                    isExpanded={expandedSections.includes(1)}
                    onToggle={() => toggleSection(1)}
                  >
                    <ul className="space-y-2">
                      <ListItem>교육 신청 접수 및 본인 확인</ListItem>
                      <ListItem>교육 일정 안내, 운영관리, 참여 확인</ListItem>
                      <ListItem>교육 관련 공지사항 전달 및 사후 안내</ListItem>
                      <ListItem>교육 품질 향상 및 내부 서비스 개선(통계 목적)</ListItem>
                    </ul>
                  </AccordionSection>

                  {/* 섹션 2 */}
                  <AccordionSection
                    id={2}
                    icon={<Database className="w-4 h-4" />}
                    title="수집하는 개인정보 항목"
                    badge="필수 확인"
                    isExpanded={expandedSections.includes(2)}
                    onToggle={() => toggleSection(2)}
                  >
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-[#00ff88]/5 border border-[#00ff88]/20">
                        <p className="text-xs font-semibold text-[#00ff88] mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          필수항목
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <InfoChip>성명</InfoChip>
                          <InfoChip>연락처(휴대전화)</InfoChip>
                          <InfoChip>이메일</InfoChip>
                          <InfoChip>소속(기관명 또는 회사명)</InfoChip>
                          <InfoChip>신청 프로그램 정보</InfoChip>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs font-medium text-white/80 mb-2">선택항목</p>
                        <InfoChip>기타 신청자가 자발적으로 제공한 정보</InfoChip>
                      </div>
                    </div>
                  </AccordionSection>

                  {/* 섹션 3 */}
                  <AccordionSection
                    id={3}
                    icon={<Clock className="w-4 h-4" />}
                    title="보유 및 이용 기간"
                    isExpanded={expandedSections.includes(3)}
                    onToggle={() => toggleSection(3)}
                  >
                    <ul className="space-y-2">
                      <ListItem icon={<Clock className="w-3.5 h-3.5 text-[#00ff88]" />}>
                        교육 종료일로부터 <span className="text-[#00ff88] font-semibold">3년간 보관</span> 후 즉시 파기
                      </ListItem>
                      <ListItem>
                        관계 법령에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관
                      </ListItem>
                    </ul>
                  </AccordionSection>

                  {/* 섹션 4 */}
                  <AccordionSection
                    id={4}
                    icon={<Users className="w-4 h-4" />}
                    title="제3자 제공 (해당 시)"
                    isExpanded={expandedSections.includes(4)}
                    onToggle={() => toggleSection(4)}
                  >
                    <div className="space-y-3">
                      <p className="text-xs text-white/70 leading-relaxed">
                        교육 운영에 필요한 범위 내에서 아래 기관에 개인정보를 제공할 수 있습니다.
                      </p>
                      <div className="grid gap-2">
                        <InfoRow label="제공받는 자" value="교육 관련 행정기관, 지자체 또는 협력 교육기관" />
                        <InfoRow label="제공 목적" value="교육 실적 제출, 운영 협조, 행정업무 처리" />
                        <InfoRow label="제공 항목" value="성명, 연락처, 소속, 참여 여부" />
                        <InfoRow label="보유 기간" value="목적 달성 후 즉시 파기" />
                      </div>
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-200/80 leading-relaxed">
                          제3자 제공은 해당 교육 운영에 반드시 필요한 경우에 한해 제한적으로 이루어집니다.
                        </p>
                      </div>
                    </div>
                  </AccordionSection>

                  {/* 섹션 5 */}
                  <AccordionSection
                    id={5}
                    icon={<Database className="w-4 h-4" />}
                    title="개인정보 처리 위탁 (해당 시)"
                    isExpanded={expandedSections.includes(5)}
                    onToggle={() => toggleSection(5)}
                  >
                    <div className="space-y-3">
                      <p className="text-xs text-white/70 leading-relaxed">
                        안정적인 시스템 운영을 위해 아래 업체에 개인정보 처리를 위탁할 수 있습니다.
                      </p>
                      <div className="grid gap-2">
                        <InfoRow label="수탁업체" value="웹호스팅사 또는 교육 플랫폼 운영기관" />
                        <InfoRow label="위탁업무" value="시스템 유지관리, 교육 안내 발송 등" />
                        <InfoRow label="보유 기간" value="위탁 계약 종료 시까지" />
                      </div>
                    </div>
                  </AccordionSection>

                  {/* 섹션 6 */}
                  <AccordionSection
                    id={6}
                    icon={<AlertCircle className="w-4 h-4" />}
                    title="동의 거부권 및 불이익 고지"
                    badge="중요"
                    isExpanded={expandedSections.includes(6)}
                    onToggle={() => toggleSection(6)}
                  >
                    <ul className="space-y-2">
                      <ListItem>정보주체는 개인정보 제공에 대해 동의를 거부할 수 있습니다.</ListItem>
                      <ListItem icon={<AlertCircle className="w-3.5 h-3.5 text-amber-400" />}>
                        다만, <span className="text-amber-300 font-semibold">필수항목에 대한 동의가 없을 경우</span> 교육 신청 접수 및 참여가 제한될 수 있습니다.
                      </ListItem>
                      <ListItem>선택항목은 동의하지 않아도 불이익이 없습니다.</ListItem>
                    </ul>
                  </AccordionSection>

                  {/* 섹션 7 */}
                  <AccordionSection
                    id={7}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    title="동의 내용"
                    isExpanded={expandedSections.includes(7)}
                    onToggle={() => toggleSection(7)}
                  >
                    <div className="p-3 rounded-lg bg-[#00ff88]/5 border border-[#00ff88]/20">
                      <p className="text-xs text-white/80 leading-relaxed">
                        본인은 위 내용을 모두 확인하였으며, 한국창의융합연구원이 위 목적을 위하여 개인정보를 수집·이용하는 것에 동의합니다.
                      </p>
                    </div>
                  </AccordionSection>
                </div>

                {/* 푸터 */}
                <div className="p-5 md:p-6 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    확인했습니다
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
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
    <div className="rounded-xl border border-white/10 overflow-hidden glass-panel">
      <button
        onClick={onToggle}
        className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88]">
            {icon}
          </div>
          <span className="text-sm font-semibold text-white">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-white/60" />
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
            <div className="p-3.5 pt-0 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 리스트 아이템 컴포넌트
function ListItem({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs text-white/70 leading-relaxed">
      {icon ? (
        icon
      ) : (
        <span className="w-1 h-1 rounded-full bg-[#00ff88]/60 mt-1.5 flex-shrink-0" />
      )}
      <span>{children}</span>
    </li>
  );
}

// 정보 칩 컴포넌트
function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80">
      {children}
    </div>
  );
}

// 정보 행 컴포넌트
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
      <span className="text-xs text-[#00ff88] font-medium whitespace-nowrap">{label}:</span>
      <span className="text-xs text-white/70 leading-relaxed">{value}</span>
    </div>
  );
}

"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { FloatingSection } from "@/components/glass/FloatingSection";
import { EducationApplicationForm } from "@/components/forms/EducationApplicationForm";
import { CheckCircle2, BookOpen, Users, FileCheck, Award, Clock, UserCheck, Gift, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const schedule = [
  { time: "09:30~10:00", content: "참석자 등록 및 책자 배포", instructor: "이유진(전 KOLAS 교육기관 원장)", period: "오전" },
  { time: "10:00~12:00", content: "놀이시설 안전관리 실무교육", instructor: "이유진(전 KOLAS 교육기관 원장)", period: "오전" },
  { time: "13:00~13:50", content: "신종·유사 놀이시설 및 놀이기구의 구분과 사례", instructor: "배송수(검사기관협의회회장)", period: "오후" },
  { time: "14:00~14:50", content: "사고위험과 위해요인의 식별 (이용자 행동특성 등)", instructor: "배송수(검사기관협의회회장)", period: "오후" },
  { time: "15:00~15:50", content: "사고위험별 가능성과 심각성 판단 방법", instructor: "배송수(검사기관협의회회장)", period: "오후" },
  { time: "16:00~17:50", content: "위험요소 저감 조치 및 현장 지도 사례", instructor: "배송수(검사기관협의회회장)", period: "오후" },
];

const keyPoints = [
  {
    title: "어린이놀이시설 안전관리 실무교육",
    description: "민원 처리, 중대사고 발생 시 대응, 지도점검 등 실무 전문화 교육",
  },
  {
    title: "사고위험 분석 및 평가",
    description: "유형별 사고위험(추락·익수·감전·끼임 등) 분석 및 평가",
  },
  {
    title: "안전성평가 수행 절차",
    description: "실무자가 직접 적용할 수 있는 안전성평가 수행 절차",
  },
  {
    title: "문제 사례와 대응방법",
    description: "현장에서 가장 많이 발생하는 문제 사례와 대응방법",
  },
  {
    title: "체크리스트 제공",
    description: "사고 예방을 위한 사전 점검·운영관리 체크리스트 제공",
  },
  {
    title: "구조적·환경적 위험 이해",
    description: "신종·유사 놀이시설의 구조적·환경적 위험 이해",
  },
];

const targets = [
  { icon: UserCheck, text: "무인키즈카페·키즈풀 운영자" },
  { icon: UserCheck, text: "키즈펜션·체험형 놀이시설 운영자" },
  { icon: UserCheck, text: "안전관리 담당자 및 종사자" },
  { icon: UserCheck, text: "신종시설 안전관리 제도 도입 예정 기관" },
];

const benefits = [
  { icon: Award, text: "교육 수료증 발급", color: "text-[#00ff88]" },
  { icon: FileCheck, text: "최신 안전성평가 체크리스트 제공", color: "text-[#00ff88]" },
  { icon: BookOpen, text: "평가 준비 가이드 문서 지원", color: "text-[#00ff88]" },
  { icon: Users, text: "전문 강사(이유진·배송수) 현장 질의응답", color: "text-[#00ff88]" },
];

const applicationMethods = [
  { icon: Clock, text: "온라인 사전 접수" },
  { icon: CheckCircle2, text: "접수 후 개별 안내 문자 발송" },
  { icon: Gift, text: "선착순 마감" },
];

export function EducationSection() {
  return (
    <section id="education" className="relative py-20 md:py-32 px-4 md:px-8 pb-4 md:pb-6">
      <div className="max-w-6xl mx-auto">
        <FloatingSection>
          <h2 className="text-white text-4xl md:text-6xl font-light mb-16 text-center">
            놀이시설 <span className="text-[#00ff88]">안전성평가 교육</span>
          </h2>
        </FloatingSection>

        <div className="space-y-12 md:space-y-16">
          <FloatingSection delay={0.2}>
            <GlassPanel>
              <h3 className="text-white text-2xl md:text-3xl font-medium mb-6">
                교육 개요
              </h3>
              <p className="text-white/80 text-lg font-light leading-relaxed">
                신종·유사 놀이시설의 위험요소를 정확히 이해하고, 안전성평가를 통해 현장에서 즉시 적용 가능한 실무 역량을 강화하는 전문 교육 과정입니다.
                모든 과정은 어린이놀이시설 안전관리 기준 및 최신 정책과 연계하여 구성되었습니다.
              </p>
            </GlassPanel>
          </FloatingSection>

          <FloatingSection delay={0.3}>
            <GlassPanel>
              <h3 className="text-white text-2xl md:text-3xl font-medium mb-6">
                교육 일정
              </h3>
              <p className="text-white/80 mb-6 font-light">
                일자: 09:30 ~ 17:50 (총 1일 과정)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-0">
                      <th className="text-left py-3 px-4 text-white font-medium">시간</th>
                      <th className="text-left py-3 px-4 text-white font-medium">교육 내용</th>
                      <th className="text-left py-3 px-4 text-white font-medium">강사</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item, index) => {
                      const isFirstOfPeriod = index === 0 || schedule[index - 1].period !== item.period;
                      return (
                        <tr
                          key={index}
                          className="border-b-0 hover:bg-white/5 hover:border-b hover:border-[#00ff88]/30 transition-all"
                        >
                          <td className="py-3 px-4 text-white/90 font-light whitespace-nowrap">
                            {item.time}
                          </td>
                          <td className="py-3 px-4 text-white/80 font-light">
                            {item.content}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-white font-medium ${
                                item.period === "오전" ? "text-[#00ff88]" : "text-blue-400"
                              }`}>
                                {item.instructor}
                              </span>
                              {isFirstOfPeriod && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  item.period === "오전" 
                                    ? "bg-[#00ff88]/20 text-[#00ff88]" 
                                    : "bg-blue-400/20 text-blue-400"
                                }`}>
                                  {item.period}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          </FloatingSection>

          <FloatingSection delay={0.4}>
            <GlassPanel className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[#00ff88]" />
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-medium">
                  교육 핵심 포인트
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {keyPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                      <span className="text-[#00ff88] font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1 text-lg">
                        {point.title}
                      </h4>
                      <p className="text-white/70 font-light text-sm md:text-base">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassPanel>
          </FloatingSection>

          <FloatingSection delay={0.5}>
            <GlassPanel className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h3 className="text-white text-3xl md:text-4xl font-medium mb-4">
                  교육 신청하기
                </h3>
                <p className="text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto">
                  놀이시설 안전성평가 교육에 참여를 원하시는 분은 아래 버튼을 통해 신청서를 제출해 주십시오.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                {/* 신청대상 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="glass-panel p-6 rounded-2xl hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-[#00ff88]" />
                    </div>
                    <h4 className="text-white text-xl font-medium">신청대상</h4>
                  </div>
                  <ul className="space-y-3">
                    {targets.map((target, index) => {
                      const Icon = target.icon;
                      return (
                        <li key={index} className="flex items-start gap-2 text-white/80">
                          <Icon className="w-4 h-4 text-[#00ff88] mt-1 flex-shrink-0" />
                          <span className="font-light text-sm md:text-base">{target.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>

                {/* 교육 혜택 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="glass-panel p-6 rounded-2xl hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-[#00ff88]" />
                    </div>
                    <h4 className="text-white text-xl font-medium">교육 혜택</h4>
                  </div>
                  <ul className="space-y-3">
                    {benefits.map((benefit, index) => {
                      const Icon = benefit.icon;
                      return (
                        <li key={index} className="flex items-start gap-2 text-white/80">
                          <Icon className="w-4 h-4 text-[#00ff88] mt-1 flex-shrink-0" />
                          <span className="font-light text-sm md:text-base">{benefit.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>

                {/* 신청 방식 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="glass-panel p-6 rounded-2xl hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#00ff88]" />
                    </div>
                    <h4 className="text-white text-xl font-medium">신청 방식</h4>
                  </div>
                  <ul className="space-y-3">
                    {applicationMethods.map((method, index) => {
                      const Icon = method.icon;
                      return (
                        <li key={index} className="flex items-start gap-2 text-white/80">
                          <Icon className="w-4 h-4 text-[#00ff88] mt-1 flex-shrink-0" />
                          <span className="font-light text-sm md:text-base">{method.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              </div>

              {/* 신청 폼 */}
              <div className="pt-6">
                <EducationApplicationForm />
              </div>
            </GlassPanel>
          </FloatingSection>
        </div>
      </div>
    </section>
  );
}


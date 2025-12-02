"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { FloatingSection } from "@/components/glass/FloatingSection";
import { motion } from "framer-motion";
import { FileCheck, Calendar, AlertTriangle, Search, Wrench, FileText } from "lucide-react";

const evaluationTypes = [
  {
    title: "최초 평가",
    description: "시설 설치 후 이용 개시 전 평가 필수",
    icon: FileCheck,
  },
  {
    title: "정기 평가",
    description: "운영 중 월 1회 이상 자체 또는 전문기관 평가",
    icon: Calendar,
  },
  {
    title: "변경 및 사고 발생 시 평가",
    description: "내부 구조 변경, 시설 교체, 안전사고 발생 시 즉시 재평가",
    icon: AlertTriangle,
  },
];

const steps = [
  {
    title: "위험요소 식별",
    description: "구조물·현장환경·운영상황 전반을 분석",
    icon: Search,
  },
  {
    title: "위험 저감 조치",
    description: "기술적 보완 + 운영관리 체계 개선",
    icon: Wrench,
  },
  {
    title: "결과 등록 및 공유",
    description: "어린이놀이시설 안전관리시스템 등록 및 지속 관리",
    icon: FileText,
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="relative py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FloatingSection>
          <h2 className="text-white text-2xl sm:text-3xl md:text-6xl font-light mb-8 md:mb-16 text-center leading-tight md:leading-normal">
            <span className="text-[#00ff88]">안전성평가</span> 절차
          </h2>
        </FloatingSection>

        <div className="space-y-12 md:space-y-16">
          <FloatingSection delay={0.2}>
            <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium mb-8">
              평가 유형
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {evaluationTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassPanel className="h-full">
                      <Icon className="w-8 h-8 text-[#00ff88] mb-4" />
                      <h4 className="text-white text-xl font-medium mb-3">
                        {type.title}
                      </h4>
                      <p className="text-white/80 font-light">
                        {type.description}
                      </p>
                    </GlassPanel>
                  </motion.div>
                );
              })}
            </div>
          </FloatingSection>

          <FloatingSection delay={0.4}>
            <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium mb-8">
              평가 단계
            </h3>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/20 hidden md:block" />
              <div className="space-y-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="relative flex gap-6"
                    >
                      <div className="flex-shrink-0 w-16 h-16 rounded-full glass-panel flex items-center justify-center z-10">
                        <Icon className="w-8 h-8 text-[#00ff88]" />
                      </div>
                      <GlassPanel className="flex-1">
                        <h4 className="text-white text-xl font-medium mb-2">
                          {index + 1}. {step.title}
                        </h4>
                        <p className="text-white/80 font-light">
                          {step.description}
                        </p>
                      </GlassPanel>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FloatingSection>
        </div>
      </div>
    </section>
  );
}


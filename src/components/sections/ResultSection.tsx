"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { FloatingSection } from "@/components/glass/FloatingSection";
import { CheckCircle2, FileText, Shield, Award } from "lucide-react";

const benefits = [
  {
    icon: FileText,
    title: "시설 고유번호 발급",
  },
  {
    icon: Shield,
    title: "보험·안전교육·의무사항 이행 가능",
  },
  {
    icon: CheckCircle2,
    title: "안전모니터링 기록 관리",
  },
  {
    icon: Award,
    title: "이용자에게 안전한 시설임을 인증하는 공개 자료로 활용 가능",
  },
];

export function ResultSection() {
  return (
    <section id="result" className="relative py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FloatingSection>
          <h2 className="text-white text-4xl md:text-6xl font-light mb-16 text-center">
            평가 <span className="text-[#00ff88]">결과 활용</span>
          </h2>
        </FloatingSection>

        <FloatingSection delay={0.2}>
          <GlassPanel className="mb-8">
            <p className="text-white/90 text-lg md:text-xl font-light text-center">
              안전성평가 결과는 <strong className="font-medium text-[#00ff88]">어린이놀이시설 안전관리시스템</strong>에 등록
            </p>
          </GlassPanel>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <FloatingSection key={index} delay={0.3 + index * 0.1}>
                  <GlassPanel className="h-full">
                    <div className="flex items-start gap-4">
                      <Icon className="w-8 h-8 text-[#00ff88] flex-shrink-0 mt-1" />
                      <p className="text-white/90 font-light text-lg">
                        {benefit.title}
                      </p>
                    </div>
                  </GlassPanel>
                </FloatingSection>
              );
            })}
          </div>
        </FloatingSection>
      </div>
    </section>
  );
}


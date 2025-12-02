"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { FloatingSection } from "@/components/glass/FloatingSection";
import { motion } from "framer-motion";
import { Droplets, TrendingDown, Zap, AlertCircle } from "lucide-react";

const facilities = [
  "무인 키즈카페 / 무인 키즈풀",
  "키즈펜션, 키즈풀빌라, 민박·숙박형 키즈테마 공간",
  "공산품 안전인증 대상이 아니지만 놀이 목적으로 사용되는 설비·구조물",
  "놀이공간 내에 설치된 부가적 활용 구조물",
  "목욕조·물놀이 욕조·수작업 고정형 구조물 등 비표준 설치물",
];

const playTypes = [
  "오르는 놀이형",
  "건너는 놀이형",
  "흔들·그네형",
  "미끄럼형",
  "물놀이형",
  "조합형(2종 이상의 형태를 결합한 구조)",
];

const risks = [
  {
    type: "익수 위험",
    icon: Droplets,
    color: "text-[#00ff88]",
    items: ["수심·배수구·안전요원 부재, 감시 사각지대"],
  },
  {
    type: "추락 위험",
    icon: TrendingDown,
    color: "text-[#00ff88]",
    items: ["난간 미설치, 안전공간 부족, 높이 제한 미준수"],
  },
  {
    type: "감전 위험",
    icon: Zap,
    color: "text-[#00ff88]",
    items: ["노출 전기설비, 습도·물기 환경의 전기 기기 비보호"],
  },
  {
    type: "충돌·끼임·넘어짐",
    icon: AlertCircle,
    color: "text-[#00ff88]",
    items: ["동선 중첩, 돌출부, 바닥 미끄러움, 구조물 간 간섭"],
  },
];

export function TargetSection() {
  return (
    <section id="target" className="relative py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FloatingSection>
          <h2 className="text-white text-2xl sm:text-3xl md:text-6xl font-light mb-8 md:mb-16 text-center leading-tight md:leading-normal">
            <span className="text-[#00ff88]">안전성평가</span> 대상 및 주요 위험요소
          </h2>
        </FloatingSection>

        <div className="space-y-12 md:space-y-16">
          <FloatingSection delay={0.2}>
            <GlassPanel>
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium mb-6">
                평가 대상 시설
              </h3>
              <p className="text-white/80 text-sm sm:text-base md:text-lg mb-6 font-light leading-normal">
                다음과 같은 시설은 모두 안전성평가 대상입니다:
              </p>
              <ul className="space-y-3">
                {facilities.map((facility, index) => (
                  <li key={index} className="flex items-start gap-3 text-white/90">
                    <span className="text-white/50 mt-1">•</span>
                    <span className="font-light">{facility}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </FloatingSection>

          <FloatingSection delay={0.3}>
            <GlassPanel>
              <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium mb-6">
                유사 놀이기구 분류
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {playTypes.map((type, index) => (
                  <div
                    key={index}
                    className="text-white/90 font-light text-sm md:text-base"
                  >
                    • {type}
                  </div>
                ))}
              </div>
            </GlassPanel>
          </FloatingSection>

          <FloatingSection delay={0.4}>
            <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium mb-8 text-center">
              주요 위험유형 (핵심 사례 중심)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {risks.map((risk, index) => {
                const Icon = risk.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassPanel className="h-full hover:scale-105 transition-transform">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className={`w-6 h-6 ${risk.color}`} />
                        <h4 className={`text-xl font-medium ${risk.color}`}>
                          {risk.type}
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {risk.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="text-white/80 font-light text-sm md:text-base"
                          >
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </GlassPanel>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-white/90 text-lg mt-8 text-center font-light italic">
              이 모든 요소를 종합적으로 판단하여{" "}
              <strong className="font-medium text-[#00ff88]">위험도의 '허용 가능 수준'을 관리하는 것</strong>이 안전성평가의 핵심입니다.
            </p>
          </FloatingSection>
        </div>
      </div>
    </section>
  );
}


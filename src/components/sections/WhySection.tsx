"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { FloatingSection } from "@/components/glass/FloatingSection";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, CheckCircle2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function WhySection() {
  const limitations = [
    "놀이기구 형태가 비표준·비정형 구조물로 이루어져 있음",
    "공간 전체가 놀이로 활용되어 위험요소가 다양함",
    "관리 인력 부재 및 무인 운영 증가",
    "관리자의 안전관리 역량에 따라 시설의 위험도 편차 발생",
  ];

  const solutions = [
    "시설 구조물 안전성",
    "충돌·추락·익수 등 치명적 위험",
    "동선·환경·조명·전기 등 주변 환경",
    "운영자 안전관리 체계",
    "관리자의 대응 역량 및 비상조치 계획",
  ];

  return (
    <section id="why" className="relative py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FloatingSection>
          <h2 className="text-white text-2xl sm:text-3xl md:text-6xl font-light mb-8 md:mb-16 text-center leading-tight md:leading-normal">
            왜 지금 <span className="text-[#00ff88]">'안전성평가'</span>가 필요한가요?
          </h2>
        </FloatingSection>

        <div className="space-y-12 md:space-y-16">
          <FloatingSection delay={0.2}>
            <GlassPanel>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-8 h-8 text-[#00ff88]" />
                <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium">
                  기존 제도의 한계
                </h3>
              </div>
              <p className="text-white/80 text-sm sm:text-base md:text-lg mb-6 font-light leading-normal md:leading-relaxed">
                전통적인 어린이놀이시설은 정량화된 안전기준과 법적 검사를 통해 관리되지만,
                신종 놀이공간은 다음과 같은 이유로 기존 제도로 관리가 어렵습니다.
              </p>
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="space-y-4"
              >
                {limitations.map((item, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className="flex items-start gap-3 text-white/90"
                  >
                    <span className="text-white/50 mt-1">•</span>
                    <span className="font-light">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </GlassPanel>
          </FloatingSection>

          <FloatingSection delay={0.4}>
            <GlassPanel>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-[#00ff88]" />
                <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium">
                  안전성평가가 해결하는 것
                </h3>
              </div>
              <p className="text-white/80 text-sm sm:text-base md:text-lg mb-6 font-light leading-normal md:leading-relaxed">
                안전성평가는 다음 요소들을 통합적으로 점검합니다:
              </p>
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="space-y-4"
              >
                {solutions.map((item, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className="flex items-start gap-3 text-white/90"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#00ff88] mt-0.5 flex-shrink-0" />
                    <span className="font-light">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <p className="text-white/90 text-lg mt-6 font-light italic">
                기존 검사에서 다루지 못한 <strong className="font-medium text-[#00ff88]">정성적·종합적 위험 관리 체계를 구축</strong>하는 것이 핵심입니다.
              </p>
            </GlassPanel>
          </FloatingSection>
        </div>
      </div>
    </section>
  );
}


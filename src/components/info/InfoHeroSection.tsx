"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { motion } from "framer-motion";
import { HERO_BADGES } from "@/data/legal-obligations";

export function InfoHeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[85vh] flex items-center justify-center px-4 md:px-8 py-24 md:py-32 pt-32 md:pt-40"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/80 via-[#1e3a5f]/60 to-black/70 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <GlassPanel className="p-8 md:p-12 border-[#1e3a5f]/30">
            <div className="space-y-6">
              <p className="text-[#2d8a4e] text-sm md:text-base font-medium tracking-wide">
                양주시 어린이놀이시설 안전관리
              </p>
              <h1 className="text-white font-medium leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                양주시 어린이놀이시설
                <br />
                <span className="text-[#2d8a4e]">안전관리자 교육</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg leading-relaxed">
                어린이놀이시설 관리주체와 안전관리자를 위한
                <br className="hidden sm:block" />
                법정의무사항, 안전관리 매뉴얼, CPF 사용자 매뉴얼 통합 안내 페이지
              </p>
              <p className="text-white/70 text-sm md:text-base leading-relaxed border-l-2 border-[#2d8a4e]/50 pl-4">
                본 페이지는 「어린이놀이시설 안전관리법」에 따른 관리주체의 주요 의무사항과
                안전관리 실무 자료를 안내하기 위해 제작되었습니다.
              </p>
            </div>
          </GlassPanel>

          <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
            {HERO_BADGES.map((badge) => (
              <span
                key={badge}
                className="px-3 py-1.5 rounded-full text-xs md:text-sm font-medium bg-[#1e3a5f]/60 text-white border border-[#2d8a4e]/40"
              >
                {badge}
              </span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center md:justify-start"
          >
            <GlowCapsuleButton href="#legal" className="text-sm md:text-base px-6 py-3">
              법적의무사항 확인하기
            </GlowCapsuleButton>
            <GlowCapsuleButton
              href="#safety-manual"
              variant="secondary"
              className="text-sm md:text-base px-6 py-3"
            >
              관리주체 안전매뉴얼 보기
            </GlowCapsuleButton>
            <GlowCapsuleButton
              href="#cpf-manual"
              variant="secondary"
              className="text-sm md:text-base px-6 py-3"
            >
              CPF 사용자 매뉴얼 보기
            </GlowCapsuleButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlowCapsuleButton } from "@/components/glass/GlowCapsuleButton";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 md:px-8 py-20 md:py-32 pt-32 md:pt-40">
      {/* 배경 동영상 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/3.mp4" type="video/mp4" />
      </video>
      {/* 동영상 오버레이 - 가독성 향상 */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-[1]" />
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 md:space-y-10"
        >
          {/* 메인 타이틀 패널 */}
          <GlassPanel className="p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-white font-light mb-4 md:mb-8 leading-[1.25] md:leading-[1.2] tracking-tight">
                <span className="block text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl mb-1.5 md:mb-2">
                  보이지 않는 위험까지 관리
                </span>
                <span className="block text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl mb-1.5 md:mb-2">
                  하는 새로운 안전 기준,
                </span>
                <span className="block text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-[#00ff88]">
                  신종놀이시설 안전성평가
                </span>
              </h1>
              <p className="text-white/90 text-base sm:text-lg md:text-2xl lg:text-3xl font-light leading-normal md:leading-relaxed">
                아이들이 자유롭게 놀 수 있는 공간, 이제 더 <span className="text-[#00ff88] font-medium">안전하게</span> 관리해야 합니다.
              </p>
            </motion.div>
          </GlassPanel>

          {/* 설명 패널 */}
          <GlassPanel className="p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <p className="text-white/85 text-sm sm:text-base md:text-xl lg:text-2xl leading-normal md:leading-relaxed font-light">
                급증하는 <strong className="font-medium text-[#00ff88]">무인키즈풀·무인키즈카페·키즈펜션</strong> 등 신종 어린이 놀이공간은 기존 법령의 관리 대상이 아니어서{" "}
                <strong className="font-medium text-[#00ff88]">안전 사각지대</strong>가 되고 있습니다.
              </p>
              <p className="text-white/85 text-sm sm:text-base md:text-xl lg:text-2xl leading-normal md:leading-relaxed font-light">
                이를 해결하기 위해 정부는 <strong className="font-medium text-[#00ff88]">신종놀이시설 안전성평가 제도</strong>를 도입하여, 다양한 형태의 놀이공간에서 발생할 수 있는{" "}
                <strong className="font-medium text-[#00ff88]">환경·관리·이용자 행동 기반 위험요소까지 포괄적으로 관리</strong>할 수 있도록 지원합니다.
              </p>
            </motion.div>
          </GlassPanel>

          {/* CTA 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start pt-4"
          >
            <GlowCapsuleButton href="#contact" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
              무료 사전진단 신청
            </GlowCapsuleButton>
            <GlowCapsuleButton href="#info" variant="secondary" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
              안전성평가 의무 안내받기
            </GlowCapsuleButton>
            <GlowCapsuleButton href="#consult" variant="secondary" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
              전문가 상담 요청
            </GlowCapsuleButton>
            <GlowCapsuleButton href="#education" variant="secondary" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
              안전성 평가 교육 신청
            </GlowCapsuleButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


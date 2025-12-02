"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { FloatingSection } from "@/components/glass/FloatingSection";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    id: 1,
    name: "김○○",
    role: "무인키즈카페 운영자",
    rating: 5,
    content: "안전성평가 교육을 통해 우리 시설의 위험요소를 정확히 파악할 수 있었습니다. 실무에 바로 적용 가능한 내용이 많아 매우 유용했습니다.",
  },
  {
    id: 2,
    name: "이○○",
    role: "키즈펜션 운영자",
    rating: 5,
    content: "기존에 알지 못했던 안전 관리 방법을 배울 수 있어서 좋았습니다. 특히 위험요소 식별 방법이 매우 체계적이었습니다.",
  },
  {
    id: 3,
    name: "박○○",
    role: "안전관리 담당자",
    rating: 5,
    content: "전문 강사님들의 현장 경험이 풍부해서 실제 사례를 바탕으로 한 설명이 이해하기 쉬웠습니다. 추천합니다!",
  },
  {
    id: 4,
    name: "최○○",
    role: "무인키즈풀 운영자",
    rating: 5,
    content: "교육 수료증 발급과 체크리스트 제공이 실무에 큰 도움이 되었습니다. 정기적으로 참여하고 싶습니다.",
  },
  {
    id: 5,
    name: "정○○",
    role: "키즈테마 공간 운영자",
    rating: 5,
    content: "안전성평가의 중요성을 다시 한번 깨달았습니다. 아이들의 안전을 위해 꼭 필요한 교육이었습니다.",
  },
];

export function CTASection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // 5초마다 자동 전환

    return () => clearInterval(interval);
  }, []);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-[#00ff88] fill-[#00ff88]" : "text-white/30"
        }`}
      />
    ));
  };

  return (
    <section id="cta" className="relative pt-8 md:pt-12 pb-20 md:pb-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FloatingSection>
          <h2 className="text-white text-4xl md:text-6xl font-light mb-16 text-center">
            수료생 <span className="text-[#00ff88]">교육소감</span>
          </h2>
        </FloatingSection>

        <FloatingSection delay={0.2}>
          <div className="relative">
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 glass-panel p-3 rounded-full hover:border-[#00ff88] transition-all"
              aria-label="이전"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <GlassPanel className="p-8 md:p-12">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="flex gap-1">
                        {renderStars(testimonials[currentIndex].rating)}
                      </div>
                      <p className="text-white/90 text-lg md:text-xl lg:text-2xl font-light leading-relaxed max-w-4xl">
                        "{testimonials[currentIndex].content}"
                      </p>
                      <div className="pt-4">
                        <p className="text-[#00ff88] text-lg md:text-xl font-medium">
                          {testimonials[currentIndex].name}
                        </p>
                        <p className="text-white/70 text-sm md:text-base font-light mt-1">
                          {testimonials[currentIndex].role}
                        </p>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 glass-panel p-3 rounded-full hover:border-[#00ff88] transition-all"
              aria-label="다음"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* 인디케이터 */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-[#00ff88]"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`${index + 1}번째 소감으로 이동`}
              />
            ))}
          </div>
        </FloatingSection>
      </div>
    </section>
  );
}

"use client";

import { FloatingSection } from "@/components/glass/FloatingSection";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

// 이미지 배열 생성 (확장자 혼재: 1-4는 .jpeg, 5-8은 .jpg)
const galleryImages = [
  { src: "/gallery-1.jpeg", alt: "안전사각지대 신종놀이공간 안전성평가 이미지 1" },
  { src: "/gallery-2.jpeg", alt: "안전사각지대 신종놀이공간 안전성평가 이미지 2" },
  { src: "/gallery-3.jpeg", alt: "안전사각지대 신종놀이공간 안전성평가 이미지 3" },
  { src: "/gallery-4.jpeg", alt: "안전사각지대 신종놀이공간 안전성평가 이미지 4" },
  { src: "/gallery-5.jpg", alt: "안전사각지대 신종놀이공간 안전성평가 이미지 5" },
  { src: "/gallery-6.jpg", alt: "안전사각지대 신종놀이공간 안전성평가 이미지 6" },
  { src: "/gallery-7.jpg", alt: "안전사각지대 신종놀이공간 안전성평가 이미지 7" },
  { src: "/gallery-8.jpg", alt: "안전사각지대 신종놀이공간 안전성평가 이미지 8" },
];

export function InfoGraphicSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 자동 슬라이드 로직 (3초마다)
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // 다음 이미지로 이동
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    setIsAutoPlaying(false);
    // 버튼 클릭 후 5초 뒤 자동 재생 재개
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // 이전 이미지로 이동
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    setIsAutoPlaying(false);
    // 버튼 클릭 후 5초 뒤 자동 재생 재개
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // 특정 인덱스로 이동 (인디케이터 클릭용)
  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <section id="infographic" className="relative pt-4 md:pt-6 pb-20 md:pb-32 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <FloatingSection>
          <GlassPanel className="p-4 md:p-8 overflow-hidden">
            {/* 제목 */}
            <div className="text-center mb-10">
              <h3 className="text-white text-xl sm:text-2xl md:text-4xl font-medium mb-4 leading-tight md:leading-normal">
                안전사각지대 신종놀이공간 안전성평가
              </h3>
            </div>

            {/* 갤러리 영역 */}
            <div
              className="relative"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {/* 좌측 네비게이션 버튼 */}
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 glass-panel p-3 rounded-full hover:border-[#00ff88] transition-all"
                aria-label="이전 이미지"
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

              {/* 이미지 슬라이더 컨테이너 */}
              <div className="overflow-hidden rounded-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="relative w-full aspect-video"
                  >
                    <Image
                      src={galleryImages[currentIndex].src}
                      alt={galleryImages[currentIndex].alt}
                      fill
                      className="object-contain"
                      priority={currentIndex === 0}
                      unoptimized
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 우측 네비게이션 버튼 */}
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 glass-panel p-3 rounded-full hover:border-[#00ff88] transition-all"
                aria-label="다음 이미지"
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

            {/* 인디케이터 점들 */}
            <div className="flex justify-center gap-2 mt-6">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-[#00ff88] w-8"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`이미지 ${index + 1}로 이동`}
                />
              ))}
            </div>

            {/* 이미지 카운터 */}
            <div className="text-center mt-4">
              <p className="text-white/60 text-sm font-light">
                {currentIndex + 1} / {galleryImages.length}
              </p>
            </div>
          </GlassPanel>
        </FloatingSection>
      </div>
    </section>
  );
}

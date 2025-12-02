"use client";

import { FloatingSection } from "@/components/glass/FloatingSection";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export function InfoGraphicSection() {
  const [isHovered, setIsHovered] = useState(false);

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
            
            <motion.div
              className="relative w-full"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* 이미지 */}
              <div className="relative w-full">
                <Image
                  src="/unnamed.png"
                  alt="안전 사각지대, 신종 놀이공간 안전성 평가 가이드"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain"
                  unoptimized
                  priority
                />
                
                {/* 다크 오버레이 */}
                <motion.div
                  className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isHovered ? 0 : 1 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
                
                {/* 호버 시 형광 초록색 글로우 효과 */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isHovered ? 0.3 : 0,
                    boxShadow: isHovered ? "0 0 60px rgba(0, 255, 136, 0.4)" : "none"
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{
                    background: isHovered 
                      ? "radial-gradient(circle at center, rgba(0, 255, 136, 0.1) 0%, transparent 70%)"
                      : "transparent"
                  }}
                />
              </div>
              
              {/* 호버 안내 텍스트 */}
              <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: isHovered ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white/60 text-sm md:text-base font-light">
                  마우스를 올려서 자세히 보기
                </p>
              </motion.div>
            </motion.div>
          </GlassPanel>
        </FloatingSection>
      </div>
    </section>
  );
}


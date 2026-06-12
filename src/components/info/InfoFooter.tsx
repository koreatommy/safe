"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { motion } from "framer-motion";
import { ExternalLink, Shield } from "lucide-react";

const LEGAL_REFERENCE_DATE = "2026년 6월";

export function InfoFooter() {
  return (
    <footer className="px-4 md:px-8 pb-16 md:pb-24 pt-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <GlassPanel className="p-8 md:p-10 border-[#1e3a5f]/30">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#00ff88]" aria-hidden />
                </div>
                <h2 className="text-white text-base font-medium">주관 · 운영</h2>
              </div>
              <p className="text-white/90 text-sm md:text-base font-medium">
                (사)창의융합연구원 안전관리지원기관
              </p>
              <p className="text-white/90 text-sm md:text-base">
                <span className="text-white/70">문의:</span>{" "}
                <a
                  href="tel:01023271730"
                  className="whitespace-nowrap hover:text-[#00ff88] transition-colors"
                >
                  이유진 원장(010-2327-1730)
                </a>
                <span className="text-white/50 mx-1">/</span>
                <a
                  href="tel:01093939264"
                  className="whitespace-nowrap hover:text-[#00ff88] transition-colors"
                >
                  이영일 본부장(010-9393-9264)
                </a>
              </p>
              <p className="text-white/75 text-sm md:text-base leading-relaxed">
                본 페이지는 양주시 어린이놀이시설 안전관리자 교육 안내를 목적으로 제작되었습니다.
              </p>
              <p className="text-white/60 text-sm">
                법령 및 자료 기준일: {LEGAL_REFERENCE_DATE}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-white text-base font-medium">문의 · 참고</h3>
              <p className="text-white/75 text-sm md:text-base leading-relaxed">
                최신 법령 및 제도는 관계 법령 및 어린이놀이시설 안전관리시스템(CPF)을 통해
                확인하시기 바랍니다.
              </p>
              <a
                href="https://cpf.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#00ff88] hover:text-[#39ff14] text-sm md:text-base transition-colors"
              >
                <ExternalLink className="w-4 h-4" aria-hidden />
                어린이놀이시설 안전관리시스템 (cpf.go.kr)
              </a>
            </motion.div>
          </div>

          <div className="my-8 border-t border-white/10" />

          <p className="text-white/50 text-xs md:text-sm text-center leading-relaxed">
            법령 및 제도는 개정될 수 있으므로 최신 기준은 관계 법령 및 어린이놀이시설
            안전관리시스템을 통해 확인하시기 바랍니다.
          </p>
        </GlassPanel>
      </div>
    </footer>
  );
}

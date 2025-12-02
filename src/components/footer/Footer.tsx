"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative pt-8 md:pt-12 pb-16 md:pb-20 px-4 md:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <GlassPanel className="p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* 기관 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#00ff88]" />
                </div>
                <h2 className="text-white text-sm md:text-base font-bold whitespace-nowrap" style={{ fontSize: '99%' }}>
                  한국창의융합연구원
                </h2>
              </div>
              <p className="text-white/70 text-sm md:text-base font-light leading-relaxed">
                창의적 융합을 통한 가치 창출과 혁신적인 연구로 미래를 선도합니다.
              </p>
            </motion.div>

            {/* 연락처 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h4 className="text-white text-sm md:text-base font-medium mb-4">연락처</h4>
              <div className="space-y-4">
                <a
                  href="tel:010-2327-1730"
                  className="flex items-center gap-3 text-white/80 hover:text-[#00ff88] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#00ff88]/20 flex items-center justify-center transition-colors">
                    <Phone className="w-5 h-5 text-[#00ff88]" />
                  </div>
                  <span className="font-light text-sm md:text-base">010-2327-1730</span>
                </a>
                <a
                  href="mailto:hieugenelee@gmail.com"
                  className="flex items-center gap-3 text-white/80 hover:text-[#00ff88] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#00ff88]/20 flex items-center justify-center transition-colors">
                    <Mail className="w-5 h-5 text-[#00ff88]" />
                  </div>
                  <span className="font-light text-sm md:text-base">hieugenelee@gmail.com</span>
                </a>
              </div>
            </motion.div>

            {/* 추가 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <h4 className="text-white text-sm md:text-base font-medium mb-4">지원정보</h4>
              <div className="space-y-3">
                <p className="text-white/60 text-sm md:text-base font-light">
                  신종놀이시설 안전성평가
                </p>
                <p className="text-white/60 text-sm md:text-base font-light">
                  전문 교육 및 컨설팅
                </p>
                <p className="text-white/60 text-sm md:text-base font-light">
                  A.I SaaS 자동화 플랫폼 지원
                </p>
              </div>
            </motion.div>
          </div>

          {/* 구분선 */}
          <div className="my-8 border-t border-white/10" />

          {/* 저작권 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <p className="text-white/50 text-xs md:text-sm font-light">
              © 2024 한국창의융합연구원. All rights reserved.
            </p>
          </motion.div>
        </GlassPanel>
      </div>
    </footer>
  );
}


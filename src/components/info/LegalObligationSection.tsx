"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { motion } from "framer-motion";
import { AlertTriangle, CheckSquare } from "lucide-react";
import {
  LEGAL_CHECKLIST_ITEMS,
  LEGAL_OBLIGATION_INTRO,
  LEGAL_PENALTY_NOTICE,
  legalObligations,
} from "@/data/legal-obligations";
import { LegalObligationCard } from "./LegalObligationCard";

export function LegalObligationSection() {
  return (
    <section id="legal" className="px-4 md:px-8 py-16 md:py-24">
      <div className="max-w-4xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassPanel className="p-6 md:p-10 border-[#1e3a5f]/30">
            <p className="text-[#00ff88] text-sm font-medium mb-3">Section 1</p>
            <h2 className="text-white text-xl md:text-2xl font-medium mb-4">
              법적의무사항 알림
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              {LEGAL_OBLIGATION_INTRO}
            </p>
          </GlassPanel>
        </motion.div>

        <div className="grid gap-4 md:gap-5">
          {legalObligations.map((obligation, index) => (
            <motion.div
              key={obligation.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <LegalObligationCard obligation={obligation} defaultOpen={index === 0} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassPanel className="p-6 md:p-8 border-[#f59e0b]/30 bg-[#f59e0b]/5">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" aria-hidden />
              <div>
                <h3 className="text-white font-medium text-base md:text-lg mb-2">
                  위반 시 제재 안내
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  {LEGAL_PENALTY_NOTICE}
                </p>
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassPanel className="p-6 md:p-8 border-[#00ff88]/30">
            <div className="flex gap-3 items-center mb-5">
              <CheckSquare className="w-5 h-5 text-[#00ff88]" aria-hidden />
              <h3 className="text-white font-medium text-base md:text-lg">
                관리주체 필수 체크리스트
              </h3>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {LEGAL_CHECKLIST_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-white/80 text-sm md:text-base"
                >
                  <span
                    className="mt-0.5 w-4 h-4 rounded border border-[#00ff88]/60 shrink-0"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </GlassPanel>
        </motion.div>
      </div>
    </section>
  );
}

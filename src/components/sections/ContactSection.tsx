"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { FloatingSection } from "@/components/glass/FloatingSection";
import { ContactForm } from "@/components/forms/ContactForm";

export function ContactSection() {
  return (
    <section id="contact" className="relative py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FloatingSection>
          <h2 className="text-white text-2xl sm:text-3xl md:text-6xl font-light mb-8 md:mb-16 text-center leading-tight md:leading-normal">
            <span className="text-[#00ff88]">문의하기</span>
          </h2>
        </FloatingSection>

        <FloatingSection delay={0.2}>
          <GlassPanel className="p-8 md:p-12">
            <div className="text-center mb-10">
              <p className="text-white/80 text-sm sm:text-base md:text-xl font-light max-w-2xl mx-auto leading-normal md:leading-relaxed">
                안전성평가 및 교육에 대한 문의사항이 있으시면 아래 양식을 작성해주시기 바랍니다.
                <br />
                빠른 시일 내에 답변 드리겠습니다.
              </p>
            </div>

            <ContactForm />
          </GlassPanel>
        </FloatingSection>
      </div>
    </section>
  );
}


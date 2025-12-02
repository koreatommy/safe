"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { FloatingSection } from "@/components/glass/FloatingSection";

const obligations = [
  {
    field: "시설 등록",
    action: "유사 놀이기구 시설 등록 및 시스템 정보 입력",
    type: "법제화 예정",
    isRequired: false,
  },
  {
    field: "안전성평가",
    action: "월 1회 이상 평가, 결과 시스템 등록, 영업장 비치",
    type: "권고",
    isRequired: false,
  },
  {
    field: "보험 가입",
    action: "어린이놀이시설 배상책임보험 가입",
    type: "법적 의무",
    isRequired: true,
  },
  {
    field: "안전교육",
    action: "2년 1회, 4시간 이상 이수 및 등록",
    type: "법적 의무",
    isRequired: true,
  },
  {
    field: "사고 보고",
    action: "중대한 사고 즉시 중지 및 보고",
    type: "권고",
    isRequired: false,
  },
];

export function ObligationSection() {
  return (
    <section id="obligation" className="relative py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FloatingSection>
          <h2 className="text-white text-2xl sm:text-3xl md:text-6xl font-light mb-8 md:mb-16 text-center leading-tight md:leading-normal">
            관리 주체(사업주)의 <span className="text-[#00ff88]">의무</span> 및 권고사항
          </h2>
        </FloatingSection>

        <FloatingSection delay={0.2}>
          <GlassPanel>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-0">
                    <th className="text-left py-4 px-4 text-white font-medium">관리 분야</th>
                    <th className="text-left py-4 px-4 text-white font-medium">주요 조치</th>
                    <th className="text-left py-4 px-4 text-white font-medium">의무/권고</th>
                  </tr>
                </thead>
                <tbody>
                  {obligations.map((obligation, index) => (
                    <tr
                      key={index}
                      className="border-b-0 hover:bg-white/5 hover:border-b hover:border-[#00ff88]/30 transition-all"
                    >
                      <td className="py-4 px-4 text-white/90 font-light">
                        {obligation.field}
                      </td>
                      <td className="py-4 px-4 text-white/80 font-light">
                        {obligation.action}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-medium ${
                            obligation.isRequired
                              ? "text-[#00ff88]"
                              : "text-white/70"
                          }`}
                        >
                          {obligation.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/90 text-lg mt-8 font-light italic text-center">
              관리자가 직접 위험을 찾고 개선하는 방식으로 <span className="text-[#00ff88] font-medium">운영 안전성을 높이는 제도</span>입니다.
            </p>
          </GlassPanel>
        </FloatingSection>
      </div>
    </section>
  );
}


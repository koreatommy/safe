import { quizQuestions } from "@/data/playsafe/quiz";
import type { EligibilityPair } from "@/lib/playsafe-workflow/types";
import { DetailSection } from "./DetailSection";

export function EligibilityAnswersSection({ answers }: { answers: EligibilityPair[] }) {
  const byCode = new Map(answers.map((item) => [item.code, item.answer]));

  return (
    <DetailSection title="신규설치 등록신청 판단 기준">
      <ol className="space-y-2">
        {quizQuestions.map((question, index) => {
          const answer = byCode.get(question.code);
          return (
            <li key={question.code} className="flex items-start justify-between gap-3">
              <span className="text-white/80">
                {index + 1}. {question.question}
              </span>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${
                  answer === "yes"
                    ? "bg-[#00ff88]/10 text-[#00ff88]"
                    : answer === "no"
                      ? "bg-red-500/15 text-red-200"
                      : "bg-white/5 text-white/40"
                }`}
              >
                {answer === "yes" ? "네" : answer === "no" ? "아니요" : "미응답"}
              </span>
            </li>
          );
        })}
      </ol>
    </DetailSection>
  );
}

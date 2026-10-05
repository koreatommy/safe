import { NOT_TARGET_SUMMARY, NOT_TARGET_TITLE } from "@/data/playsafe/facility-registration";
import { quizQuestions } from "@/data/playsafe/quiz";
import type { EligibilityAnswer, FailedCriterion } from "@/data/playsafe/types";
import { FailedCriteriaList } from "./FailedCriteriaList";

type EligibilityQuestionsProps = {
  answers: readonly EligibilityAnswer[];
  failedCriteria: readonly FailedCriterion[];
  onAnswer: (index: number, value: EligibilityAnswer) => void;
  onBack: () => void;
  onNext: () => void;
};

export function EligibilityQuestions({ answers, failedCriteria, onAnswer, onBack, onNext }: EligibilityQuestionsProps) {
  return (
    <>
      <ol className="facility-questions">
        {quizQuestions.map((item, index) => (
          <li key={item.question}>
            {index > 0 && <p className="facility-arrow" aria-hidden="true">▼</p>}
            <article className={answers[index] === "no" ? "facility-question failed" : "facility-question"}>
              <span className="facility-question-number" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{item.question}</h3>
              <p>{item.hint}</p>
              <div className="facility-answers">
                <button
                  type="button"
                  className={answers[index] === "yes" ? "selected" : undefined}
                  aria-pressed={answers[index] === "yes"}
                  onClick={() => onAnswer(index, "yes")}
                >
                  네
                </button>
                <button
                  type="button"
                  className={answers[index] === "no" ? "selected" : undefined}
                  aria-pressed={answers[index] === "no"}
                  onClick={() => onAnswer(index, "no")}
                >
                  아니요
                </button>
              </div>
            </article>
          </li>
        ))}
      </ol>
      {failedCriteria.length > 0 ? (
        <div className="facility-not-target" role="status">
          <strong>{NOT_TARGET_TITLE}</strong>
          <p>{NOT_TARGET_SUMMARY} 기구정보 등록은 ‘놀이기구 없음’으로 종결됩니다.</p>
          <FailedCriteriaList criteria={failedCriteria} />
        </div>
      ) : (
        <p className="facility-notice">
          유사 놀이기구 판단 절차 및 기준에 부합되는지 확인합니다. 모든 기준에 부합되는 경우에만 신종·유사
          놀이시설로 등록신청이 가능합니다.
        </p>
      )}
      <div className="facility-actions">
        <button type="button" className="btn" onClick={onBack}>
          이전 항목으로
        </button>
        <button type="button" className="btn primary" onClick={onNext}>
          선택 확인 · 기구정보 등록
        </button>
      </div>
    </>
  );
}

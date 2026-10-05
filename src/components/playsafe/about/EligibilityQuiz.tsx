"use client";

import { useRef, useState } from "react";
import { quizQuestions } from "@/data/playsafe/quiz";
import { evaluateQuiz, progressLabel, type QuizAnswer } from "./quizProgress";
import "./quiz.css";

const emptyAnswers = (): QuizAnswer[] => quizQuestions.map(() => null);

export function EligibilityQuiz() {
  const [answers, setAnswers] = useState<QuizAnswer[]>(emptyAnswers);
  const stepsRef = useRef<HTMLDivElement>(null);
  const state = evaluateQuiz(answers);

  const answer = (index: number, value: "yes" | "no") => {
    setAnswers((prev) => prev.map((a, i) => (i < index ? a : i === index ? value : null)));
  };

  const reset = () => {
    setAnswers(emptyAnswers());
    stepsRef.current?.querySelector("button")?.focus();
  };

  return (
    <>
      <span className="micro">REGISTRATION CHECK</span>
      <h3>대상 여부 간단 확인</h3>
      <p className="quiz-intro">신규설치 등록신청 화면의 유사 놀이기구 판단 절차를 순서대로 확인합니다.</p>
      <div className="quiz-progress" aria-live="polite">
        {progressLabel(state)}
      </div>
      <div className="quiz-steps" ref={stepsRef}>
        {quizQuestions.map((q, i) => {
          const locked = i > state.openIndex;
          return (
            <div
              key={q.question}
              className={`quiz-step${i === state.openIndex ? " current" : ""}${locked ? " locked" : ""}`}
              aria-disabled={locked || undefined}
            >
              <span className="quiz-number">{i + 1}</span>
              <div className="quiz-question">
                <strong>{q.question}</strong>
                <small>{q.hint}</small>
                <div className="quiz-options" role="group" aria-label={`${i + 1}번 질문 답변`}>
                  <button type="button" aria-pressed={answers[i] === "yes"} disabled={locked} onClick={() => answer(i, "yes")}>
                    네
                  </button>
                  <button type="button" aria-pressed={answers[i] === "no"} disabled={locked} onClick={() => answer(i, "no")}>
                    아니요
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`result quiz-result${state.passed ? " success" : ""}`} role="status" hidden={!state.finished}>
        {state.excludedIndex >= 0 && (
          <>
            <strong>이 기준에서는 등록신청 대상에서 제외</strong>
            <span>{quizQuestions[state.excludedIndex].excludedReason}</span>
          </>
        )}
        {state.passed && (
          <>
            <strong>다섯 기준 모두 부합합니다.</strong>
            <span>
              원문의 유사 놀이기구 판단 절차에 따라 신종·유사 놀이시설 등록신청을 검토할 수 있습니다. 실제 시설정보와 설치물 현황을
              확인해 관할 관리감독기관의 절차에 따라 진행하세요.
            </span>
          </>
        )}
      </div>
      <button className="quiz-reset" type="button" onClick={reset}>
        처음부터 다시 확인 ↺
      </button>
      <p className="quiz-footnote">
        모든 기준에 부합할 때 신종·유사 놀이시설 등록신청을 검토할 수 있습니다. 이는 유사 놀이기구의 등록 분류를 돕는 간단
        확인이며, 공간 전체의 안전성평가 필요 여부와 최종 등록 대상은 시설 형태에 따라 관할 시·군·구에 확인하세요. 원문 PDF 8쪽의
        판단절차를 함께 참고하세요.
      </p>
    </>
  );
}

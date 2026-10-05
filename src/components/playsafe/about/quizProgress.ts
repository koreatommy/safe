export type QuizAnswer = "yes" | "no" | null;

export type QuizState = {
  openIndex: number;
  excludedIndex: number;
  passed: boolean;
  finished: boolean;
  total: number;
};

export function evaluateQuiz(answers: QuizAnswer[]): QuizState {
  const total = answers.length;
  const excludedIndex = answers.indexOf("no");
  const firstUnanswered = answers.indexOf(null);
  const openIndex = excludedIndex >= 0 ? excludedIndex : firstUnanswered >= 0 ? firstUnanswered : total;
  const passed = excludedIndex < 0 && openIndex >= total;
  return { openIndex, excludedIndex, passed, finished: passed || excludedIndex >= 0, total };
}

export function progressLabel({ openIndex, excludedIndex, passed, total }: QuizState): string {
  if (excludedIndex >= 0) return `${excludedIndex + 1} / ${total}단계에서 확인 종료`;
  if (passed) return `${total} / ${total}단계 완료`;
  return `${openIndex + 1} / ${total}단계`;
}

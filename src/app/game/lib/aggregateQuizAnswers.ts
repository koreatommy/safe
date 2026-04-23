'use client';

import type { Answer } from '../context/GameContext';
import { MAX_SCORE, POINTS_PER_QUESTION, TOTAL_QUESTIONS } from '../data/questions';

interface AggregateQuizAnswersResult {
  normalizedAnswers: Answer[];
  correctCount: number;
  totalScore: number;
}

function isValidQuestionNumber(questionNumber: number): boolean {
  return Number.isInteger(questionNumber) && questionNumber >= 1 && questionNumber <= TOTAL_QUESTIONS;
}

export function aggregateQuizAnswers(answers: Answer[]): AggregateQuizAnswersResult {
  const dedupedByQuestion = new Map<number, Answer>();
  let hadDuplicateQuestion = false;
  let hadInvalidQuestionNumber = false;

  for (const answer of answers) {
    if (!isValidQuestionNumber(answer.questionNumber)) {
      hadInvalidQuestionNumber = true;
      continue;
    }

    if (dedupedByQuestion.has(answer.questionNumber)) {
      hadDuplicateQuestion = true;
    }

    // Keep the latest answer for each question number.
    dedupedByQuestion.set(answer.questionNumber, answer);
  }

  const normalizedAnswers = Array.from(dedupedByQuestion.values())
    .sort((a, b) => a.questionNumber - b.questionNumber)
    .slice(0, TOTAL_QUESTIONS);

  const correctCount = Math.min(
    normalizedAnswers.filter((answer) => answer.isCorrect).length,
    TOTAL_QUESTIONS
  );
  const totalScore = Math.min(correctCount * POINTS_PER_QUESTION, MAX_SCORE);

  if (process.env.NODE_ENV !== 'production') {
    if (answers.length > TOTAL_QUESTIONS || hadDuplicateQuestion || hadInvalidQuestionNumber) {
      console.warn('[QuizAggregate] Answers were normalized', {
        inputLength: answers.length,
        normalizedLength: normalizedAnswers.length,
        hadDuplicateQuestion,
        hadInvalidQuestionNumber,
      });
    }
  }

  return {
    normalizedAnswers,
    correctCount,
    totalScore,
  };
}

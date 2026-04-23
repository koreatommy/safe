'use client';

import { useEffect, useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useConfetti } from '../hooks/useConfetti';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useSoundEffect } from '../hooks/useSoundEffect';
import { questions, TOTAL_QUESTIONS, MAX_SCORE } from '../data/questions';
import { aggregateQuizAnswers } from '../lib/aggregateQuizAnswers';
import ResultChart from './ResultChart';

export default function GameResult() {
  const router = useRouter();
  const { participant, gameResult, resetGame } = useGame();
  const { fireByScore, fireFirstPlace } = useConfetti();
  const { playComplete } = useSoundEffect();
  const prefersReducedMotion = usePrefersReducedMotion();
  const accordionId = useId();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!participant || !gameResult) {
      router.replace('/game');
      return;
    }

    const completeSoundTimer = window.setTimeout(() => {
      playComplete();
    }, 350);

    if (prefersReducedMotion) {
      return () => clearTimeout(completeSoundTimer);
    }

    const confettiTimer = window.setTimeout(() => {
      fireByScore(gameResult.totalScore, MAX_SCORE);

      if (gameResult.submissionRank === 1) {
        setTimeout(() => fireFirstPlace(), 1000);
      }
    }, 500);

    return () => {
      clearTimeout(completeSoundTimer);
      clearTimeout(confettiTimer);
    };
  }, [participant, gameResult, router, fireByScore, fireFirstPlace, prefersReducedMotion, playComplete]);

  if (!participant || !gameResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-yellow-400" aria-label="로딩 중" />
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const { normalizedAnswers, correctCount, totalScore } = aggregateQuizAnswers(gameResult.answers);

  const getScoreMessage = () => {
    const percentage = (totalScore / MAX_SCORE) * 100;
    if (percentage === 100) return { emoji: '🏆', message: '완벽합니다! 만점이에요!' };
    if (percentage >= 80) return { emoji: '🎉', message: '훌륭해요! 우수한 성적입니다!' };
    if (percentage >= 60) return { emoji: '👍', message: '잘했어요! 좋은 성적이에요!' };
    if (percentage >= 40) return { emoji: '💪', message: '조금 더 노력해봐요!' };
    return { emoji: '📚', message: '다시 도전해보세요!' };
  };

  const scoreMessage = getScoreMessage();

  const handlePlayAgain = () => {
    resetGame();
    router.push('/game');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowDetails(!showDetails);
    }
  };

  const motionProps = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div {...motionProps} className="game-card overflow-hidden p-0">
          {/* Score Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-700 p-4 sm:p-6 text-white text-center">
            <p className="text-sm sm:text-lg opacity-90 mb-1.5 sm:mb-2">{participant.name} 님의 결과 리포트</p>
            <div className="text-4xl sm:text-5xl md:text-6xl mb-1.5 sm:mb-2" aria-hidden="true">{scoreMessage.emoji}</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{totalScore}점</h1>
            <p className="text-sm sm:text-base opacity-95">{scoreMessage.message}</p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              <div className="order-2 sm:order-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 text-center">정답률</h2>
                <ResultChart 
                  correctCount={correctCount}
                  totalQuestions={TOTAL_QUESTIONS} 
                />
              </div>

              <div className="space-y-3 sm:space-y-4 order-1 sm:order-2">
                <div className="rounded-xl p-3 sm:p-4 border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-700 text-sm sm:text-base">총 점수</span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-amber-600">
                      {totalScore} / {MAX_SCORE}
                    </span>
                  </div>
                </div>

                <div className="bg-white/75 rounded-xl p-3 sm:p-4 border border-slate-200">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-700 text-sm sm:text-base">정답 개수</span>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-slate-900">
                      {correctCount} / {TOTAL_QUESTIONS} 문제
                    </span>
                  </div>
                </div>

                <div className="bg-white/75 rounded-xl p-3 sm:p-4 border border-slate-200">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-700 text-sm sm:text-base">소요 시간</span>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-slate-900">
                      {formatTime(gameResult.totalTimeMs)}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 border border-emerald-200">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-emerald-800 text-sm sm:text-base">제출 순서</span>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-emerald-700">
                      {gameResult.submissionRank}번째
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion - Details */}
            <div className="border-t pt-4 sm:pt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                onKeyDown={handleKeyDown}
                aria-expanded={showDetails}
                aria-controls={`${accordionId}-content`}
                id={`${accordionId}-header`}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-white/75 border border-slate-200 rounded-xl hover:bg-white transition-colors min-h-[48px]"
              >
                <span className="font-bold text-slate-900 text-sm sm:text-base">문제별 결과 상세보기</span>
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-600 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                id={`${accordionId}-content`}
                role="region"
                aria-labelledby={`${accordionId}-header`}
                hidden={!showDetails}
                className={showDetails ? 'block' : 'hidden'}
              >
                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                  {normalizedAnswers.map((answer, index) => {
                    const question = questions.find(q => q.id === answer.questionNumber);
                    if (!question) return null;

                    return (
                      <div
                        key={index}
                        className={`p-3 sm:p-4 rounded-xl border-2 ${
                          answer.isCorrect 
                            ? 'bg-amber-50 border-amber-300' 
                            : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <span 
                            className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                              answer.isCorrect ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-100'
                            }`}
                            aria-label={answer.isCorrect ? '정답' : '오답'}
                          >
                            {answer.isCorrect ? '✓' : '✗'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 mb-1.5 sm:mb-2 text-sm sm:text-base leading-relaxed">
                              Q{question.id}. {question.question}
                            </p>
                            <div className="text-xs sm:text-sm space-y-1">
                              <p className={answer.isCorrect ? 'text-slate-700' : 'text-rose-600'}>
                                <span className="font-medium">내 답변:</span>{' '}
                                {answer.selectedAnswer >= 0 
                                  ? question.options[answer.selectedAnswer] 
                                  : '미응답'}
                              </p>
                              {!answer.isCorrect && (
                                <p className="text-slate-700">
                                  <span className="font-medium text-emerald-700">정답:</span>{' '}
                                  {question.options[question.correctAnswer]}
                                </p>
                              )}
                              <p className="text-slate-600 mt-1.5 sm:mt-2 italic leading-relaxed">
                                {question.explanation}
                              </p>
                              <p className="text-slate-500 text-xs mt-1">
                                소요 시간: {(answer.timeSpentMs / 1000).toFixed(1)}초
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <Link
                href="/game/leaderboard"
                className="game-btn flex-1 py-3.5 sm:py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-center hover:from-amber-600 hover:to-orange-600 shadow-lg"
              >
                🏆 순위보드 보기
              </Link>
              <button
                onClick={handlePlayAgain}
                className="game-btn game-btn-secondary flex-1 py-3.5 sm:py-4"
              >
                다시 도전하기
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

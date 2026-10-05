'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { questions, TOTAL_QUESTIONS } from '../data/questions';
import { useSoundEffect } from '../hooks/useSoundEffect';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { aggregateQuizAnswers } from '../lib/aggregateQuizAnswers';
import { getGameSupabaseClient } from '@/lib/supabase';

export default function QuizGame() {
  const router = useRouter();
  const { participant, addAnswer, answers, setGameStartTime, gameStartTime, setGameResult } = useGame();
  const { playCorrect, playWrong, playTick, isMuted, toggleMute } = useSoundEffect();
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const answersRef = useRef(answers);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!participant) {
      router.replace('/game');
      return;
    }
    
    if (!gameStartTime) {
      setGameStartTime(Date.now());
    }
    setQuestionStartTime(Date.now());
  }, [participant, router, gameStartTime, setGameStartTime]);

  const handleSelectAnswer = (answerIndex: number) => {
    if (isAnswered || isSubmitting) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowFeedback(true);
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const timeSpent = Date.now() - questionStartTime;
    
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
    
    const latestAnswer = {
      questionNumber: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpentMs: timeSpent,
    };
    addAnswer(latestAnswer);

    setTimeout(() => {
      setShowFeedback(false);
      
      if (currentIndex < TOTAL_QUESTIONS - 1) {
        playTick();
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuestionStartTime(Date.now());
      } else {
        handleSubmitGame(latestAnswer);
      }
    }, 1500);
  };

  const handleSubmitGame = async (latestAnswer?: {
    questionNumber: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpentMs: number;
  }) => {
    if (!participant || isSubmitting) return;
    
    setIsSubmitting(true);

    const totalTimeMs = Date.now() - (gameStartTime || Date.now());
    const allAnswers = [...answersRef.current];

    if (latestAnswer && !allAnswers.some(answer => answer.questionNumber === latestAnswer.questionNumber)) {
      allAnswers.push(latestAnswer);
    }

    const { normalizedAnswers, correctCount, totalScore } = aggregateQuizAnswers(allAnswers);

    try {
      const supabase = getGameSupabaseClient();

      const { count: currentRank } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true });

      const submissionRank = (currentRank ?? 0) + 1;

      const { data: resultData, error: resultError } = await supabase
        .from('results')
        .insert({
          participant_id: participant.id,
          total_score: totalScore,
          correct_count: correctCount,
          total_time_ms: totalTimeMs,
          submission_rank: submissionRank,
        })
        .select()
        .single();

      if (resultError) throw resultError;

      const answersToInsert = normalizedAnswers.map(answer => ({
        result_id: resultData.id,
        question_number: answer.questionNumber,
        selected_answer: String(answer.selectedAnswer),
        is_correct: answer.isCorrect,
        time_spent_ms: answer.timeSpentMs,
      }));

      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      setGameResult({
        id: resultData.id,
        participantId: participant.id,
        totalScore,
        correctCount,
        totalTimeMs,
        submittedAt: resultData.submitted_at,
        submissionRank,
        answers: normalizedAnswers,
      });

      router.push('/game/result');
    } catch (error) {
      console.error('Failed to submit game:', error);
      setIsSubmitting(false);
    }
  };

  if (!participant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-yellow-400" aria-label="로딩 중" />
      </div>
    );
  }

  const questionMotion = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 }, transition: { duration: 0.25 } };

  const feedbackMotion = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen py-4 sm:py-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header - 2-row grid on mobile for better touch targets */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4 col-span-1">
            <span className="text-xs sm:text-sm text-black truncate max-w-[100px] sm:max-w-none">
              {participant.name} 님
            </span>
          </div>
          
          <div className="flex items-center justify-end gap-2 sm:gap-3 col-span-1">
            <span className="game-badge bg-yellow-300 text-black text-xs sm:text-sm font-bold">
              {currentIndex + 1} / {TOTAL_QUESTIONS}
            </span>
            <button
              onClick={toggleMute}
              className="p-2.5 sm:p-2 rounded-lg hover:bg-white/80 transition-colors"
              aria-label={isMuted ? '음소거 해제' : '음소거'}
              aria-pressed={isMuted}
            >
              {isMuted ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div 
          className="game-progress mb-5 sm:mb-8" 
          role="progressbar" 
          aria-valuenow={currentIndex + 1} 
          aria-valuemin={1} 
          aria-valuemax={TOTAL_QUESTIONS}
          aria-label={`${currentIndex + 1}/${TOTAL_QUESTIONS} 문제 진행 중`}
        >
          <motion.div
            className="game-progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            {...questionMotion}
            className="game-card"
          >
            {/* Question Type Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
              <span className={`game-badge ${
                currentQuestion.type === 'multiple' 
                  ? 'bg-yellow-200 text-black' 
                  : 'bg-white text-black ring-1 ring-black/15'
              }`}>
                {currentQuestion.type === 'multiple' ? '4지선다' : 'O/X'}
              </span>
              <span className={`game-badge ${
                currentQuestion.difficulty === 'high' 
                  ? 'bg-black text-yellow-300' 
                  : 'bg-yellow-100 text-black'
              }`}>
                {currentQuestion.difficulty === 'high' ? '상' : '중상'}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="game-question-title mb-5 sm:mb-7">
              <span className="flex items-start gap-1.5 sm:gap-2">
                <span className="flex-shrink-0 text-base sm:text-lg md:text-xl font-semibold text-yellow-500/90 leading-[1.5]">
                  Q{currentIndex + 1}.
                </span>
                <span className="text-base sm:text-lg md:text-xl font-semibold text-black/75 leading-[1.5] tracking-[-0.01em] break-keep">
                  {currentQuestion.question}
                </span>
              </span>
            </h2>

            {/* Answer Options */}
            <div 
              className={`grid gap-3 sm:gap-4 ${currentQuestion.type === 'ox' ? 'grid-cols-2' : 'grid-cols-1'}`}
              role="group"
              aria-label="답변 선택"
            >
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrectAnswer = showFeedback && isCorrect;
                const showWrongAnswer = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isAnswered}
                    aria-pressed={isSelected}
                    className={`relative w-full min-h-[50px] sm:min-h-[54px] p-3 sm:p-3.5 md:p-4 rounded-xl border-2 text-left transition-all text-black/75 ${
                      currentQuestion.type === 'ox' ? 'text-center text-xl sm:text-2xl font-semibold' : 'text-sm sm:text-base leading-[1.5] font-medium'
                    } ${
                      showCorrectAnswer
                        ? 'border-yellow-500 bg-yellow-300/35'
                        : showWrongAnswer
                        ? 'border-black bg-yellow-300/25'
                        : isSelected
                        ? 'border-yellow-500 bg-yellow-300/25'
                        : 'border-neutral-200 hover:border-yellow-400 hover:bg-yellow-300/15'
                    } ${isAnswered && !isSelected && !showCorrectAnswer ? 'opacity-50' : ''} disabled:cursor-default`}
                  >
                    {currentQuestion.type === 'multiple' && (
                      <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 sm:mr-3 text-xs sm:text-sm font-bold flex-shrink-0 ${
                        showCorrectAnswer
                          ? 'bg-yellow-400 text-black'
                          : showWrongAnswer
                          ? 'bg-black text-yellow-300'
                          : isSelected
                          ? 'bg-yellow-400 text-black'
                          : 'bg-neutral-200 text-black'
                      }`} aria-hidden="true">
                        {index + 1}
                      </span>
                    )}
                    <span className="leading-[1.5]">{option}</span>
                    
                    {showCorrectAnswer && (
                      <motion.span
                        {...(prefersReducedMotion ? {} : { initial: { scale: 0 }, animate: { scale: 1 } })}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2"
                        aria-label="정답"
                      >
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.span>
                    )}
                    
                    {showWrongAnswer && (
                      <motion.span
                        {...(prefersReducedMotion ? {} : { initial: { scale: 0 }, animate: { scale: 1 } })}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2"
                        aria-label="오답"
                      >
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Area - Fixed min-height to prevent layout shift */}
            <div className="min-h-[80px] sm:min-h-[100px] mt-4 sm:mt-6">
              {showFeedback && (
                <motion.div
                  {...feedbackMotion}
                  role="alert"
                  className={`p-3 sm:p-4 rounded-lg ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-yellow-300/40 text-black'
                      : 'bg-yellow-300/25 text-black border border-yellow-500/60'
                  }`}
                >
                  <p className="font-bold mb-1 text-sm sm:text-base text-yellow-600">
                    {selectedAnswer === currentQuestion.correctAnswer ? '정답입니다! 🎉' : '오답입니다 😢'}
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed text-black">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Submitting Overlay */}
        {isSubmitting && (
          <motion.div
            {...(prefersReducedMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } })}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="결과 제출 중"
          >
            <div className="game-card text-center mx-4 max-w-sm">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4" aria-hidden="true" />
              <p className="text-base sm:text-lg font-bold text-black">결과 제출 중...</p>
              <p className="text-black text-xs sm:text-sm mt-2">잠시만 기다려주세요</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

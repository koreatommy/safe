'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Participant {
  id: string;
  schoolName: string;
  name: string;
  email: string;
}

export interface Answer {
  questionNumber: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface GameResult {
  id: string;
  participantId: string;
  totalScore: number;
  correctCount: number;
  totalTimeMs: number;
  submittedAt: string;
  submissionRank: number;
  answers: Answer[];
}

interface GameContextType {
  participant: Participant | null;
  setParticipant: (participant: Participant | null) => void;
  answers: Answer[];
  addAnswer: (answer: Answer) => void;
  resetAnswers: () => void;
  gameStartTime: number | null;
  setGameStartTime: (time: number | null) => void;
  gameResult: GameResult | null;
  setGameResult: (result: GameResult | null) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const addAnswer = useCallback((answer: Answer) => {
    setAnswers(prev => [...prev, answer]);
  }, []);

  const resetAnswers = useCallback(() => {
    setAnswers([]);
  }, []);

  const resetGame = useCallback(() => {
    setParticipant(null);
    setAnswers([]);
    setGameStartTime(null);
    setGameResult(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        participant,
        setParticipant,
        answers,
        addAnswer,
        resetAnswers,
        gameStartTime,
        setGameStartTime,
        gameResult,
        setGameResult,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

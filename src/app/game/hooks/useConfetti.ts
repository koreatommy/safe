'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

type ConfettiLevel = 'perfect' | 'excellent' | 'good' | 'encourage';

export function useConfetti() {
  const firePerfectScore = useCallback(() => {
    const duration = 5000;
    const end = Date.now() + duration;

    const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500'],
        scalar: 1.5,
      });
    }, 500);
  }, []);

  const fireExcellent = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42'];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const fireGood = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const fireByScore = useCallback((score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;

    if (percentage === 100) {
      firePerfectScore();
      return 'perfect';
    } else if (percentage >= 80) {
      fireExcellent();
      return 'excellent';
    } else if (percentage >= 60) {
      fireGood();
      return 'good';
    }
    return 'encourage';
  }, [firePerfectScore, fireExcellent, fireGood]);

  const fireFirstPlace = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FFD700'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#FFD700', '#FFA500'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#FFD700', '#FFA500', '#FF6347'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#FFD700'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#FFD700', '#FFA500'],
    });
  }, []);

  return {
    firePerfectScore,
    fireExcellent,
    fireGood,
    fireByScore,
    fireFirstPlace,
  };
}

export type { ConfettiLevel };

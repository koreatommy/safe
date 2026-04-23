'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

interface ResultChartProps {
  correctCount: number;
  totalQuestions: number;
}

const CHART_PALETTE = {
  correct: '#f59e0b',
  correctBorder: '#d97706',
  wrong: '#475569',
  wrongBorder: '#334155',
  centerText: '#b45309',
  labelText: '#334155',
  legendText: '#0f172a',
} as const;

export default function ResultChart({ correctCount, totalQuestions }: ResultChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  const wrongCount = totalQuestions - correctCount;
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const legendFontSize = isMobile ? 12 : 14;
    const legendPadding = isMobile ? 12 : 20;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['정답', '오답'],
        datasets: [
          {
            data: [correctCount, wrongCount],
            backgroundColor: [CHART_PALETTE.correct, CHART_PALETTE.wrong],
            borderColor: [CHART_PALETTE.correctBorder, CHART_PALETTE.wrongBorder],
            borderWidth: 2,
            hoverOffset: isMobile ? 4 : 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: legendPadding,
              usePointStyle: true,
              pointStyle: 'circle',
              color: CHART_PALETTE.legendText,
              font: {
                size: legendFontSize,
                weight: 'bold',
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const percentage = Math.round((value / totalQuestions) * 100);
                return `${context.label}: ${value}문제 (${percentage}%)`;
              },
            },
          },
        },
        animation: prefersReducedMotion
          ? { duration: 0 }
          : {
              animateScale: true,
              animateRotate: true,
              duration: 800,
              easing: 'easeOutQuart',
            },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [correctCount, wrongCount, totalQuestions, isMobile, prefersReducedMotion]);

  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div 
      className="relative w-full max-w-[220px] sm:max-w-[280px] mx-auto"
      role="img"
      aria-label={`정답률 차트: ${correctCount}/${totalQuestions} (${percentage}%)`}
    >
      <canvas ref={chartRef} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="text-center -mt-4 sm:-mt-6">
          <p className="text-3xl sm:text-4xl font-bold" style={{ color: CHART_PALETTE.centerText }}>
            {correctCount}
          </p>
          <p className="text-xs sm:text-sm" style={{ color: CHART_PALETTE.labelText }}>
            / {totalQuestions}
          </p>
        </div>
      </div>
    </div>
  );
}

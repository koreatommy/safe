'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import GameRegistrationForm from './GameRegistrationForm';
import GameLandingVideoBackground from './components/GameLandingVideoBackground';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

export default function GamePage() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const fadeIn = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  const slideLeft = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, delay: 0.1 } };

  const slideRight = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5, delay: 0.2 } };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <GameLandingVideoBackground prefersReducedMotion={prefersReducedMotion} />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <motion.header {...fadeIn} className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 bg-white/10 text-white ring-1 ring-white/35 backdrop-blur-sm">
            <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" aria-hidden="true" />
            실시간 퀴즈 진행 중
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 sm:mb-3 drop-shadow-sm">
            어린이 놀이시설{' '}
            <span className="relative inline-block">
              <span className="relative z-10">안전관리</span>
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-[0.08em] h-[0.42em] rounded-sm bg-yellow-300/20"
              />
            </span>
            <br />
            <span className="text-yellow-300">스피드 퀴즈</span>
          </h1>
          
          <p className="text-white text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            대전교육청 어린이놀이시설 안전관리 실무 능력을
            <span className="hidden sm:inline"><br /></span>
            <span className="sm:hidden"> </span>
            10문항으로 테스트해보세요!
          </p>
          </motion.header>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start max-w-5xl mx-auto">
            <motion.div {...slideLeft} className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="game-card">
              <h2 className="font-bold text-base sm:text-lg text-black mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl" aria-hidden="true">📋</span> 퀴즈 안내
              </h2>
              <ul className="space-y-2.5 sm:space-y-3 text-black text-sm sm:text-base">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-300 rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm" aria-hidden="true">1</span>
                  <span>총 10문항 (4지선다 6문제 + O/X 4문제)</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-300 rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm" aria-hidden="true">2</span>
                  <span>문제당 10점, 총점 100점 만점</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-300 rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm" aria-hidden="true">3</span>
                  <span>제출 순서에 따라 순위가 결정됩니다</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-300 rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm" aria-hidden="true">4</span>
                  <span>결과 페이지에서 정답 해설을 확인할 수 있습니다</span>
                </li>
              </ul>
            </div>

            <div className="game-card-promo rounded-xl p-4 sm:p-6 border border-amber-200/40 shadow-sm backdrop-blur-md bg-gradient-to-r from-amber-50/45 to-orange-50/45 ring-1 ring-white/18">
              <h2 className="font-bold text-base sm:text-lg text-yellow-500 mb-1.5 sm:mb-2 flex items-center gap-2">
                <span className="text-xl sm:text-2xl" aria-hidden="true">🏆</span> 선착순 경쟁!
              </h2>
              <p className="text-black text-sm sm:text-base leading-relaxed">
                같은 점수일 경우 빨리 제출한 참가자가 더 높은 순위를 얻습니다.
                신속하고 정확하게 풀어보세요!
              </p>
            </div>

            <Link
              href="/game/leaderboard"
              className="game-btn game-btn-secondary w-full justify-center text-sm sm:text-base"
            >
              📊 실시간 순위보드 보기
            </Link>
            </motion.div>

            <motion.div {...slideRight} className="order-1 lg:order-2">
              <GameRegistrationForm />
            </motion.div>
          </div>
        </div>

        <footer className="mt-auto pt-6 sm:pt-8 text-center">
          <p className="text-white/50 text-xs sm:text-sm">© 한국창의융합연구원</p>
        </footer>
      </div>
    </div>
  );
}

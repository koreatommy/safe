'use client';

import Link from 'next/link';
import GameShell from '../components/GameShell';
import LeaderboardTable from './LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <GameShell
      title="🏆 실시간 순위보드"
      subtitle="놀이시설 안전관리 퀴즈 참가자 순위"
      showBackLink
      maxWidth="5xl"
    >
      <div className="game-card">
        <LeaderboardTable />
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
        <Link href="/game" className="game-btn game-btn-primary text-center">
          퀴즈 참가하기
        </Link>
      </div>

      <div className="mt-6 sm:mt-8 text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-black">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
            <span>실시간 업데이트</span>
          </div>
          <div className="text-xs sm:text-sm">
            정렬: 점수 높은 순 &gt; 시간 빠른 순 &gt; 제출 빠른 순
          </div>
        </div>
      </div>
    </GameShell>
  );
}

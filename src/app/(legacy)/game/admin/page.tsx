'use client';

import Link from 'next/link';
import GameShell from '../components/GameShell';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  return (
    <GameShell
      title="관리자 대시보드"
      subtitle="놀이시설 안전관리 퀴즈 관리"
      maxWidth="5xl"
      headerRight={
        <Link href="/game" className="game-btn game-btn-secondary text-sm">
          ← 퀴즈로 돌아가기
        </Link>
      }
    >
      <div className="game-card">
        <AdminDashboard />
      </div>
    </GameShell>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getGameSupabaseClient } from '@/lib/supabase';
import { useGame } from '../context/GameContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface LeaderboardEntry {
  rank: number;
  id: string;
  participantId: string;
  schoolName: string;
  name: string;
  totalScore: number;
  correctCount: number;
  totalTimeMs: number;
  submittedAt: string;
  submissionRank: number;
}

export default function LeaderboardTable() {
  const { participant } = useGame();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchLeaderboard = useCallback(async () => {
    try {
      const supabase = getGameSupabaseClient();
      
      const { data, error: fetchError } = await supabase
        .from('results')
        .select(`
          id,
          participant_id,
          total_score,
          correct_count,
          total_time_ms,
          submitted_at,
          submission_rank,
          participants (
            id,
            school_name,
            name
          )
        `)
        .order('total_score', { ascending: false })
        .order('total_time_ms', { ascending: true })
        .order('submitted_at', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedEntries: LeaderboardEntry[] = (data || []).map((item, index) => {
        const participantData = item.participants as unknown as { school_name: string; name: string } | null;
        return {
          rank: index + 1,
          id: item.id,
          participantId: item.participant_id,
          schoolName: participantData?.school_name || '',
          name: participantData?.name || '',
          totalScore: item.total_score,
          correctCount: item.correct_count,
          totalTimeMs: item.total_time_ms,
          submittedAt: item.submitted_at,
          submissionRank: item.submission_rank,
        };
      });

      setEntries(formattedEntries);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('순위를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    const supabase = getGameSupabaseClient();
    const channel = supabase
      .channel('game_results_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'game', table: 'results' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    const interval = setInterval(fetchLeaderboard, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchLeaderboard]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default:
        return 'bg-neutral-200 text-black';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-yellow-400" aria-label="로딩 중" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 sm:py-12">
        <p className="text-yellow-500 mb-4 text-sm sm:text-base font-medium">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="game-btn game-btn-primary text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 sm:py-12">
        <p className="text-black text-base sm:text-lg mb-2">아직 참가자가 없습니다.</p>
        <p className="text-black text-sm">첫 번째 참가자가 되어보세요!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-4">
        <p className="text-xs sm:text-sm text-black">
          총 {entries.length}명 참가
        </p>
        <p className="text-xs sm:text-sm text-black">
          마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {entries.map((entry, index) => {
          const isCurrentUser = participant?.id === entry.participantId;
          
          return (
            <div
              key={entry.id}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                isCurrentUser 
                  ? 'bg-yellow-300/15 border-yellow-400' 
                  : 'bg-white border-neutral-200'
              }`}
              style={prefersReducedMotion ? {} : { 
                animationDelay: `${index * 30}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${getRankStyle(entry.rank)}`}>
                  {getRankIcon(entry.rank) || entry.rank}
                </div>
                
                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold text-sm sm:text-base truncate ${isCurrentUser ? 'text-yellow-600' : 'text-black'}`}>
                      {entry.name}
                    </span>
                    {isCurrentUser && (
                      <span className="flex-shrink-0 text-xs bg-yellow-400 text-black px-1.5 py-0.5 rounded-full font-bold">
                        나
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-black truncate">{entry.schoolName}</p>
                </div>
                
                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-500">{entry.totalScore}</p>
                  <p className="text-xs text-black">점</p>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs sm:text-sm text-black">
                <span>정답 {entry.correctCount}/10</span>
                <span className="font-mono">{formatTime(entry.totalTimeMs)}</span>
                <span className="px-1.5 py-0.5 bg-yellow-300 text-black rounded text-xs font-medium">
                  #{entry.submissionRank}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-neutral-200">
              <th className="px-3 lg:px-4 py-3 text-left text-sm font-bold text-black">순위</th>
              <th className="px-3 lg:px-4 py-3 text-left text-sm font-bold text-black">학교명</th>
              <th className="px-3 lg:px-4 py-3 text-left text-sm font-bold text-black">이름</th>
              <th className="px-3 lg:px-4 py-3 text-center text-sm font-bold text-black">점수</th>
              <th className="px-3 lg:px-4 py-3 text-center text-sm font-bold text-black">정답</th>
              <th className="px-3 lg:px-4 py-3 text-center text-sm font-bold text-black">소요시간</th>
              <th className="px-3 lg:px-4 py-3 text-center text-sm font-bold text-black">제출순서</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isCurrentUser = participant?.id === entry.participantId;

              return (
                <tr
                  key={entry.id}
                  className={`border-b border-neutral-100 transition-colors ${
                    isCurrentUser 
                      ? 'bg-yellow-300/10 border-l-4 border-l-yellow-400' 
                      : 'hover:bg-yellow-300/5'
                  }`}
                >
                  <td className="px-3 lg:px-4 py-3 lg:py-4">
                    <span className={`inline-flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full font-bold text-sm ${getRankStyle(entry.rank)}`}>
                      {getRankIcon(entry.rank) || entry.rank}
                    </span>
                  </td>
                  <td className="px-3 lg:px-4 py-3 lg:py-4">
                    <span className="text-black text-sm">{entry.schoolName}</span>
                  </td>
                  <td className="px-3 lg:px-4 py-3 lg:py-4">
                    <span className={`font-medium text-sm ${isCurrentUser ? 'text-yellow-600' : 'text-black'}`}>
                      {entry.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                          나
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 lg:px-4 py-3 lg:py-4 text-center">
                    <span className="text-lg lg:text-xl font-bold text-yellow-500">{entry.totalScore}</span>
                  </td>
                  <td className="px-3 lg:px-4 py-3 lg:py-4 text-center">
                    <span className="text-black text-sm">{entry.correctCount}/10</span>
                  </td>
                  <td className="px-3 lg:px-4 py-3 lg:py-4 text-center">
                    <span className="text-black font-mono text-sm">{formatTime(entry.totalTimeMs)}</span>
                  </td>
                  <td className="px-3 lg:px-4 py-3 lg:py-4 text-center">
                    <span className="px-2 py-1 bg-yellow-300 text-black rounded-full text-xs sm:text-sm font-medium">
                      #{entry.submissionRank}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

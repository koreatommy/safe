'use client';

import { useEffect, useState, useCallback, useRef, useId } from 'react';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, BarController } from 'chart.js';
import { getGameSupabaseClient } from '@/lib/supabase';
import { questions } from '../data/questions';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, BarController);

interface Stats {
  totalParticipants: number;
  completedGames: number;
  averageScore: number;
  highestScore: number;
  averageTime: number;
}

interface Participant {
  id: string;
  schoolName: string;
  name: string;
  email: string;
  createdAt: string;
  hasResult: boolean;
  score?: number;
}

interface QuestionStats {
  questionNumber: number;
  totalAnswers: number;
  correctAnswers: number;
  correctRate: number;
}

export default function AdminDashboard() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const modalId = useId();
  const [stats, setStats] = useState<Stats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'participants' | 'questions'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = getGameSupabaseClient();

      const { data: participantsData, count: participantCount } = await supabase
        .from('participants')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      const { data: resultsData } = await supabase
        .from('results')
        .select('*');

      const { data: answersData } = await supabase
        .from('answers')
        .select('*');

      const completedGames = resultsData?.length || 0;
      const scores = resultsData?.map(r => r.total_score) || [];
      const times = resultsData?.map(r => r.total_time_ms) || [];

      setStats({
        totalParticipants: participantCount || 0,
        completedGames,
        averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        averageTime: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      });

      const participantsList: Participant[] = (participantsData || []).map(p => {
        const result = resultsData?.find(r => r.participant_id === p.id);
        return {
          id: p.id,
          schoolName: p.school_name,
          name: p.name,
          email: p.email,
          createdAt: p.created_at,
          hasResult: !!result,
          score: result?.total_score,
        };
      });
      setParticipants(participantsList);

      const qStats: QuestionStats[] = questions.map(q => {
        const answers = answersData?.filter(a => a.question_number === q.id) || [];
        const correct = answers.filter(a => a.is_correct).length;
        return {
          questionNumber: q.id,
          totalAnswers: answers.length,
          correctAnswers: correct,
          correctRate: answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0,
        };
      });
      setQuestionStats(qStats);

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab !== 'questions' || !chartRef.current || questionStats.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: questionStats.map(q => `Q${q.questionNumber}`),
        datasets: [{
          label: '정답률 (%)',
          data: questionStats.map(q => q.correctRate),
          backgroundColor: questionStats.map(q => 
            q.correctRate >= 70 ? '#facc15' : q.correctRate >= 40 ? '#fde047' : '#171717'
          ),
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? { duration: 0 } : { duration: 750 },
        scales: {
          x: {
            ticks: { color: '#000000' },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#000000',
              callback: (value) => `${value}%`,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const idx = context.dataIndex;
                const stat = questionStats[idx];
                return `정답률: ${stat.correctRate}% (${stat.correctAnswers}/${stat.totalAnswers})`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [activeTab, questionStats, prefersReducedMotion]);

  const handleExportCSV = () => {
    const headers = ['순위', '학교명', '이름', '이메일', '점수', '등록일시'];
    const rows = participants
      .filter(p => p.hasResult)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((p, idx) => [
        idx + 1,
        p.schoolName,
        p.name,
        p.email,
        p.score || 0,
        new Date(p.createdAt).toLocaleString('ko-KR'),
      ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetGame = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/game/reset', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      setShowResetModal(false);
      await fetchData();
    } catch (error) {
      console.error('Failed to reset game:', error);
      alert('초기화에 실패했습니다.');
    } finally {
      setIsResetting(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-yellow-400" aria-label="로딩 중" />
      </div>
    );
  }

  return (
    <div>
      {/* Tab Navigation - Segment Control Style */}
      <div 
        className="flex p-1 bg-gray-100 rounded-xl mb-5 sm:mb-6 overflow-x-auto"
        role="tablist"
        aria-label="관리자 대시보드 탭"
      >
        <button
          onClick={() => setActiveTab('stats')}
          role="tab"
          aria-selected={activeTab === 'stats'}
          aria-controls="panel-stats"
          className={`flex-1 min-w-[80px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all ${
            activeTab === 'stats' 
              ? 'bg-white text-yellow-600 shadow-sm font-semibold' 
              : 'text-black hover:text-yellow-600'
          }`}
        >
          통계
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          role="tab"
          aria-selected={activeTab === 'participants'}
          aria-controls="panel-participants"
          className={`flex-1 min-w-[80px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all ${
            activeTab === 'participants' 
              ? 'bg-white text-yellow-600 shadow-sm font-semibold' 
              : 'text-black hover:text-yellow-600'
          }`}
        >
          참가자 <span className="hidden sm:inline">({stats?.totalParticipants || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          role="tab"
          aria-selected={activeTab === 'questions'}
          aria-controls="panel-questions"
          className={`flex-1 min-w-[80px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all ${
            activeTab === 'questions' 
              ? 'bg-white text-yellow-600 shadow-sm font-semibold' 
              : 'text-black hover:text-yellow-600'
          }`}
        >
          문제 분석
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div id="panel-stats" role="tabpanel" aria-labelledby="tab-stats" className="space-y-4 sm:space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
              <p className="text-black text-xs sm:text-sm font-medium">총 참가자</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-500">{stats.totalParticipants}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 sm:p-4">
              <p className="text-black text-xs sm:text-sm font-medium">완료한 게임</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-500">{stats.completedGames}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 sm:p-4">
              <p className="text-black text-xs sm:text-sm font-medium">평균 점수</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-500">{stats.averageScore}점</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
              <p className="text-black text-xs sm:text-sm font-medium">최고 점수</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-500">{stats.highestScore}점</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <p className="text-black text-xs sm:text-sm font-medium">평균 소요 시간</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-500">{formatTime(stats.averageTime)}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <button
              onClick={handleExportCSV}
              className="game-btn px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white font-semibold hover:bg-blue-600 text-sm sm:text-base"
            >
              📥 CSV 다운로드
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              className="game-btn px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white font-semibold hover:bg-red-600 text-sm sm:text-base"
            >
              🗑️ 게임 초기화
            </button>
            <button
              onClick={fetchData}
              className="game-btn game-btn-secondary px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              🔄 새로고침
            </button>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div id="panel-participants" role="tabpanel" aria-labelledby="tab-participants">
          <div className="mb-4">
            <input
              type="text"
              placeholder="이름, 학교명, 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="game-input"
              aria-label="참가자 검색"
            />
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filteredParticipants.map((p) => (
              <div key={p.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-black text-sm truncate">{p.name}</p>
                    <p className="text-xs text-black truncate">{p.schoolName}</p>
                    <p className="text-xs text-black truncate mt-0.5">{p.email}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {p.hasResult ? (
                      <span className="text-lg font-bold text-yellow-500">{p.score}점</span>
                    ) : (
                      <span className="text-xs text-black bg-yellow-300 px-2 py-0.5 rounded font-medium">진행중</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-3 lg:px-4 py-3 text-left text-sm font-bold text-black">학교명</th>
                  <th className="px-3 lg:px-4 py-3 text-left text-sm font-bold text-black">이름</th>
                  <th className="px-3 lg:px-4 py-3 text-left text-sm font-bold text-black">이메일</th>
                  <th className="px-3 lg:px-4 py-3 text-center text-sm font-bold text-black">점수</th>
                  <th className="px-3 lg:px-4 py-3 text-center text-sm font-bold text-black">상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 lg:px-4 py-3 text-black text-sm">{p.schoolName}</td>
                    <td className="px-3 lg:px-4 py-3 font-medium text-black text-sm">{p.name}</td>
                    <td className="px-3 lg:px-4 py-3 text-black text-sm">{p.email}</td>
                    <td className="px-3 lg:px-4 py-3 text-center">
                      {p.hasResult ? (
                        <span className="text-base lg:text-lg font-bold text-yellow-500">{p.score}점</span>
                      ) : (
                        <span className="text-black">-</span>
                      )}
                    </td>
                    <td className="px-3 lg:px-4 py-3 text-center">
                      {p.hasResult ? (
                        <span className="px-2 py-1 bg-yellow-200 text-black rounded-full text-xs sm:text-sm font-medium">완료</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-300 text-black rounded-full text-xs sm:text-sm font-medium">진행중</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredParticipants.length === 0 && (
            <p className="text-center text-black py-6 sm:py-8 text-sm sm:text-base">검색 결과가 없습니다.</p>
          )}
        </div>
      )}

      {activeTab === 'questions' && (
        <div id="panel-questions" role="tabpanel" aria-labelledby="tab-questions" className="space-y-4 sm:space-y-6">
          <div className="h-60 sm:h-72 md:h-80">
            <canvas ref={chartRef} aria-label="문제별 정답률 차트" role="img" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {questionStats.map((stat, idx) => {
              const question = questions[idx];
              const questionPreview = question.question.length > 50 
                ? question.question.substring(0, 50) + '...'
                : question.question;
              return (
                <div
                  key={stat.questionNumber}
                  className="p-3 sm:p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black mb-1 text-sm sm:text-base leading-relaxed">
                        Q{stat.questionNumber}. {questionPreview}
                      </p>
                      <p className="text-xs sm:text-sm text-black">
                        {stat.correctAnswers}/{stat.totalAnswers}명 정답
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className={`text-xl sm:text-2xl font-bold ${
                        stat.correctRate >= 70 ? 'text-yellow-500' :
                        stat.correctRate >= 40 ? 'text-yellow-600' : 'text-black'
                      }`}>
                        {stat.correctRate}%
                      </span>
                    </div>
                  </div>
                  <div 
                    className="mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2"
                    role="progressbar"
                    aria-valuenow={stat.correctRate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Q${stat.questionNumber} 정답률 ${stat.correctRate}%`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        stat.correctRate >= 70 ? 'bg-yellow-400' :
                        stat.correctRate >= 40 ? 'bg-yellow-200' : 'bg-black'
                      }`}
                      style={{ width: `${stat.correctRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${modalId}-title`}
          aria-describedby={`${modalId}-desc`}
        >
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full">
            <h3 id={`${modalId}-title`} className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">
              게임 초기화
            </h3>
            <p id={`${modalId}-desc`} className="text-black mb-5 sm:mb-6 text-sm sm:text-base">
              모든 참가자 데이터와 결과가 삭제됩니다.
              <br />
              <span className="text-yellow-500 font-bold">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="game-btn game-btn-secondary flex-1 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                취소
              </button>
              <button
                onClick={handleResetGame}
                disabled={isResetting}
                className="game-btn flex-1 py-2.5 sm:py-3 bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 text-sm sm:text-base"
              >
                {isResetting ? '초기화 중...' : '초기화'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

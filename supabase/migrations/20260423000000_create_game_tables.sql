-- 놀이시설 안전관리 퀴즈게임 테이블

-- 참가자 테이블
CREATE TABLE IF NOT EXISTS game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 게임 결과 테이블
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES game_participants(id) ON DELETE CASCADE,
  total_score INT NOT NULL,
  correct_count INT NOT NULL,
  total_time_ms INT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submission_rank INT
);

-- 문제별 답변 테이블
CREATE TABLE IF NOT EXISTS game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES game_results(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_ms INT NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_game_results_participant ON game_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_game_results_submitted_at ON game_results(submitted_at);
CREATE INDEX IF NOT EXISTS idx_game_results_score ON game_results(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_answers_result ON game_answers(result_id);

-- RLS 정책 설정
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert participants" ON game_participants;
DROP POLICY IF EXISTS "Anyone can view participants" ON game_participants;
DROP POLICY IF EXISTS "Anyone can insert results" ON game_results;
DROP POLICY IF EXISTS "Anyone can view results" ON game_results;
DROP POLICY IF EXISTS "Anyone can insert answers" ON game_answers;
DROP POLICY IF EXISTS "Anyone can view answers" ON game_answers;
DROP POLICY IF EXISTS "Service role can delete participants" ON game_participants;
DROP POLICY IF EXISTS "Service role can delete results" ON game_results;
DROP POLICY IF EXISTS "Service role can delete answers" ON game_answers;

-- 누구나 참가자 등록 가능
CREATE POLICY "Anyone can insert participants" ON game_participants
  FOR INSERT WITH CHECK (true);

-- 누구나 참가자 조회 가능
CREATE POLICY "Anyone can view participants" ON game_participants
  FOR SELECT USING (true);

-- 누구나 결과 등록 가능
CREATE POLICY "Anyone can insert results" ON game_results
  FOR INSERT WITH CHECK (true);

-- 누구나 결과 조회 가능
CREATE POLICY "Anyone can view results" ON game_results
  FOR SELECT USING (true);

-- 누구나 답변 등록 가능
CREATE POLICY "Anyone can insert answers" ON game_answers
  FOR INSERT WITH CHECK (true);

-- 누구나 답변 조회 가능
CREATE POLICY "Anyone can view answers" ON game_answers
  FOR SELECT USING (true);

-- 관리자용 삭제 정책 (service role 사용 시)
CREATE POLICY "Service role can delete participants" ON game_participants
  FOR DELETE USING (true);

CREATE POLICY "Service role can delete results" ON game_results
  FOR DELETE USING (true);

CREATE POLICY "Service role can delete answers" ON game_answers
  FOR DELETE USING (true);

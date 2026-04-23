-- 놀이시설 안전관리 퀴즈게임: game 스키마 (public과 분리)

CREATE SCHEMA IF NOT EXISTS game;

GRANT USAGE ON SCHEMA game TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA game TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA game GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 참가자 테이블
CREATE TABLE IF NOT EXISTS game.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 게임 결과 테이블
CREATE TABLE IF NOT EXISTS game.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES game.participants(id) ON DELETE CASCADE,
  total_score INT NOT NULL,
  correct_count INT NOT NULL,
  total_time_ms INT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submission_rank INT
);

-- 문제별 답변 테이블
CREATE TABLE IF NOT EXISTS game.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES game.results(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_ms INT NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_results_participant ON game.results(participant_id);
CREATE INDEX IF NOT EXISTS idx_results_submitted_at ON game.results(submitted_at);
CREATE INDEX IF NOT EXISTS idx_results_score ON game.results(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_answers_result ON game.answers(result_id);

-- RLS
ALTER TABLE game.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert participants" ON game.participants;
DROP POLICY IF EXISTS "Anyone can view participants" ON game.participants;
DROP POLICY IF EXISTS "Anyone can insert results" ON game.results;
DROP POLICY IF EXISTS "Anyone can view results" ON game.results;
DROP POLICY IF EXISTS "Anyone can insert answers" ON game.answers;
DROP POLICY IF EXISTS "Anyone can view answers" ON game.answers;
DROP POLICY IF EXISTS "Service role can delete participants" ON game.participants;
DROP POLICY IF EXISTS "Service role can delete results" ON game.results;
DROP POLICY IF EXISTS "Service role can delete answers" ON game.answers;

CREATE POLICY "Anyone can insert participants" ON game.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view participants" ON game.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert results" ON game.results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view results" ON game.results FOR SELECT USING (true);
CREATE POLICY "Anyone can insert answers" ON game.answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view answers" ON game.answers FOR SELECT USING (true);

CREATE POLICY "Service role can delete participants" ON game.participants
  FOR DELETE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete results" ON game.results
  FOR DELETE USING (auth.role() = 'service_role');
CREATE POLICY "Service role can delete answers" ON game.answers
  FOR DELETE USING (auth.role() = 'service_role');

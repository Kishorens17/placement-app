-- ============================================================
-- QUIZ PORTAL - DATABASE MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  set_number INT NOT NULL CHECK (set_number IN (1, 2, 3)),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_ans TEXT NOT NULL CHECK (correct_ans IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  topic_tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  set_number INT NOT NULL CHECK (set_number IN (1, 2, 3)),
  email_used TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INT,
  score INT DEFAULT 0,
  total_questions INT DEFAULT 25,
  percentage FLOAT DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  auto_submitted BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  malpractice_count INT DEFAULT 0,
  malpractice_severity TEXT DEFAULT 'clean' CHECK (malpractice_severity IN ('clean', 'low', 'moderate', 'high')),
  next_retake_allowed_at TIMESTAMPTZ
);

-- 3. QUIZ ATTEMPT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  selected_ans TEXT CHECK (selected_ans IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN DEFAULT FALSE,
  time_spent_sec INT DEFAULT 0,
  flagged_fast BOOLEAN DEFAULT FALSE
);

-- 4. QUIZ MALPRACTICE LOGS TABLE
CREATE TABLE IF NOT EXISTS quiz_malpractice_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'focus_loss', 'fullscreen_exit', 'right_click',
    'copy_attempt', 'fast_answer', 'keyboard_shortcut', 'auto_submitted'
  )),
  event_detail TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  question_number INT
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_quiz_questions_subject_set ON quiz_questions(subject, set_number);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_subject ON quiz_attempts(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt ON quiz_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_malpractice_attempt ON quiz_malpractice_logs(attempt_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_malpractice_logs ENABLE ROW LEVEL SECURITY;

-- Questions: readable by all authenticated users
CREATE POLICY "quiz_questions_read" ON quiz_questions
  FOR SELECT USING (true);

-- Attempts: users can only see their own
CREATE POLICY "quiz_attempts_user_select" ON quiz_attempts
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "quiz_attempts_user_insert" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "quiz_attempts_user_update" ON quiz_attempts
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Attempt answers: users can manage their own
CREATE POLICY "quiz_answers_user_select" ON quiz_attempt_answers
  FOR SELECT USING (
    attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = auth.uid())
  );

CREATE POLICY "quiz_answers_user_insert" ON quiz_attempt_answers
  FOR INSERT WITH CHECK (
    attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = auth.uid())
  );

-- Malpractice logs: users can read and insert their own
CREATE POLICY "quiz_malpractice_user_select" ON quiz_malpractice_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "quiz_malpractice_user_insert" ON quiz_malpractice_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

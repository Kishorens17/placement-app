// Quiz Portal Type Definitions

export interface QuizQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  topic_tag: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  subject: string;
  set_number: number;
  email_used: string;
  started_at: string;
  submitted_at?: string;
  time_taken_seconds?: number;
  score?: number;
  total_questions?: number;
  percentage?: number;
  passed?: boolean;
  auto_submitted?: boolean;
  email_sent?: boolean;
  malpractice_count?: number;
  malpractice_severity?: 'clean' | 'low' | 'moderate' | 'high';
  next_retake_allowed_at?: string;
}

export interface QuizAnswer {
  question_id: string;
  question_order: number;
  selected_ans: string | null;
  time_spent_sec: number;
}

export interface QuizResult {
  attempt: QuizAttempt;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  malpracticeCount: number;
  malpracticeSeverity: string;
  topicStats: Record<string, { correct: number; total: number }>;
  diffStats: Record<string, { correct: number; total: number }>;
  nextRetakeAllowedAt: string;
}

export type MalpracticeEvent =
  | 'focus_loss'
  | 'fullscreen_exit'
  | 'right_click'
  | 'copy_attempt'
  | 'fast_answer'
  | 'keyboard_shortcut'
  | 'auto_submitted';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  roll_no?: string;
  start_year: number;
  end_year: number;
  github_username: string;
  leetcode_username: string;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
}

export interface RepoAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  detailed_analysis: string;
}

export interface TargetResult {
  weekly_target: number;
  monthly_target: number;
  reasoning: string;
  focus_concepts: string[];
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

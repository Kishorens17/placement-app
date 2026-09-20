export interface User {
  id: string;
  username: string;
  rollNo?: string;
  startYear: number;
  endYear: number;
  githubUsername: string;
  leetcodeUsername: string;
  createdAt: string;
}

export interface GithubStats {
  totalRepos: number;
  lastPushDate: string;
  reposData: Repository[];
}

export interface Repository {
  name: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
}

export interface RepoAnalysis {
  id: string;
  repoName: string;
  repoUrl: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  detailedAnalysis: string;
  analyzedAt: string;
}

export interface LeetcodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  lastSubmissionDate: string;
  conceptStats: Record<string, { solved: number; total: number }>;
  solvedProblems: string[];
}

export interface Problem {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcodeUrl: string;
  isSolved?: boolean;
}

export interface WeeklyTarget {
  id: string;
  weekStart: string;
  totalTarget: number;
  conceptRecommendations: Record<string, number>;
  aiReasoning: string;
  currentProgress?: number;
}

export interface MonthlyTarget {
  id: string;
  monthStart: string;
  totalTarget: number;
  aiReasoning: string;
  currentProgress?: number;
}

export interface RoadmapConcept {
  name: string;
  completed: boolean;
  progressPercentage: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface SignupData {
  username: string;
  password: string;
  rollNo?: string;
  startYear: number;
  endYear: number;
  githubUsername: string;
  leetcodeUsername: string;
}

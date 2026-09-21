import { useState, useEffect } from 'react';
import api from '../../services/api';

interface LeetcodeStatsData {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  lastSubmissionDate: string | null;
  conceptStats: Record<string, { solved: number; total: number }>;
  solvedProblems: string[];
  cached?: boolean;
}

interface WeeklyTargetData {
  id?: string;
  week_start?: string;
  weekStart?: string;
  total_target?: number;
  totalTarget?: number;
  concept_recommendations?: { focus?: string[] } | Record<string, any>;
  conceptRecommendations?: { focus?: string[] } | Record<string, any>;
  ai_reasoning?: string;
  aiReasoning?: string;
}

interface MonthlyTargetData {
  id?: string;
  month_start?: string;
  monthStart?: string;
  total_target?: number;
  totalTarget?: number;
  ai_reasoning?: string;
  aiReasoning?: string;
}

const CORE_DSA_TOPICS = [
  { name: 'Arrays', tag: 'array', icon: '📊', color: 'from-blue-500 to-cyan-500' },
  { name: 'Strings', tag: 'string', icon: '🔤', color: 'from-cyan-500 to-teal-500' },
  { name: 'Dynamic Programming', tag: 'dynamic-programming', icon: '🧠', color: 'from-purple-500 to-indigo-500' },
  { name: 'Trees & BST', tag: 'tree', icon: '🌳', color: 'from-emerald-500 to-green-500' },
  { name: 'Graphs & BFS/DFS', tag: 'graph', icon: '🕸️', color: 'from-amber-500 to-orange-500' },
  { name: 'Binary Search', tag: 'binary-search', icon: '🔍', color: 'from-rose-500 to-pink-500' },
  { name: 'Sliding Window & Two Pointers', tag: 'sliding-window', icon: '🪟', color: 'from-violet-500 to-purple-600' },
  { name: 'Heap / Priority Queue', tag: 'heap-priority-queue', icon: '🏔️', color: 'from-indigo-500 to-blue-600' },
  { name: 'Stacks & Queues', tag: 'stack', icon: '🥞', color: 'from-teal-500 to-emerald-600' },
  { name: 'Linked Lists', tag: 'linked-list', icon: '🔗', color: 'from-blue-600 to-indigo-700' },
];

export default function LeetcodeAnalysis() {
  const [stats, setStats] = useState<LeetcodeStatsData | null>(null);
  const [weeklyTarget, setWeeklyTarget] = useState<WeeklyTargetData | null>(null);
  const [monthlyTarget, setMonthlyTarget] = useState<MonthlyTargetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      // 1. Fetch Stats
      const statsRes = await api.get('/leetcode/stats', {
        params: forceRefresh ? { refresh: 'true' } : {},
      });
      setStats(statsRes.data);

      // 2. Fetch Weekly & Monthly Targets in parallel
      const [weeklyRes, monthlyRes] = await Promise.allSettled([
        api.get('/leetcode/weekly-targets'),
        api.get('/leetcode/monthly-targets'),
      ]);

      if (weeklyRes.status === 'fulfilled') {
        setWeeklyTarget(weeklyRes.value.data);
      }
      if (monthlyRes.status === 'fulfilled') {
        setMonthlyTarget(monthlyRes.value.data);
      }
    } catch (err: any) {
      console.error('Leetcode analysis error:', err);
      setError(err.response?.data?.error || 'Failed to load LeetCode data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No recent activity';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'No recent activity';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const weeklyTargetCount = weeklyTarget?.total_target ?? weeklyTarget?.totalTarget ?? 6;
  const weeklyReasoning =
    weeklyTarget?.ai_reasoning ??
    weeklyTarget?.aiReasoning ??
    'Based on your graduation timeline and problem count, this target builds consistent problem-solving habit.';
  
  const rawFocus =
    weeklyTarget?.concept_recommendations?.focus ??
    weeklyTarget?.conceptRecommendations?.focus ??
    ['Dynamic Programming', 'Trees', 'Graphs'];
  const focusConcepts: string[] = Array.isArray(rawFocus) ? rawFocus : Object.keys(rawFocus);

  const monthlyTargetCount = monthlyTarget?.total_target ?? monthlyTarget?.totalTarget ?? 24;
  const monthlyReasoning =
    monthlyTarget?.ai_reasoning ??
    monthlyTarget?.aiReasoning ??
    'Strategic benchmark to steadily elevate your DSA competitive standing this month.';

  const total = stats?.totalSolved || 0;
  const easy = stats?.easySolved || 0;
  const medium = stats?.mediumSolved || 0;
  const hard = stats?.hardSolved || 0;

  const easyPct = total > 0 ? Math.round((easy / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((medium / total) * 100) : 0;
  const hardPct = total > 0 ? Math.round((hard / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
          Analyzing your LeetCode readiness & generating AI targets...
        </p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto border-2 border-red-300 dark:border-red-800 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Unable to Load LeetCode Stats
        </h2>
        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
        <button
          onClick={() => loadData(true)}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with quick refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            LeetCode Performance & AI Readiness
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Real-time coding analytics, difficulty distribution, and adaptive AI targets
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats?.cached && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
              ⚡ Cached (24h)
            </span>
          )}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow transition-all disabled:opacity-60"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            {refreshing ? 'Syncing...' : 'Sync Fresh Stats'}
          </button>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Solved */}
        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
              Total Solved
            </span>
            <div className="text-5xl font-black mt-2 mb-1">{total}</div>
            <p className="text-xs opacity-80">
              Last submission: {formatDate(stats?.lastSubmissionDate)}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 font-mono select-none">
            &lt;/&gt;
          </div>
        </div>

        {/* Easy */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-emerald-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Easy</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {easyPct}%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{easy}</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${easyPct}%` }}
            ></div>
          </div>
        </div>

        {/* Medium */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-amber-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Medium</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {medPct}%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{medium}</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${medPct}%` }}
            ></div>
          </div>
        </div>

        {/* Hard */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-rose-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">Hard</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              {hardPct}%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{hard}</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${hardPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* AI Placement Targets Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Adaptive Placement Targets
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Target Card */}
          <div className="glass-card p-6 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Weekly Goal
              </span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                Active Week
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {weeklyTargetCount}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                problems target
              </span>
            </div>

            <div className="bg-purple-50/70 dark:bg-purple-950/30 p-4 rounded-xl mb-4 border border-purple-100 dark:border-purple-900/30">
              <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1">
                <span>🤖</span> AI Advisory Note
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {weeklyReasoning}
              </p>
            </div>

            {/* Recommended focus concepts */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                Recommended Focus Areas
              </span>
              <div className="flex flex-wrap gap-2">
                {focusConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm"
                  >
                    ✦ {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Target Card */}
          <div className="glass-card p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Monthly Milestone
              </span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Month Outlook
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {monthlyTargetCount}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                problems target
              </span>
            </div>

            <div className="bg-blue-50/70 dark:bg-blue-950/30 p-4 rounded-xl mb-4 border border-blue-100 dark:border-blue-900/30">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                <span>📈</span> Placement Trajectory
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {monthlyReasoning}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                Suggested Weekly Pace
              </span>
              <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                <span>Consistent rhythm:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ~{Math.round(monthlyTargetCount / 4)} problems / week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DSA Topic Quick Practice Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Core DSA Topic Hub
            </h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Click any topic to practice directly on LeetCode
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CORE_DSA_TOPICS.map((topic, i) => (
            <a
              key={i}
              href={`https://leetcode.com/tag/${topic.tag}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 hover:shadow-lg hover:scale-[1.02] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {topic.icon}
                </div>
                <h4 className="font-semibold text-xs text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {topic.name}
                </h4>
              </div>
              <span className="mt-3 text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                Practice ↗
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recently Solved Problems List */}
      {stats?.solvedProblems && stats.solvedProblems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recently Solved Problems
              </h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.solvedProblems.length} verified submissions
            </span>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden shadow">
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[380px] overflow-y-auto">
              {stats.solvedProblems.slice(0, 25).map((slug, idx) => {
                const title = slug
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                return (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between hover:bg-purple-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-500 font-bold text-base">✓</span>
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                          {title}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {slug}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`https://leetcode.com/problems/${slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 rounded-lg transition-colors"
                    >
                      View on LeetCode ↗
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

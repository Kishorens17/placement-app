import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import LeetcodeRadarChart from './LeetcodeRadarChart';
import { LEETCODE_DOMAINS, getUnsolvedEasyProblems } from '../../utils/leetcodeProblemsData';

interface SkillTagItem {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

interface LeetcodeStatsData {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  lastSubmissionDate: string | null;
  conceptStats: Record<string, { solved: number; total: number }>;
  skills?: {
    fundamental?: SkillTagItem[];
    intermediate?: SkillTagItem[];
    advanced?: SkillTagItem[];
    tagCounts?: Record<string, number>;
  };
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

export default function LeetcodeAnalysis() {
  const [stats, setStats] = useState<LeetcodeStatsData | null>(null);
  const [weeklyTarget, setWeeklyTarget] = useState<WeeklyTargetData | null>(null);
  const [monthlyTarget, setMonthlyTarget] = useState<MonthlyTargetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedTopicTag, setSelectedTopicTag] = useState<string>('array');

  const topicRecommendation = useMemo(() => {
    return getUnsolvedEasyProblems(selectedTopicTag, stats?.solvedProblems || [], 3);
  }, [selectedTopicTag, stats?.solvedProblems]);

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

      {/* Radar Graph Visualization & Domain Balance Index */}
      <LeetcodeRadarChart
        solvedProblems={stats?.solvedProblems || []}
        conceptStats={stats?.conceptStats || {}}
        skills={stats?.skills}
        selectedTag={selectedTopicTag}
        onSelectTopic={(tag) => setSelectedTopicTag(tag)}
      />

      {/* Real LeetCode Topic Statistics (Fundamental, Intermediate, Advanced via alfa-leetcode-api) */}
      <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                LeetCode Topic Statistics
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Live tag-level problem breakdown synchronized from LeetCode GraphQL & alfa-leetcode-api
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
            <span>●</span> Live Verified Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FUNDAMENTAL */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 p-5 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-900/30">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span>🌱</span> Fundamental
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {stats?.skills?.fundamental?.reduce((acc, x) => acc + x.problemsSolved, 0) || 0} Solved
              </span>
            </div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {(stats?.skills?.fundamental || []).length > 0 ? (
                stats?.skills?.fundamental?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-xs shadow-xs border border-gray-100 dark:border-gray-800 hover:border-emerald-300 transition-all"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.tagName}</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px]">
                      {item.problemsSolved}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">Syncing fundamental stats...</div>
              )}
            </div>
          </div>

          {/* INTERMEDIATE */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 p-5 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-900/30">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span>🌲</span> Intermediate
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {stats?.skills?.intermediate?.reduce((acc, x) => acc + x.problemsSolved, 0) || 0} Solved
              </span>
            </div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {(stats?.skills?.intermediate || []).length > 0 ? (
                stats?.skills?.intermediate?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-xs shadow-xs border border-gray-100 dark:border-gray-800 hover:border-blue-300 transition-all"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.tagName}</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px]">
                      {item.problemsSolved}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">Syncing intermediate stats...</div>
              )}
            </div>
          </div>

          {/* ADVANCED */}
          <div className="rounded-xl border border-purple-200 dark:border-purple-900/50 p-5 bg-purple-50/20 dark:bg-purple-950/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/30">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <span>⚡</span> Advanced
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                {stats?.skills?.advanced?.reduce((acc, x) => acc + x.problemsSolved, 0) || 0} Solved
              </span>
            </div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {(stats?.skills?.advanced || []).length > 0 ? (
                stats?.skills?.advanced?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-xs shadow-xs border border-gray-100 dark:border-gray-800 hover:border-purple-300 transition-all"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.tagName}</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px]">
                      {item.problemsSolved}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">Syncing advanced stats...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Concept-Wise Capacity & Unsolved Problem Recommender */}
      <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Concept-Wise Capacity & Starter Recommendations
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select a domain below to see your verified solved count and get 3 high-yield, very easy unsolved problems.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            ✓ Excludes Problems You've Already Solved
          </span>
        </div>

        {/* Domain Selection Tabs with Real Problem Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {LEETCODE_DOMAINS.map((domain) => {
            const isSelected = selectedTopicTag === domain.tag;
            const solvedSet = new Set((stats?.solvedProblems || []).map((s) => s.toLowerCase().trim()));
            const countSolved = domain.problems.filter((p) => solvedSet.has(p.slug.toLowerCase())).length;
            const tagCounts = stats?.skills?.tagCounts || {};
            const directTagCount = tagCounts[domain.name] ?? tagCounts[domain.tag] ?? 0;
            const actualCount = Math.max(directTagCount, countSolved);
            const maxVal = Math.max(...LEETCODE_DOMAINS.map(d => tagCounts[d.name] ?? tagCounts[d.tag] ?? 0), 20);
            const pct = Math.min(100, Math.round((actualCount / maxVal) * 100));

            return (
              <button
                key={domain.tag}
                onClick={() => setSelectedTopicTag(domain.tag)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                    : 'glass-card border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{domain.icon}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {actualCount} solved
                  </span>
                </div>

                <div className="text-xs font-bold text-gray-900 dark:text-white truncate mb-2">
                  {domain.name}
                </div>

                {/* Micro progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Domain Showcase & Unsolved Recommendations */}
        {topicRecommendation && (
          <div className="bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-blue-50/20 dark:from-purple-950/20 dark:via-gray-800/40 dark:to-blue-950/20 p-6 rounded-2xl border border-purple-200/70 dark:border-purple-900/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/50">
                  {topicRecommendation.domain.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {topicRecommendation.domain.name}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold rounded-full">
                      Verified Solved: {stats?.skills?.tagCounts?.[topicRecommendation.domain.name] || stats?.skills?.tagCounts?.[topicRecommendation.domain.tag] || 0} problems
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {topicRecommendation.domain.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Verified In Domain
                </div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {topicRecommendation.totalSolvedInDomain}{' '}
                  <span className="text-xs text-gray-400 font-normal">solved</span>
                </div>
              </div>
            </div>

            {/* 3 High-Yield Unsolved Easy Problems */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚡</span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    3 Very Easy Unsolved Problems For You
                  </h4>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Tailored to kickstart your momentum
                </span>
              </div>

              {topicRecommendation.recommended.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topicRecommendation.recommended.map((problem) => (
                    <div
                      key={problem.slug}
                      className="glass-card p-5 rounded-xl border border-gray-200 dark:border-gray-700/70 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500">
                            #{problem.id}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                            Easy
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
                          {problem.title}
                        </h5>

                        <div className="space-y-1.5 text-xs mb-4">
                          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                            <span>Acceptance:</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono">
                              {problem.acceptance}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                            <span>Key Pattern:</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              {problem.keyConcept}
                            </span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={`https://leetcode.com/problems/${problem.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg text-center shadow transition-all flex items-center justify-center gap-1.5 group-hover:scale-[1.02]"
                      >
                        <span>Solve on LeetCode</span>
                        <span>↗</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-3xl mb-2 block">🎉</span>
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    Incredible! You have solved all starter problems in this domain!
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    You're ready to tackle Medium-difficulty problems in {topicRecommendation.domain.name}.
                  </p>
                </div>
              )}
            </div>

            {/* Direct Link to Complete Domain Library */}
            <div className="pt-2">
              <a
                href={`https://leetcode.com/tag/${topicRecommendation.domain.tag}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <span>
                    Explore All {topicRecommendation.domain.name} Problems on LeetCode Tag Hub
                  </span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full group-hover:translate-x-1 transition-transform">
                  View Full Library ↗
                </span>
              </a>
            </div>
          </div>
        )}
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

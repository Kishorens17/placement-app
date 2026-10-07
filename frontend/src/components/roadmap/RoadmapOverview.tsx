import type { RoadmapStats } from '../../types';

interface RoadmapOverviewProps {
  stats: RoadmapStats;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function RoadmapOverview({
  stats,
  selectedCategory,
  onSelectCategory,
}: RoadmapOverviewProps) {
  const getReadinessBadge = (percentage: number) => {
    if (percentage >= 80) {
      return { text: 'Placement Ready 🚀', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
    if (percentage >= 50) {
      return { text: 'Good Progress 💪', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    }
    if (percentage >= 20) {
      return { text: 'Building Momentum ⚡', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    return { text: 'Getting Started 🌱', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
  };

  const badge = getReadinessBadge(stats.overallReadiness);

  return (
    <div className="space-y-6">
      {/* Top Banner & Main Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Readiness Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5 border border-purple-100 dark:border-purple-900/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                CS Readiness Score
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {stats.overallReadiness}%
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
            >
              {badge.text}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, stats.overallReadiness))}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on completed subtopics and progress across all 15 core computer science modules.
          </p>
        </div>

        {/* Quick Counters */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-purple-500">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Modules</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.totalConcepts}
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Core CS Syllabus</span>
          </div>

          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-emerald-500">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Mastered</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {stats.completedConcepts}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {Math.round((stats.completedConcepts / (stats.totalConcepts || 1)) * 100)}% of total
            </span>
          </div>

          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-blue-500">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">In Progress</span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {stats.inProgressConcepts}
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Active Learning</span>
          </div>

          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-l-4 border-l-amber-500">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Not Started</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {stats.notStartedConcepts}
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">Up Next</span>
          </div>
        </div>
      </div>

      {/* Category Progress Strip */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Domain Progress Breakdown
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click any domain below to filter modules
            </p>
          </div>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline self-start"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.categoryBreakdown || {}).map(([catName, catData]) => {
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => onSelectCategory(isSelected ? 'All' : catName)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10 shadow-sm'
                    : 'border-gray-200/80 dark:border-gray-800 bg-white/40 dark:bg-gray-800/40 hover:border-purple-400/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {catName}
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {catData.avgProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${catData.avgProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  <span>{catData.completed} / {catData.total} Completed</span>
                  <span>{catData.inProgress} In Progress</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

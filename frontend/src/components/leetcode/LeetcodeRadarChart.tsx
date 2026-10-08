import { useState, useMemo } from 'react';
import { LEETCODE_DOMAINS } from '../../utils/leetcodeProblemsData';

interface SkillTagItem {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

interface RadarChartProps {
  solvedProblems: string[];
  conceptStats?: Record<string, { solved: number; total: number }>;
  skills?: {
    fundamental?: SkillTagItem[];
    intermediate?: SkillTagItem[];
    advanced?: SkillTagItem[];
    tagCounts?: Record<string, number>;
  };
  onSelectTopic?: (tag: string) => void;
  selectedTag?: string;
}

const PRIMARY_RADAR_TOPICS = [
  { name: 'Array', tag: 'array', icon: '📊', category: 'Fundamental' },
  { name: 'String', tag: 'string', icon: '🔤', category: 'Fundamental' },
  { name: 'Hash Table', tag: 'hash-table', icon: '🗄️', category: 'Intermediate' },
  { name: 'Two Pointers', tag: 'two-pointers', icon: '👉', category: 'Fundamental' },
  { name: 'Sorting', tag: 'sorting', icon: '🔄', category: 'Fundamental' },
  { name: 'Linked List', tag: 'linked-list', icon: '🔗', category: 'Fundamental' },
  { name: 'Tree & BST', tag: 'tree', icon: '🌳', category: 'Intermediate' },
  { name: 'Binary Search', tag: 'binary-search', icon: '🔍', category: 'Intermediate' },
  { name: 'Dynamic Programming', tag: 'dynamic-programming', icon: '📈', category: 'Advanced' },
  { name: 'Math', tag: 'math', icon: '🔢', category: 'Intermediate' },
];

export default function LeetcodeRadarChart({
  solvedProblems = [],
  conceptStats = {},
  skills,
  onSelectTopic,
  selectedTag,
}: RadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Evaluate primary interview axes using original LeetCode solved counts
  const radarAxes = useMemo(() => {
    const solvedSet = new Set(solvedProblems.map((s) => s.toLowerCase().trim()));
    const tagCounts = skills?.tagCounts || {};

    const rawAxes = PRIMARY_RADAR_TOPICS.map((topic) => {
      // 1. Direct verified count from LeetCode tag counts (alfa-leetcode-api / skillStats)
      let directCount = 0;
      if (topic.name === 'Tree & BST') {
        directCount = (tagCounts['Tree'] || tagCounts['tree'] || 0) + (tagCounts['Binary Tree'] || tagCounts['binary-tree'] || 0);
      } else {
        directCount = tagCounts[topic.name] ?? tagCounts[topic.tag] ?? 0;
      }

      // 2. Check conceptStats from backend or fallback to catalog
      const fromBackend = conceptStats[topic.name]?.solved || 0;
      const matchedDomain = LEETCODE_DOMAINS.find((d) => d.tag === topic.tag || d.name.toLowerCase().includes(topic.name.toLowerCase()));
      const catalogSolved = matchedDomain ? matchedDomain.problems.filter((p) => solvedSet.has(p.slug.toLowerCase())).length : 0;

      const effectiveSolved = Math.max(directCount, fromBackend, catalogSolved);

      return {
        name: topic.name,
        tag: topic.tag,
        icon: topic.icon,
        category: topic.category,
        solved: effectiveSolved,
      };
    });

    // Dynamic scale based on user's highest solved topic (no hardcoded 25 cap)
    const maxVal = Math.max(...rawAxes.map((a) => a.solved), 15);

    return rawAxes.map((axis) => {
      const ratio = Math.min(1, Math.max(0.08, axis.solved / maxVal));
      return {
        ...axis,
        maxScale: maxVal,
        ratio,
        percentage: Math.round((axis.solved / maxVal) * 100),
      };
    });
  }, [solvedProblems, conceptStats, skills]);

  // Compute Domain Balance Index (0 - 100%)
  const { balanceScore, balanceLabel, balanceAdvice } = useMemo(() => {
    const ratios = radarAxes.map((a) => a.ratio);
    const n = ratios.length;
    const mean = ratios.reduce((acc, v) => acc + v, 0) / n;

    // Variance & Standard Deviation to penalize skewed distributions
    const variance = ratios.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Uniformity factor: 1 when all ratios are equal, decreases as variance grows
    const uniformity = Math.max(0, 1 - (stdDev / (mean + 0.001)) * 0.7);

    const rawScore = Math.round((mean * 0.6 + uniformity * 0.4) * 100);
    const score = Math.max(12, Math.min(100, rawScore));

    let label = 'Developing Balance';
    let advice = 'Focus on expanding your practice into untouched topics to build a well-rounded foundation.';

    if (score >= 80) {
      label = 'Elite Equilibrium (80%+)';
      advice = 'Outstanding distribution! Your DSA foundation spans all core interview domains equally.';
    } else if (score >= 60) {
      label = 'Strong Coverage (60-79%)';
      advice = 'Solid breadth. Sharpen your lower-coverage areas (e.g. DP or Graphs) to reach top-tier readiness.';
    } else if (score >= 40) {
      label = 'Moderate Balance (40-59%)';
      advice = 'Noticeable concentration in 2-3 topics. Diversify into Trees, Binary Search, and Linked Lists.';
    }

    return { balanceScore: score, balanceLabel: label, balanceAdvice: advice };
  }, [radarAxes]);

  // Radar geometry
  const size = 360;
  const center = size / 2;
  const radius = size * 0.38;
  const angleStep = (2 * Math.PI) / radarAxes.length;

  // Compute coordinate on axis
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build polygon path for student's solved distribution
  const polygonPoints = radarAxes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.ratio);
      return `${x},${y}`;
    })
    .join(' ');

  // Benchmark target polygon points (100% boundary)
  const targetPolygonPoints = radarAxes
    .map((_, i) => {
      const { x, y } = getCoordinates(i, 1.0);
      return `${x},${y}`;
    })
    .join(' ');

  // Concentric polygon grid levels: 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕸️</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Domain Balance Radar & Distribution
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Visualizes problem-solving equilibrium across 8 primary CS & DSA interview domains
          </p>
        </div>

        {/* Balance Score Pill */}
        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-4 py-2 rounded-xl">
          <div className="relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="4"
                className="text-gray-200 dark:text-gray-800 fill-none"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${(balanceScore / 100) * 113} 113`}
                strokeLinecap="round"
                className="text-purple-600 dark:text-purple-400 fill-none transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-black text-gray-900 dark:text-white">
              {balanceScore}%
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
              {balanceLabel}
            </div>
            <div className="text-[11px] text-gray-600 dark:text-gray-400">
              DSA Equality Index
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Radar SVG + Domain Breakdown List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar SVG Container */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[370px] h-auto overflow-visible">
            <defs>
              {/* Radial gradient for data polygon */}
              <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </radialGradient>
              <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Concentric grid polygons */}
            {gridLevels.map((lvl) => {
              const points = radarAxes
                .map((_, i) => {
                  const { x, y } = getCoordinates(i, lvl);
                  return `${x},${y}`;
                })
                .join(' ');
              return (
                <polygon
                  key={lvl}
                  points={points}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={lvl === 1 ? '1.5' : '1'}
                  strokeDasharray={lvl === 1 ? 'none' : '3,3'}
                  className="text-gray-300 dark:text-gray-700/60 transition-colors"
                />
              );
            })}

            {/* Axis spokes from center to each vertex */}
            {radarAxes.map((_, i) => {
              const { x, y } = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-300 dark:text-gray-700/70"
                />
              );
            })}

            {/* Benchmark Target outline (100% capacity) */}
            <polygon
              points={targetPolygonPoints}
              fill="none"
              stroke="#eab308"
              strokeWidth="1.2"
              strokeDasharray="4,4"
              opacity="0.35"
            />

            {/* Student's Actual Data Polygon */}
            <polygon
              points={polygonPoints}
              fill="url(#radarGlow)"
              stroke="url(#strokeGradient)"
              strokeWidth="2.5"
              className="filter drop-shadow-md transition-all duration-700 ease-out"
            />

            {/* Data points & clickable vertices */}
            {radarAxes.map((axis, i) => {
              const { x, y } = getCoordinates(i, axis.ratio);
              const isHovered = hoveredIndex === i;
              const isSelected = selectedTag === axis.tag;

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onClick={() => onSelectTopic && onSelectTopic(axis.tag)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Outer pulse circle if selected or hovered */}
                  {(isHovered || isSelected) && (
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="#8b5cf6"
                      fillOpacity="0.25"
                      className="animate-ping"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '6.5' : isHovered ? '6' : '4.5'}
                    fill={isSelected ? '#ec4899' : '#8b5cf6'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-200 drop-shadow"
                  />
                </g>
              );
            })}

            {/* Axis Labels positioned around periphery */}
            {radarAxes.map((axis, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const labelRadius = radius + 26;
              const lx = center + labelRadius * Math.cos(angle);
              const ly = center + labelRadius * Math.sin(angle);
              const isSelected = selectedTag === axis.tag;

              return (
                <text
                  key={i}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  onClick={() => onSelectTopic && onSelectTopic(axis.tag)}
                  className={`text-[10px] font-bold cursor-pointer transition-colors duration-200 select-none ${
                    isSelected
                      ? 'fill-purple-600 dark:fill-purple-400 font-extrabold'
                      : 'fill-gray-600 dark:fill-gray-400 hover:fill-purple-500'
                  }`}
                >
                  {axis.icon} {axis.name.split(' ')[0]}
                </text>
              );
            })}
          </svg>

          {/* Active Hover / Selection Tooltip */}
          {hoveredIndex !== null && (
            <div className="absolute bottom-1 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md border border-gray-700 flex items-center gap-2 pointer-events-none">
              <span className="text-base">{radarAxes[hoveredIndex].icon}</span>
              <span className="font-semibold">{radarAxes[hoveredIndex].name}:</span>
              <span className="text-purple-300 font-bold">
                {radarAxes[hoveredIndex].solved} problems solved
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200">
                {radarAxes[hoveredIndex].category}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Domain Capacity Metrics & Advice */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">
              <span>💡</span> Domain Balance Recommendation
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {balanceAdvice}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
              <span>Domain (alfa-leetcode-api)</span>
              <span>LeetCode Solved</span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {radarAxes.map((axis, idx) => {
                const isSelected = selectedTag === axis.tag;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectTopic && onSelectTopic(axis.tag)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                      isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/50 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-white font-bold'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{axis.icon}</span>
                      <span className="truncate">{axis.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, axis.percentage)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] min-w-[55px] text-right font-bold text-purple-600 dark:text-purple-400">
                        {axis.solved} solved
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
            Click on any topic above to view 3 very easy unsolved problems
          </div>
        </div>
      </div>
    </div>
  );
}

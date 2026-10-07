interface RepositoryCardProps {
  analysis: {
    repo_name?: string;
    repoName?: string;
    repo_url?: string;
    repoUrl?: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    detailed_analysis?: string;
    analyzed_at?: string;
  };
  onOpenDeepAnalysis?: (analysis: any) => void;
}

export default function RepositoryCard({ analysis, onOpenDeepAnalysis }: RepositoryCardProps) {
  const repoName = analysis.repo_name || analysis.repoName || 'Untitled Repository';
  const repoUrl = analysis.repo_url || analysis.repoUrl || '#';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  };

  return (
    <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4 gap-3">
          <h3
            className="text-xl font-bold text-gray-800 dark:text-white truncate flex-1"
            title={repoName}
          >
            {repoName}
          </h3>
          <div className={`px-3 py-1 rounded-full font-bold text-lg shrink-0 ${getScoreColor(analysis.score)}`}>
            {getScoreGrade(analysis.score)}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Score</span>
            <span className="font-semibold text-gray-800 dark:text-white">{analysis.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${
                analysis.score >= 80
                  ? 'bg-green-500'
                  : analysis.score >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${analysis.score}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
              ✓ Strengths ({analysis.strengths.length})
            </div>
            {analysis.strengths.length === 0 ? (
              <p className="text-xs text-gray-400 italic">None</p>
            ) : (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {analysis.strengths.slice(0, 2).map((strength, idx) => (
                  <li key={idx} className="truncate">• {strength}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
              ✗ Weaknesses ({analysis.weaknesses.length})
            </div>
            {analysis.weaknesses.length === 0 ? (
              <p className="text-xs text-gray-400 italic">None</p>
            ) : (
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {analysis.weaknesses.slice(0, 2).map((weakness, idx) => (
                  <li key={idx} className="truncate">• {weakness}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-center text-xs sm:text-sm font-semibold truncate"
        >
          View on GitHub
        </a>
        <button
          onClick={() => onOpenDeepAnalysis && onOpenDeepAnalysis(analysis)}
          className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-center text-xs sm:text-sm font-semibold shadow-sm"
        >
          Deep Analysis
        </button>
      </div>
    </div>
  );
}

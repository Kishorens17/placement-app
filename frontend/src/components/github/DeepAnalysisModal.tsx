interface DeepAnalysisModalProps {
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
  } | null;
  onClose: () => void;
}

export default function DeepAnalysisModal({ analysis, onClose }: DeepAnalysisModalProps) {
  if (!analysis) return null;

  const repoName = analysis.repo_name || analysis.repoName || 'Project Repository';
  const repoUrl = analysis.repo_url || analysis.repoUrl || '#';
  const score = analysis.score ?? 0;
  const strengths = analysis.strengths || [];
  const weaknesses = analysis.weaknesses || [];
  const detailedAnalysis = analysis.detailed_analysis || 'No detailed analysis narrative available.';

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800';
    if (sc >= 60) return 'text-amber-500 bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    return 'text-rose-500 bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800';
  };

  const getScoreGrade = (sc: number) => {
    if (sc >= 90) return 'A+';
    if (sc >= 80) return 'A';
    if (sc >= 70) return 'B+';
    if (sc >= 60) return 'B';
    if (sc >= 50) return 'C';
    return 'D';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="glass-card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate">
                {repoName}
              </h2>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-black border ${getScoreColor(score)}`}
              >
                Grade {getScoreGrade(score)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Deep Technical Codebase & Placement Readiness Audit
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Score Bar */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              <span>Overall Repository Health</span>
              <span className="text-base font-black text-gray-900 dark:text-white">{score} / 100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>✓ Core Strengths ({strengths.length})</span>
              </div>
              {strengths.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No prominent strengths identified.</p>
              ) : (
                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                  {strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/60 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <span>✗ Critical Areas for Improvement ({weaknesses.length})</span>
              </div>
              {weaknesses.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No major weaknesses identified.</p>
              ) : (
                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                  {weaknesses.map((wk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Detailed Narrative Review */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Detailed AI Code Review & Feedback
            </h3>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-line text-xs sm:text-sm font-sans">
              {detailedAnalysis}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/50">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition-all"
          >
            <span>🐙 Open on GitHub</span>
          </a>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

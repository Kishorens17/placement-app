import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../../services/quiz.api';
import { CheckCircle, XCircle, AlertTriangle, BookOpen } from 'lucide-react';

interface HistoryEntry {
  id: string;
  subject: string;
  set_number: number;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
  malpractice_count: number;
  malpractice_severity: string;
}

export default function QuizHistoryCard() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    quizApi.getHistory().then(data => {
      setHistory(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const severityColor = (s: string) => s === 'clean' ? '#34d399'
    : s === 'low' ? '#f59e0b'
    : s === 'moderate' ? '#f97316'
    : '#f87171';

  const overallAvg = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.percentage, 0) / history.length)
    : null;

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📝</span>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Assessment History</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📝</span>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Assessment History</h2>
        </div>
        <div className="flex flex-col items-center py-8 text-center">
          <BookOpen size={36} className="text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No assessments taken yet</p>
          <p className="text-xs text-gray-500 mt-1">Complete a roadmap subject to unlock its assessment</p>
          <button
            onClick={() => navigate('/roadmap')}
            className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-all"
          >
            Go to Roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Assessment History</h2>
        </div>
        {overallAvg !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Overall avg:</span>
            <span className={`text-sm font-bold ${overallAvg >= 60 ? 'text-emerald-500' : 'text-red-400'}`}>
              {overallAvg}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {history.map((entry) => (
          <div
            key={entry.id}
            onClick={() => navigate(`/quiz/${encodeURIComponent(entry.subject)}`)}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all border border-gray-200/50 dark:border-gray-700/50"
          >
            {entry.passed
              ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
              : <XCircle size={18} className="text-red-400 flex-shrink-0" />}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {entry.subject}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  Set {['A', 'B', 'C'][entry.set_number - 1] || entry.set_number}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {new Date(entry.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {entry.malpractice_count > 0 && (
                <div className="flex items-center gap-1" title={`${entry.malpractice_count} violation(s) — ${entry.malpractice_severity}`}>
                  <AlertTriangle size={12} style={{ color: severityColor(entry.malpractice_severity) }} />
                  <span style={{ color: severityColor(entry.malpractice_severity), fontSize: '11px' }}>
                    {entry.malpractice_count}
                  </span>
                </div>
              )}
              <div className="text-right">
                <div className={`text-sm font-bold ${entry.passed ? 'text-emerald-500' : 'text-red-400'}`}>
                  {entry.percentage}%
                </div>
                <div className="text-[10px] text-gray-500">{entry.score}/{entry.total_questions}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/roadmap')}
        className="mt-4 w-full py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-all text-center"
      >
        Take more assessments →
      </button>
    </div>
  );
}

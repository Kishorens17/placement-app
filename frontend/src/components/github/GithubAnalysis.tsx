import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RepositoryCard from './RepositoryCard';
import DeepAnalysisModal from './DeepAnalysisModal';

export default function GithubAnalysis() {
  const { repoName: paramRepoName } = useParams<{ repoName?: string }>();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);

  const startAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError('');
      const response = await api.post('/github/analyze');
      const loaded = response.data.analyses || [];
      setAnalyses(loaded);
      if (paramRepoName) {
        const found = loaded.find((a: any) => (a.repo_name || a.repoName) === paramRepoName);
        if (found) setSelectedAnalysis(found);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze repositories');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadExistingAnalyses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/github/analyses');
      const loaded = response.data.analyses || [];
      setAnalyses(loaded);
      if (paramRepoName) {
        const found = loaded.find((a: any) => (a.repo_name || a.repoName) === paramRepoName);
        if (found) setSelectedAnalysis(found);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExistingAnalyses();
  }, [paramRepoName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading repository analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">GitHub Repository Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            AI-powered code quality, documentation, and placement readiness audits for all your repositories
          </p>
        </div>
        <button
          onClick={startAnalysis}
          disabled={analyzing}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing All Repositories...</span>
            </>
          ) : (
            <>
              <span>⚡ Analyze All Repositories</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {analyzing && (
        <div className="glass-card p-8 rounded-2xl text-center space-y-4">
          <div className="text-5xl animate-bounce">🤖</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            AI Auditing All Repositories...
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
            Scanning files, analyzing READMEs, evaluating software architecture, and assigning grades across all your projects.
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden max-w-md mx-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {analyses.length === 0 && !analyzing && (
        <div className="glass-card p-12 rounded-2xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Analyses Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
            Click "Analyze All Repositories" above to generate a full technical evaluation report for all repositories in your GitHub account.
          </p>
        </div>
      )}

      {analyses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>Showing reports for all {analyses.length} repositories</span>
            <span>Click <b>Deep Analysis</b> on any card for full details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis, idx) => (
              <RepositoryCard
                key={analysis.repo_name || analysis.repoName || idx}
                analysis={analysis}
                onOpenDeepAnalysis={setSelectedAnalysis}
              />
            ))}
          </div>
        </div>
      )}

      {/* Deep Analysis Modal */}
      <DeepAnalysisModal
        analysis={selectedAnalysis}
        onClose={() => {
          setSelectedAnalysis(null);
          if (paramRepoName) navigate('/github');
        }}
      />
    </div>
  );
}

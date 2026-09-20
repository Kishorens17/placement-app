import { useState, useEffect } from 'react';
import api from '../../services/api';
import RepositoryCard from './RepositoryCard';

export default function GithubAnalysis() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const startAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError('');
      const response = await api.post('/github/analyze');
      setAnalyses(response.data.analyses);
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
      setAnalyses(response.data.analyses);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExistingAnalyses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">GitHub Repository Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered analysis of your projects with detailed scoring
          </p>
        </div>
        <button
          onClick={startAnalysis}
          disabled={analyzing}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {analyzing ? (
            <>
              <span className="animate-pulse">Analyzing...</span>
              <span className="ml-2">🤖</span>
            </>
          ) : (
            <>Start Repository Analysis</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {analyzing && (
        <div className="glass-card p-8 rounded-xl text-center">
          <div className="animate-pulse mb-4 text-4xl">🤖</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            AI Analysis in Progress...
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This may take 1-2 minutes. Analyzing repository structure, code quality, and documentation.
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse w-2/3"></div>
          </div>
        </div>
      )}

      {analyses.length === 0 && !analyzing && (
        <div className="glass-card p-12 rounded-xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Analyses Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click "Start Repository Analysis" to begin AI-powered analysis of your GitHub projects
          </p>
        </div>
      )}

      {analyses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <RepositoryCard key={analysis.repo_name} analysis={analysis} />
          ))}
        </div>
      )}
    </div>
  );
}

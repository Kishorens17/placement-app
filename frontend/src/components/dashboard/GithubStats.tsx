import { useEffect, useState } from 'react';
import api from '../../services/api';

interface GithubData {
  totalRepos: number;
  lastPushDate: string | null;
  repos: any[];
  cached: boolean;
}

export default function GithubStats() {
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGithubStats();
  }, []);

  const fetchGithubStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/github/stats');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch GitHub stats');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-xl border-2 border-red-200 dark:border-red-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          GitHub Statistics
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchGithubStats}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          GitHub Statistics
        </h2>
        {data?.cached && (
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            Cached
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-lg text-white">
          <div className="text-4xl font-bold mb-1">{data?.totalRepos || 0}</div>
          <div className="text-sm opacity-90">Total Repositories</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {data?.repos.filter(r => r.language).length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">With Code</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {data?.repos.reduce((sum, r) => sum + r.stars, 0) || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Stars</div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Active</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {formatDate(data?.lastPushDate || null)}
          </div>
        </div>

        <button
          onClick={fetchGithubStats}
          className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}

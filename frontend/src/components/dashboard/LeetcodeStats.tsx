import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface LeetcodeData {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  lastSubmissionDate: string | null;
  cached: boolean;
}

export default function LeetcodeStats() {
  const [data, setData] = useState<LeetcodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeetcodeStats();
  }, []);

  const fetchLeetcodeStats = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/leetcode/stats', {
        params: forceRefresh ? { refresh: 'true' } : {},
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch LeetCode stats');
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
          LeetCode Progress
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchLeetcodeStats}
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
          LeetCode Progress
        </h2>
        {data?.cached && (
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            Cached
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-lg text-white">
          <div className="text-4xl font-bold mb-1">{data?.totalSolved || 0}</div>
          <div className="text-sm opacity-90">Problems Solved</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
              {data?.easySolved || 0}
            </div>
            <div className="text-xs text-green-600 dark:text-green-500">Easy</div>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-1">
              {data?.mediumSolved || 0}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-500">Medium</div>
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400 mb-1">
              {data?.hardSolved || 0}
            </div>
            <div className="text-xs text-red-600 dark:text-red-500">Hard</div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Submission</div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {formatDate(data?.lastSubmissionDate || null)}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchLeetcodeStats(true)}
            className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm font-medium"
          >
            Refresh
          </button>
          <Link
            to="/leetcode"
            className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-semibold text-center flex items-center justify-center gap-1 shadow"
          >
            Full Analysis →
          </Link>
        </div>
      </div>
    </div>
  );
}

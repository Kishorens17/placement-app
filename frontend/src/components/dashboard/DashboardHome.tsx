import { useAuth } from '../../contexts/AuthContext';
import GithubStats from '../../components/dashboard/GithubStats';
import LeetcodeStats from '../../components/dashboard/LeetcodeStats';

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your placement readiness overview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GithubStats />
        <LeetcodeStats />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/github"
            className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all text-center"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-gray-800 dark:text-white">GitHub Analysis</div>
          </a>
          <a
            href="/leetcode"
            className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-center"
          >
            <div className="text-2xl mb-2">💻</div>
            <div className="font-semibold text-gray-800 dark:text-white">LeetCode Progress</div>
          </a>
          <a
            href="/roadmap"
            className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all text-center"
          >
            <div className="text-2xl mb-2">🗺️</div>
            <div className="font-semibold text-gray-800 dark:text-white">CS Roadmap</div>
          </a>
          <a
            href="/chatbot"
            className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-all text-center"
          >
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-semibold text-gray-800 dark:text-white">AI Assistant</div>
          </a>
        </div>
      </div>
    </div>
  );
}

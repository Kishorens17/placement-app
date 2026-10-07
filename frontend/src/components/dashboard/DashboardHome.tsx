import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GithubStats from '../../components/dashboard/GithubStats';
import LeetcodeStats from '../../components/dashboard/LeetcodeStats';
import QuizHistoryCard from '../../components/dashboard/QuizHistoryCard';

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

      {/* Assessment History — persistent placement portal card */}
      <QuizHistoryCard />

      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link
            to="/resume"
            className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all text-center group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📄</div>
            <div className="font-semibold text-gray-800 dark:text-white">Resume Analyser</div>
          </Link>
          <Link
            to="/github"
            className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all text-center group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <div className="font-semibold text-gray-800 dark:text-white">GitHub Analysis</div>
          </Link>
          <Link
            to="/leetcode"
            className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all text-center group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💻</div>
            <div className="font-semibold text-gray-800 dark:text-white">LeetCode Progress</div>
          </Link>
          <Link
            to="/roadmap"
            className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all text-center group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗺️</div>
            <div className="font-semibold text-gray-800 dark:text-white">CS Roadmap</div>
          </Link>
          <Link
            to="/chatbot"
            className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-all text-center group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🤖</div>
            <div className="font-semibold text-gray-800 dark:text-white">AI Assistant</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

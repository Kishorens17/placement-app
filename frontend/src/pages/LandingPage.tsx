import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Public Sticky Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 dark:bg-gray-900/75 border-b border-gray-200/80 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  PlacementPulse
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  AI
                </span>
              </div>
            </Link>

            {/* Middle Nav Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Platform Features
              </a>
              <a href="#leetcode" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                LeetCode Intelligence
              </a>
              <a href="#roadmap" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                CS Roadmap
              </a>
              <a href="#how-it-works" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                How It Works
              </a>
            </nav>

            {/* Auth Actions & Theme Switcher */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-base"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Dashboard</span>
                  <span>→</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/25 hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-500/20 via-indigo-500/20 to-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide uppercase">
            <span>🚀</span> Engineered for College Placements & Tech Careers
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Master Campus Placements with{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Data-Driven Intelligence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
            Real-time LeetCode radar balance analytics, automated GitHub portfolio audits, a 15-subject structured CS roadmap, and 24/7 AI interview coaching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base rounded-2xl hover:from-purple-700 hover:to-indigo-700 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Launch Your Readiness Diagnostic</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-4 glass-card border border-gray-200 dark:border-gray-800 font-semibold text-base text-gray-800 dark:text-gray-200 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all text-center"
            >
              Sign In to Your Profile
            </Link>
          </div>

          {/* Interactive Feature Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-12 text-left">
            <div className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg hover:border-amber-400 dark:hover:border-amber-600 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center text-xl mb-3">
                📄
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                AI Resume & ATS Analyser
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Role-specific ATS score, missing keyword detection, readability score, and AI improvement recommendations.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg hover:border-purple-400 dark:hover:border-purple-600 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xl mb-3">
                🕸️
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                LeetCode Radar & Capacity
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Multi-axis spider graph evaluating domain equilibrium and recommending unsolved easy problems.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xl mb-3">
                🐙
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                GitHub Portfolio Audit
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Evaluates repository complexity, commit consistency, tests, and production resume signals.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xl mb-3">
                🗺️
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                15-Subject CS Roadmap
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Comprehensive tracking across OS, DBMS, Networks, and System Design with AI interview cheatsheets.
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xl mb-3">
                🤖
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                AI Placement Coach
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                24/7 conversational mentor trained on top tech company OA questions and hiring benchmarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: LeetCode & Radar */}
      <section id="leetcode" className="py-20 bg-white/40 dark:bg-gray-800/30 border-y border-gray-200/80 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Balanced Competitive Readiness
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                Stop Solving Only Arrays. Master Every Fundamental DSA Domain.
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Most students plateau because they solve 80 array problems and 0 trees or DP questions. PlacementPulse's SVG Radar Chart measures your DSA Equilibrium Index out of 100% and recommends 3 high-yield, very easy unsolved problems per domain.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold text-lg">✓</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Instant Live LeetCode Sync
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Synchronizes directly with official LeetCode GraphQL stats with smart 24-hour caching.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold text-lg">✓</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Zero Redundancy: Unsolved Only
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically excludes any problem you've previously solved, suggesting fresh starter problems.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold text-lg">✓</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Adaptive Weekly & Monthly Targets
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      AI tailors target problem velocity based on your graduation year and current skill distribution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold text-sm rounded-xl hover:bg-purple-700 shadow-md transition-all"
                >
                  <span>Connect Your LeetCode Handle</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>

            {/* Visual Callout Mockup */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700/60 shadow-2xl relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🕸️</span>
                  <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                      Equilibrium Radar Preview
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      8-Axis Domain Distribution
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs">
                  82% Balance Index
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Arrays & Hashing', count: '18/25 solved', pct: 72, icon: '📊' },
                  { name: 'Trees & BST', count: '14/20 solved', pct: 70, icon: '🌳' },
                  { name: 'Dynamic Programming', count: '12/20 solved', pct: 60, icon: '🧠' },
                  { name: 'Binary Search', count: '11/15 solved', pct: 73, icon: '🔍' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-gray-500 dark:text-gray-400">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-xs">
                <span className="font-bold text-purple-700 dark:text-purple-300">⚡ Unsolved Recommendation:</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  Try "Invert Binary Tree" & "Valid Anagram" to push your score over 85%.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: CS Roadmap & AI */}
      <section id="roadmap" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Complete Computer Science Mastery
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              15 Comprehensive Subject Tracks with AI Revision Sheets
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Never enter an interview unsure of OS concurrency, DBMS indexing, or TCP/IP packet handshakes. Track every concept and generate custom AI interview preparation cheat sheets.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { title: 'Operating Systems', icon: '💻', count: '10 Subtopics' },
              { title: 'Database Management', icon: '🗄️', count: '10 Subtopics' },
              { title: 'Computer Networks', icon: '🌐', count: '10 Subtopics' },
              { title: 'System Design', icon: '🏗️', count: '10 Subtopics' },
              { title: 'Object-Oriented Programming', icon: '🧩', count: '10 Subtopics' },
              { title: 'Data Structures', icon: '📦', count: '10 Subtopics' },
              { title: 'Algorithms', icon: '⚡', count: '10 Subtopics' },
              { title: 'Web Development', icon: '🌍', count: '10 Subtopics' },
              { title: 'Cloud Computing', icon: '☁️', count: '10 Subtopics' },
              { title: 'Git & Version Control', icon: '🌿', count: '10 Subtopics' },
            ].map((course, i) => (
              <div
                key={i}
                className="glass-card p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2">{course.icon}</div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-1">
                    {course.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                  {course.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-100/50 dark:bg-gray-800/20 border-t border-gray-200/80 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Simple 3-Step Setup
            </span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">
              How PlacementPulse Elevates Your Readiness
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white text-xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
                1
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Register & Verify Profiles
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                Sign up with your college roll number and link your GitHub and LeetCode usernames with live validation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white text-xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Receive Multi-Vector Audit
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                Get an automated diagnostic of your code quality, domain balance radar, and adaptive weekly targets.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
                3
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Prepare with AI Mentorship
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                Practice unsolved beginner problems, complete roadmap checklists, and ace mock interviews with our AI Coach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-10 sm:p-14 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-2xl text-center space-y-6 bg-gradient-to-br from-purple-600/10 via-indigo-600/10 to-blue-600/10">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Ready to Accelerate Your Placement Success?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Join students preparing with verified LeetCode analytics, GitHub code audits, and AI placement coaching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-xl shadow-purple-500/25 hover:scale-[1.02] transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3.5 glass-card border border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10 bg-white/40 dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-white">PlacementPulse AI</span>
            <span>•</span>
            <span>Empowering Computer Science Graduates</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

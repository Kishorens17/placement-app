import { useState, Fragment, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { extractGithubUsername, extractLeetcodeUsername } from '../../utils/sanitize';

type Step = 1 | 2 | 3;

export default function SignupForm() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [email, setEmail] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');

  // Validation states
  const [githubValid, setGithubValid] = useState<boolean | null>(null);
  const [leetcodeValid, setLeetcodeValid] = useState<boolean | null>(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateGithubUsername = async () => {
    const clean = extractGithubUsername(githubUsername);
    if (!clean) {
      setError('Please enter a valid GitHub username or profile URL');
      return;
    }
    setGithubUsername(clean);
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/auth/validate-github', {
        params: { username: clean },
      });
      const isValid = !!response.data?.valid;
      setGithubValid(isValid);
      if (response.data?.username) {
        setGithubUsername(response.data.username);
      }
      if (!isValid) {
        setError(response.data?.error || 'GitHub username not found');
      }
    } catch (err: any) {
      setGithubValid(false);
      setError(err.response?.data?.error || 'Failed to validate GitHub username');
    } finally {
      setLoading(false);
    }
  };

  const validateLeetcodeUsername = async () => {
    const clean = extractLeetcodeUsername(leetcodeUsername);
    if (!clean) {
      setError('Please enter a valid LeetCode username or profile URL');
      return;
    }
    setLeetcodeUsername(clean);
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/auth/validate-leetcode', {
        params: { username: clean },
      });
      const isValid = !!response.data?.valid;
      setLeetcodeValid(isValid);
      if (response.data?.username) {
        setLeetcodeUsername(response.data.username);
      }
      if (!isValid) {
        setError(response.data?.error || 'LeetCode username not found');
      }
    } catch (err: any) {
      setLeetcodeValid(false);
      setError(err.response?.data?.error || 'Failed to validate LeetCode username');
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (parseInt(startYear) >= parseInt(endYear)) {
      setError('End year must be after start year');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    if (githubValid) {
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!leetcodeValid) {
      setError('Please validate LeetCode username first');
      return;
    }

    setLoading(true);
    setError('');

    const cleanGithub = extractGithubUsername(githubUsername);
    const cleanLeetcode = extractLeetcodeUsername(leetcodeUsername);

    try {
      await signup({
        username,
        password,
        email: email.trim(),
        rollNo: rollNo || undefined,
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        githubUsername: cleanGithub,
        leetcodeUsername: cleanLeetcode,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl shadow-2xl">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <span>← Back to Home</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join placement readiness platform</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s === step
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />}
            </Fragment>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Re-enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roll Number (Optional)</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Your roll number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Year *</label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  required
                  min="2020"
                  max="2030"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="2023"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Year *</label>
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  required
                  min="2020"
                  max="2035"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="2027"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all"
            >
              Next Step
            </button>
          </form>
        )}

        {/* Step 2: GitHub Validation */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GitHub Username *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => {
                    setGithubUsername(e.target.value);
                    setGithubValid(null);
                    setError('');
                  }}
                  onBlur={() => {
                    if (githubUsername) {
                      setGithubUsername(extractGithubUsername(githubUsername));
                    }
                  }}
                  required
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="username or profile URL"
                />
                <button
                  type="button"
                  onClick={validateGithubUsername}
                  disabled={loading || !githubUsername}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '...' : 'Verify'}
                </button>
              </div>
              {githubValid === true && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">✓ Username verified</p>
              )}
              {githubValid === false && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">✗ Username not found</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!githubValid}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </form>
        )}

        {/* Step 3: LeetCode Validation */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LeetCode Username *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={(e) => {
                    setLeetcodeUsername(e.target.value);
                    setLeetcodeValid(null);
                    setError('');
                  }}
                  onBlur={() => {
                    if (leetcodeUsername) {
                      setLeetcodeUsername(extractLeetcodeUsername(leetcodeUsername));
                    }
                  }}
                  required
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="username or profile URL (e.g. KISHORE_NSK)"
                />
                <button
                  type="button"
                  onClick={validateLeetcodeUsername}
                  disabled={loading || !leetcodeUsername}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '...' : 'Verify'}
                </button>
              </div>
              {leetcodeValid === true && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">✓ Username verified</p>
              )}
              {leetcodeValid === false && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">✗ Username not found</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !leetcodeValid}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

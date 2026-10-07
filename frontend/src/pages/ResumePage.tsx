import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';

interface ATSResult {
  ats_score: number;
  keyword_match_percentage: number;
  found_keywords: string[];
  missing_keywords: string[];
  section_scores: {
    contact: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
  improvements: string[];
  format_issues: string[];
  readability_score: number;
  overall_feedback: string;
  job_role: string;
}

const DEFAULT_ROLES = [
  'Software Development Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Data Analyst',
  'Product Manager',
];

export default function ResumePage() {
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLES[0]);
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/resume/roles');
      if (res.data?.roles) {
        setRoles(res.data.roles);
      }
    } catch {
      // Fallback to default roles
    }
  };

  const processFile = async (file: File) => {
    setError('');
    setSuccessMsg('');

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        setParsingPdf(true);
        setUploadedFileName(file.name);

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const res = await api.post('/resume/parse-pdf', {
              pdf_base64: base64Data,
            });

            if (res.data?.text) {
              setResumeText(res.data.text);
              setSuccessMsg(`Extracted ${res.data.character_count} characters from "${file.name}". You can review and edit below.`);
            } else {
              setError('No text could be extracted from this PDF. Please ensure it is not an image-only scan.');
            }
          } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to parse PDF resume.');
          } finally {
            setParsingPdf(false);
          }
        };

        reader.onerror = () => {
          setError('Failed to read file from disk.');
          setParsingPdf(false);
        };

        reader.readAsDataURL(file);
      } catch (err: any) {
        setError(err.message || 'Error processing PDF.');
        setParsingPdf(false);
      }
    } else if (
      file.type === 'text/plain' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md')
    ) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setResumeText(text);
          setSuccessMsg(`Loaded text from "${file.name}".`);
        }
      };
      reader.readAsText(file);
    } else {
      setError('Unsupported file type. Please upload a PDF (.pdf) or text (.txt, .md) file.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleClear = () => {
    setResumeText('');
    setUploadedFileName('');
    setError('');
    setSuccessMsg('');
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setError('Please paste or upload your resume text (at least 50 characters required).');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      setResult(null);

      const res = await api.post('/resume/analyze', {
        resume_text: resumeText.trim(),
        job_role: selectedRole,
      });

      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
    if (score >= 60) return 'text-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-950/30';
    return 'text-rose-500 border-rose-500 bg-rose-50 dark:bg-rose-950/30';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 mb-3">
            <span>✨ AI-Powered ATS Checker & PDF Reader</span>
          </div>
          <h1 className="text-4xl font-black gradient-text tracking-tight mb-2">
            Resume & ATS Analyser
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-sm sm:text-base">
            Upload your resume PDF or paste text, select your target tech role, and receive an instant Applicant Tracking System (ATS) audit with keyword match breakdowns, score rating, and AI coach recommendations.
          </p>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 glass-card p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Target Job Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition-all shadow-sm"
                >
                  <span>📄 Upload PDF / Text</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {(resumeText || uploadedFileName) && (
                  <button
                    onClick={handleClear}
                    className="px-3 py-2.5 text-xs text-gray-400 hover:text-rose-500 font-semibold transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Drag & Drop PDF Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                  : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
              }`}
            >
              {parsingPdf ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-7 h-7 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    Extracting and reading text from PDF "{uploadedFileName}"...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-3xl">📄</div>
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Drop your <span className="text-purple-600 dark:text-purple-400">PDF resume</span> here, or click to browse
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supports .PDF, .TXT, and .MD files. Text is extracted automatically into the editor below.
                  </p>
                </>
              )}
            </div>

            {/* Notification Pills */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Resume Text Content Area */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Extracted Resume Content (or paste manually)
                </label>
                <span className="text-xs text-gray-400">
                  {resumeText.trim().length} characters
                </span>
              </div>
              <textarea
                rows={10}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or drop your resume text here (Summary, Skills, Work Experience, Education, Projects)..."
                className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-y shadow-inner leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={analyzing || parsingPdf || !resumeText.trim()}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing ATS Compatibility...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Run AI ATS Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ATS Score */}
              <div className="glass-card p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 text-center flex flex-col items-center justify-center">
                <div className="text-xs uppercase font-extrabold text-gray-500 dark:text-gray-400 tracking-wider mb-2">
                  Overall ATS Score
                </div>
                <div
                  className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center my-2 shadow-inner font-black text-3xl ${getScoreColor(
                    result.ats_score
                  )}`}
                >
                  <span>{result.ats_score}</span>
                  <span className="text-[10px] font-normal uppercase opacity-75">/ 100</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  {result.ats_score >= 80
                    ? '🎉 Excellent candidate match'
                    : result.ats_score >= 60
                    ? '👍 Moderate match, improvements suggested'
                    : '⚠️ High risk of ATS rejection'}
                </p>
              </div>

              {/* Keyword Match */}
              <div className="glass-card p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase font-extrabold text-gray-500 dark:text-gray-400 tracking-wider mb-1">
                    Role Keyword Match
                  </div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {result.keyword_match_percentage}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target Role: <span className="font-semibold text-purple-600 dark:text-purple-400">{result.job_role}</span>
                  </p>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden mt-4">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(
                      result.keyword_match_percentage
                    )}`}
                    style={{ width: `${result.keyword_match_percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Found: {result.found_keywords.length}</span>
                  <span>Missing: {result.missing_keywords.length}</span>
                </div>
              </div>

              {/* Readability & Quality */}
              <div className="glass-card p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase font-extrabold text-gray-500 dark:text-gray-400 tracking-wider mb-1">
                    Readability & Structure
                  </div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                    {result.readability_score} <span className="text-sm font-normal text-gray-400">/ 100</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Parser readability rating
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-xs text-purple-700 dark:text-purple-300">
                  <span className="font-bold">Coach Verdict: </span>
                  {result.overall_feedback}
                </div>
              </div>
            </div>

            {/* Section Breakdown Scores */}
            <div className="glass-card p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Detailed Section Scores
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Object.entries(result.section_scores || {}).map(([sec, val]) => (
                  <div
                    key={sec}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 text-center"
                  >
                    <div className="text-[11px] font-extrabold uppercase text-gray-500 dark:text-gray-400 mb-1">
                      {sec}
                    </div>
                    <div className="text-xl font-black text-gray-900 dark:text-white">
                      {val}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${getProgressColor(val)}`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Keywords */}
              <div className="glass-card p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Matched Keywords ({result.found_keywords.length})
                  </h3>
                </div>
                {result.found_keywords.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No target keywords matched yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {result.found_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Keywords */}
              <div className="glass-card p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Missing Key Terms ({result.missing_keywords.length})
                  </h3>
                </div>
                {result.missing_keywords.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-semibold">
                    Awesome! No crucial keywords are missing for this role.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Improvements and Format Alerts */}
            <div className="glass-card p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>💡 Actionable ATS Improvements</span>
              </h3>
              <div className="space-y-3">
                {result.improvements.map((imp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs sm:text-sm text-gray-800 dark:text-gray-200 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{imp}</span>
                  </div>
                ))}
              </div>

              {result.format_issues && result.format_issues.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <span>⚠️ Formatting Concerns</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {result.format_issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

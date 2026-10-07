import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { QuizQuestion, QuizAnswer } from '../../types/quiz';
import { quizApi } from '../../services/quiz.api';
import { useAuth } from '../../contexts/AuthContext';
import QuizTimer from './QuizTimer';
import QuizCanvasQuestion from './QuizCanvasQuestion';
import { Sun, Moon } from 'lucide-react';

interface Props {
  subject: string;
  setNumber: number;
  attemptId: string;
  questions: QuizQuestion[];
  onSubmit: (answers: QuizAnswer[], autoSubmitted?: boolean) => void;
}

// Shuffled option map for a question: maps displayKey → { originalKey, text }
export interface ShuffledOption {
  displayKey: string; // 'A' | 'B' | 'C' | 'D' as shown on screen
  originalKey: string; // the actual key from DB ('A' | 'B' | 'C' | 'D')
  text: string;
}

const FULLSCREEN_EXIT_LIMIT = 2;
const QUIZ_DURATION_SECONDS = 15 * 60;
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build per-question shuffled option order (stable per session)
function buildShuffledOptions(questions: QuizQuestion[]): Record<string, ShuffledOption[]> {
  const map: Record<string, ShuffledOption[]> = {};
  for (const q of questions) {
    const originals = [
      { originalKey: 'A', text: q.option_a },
      { originalKey: 'B', text: q.option_b },
      { originalKey: 'C', text: q.option_c },
      { originalKey: 'D', text: q.option_d },
    ];
    const shuffled = shuffleArray(originals);
    map[q.id] = shuffled.map((opt, idx) => ({
      displayKey: OPTION_KEYS[idx],
      originalKey: opt.originalKey,
      text: opt.text,
    }));
  }
  return map;
}

// Given a display key, return the original key for submission
function displayToOriginalKey(
  shuffledOptions: Record<string, ShuffledOption[]>,
  questionId: string,
  displayKey: string
): string {
  const opts = shuffledOptions[questionId];
  if (!opts) return displayKey;
  return opts.find(o => o.displayKey === displayKey)?.originalKey || displayKey;
}

export default function QuizPortal({ subject, setNumber, attemptId, questions, onSubmit }: Props) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers stored as displayKey → originalKey (we store original for submission)
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const submittedRef = useRef(false);

  // Build stable shuffled options once on mount
  const shuffledOptions = useMemo(() => buildShuffledOptions(questions), [questions]);

  // Theme CSS vars
  const T = useMemo(() => theme === 'dark' ? {
    bg: '#0f0f23',
    bar: 'rgba(255,255,255,0.04)',
    barBorder: 'rgba(255,255,255,0.08)',
    text: '#e5e7eb',
    subText: '#9ca3af',
    dotBg: 'rgba(255,255,255,0.08)',
    dotBorder: 'rgba(255,255,255,0.1)',
    dotText: '#9ca3af',
    dotAnswered: 'rgba(52,211,153,0.3)',
    dotAnsweredBorder: 'rgba(52,211,153,0.5)',
    dotAnsweredText: '#34d399',
    navBg: 'rgba(255,255,255,0.08)',
    navBorder: 'rgba(255,255,255,0.1)',
    navText: '#e5e7eb',
    navDisBg: 'rgba(255,255,255,0.05)',
    navDisText: '#4b5563',
    modalBg: '#1a1a2e',
    modalBorder: 'rgba(255,255,255,0.1)',
    overlayBg: 'rgba(0,0,0,0.8)',
    watermark: 'rgba(255,255,255,0.05)',
  } : {
    bg: '#f0f4ff',
    bar: 'rgba(0,0,0,0.04)',
    barBorder: 'rgba(0,0,0,0.08)',
    text: '#1e1b4b',
    subText: '#6b7280',
    dotBg: 'rgba(0,0,0,0.06)',
    dotBorder: 'rgba(0,0,0,0.12)',
    dotText: '#6b7280',
    dotAnswered: 'rgba(16,185,129,0.15)',
    dotAnsweredBorder: 'rgba(16,185,129,0.4)',
    dotAnsweredText: '#059669',
    navBg: 'rgba(0,0,0,0.06)',
    navBorder: 'rgba(0,0,0,0.1)',
    navText: '#1e1b4b',
    navDisBg: 'rgba(0,0,0,0.03)',
    navDisText: '#d1d5db',
    modalBg: '#ffffff',
    modalBorder: 'rgba(0,0,0,0.1)',
    overlayBg: 'rgba(0,0,0,0.6)',
    watermark: 'rgba(0,0,0,0.06)',
  }, [theme]);

  // ── Fullscreen on mount ──
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }, []);

  // ── Fullscreen exit detection ──
  useEffect(() => {
    const handle = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        const n = fullscreenExits + 1;
        setFullscreenExits(n);
        quizApi.logEvent(attemptId, 'fullscreen_exit', `Exit #${n}`, currentIndex + 1);
        if (n >= FULLSCREEN_EXIT_LIMIT) {
          doSubmit(true);
        } else {
          setWarningMessage(`⚠️ Warning ${n}/${FULLSCREEN_EXIT_LIMIT}: Exiting fullscreen again will auto-submit!`);
          setShowExitWarning(true);
        }
      }
    };
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, [fullscreenExits, currentIndex, attemptId]);

  // ── Visibility change ──
  useEffect(() => {
    const handle = () => {
      if (document.hidden && !submittedRef.current) {
        quizApi.logEvent(attemptId, 'focus_loss', 'Tab switched', currentIndex + 1);
        setWarningMessage('⚠️ Tab switch detected and logged.');
        setShowExitWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [currentIndex, attemptId]);

  // ── Block keyboard shortcuts ──
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const blocked = (e.ctrlKey && ['c','v','a','x','p','s','u'].includes(e.key.toLowerCase()))
        || e.key === 'F12'
        || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()))
        || e.key === 'PrintScreen';
      if (blocked) {
        e.preventDefault();
        quizApi.logEvent(attemptId, 'keyboard_shortcut', `Key: ${e.key}`, currentIndex + 1);
      }
    };
    window.addEventListener('keydown', handle, true);
    return () => window.removeEventListener('keydown', handle, true);
  }, [currentIndex, attemptId]);

  // ── Right-click & copy ──
  useEffect(() => {
    const noCtx = (e: MouseEvent) => { e.preventDefault(); quizApi.logEvent(attemptId, 'right_click', '', currentIndex + 1); };
    const noCopy = (e: ClipboardEvent) => { e.preventDefault(); quizApi.logEvent(attemptId, 'copy_attempt', e.type, currentIndex + 1); };
    window.addEventListener('contextmenu', noCtx);
    window.addEventListener('copy', noCopy);
    window.addEventListener('paste', noCopy);
    window.addEventListener('cut', noCopy);
    return () => {
      window.removeEventListener('contextmenu', noCtx);
      window.removeEventListener('copy', noCopy);
      window.removeEventListener('paste', noCopy);
      window.removeEventListener('cut', noCopy);
    };
  }, [currentIndex, attemptId]);

  const recordTimeSpent = useCallback(() => {
    const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
    const q = questions[currentIndex];
    if (q) setTimeSpent(prev => ({ ...prev, [q.id]: (prev[q.id] || 0) + elapsed }));
  }, [questionStartTime, currentIndex, questions]);

  const buildAnswers = useCallback((): QuizAnswer[] => {
    return questions.map((q, idx) => ({
      question_id: q.id,
      question_order: idx + 1,
      selected_ans: answers[q.id] || null,
      time_spent_sec: timeSpent[q.id] || 0,
    }));
  }, [questions, answers, timeSpent]);

  const doSubmit = useCallback(async (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);
    recordTimeSpent();
    if (auto) await quizApi.logEvent(attemptId, 'auto_submitted', 'Timer/fullscreen', 0);
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    onSubmit(buildAnswers(), auto);
  }, [buildAnswers, recordTimeSpent, onSubmit, attemptId]);

  const navigateTo = (idx: number) => {
    recordTimeSpent();
    setQuestionStartTime(Date.now());
    setCurrentIndex(idx);
  };

  const selectAnswer = (questionId: string, displayKey: string) => {
    const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
    if (elapsed < 3) quizApi.logEvent(attemptId, 'fast_answer', `${elapsed}s`, currentIndex + 1);
    // Store the ORIGINAL key (for correct scoring), not the display key
    const originalKey = displayToOriginalKey(shuffledOptions, questionId, displayKey);
    setAnswers(prev => ({ ...prev, [questionId]: originalKey }));
  };

  // For showing which display option is selected, reverse-map original→display
  const getSelectedDisplayKey = (questionId: string): string | null => {
    const originalKey = answers[questionId];
    if (!originalKey) return null;
    const opts = shuffledOptions[questionId];
    if (!opts) return originalKey;
    return opts.find(o => o.originalKey === originalKey)?.displayKey || null;
  };

  const reenterFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    setShowExitWarning(false);
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const watermarkText = user
    ? `${(user as any).username || user.id.slice(0,8)} | ${new Date().toLocaleDateString('en-IN')} | ${attemptId.slice(0, 8).toUpperCase()}`
    : '';

  if (isSubmitting) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: T.text }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.3)', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite', marginBottom: 20 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>Submitting your test…</h2>
        <p style={{ color: T.subText, margin: 0 }}>Scoring your answers</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: "'Inter', 'Segoe UI', sans-serif", userSelect: 'none', WebkitUserSelect: 'none', transition: 'background 0.3s' }}>

      {/* ── Top Bar ── */}
      <div style={{ background: T.bar, borderBottom: `1px solid ${T.barBorder}`, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, padding: '5px 12px', color: 'white', fontSize: 13, fontWeight: 700 }}>PlacementPulse</div>
          <span style={{ color: T.subText, fontSize: 13 }}>{subject} — Set {['A', 'B', 'C'][setNumber - 1] || setNumber}</span>
        </div>

        <QuizTimer durationSeconds={QUIZ_DURATION_SECONDS} onExpire={() => doSubmit(true)} theme={theme} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: T.subText, fontSize: 13 }}>{answeredCount}/{questions.length} answered</span>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ background: T.navBg, border: `1px solid ${T.navBorder}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: T.text, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, color: 'white', padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 760 }}>
            {/* Question counter + difficulty */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: T.subText, fontSize: 14 }}>Question {currentIndex + 1} of {questions.length}</span>
              {currentQ && (
                <span style={{
                  background: currentQ.difficulty === 'easy' ? 'rgba(52,211,153,0.15)' : currentQ.difficulty === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(248,113,113,0.15)',
                  color: currentQ.difficulty === 'easy' ? '#34d399' : currentQ.difficulty === 'medium' ? '#f59e0b' : '#f87171',
                  border: `1px solid ${currentQ.difficulty === 'easy' ? 'rgba(52,211,153,0.3)' : currentQ.difficulty === 'medium' ? 'rgba(245,158,11,0.3)' : 'rgba(248,113,113,0.3)'}`,
                  borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {currentQ.difficulty}
                </span>
              )}
            </div>

            {currentQ && (
              <QuizCanvasQuestion
                question={currentQ}
                shuffledOptions={shuffledOptions[currentQ.id] || []}
                selectedDisplayKey={getSelectedDisplayKey(currentQ.id)}
                onSelect={(displayKey) => selectAnswer(currentQ.id, displayKey)}
                watermarkText={watermarkText}
                theme={theme}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => navigateTo(Math.max(currentIndex - 1, 0))}
            disabled={currentIndex === 0}
            style={{ padding: '9px 24px', background: currentIndex === 0 ? T.navDisBg : T.navBg, border: `1px solid ${T.navBorder}`, borderRadius: 8, color: currentIndex === 0 ? T.navDisText : T.navText, fontSize: 14, fontWeight: 600, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
          >
            ← Prev
          </button>

          {/* Question dots */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 420 }}>
            {questions.map((q, i) => {
              const isActive = i === currentIndex;
              const isAnswered = !!answers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => navigateTo(i)}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: isActive ? '#6366f1' : isAnswered ? T.dotAnswered : T.dotBg,
                    border: `1px solid ${isActive ? '#6366f1' : isAnswered ? T.dotAnsweredBorder : T.dotBorder}`,
                    color: isActive ? 'white' : isAnswered ? T.dotAnsweredText : T.dotText,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigateTo(Math.min(currentIndex + 1, questions.length - 1))}
            disabled={currentIndex === questions.length - 1}
            style={{ padding: '9px 24px', background: currentIndex === questions.length - 1 ? T.navDisBg : T.navBg, border: `1px solid ${T.navBorder}`, borderRadius: 8, color: currentIndex === questions.length - 1 ? T.navDisText : T.navText, fontSize: 14, fontWeight: 600, cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Watermark */}
      <div style={{ position: 'fixed', bottom: 8, right: 12, color: T.watermark, fontSize: 11, fontFamily: 'monospace', pointerEvents: 'none', userSelect: 'none', zIndex: 9999 }}>
        {watermarkText}
      </div>

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div style={{ position: 'fixed', inset: 0, background: T.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: T.modalBg, border: `1px solid rgba(251,191,36,0.4)`, borderRadius: 16, padding: 32, maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: '#fbbf24', fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>Integrity Violation</h2>
            <p style={{ color: T.text, fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>{warningMessage}</p>
            <button onClick={reenterFullscreen} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirm Modal */}
      {showSubmitConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: T.overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: T.modalBg, border: `1px solid ${T.modalBorder}`, borderRadius: 16, padding: 32, maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>Submit Test?</h2>
            <p style={{ color: T.subText, fontSize: 14, margin: '0 0 8px' }}>
              Answered <strong style={{ color: '#6366f1' }}>{answeredCount}</strong> of <strong>{questions.length}</strong>
            </p>
            {answeredCount < questions.length && (
              <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 20px' }}>
                {questions.length - answeredCount} unanswered will be marked wrong.
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ padding: '12px 24px', background: T.navBg, border: `1px solid ${T.navBorder}`, borderRadius: 8, color: T.text, cursor: 'pointer', fontSize: 14 }}>Keep Answering</button>
              <button onClick={() => { setShowSubmitConfirm(false); doSubmit(false); }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Submit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

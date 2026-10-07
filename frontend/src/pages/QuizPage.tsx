import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../services/quiz.api';
import type { QuizQuestion, QuizAnswer } from '../types/quiz';
import QuizPreflightModal from '../components/quiz/QuizPreflightModal';
import QuizPortal from '../components/quiz/QuizPortal';
import QuizResult from '../components/quiz/QuizResult';

type Phase = 'preflight' | 'portal' | 'result';

export default function QuizPage() {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('preflight');
  const [selectedSet, setSelectedSet] = useState(1);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const startedAt = useRef<Date | null>(null);

  const decodedSubject = subject ? decodeURIComponent(subject) : '';

  // Prevent back button during portal phase
  useEffect(() => {
    if (phase === 'portal') {
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [phase]);

  const handleStart = useCallback(async (email: string, setNum: number) => {
    setLoading(true);
    setError('');
    try {
      const [attempt, qs] = await Promise.all([
        quizApi.startAttempt(decodedSubject, setNum, email),
        quizApi.getQuestions(decodedSubject, setNum),
      ]);
      setAttemptId(attempt.id);
      setQuestions(qs);
      setSelectedSet(setNum);
      startedAt.current = new Date();
      setPhase('portal');
    } catch (err: any) {
      if (err?.type === 'cooldown') {
        const until = new Date(err.cooldown_until);
        setError(`Cooldown active. You can retake this set after ${until.toLocaleString()}`);
      } else {
        setError(err.message || 'Failed to start quiz. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [decodedSubject]);

  const handleSubmit = useCallback(async (answers: QuizAnswer[], autoSubmitted = false) => {
    try {
      if (autoSubmitted) {
        await quizApi.logEvent(attemptId, 'auto_submitted', 'Timer expired', 0);
      }

      const res = await quizApi.submitAttempt(attemptId, answers, autoSubmitted);
      setResult(res);
      setPhase('result');
    } catch (err: any) {
      console.error('Submit failed:', err);
    }
  }, [attemptId]);

  if (phase === 'preflight') {
    return (
      <QuizPreflightModal
        subject={decodedSubject}
        loading={loading}
        error={error}
        onStart={handleStart}
        onBack={() => navigate('/roadmap')}
      />
    );
  }

  if (phase === 'portal') {
    return (
      <QuizPortal
        subject={decodedSubject}
        setNumber={selectedSet}
        attemptId={attemptId}
        questions={questions}
        onSubmit={handleSubmit}
      />
    );
  }

  if (phase === 'result' && result) {
    return (
      <QuizResult
        subject={decodedSubject}
        setNumber={selectedSet}
        result={result}
        attemptId={attemptId}
        onRetake={() => {
          setPhase('preflight');
          setResult(null);
          setError('');
        }}
        onBack={() => navigate('/roadmap')}
      />
    );
  }

  return null;
}

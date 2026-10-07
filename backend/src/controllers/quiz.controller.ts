import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  getQuizQuestions,
  startQuizAttempt,
  logMalpracticeEvent,
  submitQuizAttempt,
  getAttemptResult,
  getQuizHistory,
} from '../services/quiz.service.js';

// GET /api/quiz/:subject/questions?set=1
export async function getQuestionsController(req: AuthRequest, res: Response) {
  try {
    const { subject } = req.params;
    const setNumber = parseInt(req.query.set as string) || 1;

    if (!subject) return res.status(400).json({ error: 'Subject is required' });
    if (![1, 2, 3].includes(setNumber)) return res.status(400).json({ error: 'Set must be 1, 2, or 3' });

    const questions = await getQuizQuestions(decodeURIComponent(subject), setNumber);
    res.json({ questions });
  } catch (error: any) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch questions' });
  }
}

// POST /api/quiz/attempt/start
export async function startAttemptController(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { subject, set_number, email } = req.body;
    if (!subject || !set_number || !email) {
      return res.status(400).json({ error: 'subject, set_number, and email are required' });
    }

    const attempt = await startQuizAttempt(userId, subject, set_number, email);
    res.json({ attempt });
  } catch (error: any) {
    console.error('Start attempt error:', error);
    if (error.message?.startsWith('COOLDOWN:')) {
      const cooldownEnd = error.message.replace('COOLDOWN:', '');
      return res.status(429).json({ error: 'cooldown', cooldown_until: cooldownEnd });
    }
    res.status(500).json({ error: error.message || 'Failed to start attempt' });
  }
}

// POST /api/quiz/attempt/:id/log-event
export async function logEventController(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id: attemptId } = req.params;
    const { event_type, event_detail, question_number } = req.body;

    await logMalpracticeEvent(attemptId, userId, event_type, event_detail || '', question_number || 0);
    res.json({ logged: true });
  } catch (error: any) {
    console.error('Log event error:', error);
    res.status(500).json({ error: 'Failed to log event' });
  }
}

// POST /api/quiz/attempt/:id/submit
export async function submitAttemptController(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id: attemptId } = req.params;
    const { answers, auto_submitted } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array is required' });
    }

    const result = await submitQuizAttempt(attemptId, userId, answers, auto_submitted || false);
    res.json(result);
  } catch (error: any) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit attempt' });
  }
}

// GET /api/quiz/attempt/:id/result
export async function getResultController(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id: attemptId } = req.params;
    const result = await getAttemptResult(attemptId, userId);
    res.json(result);
  } catch (error: any) {
    console.error('Get result error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch result' });
  }
}

// GET /api/quiz/history/:subject
// GET /api/quiz/history/all
export async function getHistoryController(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { subject } = req.params;
    const history = await getQuizHistory(userId, subject === 'all' ? undefined : decodeURIComponent(subject));
    res.json({ history });
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch history' });
  }
}

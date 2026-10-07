import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getQuestionsController,
  startAttemptController,
  logEventController,
  submitAttemptController,
  getResultController,
  getHistoryController,
} from '../controllers/quiz.controller.js';

const router = express.Router();

// Get shuffled questions for a subject/set
router.get('/:subject/questions', authMiddleware, getQuestionsController);

// Start a new attempt
router.post('/attempt/start', authMiddleware, startAttemptController);

// Log a malpractice event (called frequently, lightweight)
router.post('/attempt/:id/log-event', authMiddleware, logEventController);

// Submit attempt and get results
router.post('/attempt/:id/submit', authMiddleware, submitAttemptController);

// Get result for a specific attempt
router.get('/attempt/:id/result', authMiddleware, getResultController);

// Get quiz history (subject-specific or all)
router.get('/history/:subject', authMiddleware, getHistoryController);

export default router;

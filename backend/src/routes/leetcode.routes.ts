import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getLeetcodeStatsController,
  getWeeklyTargets,
  getMonthlyTargets,
} from '../controllers/leetcode.controller.js';

const router = express.Router();

router.get('/stats', authMiddleware, getLeetcodeStatsController);
router.get('/weekly-targets', authMiddleware, getWeeklyTargets);
router.get('/monthly-targets', authMiddleware, getMonthlyTargets);

export default router;

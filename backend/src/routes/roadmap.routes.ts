import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getRoadmapController,
  updateProgressController,
  getAIGuideController,
} from '../controllers/roadmap.controller.js';

const router = express.Router();

router.get('/', authMiddleware, getRoadmapController);
router.put('/progress', authMiddleware, updateProgressController);
router.post('/ai-guide', authMiddleware, getAIGuideController);

export default router;

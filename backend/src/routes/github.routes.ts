import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  getGithubStats,
  analyzeRepositories,
  getRepoAnalysis,
  getAllAnalyses,
} from '../controllers/github.controller.js';

const router = express.Router();

router.get('/stats', authMiddleware, getGithubStats);
router.post('/analyze', authMiddleware, analyzeRepositories);
router.get('/analysis/:repoName', authMiddleware, getRepoAnalysis);
router.get('/analyses', authMiddleware, getAllAnalyses);

export default router;

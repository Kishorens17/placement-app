import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getJobRolesController, analyzeResumeController, parsePdfController } from '../controllers/resume.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/roles', getJobRolesController);
router.post('/analyze', analyzeResumeController);
router.post('/parse-pdf', parsePdfController);

export default router;

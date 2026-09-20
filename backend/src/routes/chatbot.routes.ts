import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { chat, getChatHistory } from '../controllers/chatbot.controller.js';

const router = express.Router();

router.post('/chat', authMiddleware, chat);
router.get('/history', authMiddleware, getChatHistory);

export default router;

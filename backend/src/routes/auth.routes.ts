import express from 'express';
import { signup, login, validateLeetcode, validateGithub } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/validate-leetcode', validateLeetcode);
router.post('/validate-leetcode', validateLeetcode);
router.get('/validate-github', validateGithub);
router.post('/validate-github', validateGithub);

export default router;


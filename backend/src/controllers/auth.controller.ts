import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../services/supabase.service.js';
import { validateGithubUsername } from '../services/github.service.js';
import { validateLeetcodeUsername } from '../services/leetcode.service.js';
import { sanitizeGithubUsername, sanitizeLeetcodeUsername } from '../utils/sanitize.js';
import { config } from '../config/env.js';
import { JWTPayload } from '../types/index.js';

export async function validateLeetcode(req: Request, res: Response) {
  try {
    const rawUsername = (req.query.username as string) || (req.body?.username as string) || '';
    const cleanUsername = sanitizeLeetcodeUsername(rawUsername);
    if (!cleanUsername) {
      return res.status(400).json({ valid: false, error: 'LeetCode username is required' });
    }

    const isValid = await validateLeetcodeUsername(cleanUsername);
    return res.json({
      valid: isValid,
      username: cleanUsername,
      error: isValid ? undefined : 'LeetCode username not found',
    });
  } catch (error) {
    return res.status(500).json({ valid: false, error: 'Failed to validate LeetCode username' });
  }
}

export async function validateGithub(req: Request, res: Response) {
  try {
    const rawUsername = (req.query.username as string) || (req.body?.username as string) || '';
    const cleanUsername = sanitizeGithubUsername(rawUsername);
    if (!cleanUsername) {
      return res.status(400).json({ valid: false, error: 'GitHub username is required' });
    }

    const isValid = await validateGithubUsername(cleanUsername);
    return res.json({
      valid: isValid,
      username: cleanUsername,
      error: isValid ? undefined : 'GitHub username not found',
    });
  } catch (error) {
    return res.status(500).json({ valid: false, error: 'Failed to validate GitHub username' });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const { username, password, rollNo, startYear, endYear, githubUsername, leetcodeUsername, email } = req.body;

    // Validate required fields
    if (!username || !password || !startYear || !endYear || !githubUsername || !leetcodeUsername) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const cleanGithub = sanitizeGithubUsername(githubUsername);
    const cleanLeetcode = sanitizeLeetcodeUsername(leetcodeUsername);

    // Validate GitHub username
    const isGithubValid = await validateGithubUsername(cleanGithub);
    if (!isGithubValid) {
      return res.status(400).json({ error: 'Invalid GitHub username' });
    }

    // Validate LeetCode username
    const isLeetcodeValid = await validateLeetcodeUsername(cleanLeetcode);
    if (!isLeetcodeValid) {
      return res.status(400).json({ error: 'Invalid LeetCode username' });
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user payload
    const insertPayload: any = {
      username,
      password_hash: passwordHash,
      roll_no: rollNo,
      start_year: startYear,
      end_year: endYear,
      github_username: cleanGithub,
      leetcode_username: cleanLeetcode,
    };

    if (email) insertPayload.email = email.trim();

    let { data: newUser, error } = await supabase
      .from('users')
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if email column is not yet migrated in Supabase users table
    if (error && (error.message?.includes('email') || (error as any).code === '42703')) {
      console.warn('Column email not yet added in Supabase users table. Falling back to core fields.');
      delete insertPayload.email;
      const retry = await supabase.from('users').insert(insertPayload).select().single();
      newUser = retry.data;
      error = retry.error;
    }

    if (error || !newUser) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: newUser.id,
      username: newUser.username,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email || email?.trim() || undefined,
        rollNo: newUser.roll_no,
        startYear: newUser.start_year,
        endYear: newUser.end_year,
        githubUsername: newUser.github_username,
        leetcodeUsername: newUser.leetcode_username,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rollNo: user.roll_no,
        startYear: user.start_year,
        endYear: user.end_year,
        githubUsername: user.github_username,
        leetcodeUsername: user.leetcode_username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

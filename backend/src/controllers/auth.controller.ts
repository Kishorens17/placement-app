import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../services/supabase.service.js';
import { validateGithubUsername } from '../services/github.service.js';
import { validateLeetcodeUsername } from '../services/leetcode.service.js';
import { config } from '../config/env.js';
import { JWTPayload } from '../types/index.js';

export async function signup(req: Request, res: Response) {
  try {
    const { username, password, rollNo, startYear, endYear, githubUsername, leetcodeUsername } = req.body;

    // Validate required fields
    if (!username || !password || !startYear || !endYear || !githubUsername || !leetcodeUsername) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate GitHub username
    const isGithubValid = await validateGithubUsername(githubUsername);
    if (!isGithubValid) {
      return res.status(400).json({ error: 'Invalid GitHub username' });
    }

    // Validate LeetCode username
    const isLeetcodeValid = await validateLeetcodeUsername(leetcodeUsername);
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

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        roll_no: rollNo,
        start_year: startYear,
        end_year: endYear,
        github_username: githubUsername,
        leetcode_username: leetcodeUsername,
      })
      .select()
      .single();

    if (error) {
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

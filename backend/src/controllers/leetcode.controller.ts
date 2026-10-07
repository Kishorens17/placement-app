import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import supabase from '../services/supabase.service.js';
import { getLeetcodeStats } from '../services/leetcode.service.js';
import { calculateTargets } from '../services/ai/targetSetting.ai.js';
import { DSA_CONCEPTS } from '../utils/constants.js';

export async function getLeetcodeStatsController(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const { data: user } = await supabase
      .from('users')
      .select('leetcode_username, start_year, end_year')
      .eq('id', userId)
      .single();

    if (!user || !user.leetcode_username) {
      return res.status(404).json({ error: 'LeetCode username not linked to this account' });
    }

    // Check cache
    const { data: cache } = await supabase
      .from('leetcode_cache')
      .select('*')
      .eq('user_id', userId)
      .single();

    const now = new Date();
    const forceRefresh = req.query.refresh === 'true';
    const cacheAge = cache ? (now.getTime() - new Date(cache.fetched_at).getTime()) / (1000 * 60 * 60) : 25;

    if (!forceRefresh && cache && cacheAge < 24) {
      return res.json({
        totalSolved: cache.total_solved,
        easySolved: cache.easy_solved,
        mediumSolved: cache.medium_solved,
        hardSolved: cache.hard_solved,
        lastSubmissionDate: cache.last_submission_date,
        conceptStats: cache.concept_stats,
        solvedProblems: cache.solved_problems,
        cached: true,
      });
    }

    // Fetch fresh data
    const stats = await getLeetcodeStats(user.leetcode_username);

    // Initialize concept stats
    const conceptStats: Record<string, { solved: number; total: number }> = {};
    DSA_CONCEPTS.forEach(concept => {
      conceptStats[concept] = { solved: 0, total: 10 }; // Assume 10 problems per concept
    });

    // Update cache
    await supabase
      .from('leetcode_cache')
      .upsert({
        user_id: userId,
        total_solved: stats.totalSolved,
        easy_solved: stats.easySolved,
        medium_solved: stats.mediumSolved,
        hard_solved: stats.hardSolved,
        last_submission_date: stats.lastSubmissionDate,
        concept_stats: conceptStats,
        solved_problems: stats.solvedProblems,
        fetched_at: now.toISOString(),
      });

    res.json({
      ...stats,
      conceptStats,
      cached: false,
    });
  } catch (error: any) {
    console.error('Get LeetCode stats error:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch LeetCode stats' });
  }
}

export async function getWeeklyTargets(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('start_year, end_year')
      .eq('id', userId)
      .single();

    const { data: leetcodeCache } = await supabase
      .from('leetcode_cache')
      .select('total_solved, concept_stats')
      .eq('user_id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalSolved = leetcodeCache?.total_solved ?? 0;
    const conceptStats = leetcodeCache?.concept_stats ?? {};

    // Calculate current week start
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Check for existing target this week
    const { data: existingTarget } = await supabase
      .from('weekly_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart.toISOString().split('T')[0])
      .single();

    if (existingTarget) {
      return res.json(existingTarget);
    }

    // Calculate new targets
    const targets = await calculateTargets(
      user.start_year,
      user.end_year,
      totalSolved,
      conceptStats
    );

    // Save weekly target
    const { data: newTarget } = await supabase
      .from('weekly_targets')
      .insert({
        user_id: userId,
        week_start: weekStart.toISOString().split('T')[0],
        total_target: targets.weekly_target,
        concept_recommendations: { focus: targets.focus_concepts },
        ai_reasoning: targets.reasoning,
      })
      .select()
      .single();

    res.json(newTarget);
  } catch (error) {
    console.error('Get weekly targets error:', error);
    res.status(500).json({ error: 'Failed to calculate targets' });
  }
}

export async function getMonthlyTargets(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const { data: user } = await supabase
      .from('users')
      .select('start_year, end_year')
      .eq('id', userId)
      .single();

    const { data: leetcodeCache } = await supabase
      .from('leetcode_cache')
      .select('total_solved, concept_stats')
      .eq('user_id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalSolved = leetcodeCache?.total_solved ?? 0;
    const conceptStats = leetcodeCache?.concept_stats ?? {};

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: existingTarget } = await supabase
      .from('monthly_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('month_start', monthStart.toISOString().split('T')[0])
      .single();

    if (existingTarget) {
      return res.json(existingTarget);
    }

    const targets = await calculateTargets(
      user.start_year,
      user.end_year,
      totalSolved,
      conceptStats
    );

    const { data: newTarget } = await supabase
      .from('monthly_targets')
      .insert({
        user_id: userId,
        month_start: monthStart.toISOString().split('T')[0],
        total_target: targets.monthly_target,
        ai_reasoning: targets.reasoning,
      })
      .select()
      .single();

    res.json(newTarget);
  } catch (error) {
    console.error('Get monthly targets error:', error);
    res.status(500).json({ error: 'Failed to calculate targets' });
  }
}

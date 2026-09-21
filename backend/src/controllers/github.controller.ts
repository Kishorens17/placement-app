import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import supabase from '../services/supabase.service.js';
import { getGithubRepos, getRepoFiles, getFileContent } from '../services/github.service.js';
import { analyzeRepository } from '../services/ai/repoAnalysis.ai.js';

export async function getGithubStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    // Get user's GitHub username
    const { data: user } = await supabase
      .from('users')
      .select('github_username')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check cache
    const { data: cache } = await supabase
      .from('github_cache')
      .select('*')
      .eq('user_id', userId)
      .single();

    const now = new Date();
    const cacheAge = cache ? (now.getTime() - new Date(cache.fetched_at).getTime()) / (1000 * 60 * 60) : 25;

    if (cache && cacheAge < 24) {
      return res.json({
        totalRepos: cache.total_repos,
        lastPushDate: cache.last_push_date,
        repos: cache.repos_data,
        cached: true,
      });
    }

    // Fetch fresh data
    const githubData = await getGithubRepos(user.github_username);

    // Update cache
    await supabase
      .from('github_cache')
      .upsert({
        user_id: userId,
        total_repos: githubData.totalRepos,
        last_push_date: githubData.lastPushDate,
        repos_data: githubData.repos,
        fetched_at: now.toISOString(),
      });

    res.json({
      totalRepos: githubData.totalRepos,
      lastPushDate: githubData.lastPushDate,
      repos: githubData.repos,
      cached: false,
    });
  } catch (error) {
    console.error('Get GitHub stats error:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub stats' });
  }
}

export async function analyzeRepositories(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('github_username')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get repos from cache
    const { data: cache } = await supabase
      .from('github_cache')
      .select('repos_data')
      .eq('user_id', userId)
      .single();

    if (!cache || !cache.repos_data) {
      return res.status(400).json({ error: 'Please fetch GitHub stats first' });
    }

    const repos = cache.repos_data as any[];
    const analyses = [];

    // Analyze each repository (limit to first 10 for performance)
    for (const repo of repos.slice(0, 10)) {
      try {
        // Get repo files
        const files = await getRepoFiles(user.github_username, repo.name);
        if (!files || files.length === 0) {
          console.log(`Skipping empty or inaccessible repository: ${repo.name}`);
          continue;
        }

        // Get README content
        const readmeFile = files.find((f: any) =>
          f.path.toLowerCase().match(/^readme\.(md|txt)$/i)
        );
        const readmeContent = readmeFile
          ? await getFileContent(user.github_username, repo.name, readmeFile.path)
          : null;

        // Get package.json or similar
        const configFile = files.find((f: any) =>
          f.path.match(/^(package\.json|requirements\.txt|pom\.xml|Cargo\.toml)$/i)
        );
        const configContent = configFile
          ? await getFileContent(user.github_username, repo.name, configFile.path)
          : null;

        // Analyze repository
        const analysis = await analyzeRepository(repo.name, files, readmeContent, configContent);

        // Save analysis
        await supabase
          .from('repo_analysis')
          .upsert({
            user_id: userId,
            repo_name: repo.name,
            repo_url: repo.url,
            score: analysis.score,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            detailed_analysis: analysis.detailed_analysis,
            analyzed_at: new Date().toISOString(),
          });

        analyses.push({
          repoName: repo.name,
          repoUrl: repo.url,
          ...analysis,
        });
      } catch (error) {
        console.error(`Error analyzing ${repo.name}:`, error);
        // Continue with other repos
      }
    }

    res.json({ analyses });
  } catch (error) {
    console.error('Analyze repositories error:', error);
    res.status(500).json({ error: 'Failed to analyze repositories' });
  }
}

export async function getRepoAnalysis(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { repoName } = req.params;

    const { data: analysis, error } = await supabase
      .from('repo_analysis')
      .select('*')
      .eq('user_id', userId)
      .eq('repo_name', repoName)
      .single();

    if (error || !analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get repo analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
}

export async function getAllAnalyses(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const { data: analyses, error } = await supabase
      .from('repo_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('analyzed_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ analyses: analyses || [] });
  } catch (error) {
    console.error('Get all analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
}

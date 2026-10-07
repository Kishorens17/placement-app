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

    if (!user || !user.github_username) {
      return res.status(404).json({ error: 'GitHub username not linked to this account' });
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
  } catch (error: any) {
    console.error('Get GitHub stats error:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch GitHub stats' });
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

    // Analyze all repositories in the user's account
    for (const repo of repos) {
      try {
        // Get repo files
        const files = await getRepoFiles(user.github_username, repo.name);
        const isEmpty = !files || files.length === 0;

        let readmeContent: string | null = null;
        let configContent: string | null = null;

        if (!isEmpty) {
          // Get README content
          const readmeFile = files.find((f: any) =>
            f.path.toLowerCase().match(/^readme\.(md|txt|markdown)$/i)
          );
          readmeContent = readmeFile
            ? await getFileContent(user.github_username, repo.name, readmeFile.path)
            : null;

          // Get package.json or similar
          const configFile = files.find((f: any) =>
            f.path.match(/^(package\.json|requirements\.txt|pom\.xml|cargo\.toml|go\.mod)$/i)
          );
          configContent = configFile
            ? await getFileContent(user.github_username, repo.name, configFile.path)
            : null;
        }

        const hasReadmeText = !!(readmeContent && readmeContent.trim().length > 0);
        const hasCodeFiles = !isEmpty && files.some((f: any) =>
          f.type === 'blob' && !f.path.toLowerCase().match(/^(\.git|license|notice|readme)/i)
        );

        let analysis: any;

        // If repository is empty or has no code and no README contents: score 0, comment "No contents"
        if (isEmpty || (!hasReadmeText && !hasCodeFiles)) {
          analysis = {
            score: 0,
            strengths: [],
            weaknesses: ['No contents found in repository'],
            detailed_analysis: 'Repository is empty and contains no project code or README documentation.',
          };
        } else {
          // Analyze repository with AI
          analysis = await analyzeRepository(repo.name, files, readmeContent, configContent);
        }

        // Save analysis to Supabase
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
          repo_name: repo.name,
          repoName: repo.name,
          repo_url: repo.url,
          repoUrl: repo.url,
          ...analysis,
        });
      } catch (error) {
        console.error(`Error analyzing ${repo.name}:`, error);
        const fallbackAnalysis = {
          repo_name: repo.name,
          repoName: repo.name,
          repo_url: repo.url,
          repoUrl: repo.url,
          score: 0,
          strengths: [],
          weaknesses: ['No contents accessible or empty repository'],
          detailed_analysis: 'Unable to retrieve repository contents or repository is private/empty.',
        };
        analyses.push(fallbackAnalysis);
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

import axios from 'axios';
import { config } from '../config/env.js';
import { sanitizeGithubUsername } from '../utils/sanitize.js';

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    ...(config.github.token && { Authorization: `Bearer ${config.github.token}` }),
  },
});

export async function validateGithubUsername(username: string): Promise<boolean> {
  try {
    const cleanUsername = sanitizeGithubUsername(username);
    if (!cleanUsername) return false;
    const response = await githubApi.get(`/users/${cleanUsername}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

export async function getGithubRepos(username: string) {
  try {
    const cleanUsername = sanitizeGithubUsername(username);
    const response = await githubApi.get(`/users/${cleanUsername}/repos`, {
      params: {
        sort: 'updated',
        per_page: 100,
      },
    });

    const repos = response.data.map((repo: any) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updated_at: repo.updated_at,
    }));

    const totalRepos = repos.length;
    const lastPushDate = repos[0]?.updated_at || null;

    return {
      totalRepos,
      lastPushDate,
      repos,
    };
  } catch (error) {
    throw new Error('Failed to fetch GitHub repositories');
  }
}

export async function getRepoFiles(username: string, repoName: string) {
  const cleanUsername = sanitizeGithubUsername(username);
  try {
    const response = await githubApi.get(`/repos/${cleanUsername}/${repoName}/git/trees/main?recursive=1`);
    return response.data.tree || [];
  } catch (error) {
    // Try master branch if main doesn't exist
    try {
      const response = await githubApi.get(`/repos/${cleanUsername}/${repoName}/git/trees/master?recursive=1`);
      return response.data.tree || [];
    } catch (err) {
      try {
        const repoInfo = await githubApi.get(`/repos/${cleanUsername}/${repoName}`);
        const defaultBranch = repoInfo.data?.default_branch;
        if (defaultBranch && defaultBranch !== 'main' && defaultBranch !== 'master') {
          const response = await githubApi.get(`/repos/${cleanUsername}/${repoName}/git/trees/${defaultBranch}?recursive=1`);
          return response.data.tree || [];
        }
      } catch (innerErr) {
        // Repo is empty or branch not found
      }
      return [];
    }
  }
}

export async function getFileContent(username: string, repoName: string, path: string) {
  try {
    const response = await githubApi.get(`/repos/${username}/${repoName}/contents/${path}`);
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    return null;
  }
}

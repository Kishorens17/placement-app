import axios from 'axios';
import { sanitizeLeetcodeUsername } from '../utils/sanitize.js';

const leetcodeApi = axios.create({
  baseURL: 'https://leetcode.com',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://leetcode.com',
  },
});

export async function validateLeetcodeUsername(username: string): Promise<boolean> {
  try {
    const cleanUsername = sanitizeLeetcodeUsername(username);
    if (!cleanUsername) return false;

    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
        }
      }
    `;

    const response = await leetcodeApi.post('/graphql', {
      query,
      variables: { username: cleanUsername },
    });

    return !!response.data?.data?.matchedUser;
  } catch (error) {
    return false;
  }
}

export async function getLeetcodeStats(username: string) {
  try {
    const cleanUsername = sanitizeLeetcodeUsername(username);
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        recentAcSubmissionList(username: $username, limit: 100) {
          title
          titleSlug
          timestamp
        }
      }
    `;

    const response = await leetcodeApi.post('/graphql', {
      query,
      variables: { username: cleanUsername },
    });

    const data = response.data?.data;
    if (!data?.matchedUser) {
      throw new Error('User not found');
    }

    const submissions = data.matchedUser.submitStats?.acSubmissionNum || [];
    const allProblems = submissions.find((s: any) => s.difficulty === 'All')?.count || 0;
    const easy = submissions.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const medium = submissions.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = submissions.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    const recentList = data.recentAcSubmissionList || [];
    const lastSubmission = recentList[0]?.timestamp;
    const solvedProblems = recentList.map((p: any) => p.titleSlug).filter(Boolean);

    return {
      totalSolved: allProblems,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      lastSubmissionDate: lastSubmission ? new Date(parseInt(lastSubmission) * 1000).toISOString() : null,
      solvedProblems: [...new Set(solvedProblems)], // Remove duplicates
    };
  } catch (error: any) {
    console.error('LeetCode fetch stats error:', error.message || error);
    throw new Error('Failed to fetch LeetCode stats');
  }
}

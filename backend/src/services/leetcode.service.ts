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

export async function fetchSkillStats(username: string) {
  // 1. Primary: Use alfa-leetcode-api (https://github.com/alfaarghya/alfa-leetcode-api)
  try {
    const res = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/skill`, {
      timeout: 6000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PlacementPulse/1.0',
      },
    });
    if (res.data && (res.data.fundamental || res.data.intermediate || res.data.advanced)) {
      return {
        fundamental: res.data.fundamental || [],
        intermediate: res.data.intermediate || [],
        advanced: res.data.advanced || [],
      };
    }
  } catch (err: any) {
    console.warn('alfa-leetcode-api endpoint note, fallback to direct GraphQL skillStats:', err?.message || err);
  }

  // 2. Fallback: Direct LeetCode GraphQL skillStats query
  try {
    const query = `
      query skillStats($username: String!) {
        matchedUser(username: $username) {
          tagProblemCounts {
            fundamental {
              tagName
              tagSlug
              problemsSolved
            }
            intermediate {
              tagName
              tagSlug
              problemsSolved
            }
            advanced {
              tagName
              tagSlug
              problemsSolved
            }
          }
        }
      }
    `;

    const resp = await leetcodeApi.post('/graphql', {
      query,
      variables: { username },
    }, { timeout: 8000 });

    const tagCounts = resp.data?.data?.matchedUser?.tagProblemCounts;
    if (tagCounts) {
      return {
        fundamental: tagCounts.fundamental || [],
        intermediate: tagCounts.intermediate || [],
        advanced: tagCounts.advanced || [],
      };
    }
  } catch (err: any) {
    console.error('Direct LeetCode GraphQL skillStats error:', err?.message || err);
  }

  return { fundamental: [], intermediate: [], advanced: [] };
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

    // Fetch user profile and skill stats in parallel
    const [profileRes, skillsData] = await Promise.all([
      leetcodeApi.post('/graphql', {
        query,
        variables: { username: cleanUsername },
      }),
      fetchSkillStats(cleanUsername),
    ]);

    const data = profileRes.data?.data;
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

    // Build unified map of tag counts
    const tagCountsMap: Record<string, number> = {};
    const allTagList = [
      ...(skillsData.fundamental || []),
      ...(skillsData.intermediate || []),
      ...(skillsData.advanced || []),
    ];
    allTagList.forEach((item: any) => {
      if (item.tagName) tagCountsMap[item.tagName] = item.problemsSolved || 0;
      if (item.tagSlug) tagCountsMap[item.tagSlug] = item.problemsSolved || 0;
    });

    return {
      totalSolved: allProblems,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      lastSubmissionDate: lastSubmission ? new Date(parseInt(lastSubmission) * 1000).toISOString() : null,
      solvedProblems: [...new Set(solvedProblems)],
      skills: {
        fundamental: skillsData.fundamental || [],
        intermediate: skillsData.intermediate || [],
        advanced: skillsData.advanced || [],
        tagCounts: tagCountsMap,
      },
    };
  } catch (error: any) {
    console.error('LeetCode fetch stats error:', error.message || error);
    throw new Error('Failed to fetch LeetCode stats');
  }
}

import axios from 'axios';

const leetcodeApi = axios.create({
  baseURL: 'https://leetcode.com',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0',
  },
});

export async function validateLeetcodeUsername(username: string): Promise<boolean> {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
        }
      }
    `;

    const response = await leetcodeApi.post('/graphql', {
      query,
      variables: { username },
    });

    return !!response.data?.data?.matchedUser;
  } catch (error) {
    return false;
  }
}

export async function getLeetcodeStats(username: string) {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          recentSubmissionList(limit: 1) {
            timestamp
          }
        }
        recentAcSubmissionList: recentAcSubmissionList(username: $username, limit: 100) {
          title
          titleSlug
          timestamp
        }
      }
    `;

    const response = await leetcodeApi.post('/graphql', {
      query,
      variables: { username },
    });

    const data = response.data?.data;
    if (!data?.matchedUser) {
      throw new Error('User not found');
    }

    const submissions = data.matchedUser.submitStats.acSubmissionNum;
    const allProblems = submissions.find((s: any) => s.difficulty === 'All')?.count || 0;
    const easy = submissions.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const medium = submissions.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = submissions.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    const lastSubmission = data.matchedUser.recentSubmissionList?.[0]?.timestamp;
    const solvedProblems = data.recentAcSubmissionList?.map((p: any) => p.titleSlug) || [];

    return {
      totalSolved: allProblems,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      lastSubmissionDate: lastSubmission ? new Date(parseInt(lastSubmission) * 1000).toISOString() : null,
      solvedProblems: [...new Set(solvedProblems)], // Remove duplicates
    };
  } catch (error) {
    throw new Error('Failed to fetch LeetCode stats');
  }
}

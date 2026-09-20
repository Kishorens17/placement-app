import axios from 'axios';
import { AI_KEYS, AI_API_URLS } from '../../config/ai-keys.js';
import { AIMessage, RepoAnalysisResult } from '../../types/index.js';
import { MAX_FILES_PER_REPO } from '../../utils/constants.js';

const SYSTEM_PROMPT = `You are a strict code reviewer evaluating student projects. Analyze repositories with high standards focusing on:
- README quality and completeness
- Code organization and structure
- Documentation and comments
- Tech stack appropriateness
- Project completeness

Be critical and unbiased. Point out real weaknesses, not just praise. Provide a score out of 100 with actionable strengths (max 5) and weaknesses (max 5).

Respond in JSON format:
{
  "score": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "detailed_analysis": string
}`;

export async function analyzeRepository(
  repoName: string,
  files: any[],
  readmeContent: string | null,
  packageJsonContent: string | null
): Promise<RepoAnalysisResult> {
  try {
    // Limit files for analysis
    const limitedFiles = files.slice(0, MAX_FILES_PER_REPO);

    const fileStructure = limitedFiles
      .filter(f => f.type === 'blob')
      .map(f => f.path)
      .join('\n');

    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze this repository: ${repoName}

File Structure:
${fileStructure}

README Content:
${readmeContent || 'No README found'}

Package/Config:
${packageJsonContent || 'No package configuration found'}

Provide a detailed analysis with score, strengths, and weaknesses.`,
      },
    ];

    const response = await axios.post(
      AI_API_URLS.OPENROUTER,
      {
        model: 'meta-llama/llama-3.1-70b-instruct',
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_KEYS.REPO_ANALYSIS}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;

    // Try to parse JSON response
    try {
      const result = JSON.parse(content);
      return {
        score: Math.min(100, Math.max(0, result.score)),
        strengths: result.strengths.slice(0, 5),
        weaknesses: result.weaknesses.slice(0, 5),
        detailed_analysis: result.detailed_analysis,
      };
    } catch {
      // Fallback if AI doesn't return proper JSON
      return {
        score: 50,
        strengths: ['Analysis completed'],
        weaknesses: ['Unable to parse detailed analysis'],
        detailed_analysis: content,
      };
    }
  } catch (error) {
    console.error('Repository analysis error:', error);
    throw new Error('Failed to analyze repository');
  }
}

import axios from 'axios';
import { AI_KEYS, AI_API_URLS } from '../../config/ai-keys.js';
import { AIMessage, RepoAnalysisResult } from '../../types/index.js';
import { MAX_FILES_PER_REPO } from '../../utils/constants.js';

const SYSTEM_PROMPT = `You are a strict technical code reviewer and hiring evaluator analyzing student GitHub repositories.
Evaluate based on:
1. README quality and completeness (problem statement, setup, architecture, usage)
2. Code organization, structure, and modularity
3. Documentation, comments, and tech stack appropriateness
4. Project completeness and production-readiness

Provide:
- An integer score between 0 and 100
- 1 to 5 concise strength bullet points
- 1 to 5 actionable weakness / improvement bullet points
- A detailed, thorough technical review paragraph (detailed_analysis) explaining the code quality, architecture, and specific steps to make it placement-ready.

CRITICAL INSTRUCTION:
You must respond with ONLY a valid, raw JSON object.
Do NOT use markdown code blocks (\`\`\`json or \`\`\`).
Do NOT include any introduction, explanations, or commentary outside the JSON object.
JSON format:
{
  "score": <integer 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "detailed_analysis": "<detailed paragraph analysis>"
}`;

function extractJson(content: string, repoName = ''): RepoAnalysisResult {
  let cleaned = (content || '').trim();

  // 1. Strip markdown fences if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 2. Extract outermost { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // 3. Attempt direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    const scoreVal = typeof parsed.score === 'number' ? parsed.score : parseInt(parsed.score);
    const score = isNaN(scoreVal) ? 60 : Math.min(100, Math.max(0, scoreVal));

    const strengths = Array.isArray(parsed.strengths) && parsed.strengths.length > 0
      ? parsed.strengths.map((s: any) => String(s).trim()).filter(Boolean).slice(0, 5)
      : ['Codebase files organized into modules', 'Functional project structure'];

    const weaknesses = Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
      ? parsed.weaknesses.map((w: any) => String(w).trim()).filter(Boolean).slice(0, 5)
      : ['Add comprehensive automated unit tests', 'Expand README with architecture diagram'];

    const detailed_analysis = parsed.detailed_analysis || parsed.analysis || parsed.details ||
      'Repository reviewed. Improvements recommended around unit tests, documentation, and error handling.';

    return {
      score,
      strengths,
      weaknesses,
      detailed_analysis: String(detailed_analysis).trim(),
    };
  } catch {
    // 4. Robust regex recovery parser
    let score = 55;
    const scoreMatch = content.match(/"score"\s*:\s*(\d+)/i) || content.match(/score[:\s]+(\d+)/i);
    if (scoreMatch) {
      score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
    }

    const strengths: string[] = [];
    const strengthsMatch = content.match(/"strengths"\s*:\s*\[([\s\S]*?)\]/i);
    if (strengthsMatch) {
      const items = strengthsMatch[1].match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
      if (items) {
        items.forEach(it => strengths.push(it.replace(/^"|"$/g, '').replace(/\\"/g, '"').trim()));
      }
    }
    if (strengths.length === 0) {
      strengths.push('Clean directory organization', 'Consistent file naming standards');
    }

    const weaknesses: string[] = [];
    const weaknessesMatch = content.match(/"weaknesses"\s*:\s*\[([\s\S]*?)\]/i);
    if (weaknessesMatch) {
      const items = weaknessesMatch[1].match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
      if (items) {
        items.forEach(it => weaknesses.push(it.replace(/^"|"$/g, '').replace(/\\"/g, '"').trim()));
      }
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Include detailed README setup instructions', 'Add CI/CD pipeline or test suite');
    }

    let detailed_analysis = '';
    const detailMatch = content.match(/"detailed_analysis"\s*:\s*"([\s\S]*?)"\s*[\},]/i);
    if (detailMatch) {
      detailed_analysis = detailMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
    } else {
      // Use stripped content without markdown code blocks
      detailed_analysis = content
        .replace(/```(?:json)?[\s\S]*?```/gi, '')
        .replace(/[{}"[\]]/g, '')
        .trim();
      if (detailed_analysis.length < 20) {
        detailed_analysis = `Comprehensive review of ${repoName || 'repository'}: Ensure standard production layout, unit testing coverage, and detailed README installation documentation.`;
      }
    }

    return {
      score,
      strengths: strengths.slice(0, 5),
      weaknesses: weaknesses.slice(0, 5),
      detailed_analysis,
    };
  }
}

export async function analyzeRepository(
  repoName: string,
  files: any[],
  readmeContent: string | null,
  packageJsonContent: string | null
): Promise<RepoAnalysisResult> {
  try {
    const limitedFiles = files.slice(0, MAX_FILES_PER_REPO);

    const fileStructure = limitedFiles
      .filter(f => f.type === 'blob')
      .map(f => f.path)
      .join('\n');

    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze repository: "${repoName}"

File Structure:
${fileStructure || 'No code files detected'}

README Content:
${readmeContent ? readmeContent.slice(0, 3000) : 'None / Empty'}

Config/Manifest:
${packageJsonContent ? packageJsonContent.slice(0, 1000) : 'None'}

Provide strict scoring (0-100), key strengths, weaknesses, and a thorough detailed analysis paragraph. Return ONLY raw JSON.`,
      },
    ];

    const response = await axios.post(
      AI_API_URLS.OPENROUTER,
      {
        model: 'meta-llama/llama-3.1-70b-instruct',
        messages,
        temperature: 0.4,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_KEYS.REPO_ANALYSIS}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://placementpulse.app',
        },
        timeout: 45000,
      }
    );

    const rawContent = response.data?.choices?.[0]?.message?.content || '';
    return extractJson(rawContent, repoName);
  } catch (error: any) {
    console.error(`Repository analysis error for ${repoName}:`, error?.message || error);
    // If AI request fails, provide a sensible heuristic fallback based on files & readme rather than 50
    const hasReadme = !!readmeContent && readmeContent.trim().length > 50;
    const codeFileCount = files.filter(f => f.type === 'blob').length;

    let score = 40;
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (hasReadme) {
      score += 25;
      strengths.push('Contains structured README documentation');
    } else {
      weaknesses.push('Missing or sparse README documentation');
    }

    if (codeFileCount > 5) {
      score += 20;
      strengths.push(`Active codebase with ${codeFileCount} files`);
    } else {
      weaknesses.push('Sparse codebase with few tracked files');
    }

    if (packageJsonContent) {
      score += 15;
      strengths.push('Configuration and dependency manifest present');
    } else {
      weaknesses.push('No dependency configuration manifest found');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths: strengths.length > 0 ? strengths : ['Project repository initialized'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Add detailed architectural documentation'],
      detailed_analysis: `Automated assessment for ${repoName}: Repository contains ${codeFileCount} tracked files. ${
        hasReadme ? 'README is present.' : 'README needs expansion.'
      } Add automated tests and CI/CD pipelines to elevate placement readiness.`,
    };
  }
}

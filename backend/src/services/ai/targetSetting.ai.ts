import axios from 'axios';
import { AI_KEYS, AI_API_URLS } from '../../config/ai-keys.js';
import { AIMessage, TargetResult } from '../../types/index.js';

const SYSTEM_PROMPT = `You are an adaptive learning advisor for CS students. Calculate weekly and monthly LeetCode targets based on:
- Current year vs graduation year (urgency factor)
- Total problems solved to date
- Concept-wise problem distribution
- Reasonable weekly commitment (3-10 problems for weekly, 15-40 for monthly)

Guidelines:
- 4th year students need higher weekly targets (8-10 problems)
- 2nd year students can have relaxed pace (4-6 problems)
- Never exceed 12 problems/week to avoid frustration
- Identify weakest 3 concepts for focused improvement

Respond in JSON format:
{
  "weekly_target": number,
  "monthly_target": number,
  "reasoning": string,
  "focus_concepts": string[]
}`;

export async function calculateTargets(
  startYear: number,
  endYear: number,
  totalSolved: number,
  conceptStats: Record<string, { solved: number; total: number }>
): Promise<TargetResult> {
  try {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date().toISOString().split('T')[0];

    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Calculate targets for this student:
- Start Year: ${startYear}
- End Year: ${endYear}
- Current Date: ${currentDate}
- Total Problems Solved: ${totalSolved}
- Concept Stats: ${JSON.stringify(conceptStats, null, 2)}

Provide weekly and monthly targets with reasoning.`,
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
          'Authorization': `Bearer ${AI_KEYS.TARGET_SETTING}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;

    try {
      const result = JSON.parse(content);
      return {
        weekly_target: Math.min(12, Math.max(3, result.weekly_target)),
        monthly_target: Math.min(40, Math.max(15, result.monthly_target)),
        reasoning: result.reasoning,
        focus_concepts: result.focus_concepts.slice(0, 3),
      };
    } catch {
      // Fallback calculation
      const yearsRemaining = endYear - currentYear;
      const weeklyTarget = yearsRemaining <= 1 ? 8 : totalSolved < 50 ? 5 : 6;

      return {
        weekly_target: weeklyTarget,
        monthly_target: weeklyTarget * 4,
        reasoning: 'Using default calculation based on graduation timeline and current progress.',
        focus_concepts: Object.keys(conceptStats).slice(0, 3),
      };
    }
  } catch (error) {
    console.error('Target calculation error:', error);
    throw new Error('Failed to calculate targets');
  }
}

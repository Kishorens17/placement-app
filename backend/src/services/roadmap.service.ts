import axios from 'axios';
import supabase from './supabase.service.js';
import { CS_ROADMAP_DETAILS, ConceptDefinition } from '../utils/roadmapData.js';
import { AI_KEYS, AI_API_URLS } from '../config/ai-keys.js';

export interface ConceptProgressResponse extends ConceptDefinition {
  id?: string;
  completed: boolean;
  progressPercentage: number;
  notes: string;
  updatedAt?: string;
}

export interface RoadmapStats {
  totalConcepts: number;
  completedConcepts: number;
  inProgressConcepts: number;
  notStartedConcepts: number;
  overallReadiness: number;
  categoryBreakdown: Record<string, {
    total: number;
    completed: number;
    inProgress: number;
    avgProgress: number;
  }>;
}

export async function getUserRoadmap(userId: string) {
  // Fetch user's saved progress from database
  const { data: userProgress, error } = await supabase
    .from('roadmap_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching roadmap progress from Supabase:', error);
  }

  const progressMap = new Map<string, any>();
  if (userProgress && Array.isArray(userProgress)) {
    userProgress.forEach((item) => {
      progressMap.set(item.concept_name, item);
    });
  }

  // Combine details with user progress
  const concepts: ConceptProgressResponse[] = CS_ROADMAP_DETAILS.map((concept) => {
    const saved = progressMap.get(concept.name);
    return {
      ...concept,
      id: saved?.id,
      completed: saved ? Boolean(saved.completed) : false,
      progressPercentage: saved ? Number(saved.progress_percentage || 0) : 0,
      notes: saved?.notes || '',
      updatedAt: saved?.updated_at,
    };
  });

  // Calculate statistics
  let completedCount = 0;
  let inProgressCount = 0;
  let totalProgress = 0;

  const categoryBreakdown: Record<string, { total: number; completed: number; inProgress: number; sumProgress: number }> = {};

  concepts.forEach((c) => {
    if (!categoryBreakdown[c.category]) {
      categoryBreakdown[c.category] = { total: 0, completed: 0, inProgress: 0, sumProgress: 0 };
    }
    categoryBreakdown[c.category].total += 1;
    categoryBreakdown[c.category].sumProgress += c.progressPercentage;

    if (c.completed) {
      completedCount++;
      categoryBreakdown[c.category].completed += 1;
    } else if (c.progressPercentage > 0) {
      inProgressCount++;
      categoryBreakdown[c.category].inProgress += 1;
    }
    totalProgress += c.progressPercentage;
  });

  const totalConcepts = concepts.length;
  const overallReadiness = Math.round(totalProgress / totalConcepts);

  const formattedCategories: RoadmapStats['categoryBreakdown'] = {};
  for (const [cat, data] of Object.entries(categoryBreakdown)) {
    formattedCategories[cat] = {
      total: data.total,
      completed: data.completed,
      inProgress: data.inProgress,
      avgProgress: Math.round(data.sumProgress / (data.total || 1)),
    };
  }

  const stats: RoadmapStats = {
    totalConcepts,
    completedConcepts: completedCount,
    inProgressConcepts: inProgressCount,
    notStartedConcepts: totalConcepts - completedCount - inProgressCount,
    overallReadiness,
    categoryBreakdown: formattedCategories,
  };

  return { concepts, stats };
}

export async function updateUserConceptProgress(
  userId: string,
  data: {
    conceptName: string;
    completed?: boolean;
    progressPercentage?: number;
    notes?: string;
  }
) {
  const concept = CS_ROADMAP_DETAILS.find((c) => c.name === data.conceptName);
  if (!concept) {
    throw new Error(`Invalid concept name: ${data.conceptName}`);
  }

  // Sanitize progress percentage (0 - 100)
  let percentage = typeof data.progressPercentage === 'number' ? Math.max(0, Math.min(100, Math.round(data.progressPercentage))) : undefined;
  let completed = data.completed;

  // Auto-mark completed if 100%
  if (percentage === 100 && completed === undefined) {
    completed = true;
  } else if (completed === true && (percentage === undefined || percentage < 100)) {
    percentage = 100;
  } else if (completed === false && percentage === 100) {
    percentage = 90;
  }

  const upsertPayload: Record<string, any> = {
    user_id: userId,
    concept_name: data.conceptName,
    updated_at: new Date().toISOString(),
  };

  if (completed !== undefined) {
    upsertPayload.completed = completed;
  }
  if (percentage !== undefined) {
    upsertPayload.progress_percentage = percentage;
  }
  if (data.notes !== undefined) {
    upsertPayload.notes = data.notes;
  }

  const { data: updated, error } = await supabase
    .from('roadmap_progress')
    .upsert(upsertPayload, { onConflict: 'user_id,concept_name' })
    .select('*')
    .single();

  if (error) {
    console.error('Error updating roadmap progress in Supabase:', error);
    throw new Error('Failed to update roadmap progress: ' + error.message);
  }

  return updated;
}

export async function generateConceptAIGuide(conceptName: string, currentProgress = 0, notes = ''): Promise<string> {
  const concept = CS_ROADMAP_DETAILS.find((c) => c.name === conceptName);
  if (!concept) {
    throw new Error(`Concept "${conceptName}" not found`);
  }

  const systemPrompt = `You are a Principal Tech Interviewer and Computer Science Placement Coach.
Provide an actionable, high-yield Placement Preparation & Interview Revision Sheet for the CS topic: "${conceptName}".
Keep the response structured with Markdown headers and bullet points. Include:
1. 🎯 Placement Weightage & Company Types (Product vs Service, Typical rounds: OA, Technical, System Design)
2. 🧠 Top 5 Non-Negotiable Core Concepts / Mental Models
3. 💼 Top 5 Real Interview Questions & How to Answer Them
4. ⚡ Common Traps & Pitfalls Candidates Fall Into
5. 🚀 Actionable Next Step tailored to a candidate with ${currentProgress}% current completion.

Make it crisp, highly educational, realistic, and inspiring.`;

  try {
    const apiKey = AI_KEYS.PROBLEM_RECOMMENDATION || AI_KEYS.CHATBOT;
    const response = await axios.post(
      AI_API_URLS.OPENROUTER,
      {
        model: 'meta-llama/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Generate placement prep guide for "${conceptName}". Subtopics include: ${concept.subtopics.map((s) => s.name).join(', ')}. Candidate progress: ${currentProgress}%. Candidate notes: "${notes}".`,
          },
        ],
        temperature: 0.6,
        max_tokens: 1200,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (err: any) {
    console.warn('AI guide generation failed, using curated fallback guide:', err.message);

    // High quality offline fallback
    return `### 🎯 Placement Guide: ${concept.name}
**Category:** ${concept.category} | **Difficulty:** ${concept.difficulty} | **Estimated Prep Time:** ${concept.estimatedHours} Hours

#### 🧠 High-Yield Subtopics to Master
${concept.subtopics.map((s) => `- **${s.name}**`).join('\n')}

#### 💼 Key Placement Interview Focus Areas
${concept.interviewFocus.map((q) => `- ${q}`).join('\n')}

#### 💡 Expert Placement Tips
- **Conceptual Depth:** Always be ready to discuss trade-offs (Time vs Space complexity, CPU vs Memory, Consistency vs Availability).
- **Practical Application:** Interviewers frequently probe into edge cases and how this concept operates at scale.
- **Recommended Next Step:** Based on your current progress of **${currentProgress}%**, practice the curated resources linked on this card and write down concise summaries in your notes.`;
  }
}

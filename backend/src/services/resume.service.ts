import axios from 'axios';
import { PDFParse } from 'pdf-parse';
import { config } from '../config/env.js';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy?.();
  return result.text ? result.text.trim() : '';
}

const JOB_ROLE_KEYWORDS: Record<string, string[]> = {
  'Software Development Engineer': [
    'data structures', 'algorithms', 'system design', 'OOP', 'Java', 'Python', 'C++',
    'REST API', 'databases', 'SQL', 'Git', 'problem solving', 'time complexity',
    'space complexity', 'design patterns', 'microservices', 'unit testing', 'agile',
  ],
  'Frontend Developer': [
    'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Next.js', 'Vue', 'Angular',
    'responsive design', 'REST API', 'GraphQL', 'webpack', 'performance optimization',
    'accessibility', 'UI/UX', 'Tailwind', 'state management', 'testing', 'Git',
  ],
  'Backend Developer': [
    'Node.js', 'Python', 'Java', 'Express', 'FastAPI', 'Spring Boot', 'REST API',
    'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'microservices',
    'authentication', 'JWT', 'message queues', 'caching', 'CI/CD', 'Linux',
  ],
  'Full Stack Developer': [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'REST API', 'SQL', 'NoSQL',
    'Docker', 'Git', 'HTML', 'CSS', 'Express', 'databases', 'authentication',
    'deployment', 'CI/CD', 'system design', 'MongoDB', 'PostgreSQL',
  ],
  'Data Scientist': [
    'Python', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn',
    'TensorFlow', 'PyTorch', 'SQL', 'statistics', 'data analysis', 'visualization',
    'Matplotlib', 'feature engineering', 'model evaluation', 'A/B testing', 'NLP',
  ],
  'ML Engineer': [
    'Python', 'TensorFlow', 'PyTorch', 'machine learning', 'deep learning', 'MLOps',
    'model deployment', 'Docker', 'Kubernetes', 'data pipelines', 'feature store',
    'model monitoring', 'scikit-learn', 'SQL', 'distributed training', 'cloud (AWS/GCP/Azure)',
  ],
  'DevOps Engineer': [
    'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'AWS', 'Azure', 'GCP', 'Terraform',
    'Ansible', 'Linux', 'bash scripting', 'monitoring', 'Prometheus', 'Grafana',
    'Git', 'networking', 'security', 'infrastructure as code', 'GitOps',
  ],
  'Data Analyst': [
    'SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'data visualization', 'statistics',
    'pandas', 'data cleaning', 'business intelligence', 'reporting', 'A/B testing',
    'KPI', 'ETL', 'data modeling', 'communication', 'stakeholder management',
  ],
  'Product Manager': [
    'product roadmap', 'user stories', 'agile', 'scrum', 'stakeholder management',
    'data analysis', 'SQL', 'A/B testing', 'user research', 'wireframing',
    'PRD', 'go-to-market', 'KPI', 'OKR', 'competitive analysis', 'prioritization',
  ],
};

export const JOB_ROLES = Object.keys(JOB_ROLE_KEYWORDS);

export interface ATSResult {
  ats_score: number;
  keyword_match_percentage: number;
  found_keywords: string[];
  missing_keywords: string[];
  section_scores: {
    contact: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
  improvements: string[];
  format_issues: string[];
  readability_score: number;
  overall_feedback: string;
  job_role: string;
}

export async function analyzeResume(
  resumeText: string,
  jobRole: string
): Promise<ATSResult> {
  const keywords = JOB_ROLE_KEYWORDS[jobRole] || JOB_ROLE_KEYWORDS['Software Development Engineer'];

  const prompt = `You are an expert ATS (Applicant Tracking System) and resume coach. Analyze the following resume for the job role: "${jobRole}".

RESUME TEXT:
---
${resumeText.slice(0, 6000)}
---

EXPECTED KEYWORDS FOR ${jobRole}:
${keywords.join(', ')}

Respond with ONLY valid JSON (no markdown, no code blocks) in exactly this format:
{
  "ats_score": <integer 0-100>,
  "keyword_match_percentage": <integer 0-100>,
  "found_keywords": [<list of keywords from the expected list that appear in the resume>],
  "missing_keywords": [<list of important keywords NOT found in the resume>],
  "section_scores": {
    "contact": <integer 0-100>,
    "summary": <integer 0-100>,
    "experience": <integer 0-100>,
    "education": <integer 0-100>,
    "skills": <integer 0-100>
  },
  "improvements": [<5 specific, actionable improvement suggestions as strings>],
  "format_issues": [<list of format/structure issues found, empty array if none>],
  "readability_score": <integer 0-100>,
  "overall_feedback": "<2-3 sentence honest overall assessment>"
}

Be strict and realistic. A 90+ score should be rare. Base the ats_score on: keyword match (40%), content quality (30%), format (20%), readability (10%).`;

  const aiKey = config.aiKeys?.chatbot || config.aiKeys?.resumeAnalysis || process.env.AI_KEY_CHATBOT || '';

  const candidateModels = [
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-chat',
    'qwen/qwen-2.5-72b-instruct',
  ];

  let raw = '';
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await axios.post(
        config.openRouterUrl || 'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${aiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://placementpulse.app',
          },
          timeout: 40000,
        }
      );

      raw = response.data.choices?.[0]?.message?.content || '';
      if (raw) break;
    } catch (err: any) {
      console.warn(`Resume analysis failed with ${model}: ${err.response?.status || err.message}`);
      lastError = err;
    }
  }

  if (!raw) {
    throw new Error(lastError?.response?.data?.error?.message || lastError?.message || 'Failed to analyze resume with AI');
  }

  // Extract JSON from response (clean markdown backticks if any)
  const cleanRaw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const jsonMatch = cleanRaw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');

  const result: ATSResult = JSON.parse(jsonMatch[0]);
  result.job_role = jobRole;
  return result;
}

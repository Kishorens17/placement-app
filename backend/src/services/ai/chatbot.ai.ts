import axios from 'axios';
import { AI_KEYS, AI_API_URLS } from '../../config/ai-keys.js';
import { AIMessage } from '../../types/index.js';

const SYSTEM_PROMPT = `You are an academic CS assistant for students. ONLY answer questions about:
- Computer science concepts and theory
- Interview preparation and tips
- Coding problems and debugging help
- Company interview experiences and PYQs (Previous Year Questions)
- Recent interview trends

REFUSE politely if asked about:
- Non-CS topics (politics, personal advice, entertainment)
- Doing homework/assignments directly (guide, don't solve)
- Unethical hacking or cheating

Keep responses concise, educational, and encouraging. If a question is off-topic, politely decline and redirect to CS-related topics.`;

export async function chatWithAI(userMessage: string, conversationHistory: AIMessage[] = []): Promise<string> {
  try {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    const response = await axios.post(
      AI_API_URLS.OPENROUTER,
      {
        model: 'meta-llama/llama-3.1-70b-instruct',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_KEYS.CHATBOT}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Chatbot error:', error);
    throw new Error('Failed to get AI response');
  }
}

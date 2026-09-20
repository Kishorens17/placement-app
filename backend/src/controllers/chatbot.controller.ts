import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import supabase from '../services/supabase.service.js';
import { chatWithAI } from '../services/ai/chatbot.ai.js';

export async function chat(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get recent conversation history
    const { data: history } = await supabase
      .from('chat_history')
      .select('message, response')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const conversationHistory = (history || []).reverse().flatMap(h => [
      { role: 'user' as const, content: h.message },
      { role: 'assistant' as const, content: h.response },
    ]);

    // Get AI response
    const response = await chatWithAI(message, conversationHistory);

    // Save to database
    await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        message,
        response,
      });

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}

export async function getChatHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const { data: history, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({ history: history || [] });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}

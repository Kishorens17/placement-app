import type { QuizAnswer, QuizQuestion } from '../types/quiz';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getAuthHeaders() {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const quizApi = {
  async getQuestions(subject: string, setNumber: number): Promise<QuizQuestion[]> {
    const res = await fetch(
      `${API_BASE}/api/quiz/${encodeURIComponent(subject)}/questions?set=${setNumber}`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error('Failed to fetch questions');
    const data = await res.json();
    return data.questions;
  },

  async startAttempt(subject: string, setNumber: number, email: string) {
    const res = await fetch(`${API_BASE}/api/quiz/attempt/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subject, set_number: setNumber, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === 'cooldown') throw { type: 'cooldown', cooldown_until: data.cooldown_until };
      throw new Error(data.error || 'Failed to start attempt');
    }
    return data.attempt;
  },

  async logEvent(
    attemptId: string,
    eventType: string,
    eventDetail: string,
    questionNumber: number
  ) {
    try {
      await fetch(`${API_BASE}/api/quiz/attempt/${attemptId}/log-event`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          event_type: eventType,
          event_detail: eventDetail,
          question_number: questionNumber,
        }),
      });
    } catch {
      // Non-critical, don't throw
    }
  },

  async submitAttempt(attemptId: string, answers: QuizAnswer[], autoSubmitted = false) {
    const res = await fetch(`${API_BASE}/api/quiz/attempt/${attemptId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers, auto_submitted: autoSubmitted }),
    });
    if (!res.ok) throw new Error('Failed to submit attempt');
    return res.json();
  },

  async getResult(attemptId: string) {
    const res = await fetch(`${API_BASE}/api/quiz/attempt/${attemptId}/result`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch result');
    return res.json();
  },

  async getHistory(subject?: string) {
    const path = subject ? encodeURIComponent(subject) : 'all';
    const res = await fetch(`${API_BASE}/api/quiz/history/${path}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch history');
    const data = await res.json();
    return data.history;
  },
};

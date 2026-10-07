import supabase from './supabase.service.js';
import { Resend } from 'resend';
import { config } from '../config/env.js';

const resend = new Resend(config.resendApiKey);

// ─────────────────────────────────────────────
// Fetch questions for a subject + set, shuffled
// ─────────────────────────────────────────────
export async function getQuizQuestions(subject: string, setNumber: number) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, difficulty, question_text, option_a, option_b, option_c, option_d, topic_tag')
    .eq('subject', subject)
    .eq('set_number', setNumber);

  if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
  if (!data || data.length === 0) throw new Error('No questions found for this subject/set combination');

  // Shuffle the questions
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled;
}

// ─────────────────────────────────────────────
// Start a new quiz attempt
// ─────────────────────────────────────────────
export async function startQuizAttempt(
  userId: string,
  subject: string,
  setNumber: number,
  emailUsed: string
) {
  // Check 24-hour cooldown for this set
  const { data: lastAttempt } = await supabase
    .from('quiz_attempts')
    .select('id, submitted_at, next_retake_allowed_at')
    .eq('user_id', userId)
    .eq('subject', subject)
    .eq('set_number', setNumber)
    .not('submitted_at', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();

  if (lastAttempt?.next_retake_allowed_at) {
    const cooldownEnd = new Date(lastAttempt.next_retake_allowed_at);
    if (new Date() < cooldownEnd) {
      throw new Error(`COOLDOWN:${cooldownEnd.toISOString()}`);
    }
  }

  // Cancel any existing incomplete attempts
  await supabase
    .from('quiz_attempts')
    .update({ submitted_at: new Date().toISOString(), auto_submitted: true })
    .eq('user_id', userId)
    .is('submitted_at', null);

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      subject,
      set_number: setNumber,
      email_used: emailUsed,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to start attempt: ${error.message}`);
  return data;
}

// ─────────────────────────────────────────────
// Log a malpractice event
// ─────────────────────────────────────────────
export async function logMalpracticeEvent(
  attemptId: string,
  userId: string,
  eventType: string,
  eventDetail: string,
  questionNumber: number
) {
  const { error } = await supabase
    .from('quiz_malpractice_logs')
    .insert({
      attempt_id: attemptId,
      user_id: userId,
      event_type: eventType,
      event_detail: eventDetail,
      question_number: questionNumber,
      occurred_at: new Date().toISOString(),
    });

  if (error) console.error('Malpractice log error:', error.message);
}

// ─────────────────────────────────────────────
// Submit quiz attempt and compute results
// ─────────────────────────────────────────────
export async function submitQuizAttempt(
  attemptId: string,
  userId: string,
  answers: Array<{
    question_id: string;
    question_order: number;
    selected_ans: string | null;
    time_spent_sec: number;
  }>,
  autoSubmitted: boolean = false
) {
  // Fetch all questions for this attempt's answers
  const questionIds = answers.map((a) => a.question_id);
  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('id, correct_ans, topic_tag, difficulty, question_text, option_a, option_b, option_c, option_d, explanation')
    .in('id', questionIds);

  if (qError) throw new Error(`Failed to fetch questions for scoring: ${qError.message}`);

  const questionMap = new Map(questions!.map((q) => [q.id, q]));

  // Score each answer
  let score = 0;
  const answerInserts = answers.map((a) => {
    const q = questionMap.get(a.question_id);
    const isCorrect = q?.correct_ans === a.selected_ans;
    const flaggedFast = a.time_spent_sec < 3 && a.selected_ans !== null;
    if (isCorrect) score++;
    return {
      attempt_id: attemptId,
      question_id: a.question_id,
      question_order: a.question_order,
      selected_ans: a.selected_ans,
      is_correct: isCorrect,
      time_spent_sec: a.time_spent_sec,
      flagged_fast: flaggedFast,
    };
  });

  // Insert answers
  const { error: ansError } = await supabase
    .from('quiz_attempt_answers')
    .insert(answerInserts);
  if (ansError) throw new Error(`Failed to save answers: ${ansError.message}`);

  const total = answers.length;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 60;

  // Count malpractice events
  const { data: malEvents } = await supabase
    .from('quiz_malpractice_logs')
    .select('event_type')
    .eq('attempt_id', attemptId);

  const malpracticeCount = malEvents?.length || 0;
  let malpracticeSeverity = 'clean';
  if (malpracticeCount >= 8) malpracticeSeverity = 'high';
  else if (malpracticeCount >= 4) malpracticeSeverity = 'moderate';
  else if (malpracticeCount >= 1) malpracticeSeverity = 'low';

  const nextRetakeAllowedAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Update attempt record
  const { data: attempt, error: updateError } = await supabase
    .from('quiz_attempts')
    .update({
      submitted_at: new Date().toISOString(),
      score,
      total_questions: total,
      percentage,
      passed,
      auto_submitted: autoSubmitted,
      malpractice_count: malpracticeCount,
      malpractice_severity: malpracticeSeverity,
      next_retake_allowed_at: nextRetakeAllowedAt,
    })
    .eq('id', attemptId)
    .select()
    .single();

  if (updateError) throw new Error(`Failed to update attempt: ${updateError.message}`);

  // Build topic analysis
  const topicStats: Record<string, { correct: number; total: number }> = {};
  answers.forEach((a) => {
    const q = questionMap.get(a.question_id);
    if (!q) return;
    if (!topicStats[q.topic_tag]) topicStats[q.topic_tag] = { correct: 0, total: 0 };
    topicStats[q.topic_tag].total++;
    if (q.correct_ans === a.selected_ans) topicStats[q.topic_tag].correct++;
  });

  // Build difficulty stats
  const diffStats: Record<string, { correct: number; total: number }> = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
  answers.forEach((a) => {
    const q = questionMap.get(a.question_id);
    if (!q) return;
    diffStats[q.difficulty].total++;
    if (q.correct_ans === a.selected_ans) diffStats[q.difficulty].correct++;
  });

  // Dispatch email asynchronously
  const { data: attemptData } = await supabase
    .from('quiz_attempts')
    .select('email_used, subject')
    .eq('id', attemptId)
    .single();

  const { data: userData } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  sendPostTestEmail(
    attemptData?.email_used || '',
    userData?.username || 'Student',
    attemptData?.subject || '',
    attempt!,
    answers,
    questionMap,
    topicStats,
    diffStats
  ).catch((e) => console.error('Email send failed:', e));

  return {
    attempt,
    score,
    total,
    percentage,
    passed,
    malpracticeCount,
    malpracticeSeverity,
    topicStats,
    diffStats,
    nextRetakeAllowedAt,
  };
}

// ─────────────────────────────────────────────
// Get attempt result
// ─────────────────────────────────────────────
export async function getAttemptResult(attemptId: string, userId: string) {
  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (error || !attempt) throw new Error('Attempt not found');

  const { data: answers } = await supabase
    .from('quiz_attempt_answers')
    .select('*, quiz_questions(question_text, correct_ans, explanation, difficulty, topic_tag, option_a, option_b, option_c, option_d)')
    .eq('attempt_id', attemptId)
    .order('question_order');

  const { data: malpracticeLogs } = await supabase
    .from('quiz_malpractice_logs')
    .select('*')
    .eq('attempt_id', attemptId)
    .order('occurred_at');

  return { attempt, answers, malpracticeLogs };
}

// ─────────────────────────────────────────────
// Get quiz history for a user
// ─────────────────────────────────────────────
export async function getQuizHistory(userId: string, subject?: string) {
  let query = supabase
    .from('quiz_attempts')
    .select('id, subject, set_number, score, total_questions, percentage, passed, submitted_at, malpractice_count, malpractice_severity, auto_submitted')
    .eq('user_id', userId)
    .not('submitted_at', 'is', null)
    .order('submitted_at', { ascending: false });

  if (subject) query = query.eq('subject', subject);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch history: ${error.message}`);
  return data;
}

// ─────────────────────────────────────────────
// Send post-test detailed email via Resend
// ─────────────────────────────────────────────
async function sendPostTestEmail(
  email: string,
  studentName: string,
  subject: string,
  attempt: any,
  answers: any[],
  questionMap: Map<string, any>,
  topicStats: Record<string, { correct: number; total: number }>,
  diffStats: Record<string, { correct: number; total: number }>
) {
  if (!email || !config.resendApiKey) return;

  const weakTopics = Object.entries(topicStats)
    .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.6)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total);

  const strongTopics = Object.entries(topicStats)
    .filter(([, s]) => s.total > 0 && s.correct / s.total >= 0.8);

  const statusEmoji = attempt.passed ? '✅' : '❌';
  const statusText = attempt.passed ? 'PASSED' : 'FAILED';

  const qaBreakdown = answers.map((a, idx) => {
    const q = questionMap.get(a.question_id);
    if (!q) return '';
    const correct = a.is_correct;
    const options: Record<string, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    const selectedLabel = a.selected_ans ? `${a.selected_ans}. ${options[a.selected_ans]}` : 'Not answered';
    const correctLabel = `${q.correct_ans}. ${options[q.correct_ans]}`;
    return `
      <tr style="background:${idx % 2 === 0 ? '#1a1a2e' : '#16213e'}">
        <td style="padding:12px;border-bottom:1px solid #2d2d4a;color:#9ca3af;font-size:12px">${idx + 1} <span style="background:${q.difficulty === 'easy' ? '#065f46' : q.difficulty === 'medium' ? '#7c3d12' : '#7f1d1d'};color:white;padding:2px 6px;border-radius:4px;font-size:10px;margin-left:4px">${q.difficulty.toUpperCase()}</span></td>
        <td style="padding:12px;border-bottom:1px solid #2d2d4a;color:#e5e7eb;font-size:13px">${q.question_text}</td>
        <td style="padding:12px;border-bottom:1px solid #2d2d4a;color:${correct ? '#34d399' : '#f87171'};font-size:13px">${correct ? '✅' : '❌'} ${selectedLabel}</td>
        <td style="padding:12px;border-bottom:1px solid #2d2d4a;color:#34d399;font-size:13px">${correctLabel}</td>
        <td style="padding:12px;border-bottom:1px solid #2d2d4a;color:#9ca3af;font-size:12px">${q.explanation}</td>
      </tr>`;
  }).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Assessment Report — ${subject}</title></head>
<body style="margin:0;padding:0;background:#0f0f23;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:900px;margin:0 auto;padding:24px">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
      <h1 style="color:white;margin:0;font-size:28px">PlacementPulse</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Assessment Report — ${subject}</p>
    </div>

    <!-- Score Card -->
    <div style="background:#1a1a2e;border-radius:12px;padding:24px;margin-bottom:24px;display:flex;gap:24px;flex-wrap:wrap">
      <div style="flex:1;min-width:180px;text-align:center;background:#16213e;border-radius:10px;padding:20px">
        <div style="font-size:48px;font-weight:700;color:${attempt.passed ? '#34d399' : '#f87171'}">${attempt.score}<span style="font-size:24px;color:#9ca3af">/${attempt.total_questions}</span></div>
        <div style="color:#9ca3af;font-size:14px;margin-top:4px">Score</div>
        <div style="margin-top:8px;display:inline-block;background:${attempt.passed ? '#065f46' : '#7f1d1d'};color:${attempt.passed ? '#34d399' : '#f87171'};padding:4px 12px;border-radius:20px;font-size:13px">${statusEmoji} ${statusText}</div>
      </div>
      <div style="flex:1;min-width:180px;text-align:center;background:#16213e;border-radius:10px;padding:20px">
        <div style="font-size:48px;font-weight:700;color:#818cf8">${attempt.percentage}%</div>
        <div style="color:#9ca3af;font-size:14px;margin-top:4px">Percentage</div>
        <div style="margin-top:8px;color:#9ca3af;font-size:13px">Pass mark: 60%</div>
      </div>
      <div style="flex:1;min-width:180px;text-align:center;background:#16213e;border-radius:10px;padding:20px">
        <div style="font-size:48px;font-weight:700;color:#f59e0b">${Math.floor((attempt.time_taken_seconds || 0) / 60)}m ${(attempt.time_taken_seconds || 0) % 60}s</div>
        <div style="color:#9ca3af;font-size:14px;margin-top:4px">Time Taken</div>
        <div style="margin-top:8px;color:#9ca3af;font-size:13px">Limit: 15:00</div>
      </div>
      <div style="flex:1;min-width:180px;text-align:center;background:#16213e;border-radius:10px;padding:20px">
        <div style="font-size:48px;font-weight:700;color:${attempt.malpractice_severity === 'clean' ? '#34d399' : attempt.malpractice_severity === 'low' ? '#f59e0b' : '#f87171'}">${attempt.malpractice_count}</div>
        <div style="color:#9ca3af;font-size:14px;margin-top:4px">Violations</div>
        <div style="margin-top:8px;color:#9ca3af;font-size:13px;text-transform:capitalize">${attempt.malpractice_severity} integrity</div>
      </div>
    </div>

    <!-- Difficulty Breakdown -->
    <div style="background:#1a1a2e;border-radius:12px;padding:24px;margin-bottom:24px">
      <h2 style="color:#e5e7eb;margin:0 0 16px;font-size:18px">Difficulty Breakdown</h2>
      ${['easy', 'medium', 'hard'].map(d => {
        const s = diffStats[d] || { correct: 0, total: 0 };
        const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
        const color = d === 'easy' ? '#34d399' : d === 'medium' ? '#f59e0b' : '#f87171';
        return `<div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="color:#e5e7eb;text-transform:capitalize;font-weight:600">${d}</span>
            <span style="color:${color}">${s.correct}/${s.total} (${pct}%)</span>
          </div>
          <div style="background:#2d2d4a;border-radius:4px;height:8px">
            <div style="background:${color};width:${pct}%;height:8px;border-radius:4px;transition:width 0.5s"></div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Topic Analysis -->
    ${weakTopics.length > 0 ? `
    <div style="background:#1a1a2e;border-radius:12px;padding:24px;margin-bottom:24px">
      <h2 style="color:#e5e7eb;margin:0 0 16px;font-size:18px">📈 Areas for Improvement</h2>
      ${weakTopics.map(([topic, s]) => `
        <div style="background:#16213e;border-radius:8px;padding:12px 16px;margin-bottom:8px;border-left:3px solid #f87171">
          <strong style="color:#f87171">${topic}</strong>
          <span style="color:#9ca3af;float:right">${s.correct}/${s.total} (${Math.round(s.correct/s.total*100)}%)</span>
        </div>`).join('')}
    </div>` : ''}

    ${strongTopics.length > 0 ? `
    <div style="background:#1a1a2e;border-radius:12px;padding:24px;margin-bottom:24px">
      <h2 style="color:#e5e7eb;margin:0 0 16px;font-size:18px">🏆 Strong Areas</h2>
      ${strongTopics.map(([topic, s]) => `
        <div style="background:#16213e;border-radius:8px;padding:12px 16px;margin-bottom:8px;border-left:3px solid #34d399">
          <strong style="color:#34d399">${topic}</strong>
          <span style="color:#9ca3af;float:right">${s.correct}/${s.total} (${Math.round(s.correct/s.total*100)}%)</span>
        </div>`).join('')}
    </div>` : ''}

    <!-- Q&A Breakdown -->
    <div style="background:#1a1a2e;border-radius:12px;padding:24px;margin-bottom:24px;overflow-x:auto">
      <h2 style="color:#e5e7eb;margin:0 0 16px;font-size:18px">📝 Question-by-Question Breakdown</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#0f0f23">
            <th style="padding:12px;text-align:left;color:#9ca3af;font-size:12px;font-weight:600">#</th>
            <th style="padding:12px;text-align:left;color:#9ca3af;font-size:12px;font-weight:600">Question</th>
            <th style="padding:12px;text-align:left;color:#9ca3af;font-size:12px;font-weight:600">Your Answer</th>
            <th style="padding:12px;text-align:left;color:#9ca3af;font-size:12px;font-weight:600">Correct Answer</th>
            <th style="padding:12px;text-align:left;color:#9ca3af;font-size:12px;font-weight:600">Explanation</th>
          </tr>
        </thead>
        <tbody>${qaBreakdown}</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#6b7280;font-size:13px">
      <p>Good luck with your placement preparation! 🚀</p>
      <p>— PlacementPulse AI Team</p>
      <p style="font-size:11px;margin-top:8px">This is an automated report. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: 'PlacementPulse <onboarding@resend.dev>',
    to: [email],
    subject: `📊 ${subject} Assessment — ${attempt.score}/${attempt.total_questions} (${attempt.percentage}%) | PlacementPulse`,
    html,
  });

  // Mark email as sent
  await supabase
    .from('quiz_attempts')
    .update({ email_sent: true })
    .eq('id', attempt.id);
}

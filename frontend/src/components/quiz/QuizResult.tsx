import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RotateCcw, ArrowLeft, Mail, TrendingUp, TrendingDown } from 'lucide-react';
import { quizApi } from '../../services/quiz.api';

interface Props {
  subject: string;
  setNumber: number;
  result: any;
  attemptId: string;
  onRetake: () => void;
  onBack: () => void;
}

export default function QuizResult({ subject, setNumber, result, attemptId, onRetake, onBack }: Props) {
  const [detailedResult, setDetailedResult] = useState<any>(null);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizApi.getResult(attemptId).then(r => {
      setDetailedResult(r);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [attemptId]);

  const { attempt, score, total, percentage, passed, malpracticeCount, malpracticeSeverity, topicStats, diffStats, nextRetakeAllowedAt } = result;

  const cooldownDate = new Date(nextRetakeAllowedAt);
  const canRetake = new Date() > cooldownDate;
  const nextSet = setNumber < 3 ? setNumber + 1 : 1;

  const severityColor = malpracticeSeverity === 'clean' ? '#34d399'
    : malpracticeSeverity === 'low' ? '#f59e0b'
    : malpracticeSeverity === 'moderate' ? '#f97316'
    : '#f87171';

  const weakTopics = Object.entries(topicStats || {})
    .filter(([, s]: any) => s.total > 0 && s.correct / s.total < 0.6)
    .sort(([, a]: any, [, b]: any) => a.correct / a.total - b.correct / b.total);

  const strongTopics = Object.entries(topicStats || {})
    .filter(([, s]: any) => s.total > 0 && s.correct / s.total >= 0.8);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '24px',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: passed
            ? 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.1))'
            : 'linear-gradient(135deg, rgba(248,113,113,0.2), rgba(239,68,68,0.1))',
          border: `1px solid ${passed ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          {passed
            ? <CheckCircle size={48} color="#34d399" style={{ flexShrink: 0 }} />
            : <XCircle size={48} color="#f87171" style={{ flexShrink: 0 }} />}
          <div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>
              {passed ? '🎉 Assessment Passed!' : '📚 Assessment Failed'}
            </h1>
            <p style={{ color: '#9ca3af', margin: 0 }}>
              {subject} — Set {['A', 'B', 'C'][setNumber - 1] || setNumber} · {passed ? 'Great work! Try the next set.' : 'Review your weak areas and retake.'}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '40px', fontWeight: 800, color: passed ? '#34d399' : '#f87171' }}>
              {score}<span style={{ fontSize: '22px', color: '#9ca3af', fontWeight: 400 }}>/{total}</span>
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>{percentage}%</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Score', value: `${score}/${total}`, sub: `${percentage}%`, color: passed ? '#34d399' : '#f87171' },
            { label: 'Time Taken', value: `${Math.floor((attempt?.time_taken_seconds || 0) / 60)}m ${(attempt?.time_taken_seconds || 0) % 60}s`, sub: 'of 15:00', color: '#818cf8' },
            { label: 'Malpractice', value: malpracticeCount, sub: `${malpracticeSeverity} severity`, color: severityColor },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Difficulty Breakdown */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '22px',
          marginBottom: '20px',
        }}>
          <h2 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: 700, margin: '0 0 18px' }}>
            📊 Difficulty Breakdown
          </h2>
          {(['easy', 'medium', 'hard'] as const).map(d => {
            const s = (diffStats || {})[d] || { correct: 0, total: 0 };
            const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            const color = d === 'easy' ? '#34d399' : d === 'medium' ? '#f59e0b' : '#f87171';
            return (
              <div key={d} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: `${color}20`,
                      color,
                      border: `1px solid ${color}40`,
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>{d}</span>
                  </div>
                  <span style={{ color, fontWeight: 700, fontSize: '14px' }}>
                    {s.correct}/{s.total} ({pct}%)
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div style={{
                    height: '100%',
                    background: color,
                    width: `${pct}%`,
                    borderRadius: '4px',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Topic Analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {weakTopics.length > 0 && (
            <div style={{
              background: 'rgba(248,113,113,0.06)',
              border: '1px solid rgba(248,113,113,0.15)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{ color: '#f87171', margin: '0 0 14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingDown size={16} /> Needs Improvement
              </h3>
              {weakTopics.map(([topic, s]: any) => (
                <div key={topic} style={{
                  background: 'rgba(248,113,113,0.08)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ color: '#fca5a5', fontSize: '13px' }}>{topic}</span>
                  <span style={{ color: '#f87171', fontWeight: 700, fontSize: '13px' }}>
                    {s.correct}/{s.total} ({Math.round(s.correct / s.total * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}

          {strongTopics.length > 0 && (
            <div style={{
              background: 'rgba(52,211,153,0.06)',
              border: '1px solid rgba(52,211,153,0.15)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{ color: '#34d399', margin: '0 0 14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} /> Strong Areas 🏆
              </h3>
              {strongTopics.map(([topic, s]: any) => (
                <div key={topic} style={{
                  background: 'rgba(52,211,153,0.08)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ color: '#6ee7b7', fontSize: '13px' }}>{topic}</span>
                  <span style={{ color: '#34d399', fontWeight: 700, fontSize: '13px' }}>
                    {s.correct}/{s.total} ({Math.round(s.correct / s.total * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Malpractice Report */}
        {malpracticeCount > 0 && (
          <div style={{
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <h3 style={{ color: '#fbbf24', margin: '0 0 12px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Malpractice Report — {malpracticeCount} violation(s) — Severity: <span style={{ color: severityColor, textTransform: 'capitalize' }}>{malpracticeSeverity}</span>
            </h3>
            {detailedResult?.malpracticeLogs?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {detailedResult.malpracticeLogs.map((log: any, i: number) => (
                  <div key={i} style={{
                    background: 'rgba(251,191,36,0.08)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}>
                    <span style={{ color: '#fcd34d', textTransform: 'capitalize' }}>{log.event_type.replace(/_/g, ' ')}</span>
                    <span style={{ color: '#9ca3af' }}>Q{log.question_number} · {new Date(log.occurred_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Q&A Review */}
        {!loading && detailedResult?.answers?.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '22px',
            marginBottom: '24px',
          }}>
            <h2 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: 700, margin: '0 0 18px' }}>
              📝 Answer Review
            </h2>
            {detailedResult.answers.map((a: any, i: number) => {
              const q = a.quiz_questions;
              const isExpanded = expandedQ === a.id;
              const options: Record<string, string> = {
                A: q?.option_a, B: q?.option_b, C: q?.option_c, D: q?.option_d
              };
              return (
                <div key={a.id} style={{
                  borderRadius: '10px',
                  border: `1px solid ${a.is_correct ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                  marginBottom: '8px',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setExpandedQ(isExpanded ? null : a.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      background: a.is_correct ? 'rgba(52,211,153,0.06)' : 'rgba(248,113,113,0.06)',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                      background: a.is_correct ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700,
                      color: a.is_correct ? '#34d399' : '#f87171',
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ color: '#e5e7eb', fontSize: '13px', flex: 1 }}>
                      {q?.question_text?.slice(0, 80)}...
                    </span>
                    <span style={{ color: a.is_correct ? '#34d399' : '#f87171', fontSize: '12px', flexShrink: 0 }}>
                      {a.is_correct ? '✅' : '❌'} {a.selected_ans || 'No answer'}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '16px', flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ color: '#d1d5db', fontSize: '14px', margin: '0 0 12px', lineHeight: 1.6 }}>
                        {q?.question_text}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        {(['A', 'B', 'C', 'D']).map(k => (
                          <div key={k} style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: k === q?.correct_ans
                              ? 'rgba(52,211,153,0.15)'
                              : k === a.selected_ans && !a.is_correct
                              ? 'rgba(248,113,113,0.15)'
                              : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${k === q?.correct_ans ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            fontSize: '12px',
                            color: k === q?.correct_ans ? '#34d399' : '#9ca3af',
                          }}>
                            <strong>{k}.</strong> {options[k]}
                            {k === q?.correct_ans && ' ✅'}
                            {k === a.selected_ans && !a.is_correct && ' ❌'}
                          </div>
                        ))}
                      </div>
                      <div style={{
                        background: 'rgba(129,140,248,0.08)',
                        border: '1px solid rgba(129,140,248,0.2)',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        color: '#a5b4fc',
                        lineHeight: 1.6,
                      }}>
                        💡 <strong>Explanation:</strong> {q?.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Email note */}
        <div style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          color: '#a5b4fc',
        }}>
          <Mail size={16} />
          A detailed report with all answers, explanations, and improvement areas has been sent to <strong>{attempt?.email_used}</strong>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            style={{
              padding: '13px 24px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              color: '#e5e7eb',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft size={16} /> Back to Roadmap
          </button>

          <button
            onClick={onRetake}
            title={!canRetake ? `Retake available after ${cooldownDate.toLocaleString()}` : undefined}
            style={{
              padding: '13px 24px',
              background: canRetake
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.05)',
              border: canRetake ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: canRetake ? 'white' : '#4b5563',
              fontWeight: 700,
              cursor: canRetake ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <RotateCcw size={16} />
            {canRetake
              ? `Try Set ${['A', 'B', 'C'][nextSet - 1] || nextSet}`
              : `Retake available ${cooldownDate.toLocaleDateString()} ${cooldownDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}

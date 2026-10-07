import { useState } from 'react';
import { Shield, Clock, AlertTriangle, Mail, ChevronLeft, BookOpen } from 'lucide-react';

interface Props {
  subject: string;
  loading: boolean;
  error: string;
  onStart: (email: string, setNumber: number) => void;
  onBack: () => void;
}

export default function QuizPreflightModal({ subject, loading, error, onStart, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [selectedSet, setSelectedSet] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!agreed) return;
    setEmailError('');
    onStart(email, selectedSet);
  };

  const setDescriptions: Record<number, { label: string; desc: string; color: string }> = {
    1: { label: 'Set A', desc: '52 Questions', color: '#34d399' },
    2: { label: 'Set B', desc: '52 Questions', color: '#f59e0b' },
    3: { label: 'Set C', desc: '52 Questions', color: '#f87171' },
  };

  const rules = [
    { icon: '🖥️', text: 'Test runs in fullscreen — exiting fullscreen twice will auto-submit your test' },
    { icon: '🚫', text: 'Switching tabs or windows is logged as a malpractice event' },
    { icon: '📋', text: 'Copy-paste, right-click, and common keyboard shortcuts are disabled' },
    { icon: '⏱️', text: '15-minute time limit — the test auto-submits when time runs out' },
    { icon: '🔀', text: 'Questions are shuffled randomly on every attempt' },
    { icon: '📧', text: 'A detailed report will be sent to your email after submission' },
    { icon: '🔒', text: 'Your name and session ID are embedded as a watermark on screen' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '680px' }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: '#9ca3af',
            cursor: 'pointer', fontSize: '14px', marginBottom: '24px',
            padding: '0', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e5e7eb')}
          onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
        >
          <ChevronLeft size={16} /> Back to Roadmap
        </button>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '14px',
            backdropFilter: 'blur(10px)',
          }}>
            <Shield size={32} color="white" />
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>
              {subject} Assessment
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>
              Secure Exam Browser — Read the rules before starting
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: <BookOpen size={20} />, value: '52', label: 'Questions' },
            { icon: <Clock size={20} />, value: '15 min', label: 'Time Limit' },
            { icon: <Shield size={20} />, value: '3 Sets', label: 'Available' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#818cf8', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>{s.value}</div>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Set Selection */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h3 style={{ color: '#e5e7eb', margin: '0 0 14px', fontSize: '15px', fontWeight: 600 }}>
            Select Question Set
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[1, 2, 3].map((set) => {
              const info = setDescriptions[set];
              const isSelected = selectedSet === set;
              return (
                <button
                  key={set}
                  onClick={() => setSelectedSet(set)}
                  style={{
                    padding: '14px 12px',
                    borderRadius: '10px',
                    border: `2px solid ${isSelected ? info.color : 'rgba(255,255,255,0.1)'}`,
                    background: isSelected ? `${info.color}18` : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: isSelected ? info.color : '#e5e7eb', fontWeight: 700, fontSize: '15px' }}>
                    {info.label}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px' }}>
                    {info.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Email Input */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h3 style={{ color: '#e5e7eb', margin: '0 0 4px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={16} color="#818cf8" /> Your Email Address
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 12px' }}>
            Your detailed test report with all answers and explanations will be sent here.
          </p>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${emailError ? '#f87171' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          {emailError && (
            <p style={{ color: '#f87171', fontSize: '12px', margin: '6px 0 0' }}>{emailError}</p>
          )}
        </div>

        {/* Rules */}
        <div style={{
          background: 'rgba(251,191,36,0.05)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h3 style={{ color: '#fbbf24', margin: '0 0 14px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> Rules & Anti-Cheat Policy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rules.map((rule, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{rule.icon}</span>
                <span style={{ color: '#d1d5db', fontSize: '13px', lineHeight: 1.5 }}>{rule.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Agreement + CTA */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: '3px', accentColor: '#6366f1', width: '16px', height: '16px', flexShrink: 0 }}
            />
            <span style={{ color: '#d1d5db', fontSize: '13px', lineHeight: 1.5 }}>
              I have read and agree to all the rules above. I understand that malpractice events will be logged and reviewed,
              and that the test will auto-submit if I exit fullscreen twice or the timer runs out.
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!agreed || !email || loading}
          style={{
            width: '100%',
            padding: '16px',
            background: agreed && email && !loading
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '10px',
            color: agreed && email && !loading ? 'white' : '#6b7280',
            fontSize: '16px',
            fontWeight: 700,
            cursor: agreed && email && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '18px', height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              Loading questions...
            </>
          ) : (
            <>
              <Shield size={18} />
              I Agree — Start Test
            </>
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

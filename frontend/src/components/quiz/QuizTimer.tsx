import { useState, useEffect, useRef } from 'react';

interface Props {
  durationSeconds: number;
  onExpire: () => void;
  theme?: 'dark' | 'light';
}

export default function QuizTimer({ durationSeconds, onExpire, theme = 'dark' }: Props) {
  const isDark = theme === 'dark';
  const [remaining, setRemaining] = useState(durationSeconds);
  const expiredRef = useRef(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startRef.current) / 1000);
      const left = durationSeconds - elapsed;
      setRemaining(Math.max(0, left));
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(interval);
        onExpire();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [durationSeconds, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isWarning = remaining <= 120; // red at 2 min
  const isCritical = remaining <= 60;

  const pct = (remaining / durationSeconds) * 100;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: isCritical
        ? 'rgba(248,113,113,0.15)'
        : isWarning
        ? 'rgba(245,158,11,0.15)'
        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      border: `1px solid ${isCritical ? 'rgba(248,113,113,0.4)' : isWarning ? 'rgba(245,158,11,0.3)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      borderRadius: '10px',
      padding: '8px 16px',
      transition: 'all 0.5s',
    }}>
      {/* Circular progress */}
      <svg width="32" height="32" style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
        <circle cx="16" cy="16" r="13" fill="none" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeWidth="2.5"/>
        <circle
          cx="16" cy="16" r="13" fill="none"
          stroke={isCritical ? '#f87171' : isWarning ? '#f59e0b' : '#6366f1'}
          strokeWidth="2.5"
          strokeDasharray={`${2 * Math.PI * 13}`}
          strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s' }}
        />
      </svg>

      <span style={{
        color: isCritical ? '#f87171' : isWarning ? '#f59e0b' : isDark ? '#e5e7eb' : '#1e1b4b',
        fontFamily: 'monospace',
        fontSize: '18px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        transition: 'color 0.5s',
        animation: isCritical ? 'pulse 1s ease infinite' : 'none',
      }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

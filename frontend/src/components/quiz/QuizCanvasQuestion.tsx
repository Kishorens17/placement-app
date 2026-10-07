import { useEffect, useRef, useState } from 'react';
import type { QuizQuestion } from '../../types/quiz';
import type { ShuffledOption } from './QuizPortal';

interface Props {
  question: QuizQuestion;
  shuffledOptions: ShuffledOption[];       // display order, randomized per session
  selectedDisplayKey: string | null;       // which display key (A/B/C/D) is selected
  onSelect: (displayKey: string) => void;  // returns display key
  watermarkText: string;
  theme: 'dark' | 'light';
}

export default function QuizCanvasQuestion({
  question,
  shuffledOptions,
  selectedDisplayKey,
  onSelect,
  watermarkText,
  theme,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(700);
  const [tick, setTick] = useState(0); // for watermark animation

  // Refresh watermark timestamp every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Render question text on canvas (bitmap — OCR-resistant) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !question) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvasWidth;
    const padding = 28;
    const lineHeight = 30;
    const fontSize = 17;
    const maxWidth = w - padding * 2;

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1a1a3e' : '#ffffff';
    const textColor = isDark ? '#f9fafb' : '#111827';
    const wmColor = isDark ? 'rgba(129,140,248,0.18)' : 'rgba(99,102,241,0.12)';

    // Word-wrap
    ctx.font = `${fontSize}px Inter, 'Segoe UI', sans-serif`;
    const words = question.question_text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth) {
        if (current) lines.push(current);
        current = word;
      } else current = test;
    }
    if (current) lines.push(current);

    const totalHeight = padding * 2 + lines.length * lineHeight + 8;
    canvas.width = w * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${totalHeight}px`;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = bgColor;
    ctx.roundRect?.(0, 0, w, totalHeight, 10);
    ctx.fill();

    // ── STRONG diagonal watermark across the entire canvas ──
    const fullWatermark = `${watermarkText} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = wmColor;
    ctx.font = `bold 13px monospace`;
    ctx.translate(w / 2, totalHeight / 2);
    ctx.rotate(-0.35); // ~20 deg diagonal
    const reps = Math.ceil(w / 260) + 2;
    for (let row = -3; row <= 3; row++) {
      for (let col = -reps; col <= reps; col++) {
        ctx.fillText(fullWatermark, col * 260, row * 32);
      }
    }
    ctx.restore();

    // Question text on top
    ctx.font = `${fontSize}px Inter, 'Segoe UI', sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => ctx.fillText(line, padding, padding + i * lineHeight));

    // Subtle pixel noise (makes screenshots less clean for OCR)
    const imageData = ctx.getImageData(0, 0, w * dpr, totalHeight * dpr);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 16) {
      const noise = (Math.random() - 0.5) * (isDark ? 8 : 5);
      d[i] = Math.min(255, Math.max(0, d[i] + noise));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
  }, [question.question_text, watermarkText, canvasWidth, theme, tick]);

  // Resize observer
  useEffect(() => {
    const update = () => {
      const wrapper = canvasRef.current?.parentElement;
      if (wrapper) setCanvasWidth(Math.min(wrapper.clientWidth - 4, 760));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const isDark = theme === 'dark';
  const optColors = {
    selected: { bg: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)', border: '#6366f1', text: isDark ? '#a5b4fc' : '#4338ca', letter: '#6366f1' },
    hover: { bg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)', border: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.15)', text: isDark ? '#e5e7eb' : '#111827', letter: isDark ? '#9ca3af' : '#6b7280' },
    default: { bg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)', border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', text: isDark ? '#d1d5db' : '#374151', letter: isDark ? '#9ca3af' : '#9ca3af' },
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Canvas question box */}
      <div style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)'}`,
        borderRadius: 14, padding: 4, marginBottom: 18, overflow: 'hidden',
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', borderRadius: 10 }}
          onContextMenu={e => e.preventDefault()}
        />
      </div>

      {/* Shuffled options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shuffledOptions.map(({ displayKey, text }) => {
          const isSelected = selectedDisplayKey === displayKey;
          const isHovered = hoveredOption === displayKey;
          const colors = isSelected ? optColors.selected : isHovered ? optColors.hover : optColors.default;

          return (
            <button
              key={displayKey}
              onClick={() => onSelect(displayKey)}
              onMouseEnter={() => setHoveredOption(displayKey)}
              onMouseLeave={() => setHoveredOption(null)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 18px',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left', userSelect: 'none',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: isSelected ? 'rgba(99,102,241,0.25)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: colors.letter, transition: 'all 0.15s',
              }}>
                {displayKey}
              </div>
              <span style={{ color: colors.text, fontSize: 14, lineHeight: 1.5, fontWeight: isSelected ? 600 : 400, flex: 1 }}>
                {text}
              </span>
              {isSelected && (
                <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

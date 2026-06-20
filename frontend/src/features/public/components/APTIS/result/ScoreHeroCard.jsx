import React, { useEffect, useState } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';

/* ─── Color configs per skill ─── */
const COLOR_MAP = {
  emerald: { ring: '#10b981', ringTrack: '#d1fae5', accent: 'text-emerald-500', bg: 'from-emerald-50 to-white' },
  blue:    { ring: '#3b82f6', ringTrack: '#dbeafe', accent: 'text-blue-500',    bg: 'from-blue-50 to-white' },
  orange:  { ring: '#f97316', ringTrack: '#ffedd5', accent: 'text-orange-500',  bg: 'from-orange-50 to-white' },
  purple:  { ring: '#a855f7', ringTrack: '#f3e8ff', accent: 'text-purple-500',  bg: 'from-purple-50 to-white' },
  indigo:  { ring: '#6366f1', ringTrack: '#e0e7ff', accent: 'text-indigo-500',  bg: 'from-indigo-50 to-white' },
};

const CEFR_COLORS = {
  C2: '#059669', C1: '#10b981', C: '#10b981',
  B2: '#3b82f6', B1: '#60a5fa', B: '#3b82f6',
  A2: '#f59e0b', A1: '#fbbf24', A: '#f59e0b',
  'Below A1': '#94a3b8',
};

const getEncouragingMessage = (ratio) => {
  if (ratio >= 0.9) return '🎉 Outstanding! You nailed it!';
  if (ratio >= 0.7) return '💪 Great job! Keep it up!';
  if (ratio >= 0.5) return '👍 Good effort! Room to grow!';
  return '📚 Keep practicing, you\'ll get there!';
};

/* ─── Animated Score Ring (SVG) ─── */
const ScoreRing = ({ score, maxScore, color, size = 120 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = animatedScore / maxScore;
  const offset = circumference - ratio * circumference;

  useEffect(() => {
    let frame;
    const duration = 1200;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color.ringTrack} strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color.ring} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-800 leading-none">{animatedScore}</span>
        <span className="text-xs text-slate-400 font-semibold mt-0.5">/ {maxScore}</span>
      </div>
    </div>
  );
};

/* ─── CEFR Badge ─── */
const CefrBadge = ({ level, isGraded = true }) => {
  const color = CEFR_COLORS[level] || '#94a3b8';
  if (!isGraded) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-slate-100 border-[3px] border-slate-200">
          <span className="text-2xl font-black text-slate-300">?</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center shadow-inner border-[3px]"
        style={{ backgroundColor: `${color}12`, borderColor: color }}
      >
        <span className="text-2xl font-black" style={{ color }}>{level}</span>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CEFR Level</span>
    </div>
  );
};

/* ─── Main Component ─── */
const ScoreHeroCard = ({
  score,
  maxScore = 50,
  cefrLevel,
  correctCount,
  totalQuestions,
  submitDate,
  skillColor = 'blue',
  isGraded = true,
  scoreLabel = 'Aptis Score',
}) => {
  const colors = COLOR_MAP[skillColor] || COLOR_MAP.blue;
  const ratio = totalQuestions > 0 ? correctCount / totalQuestions : 0;

  return (
    <div className={`rounded-3xl bg-gradient-to-br ${colors.bg} border border-slate-200 shadow-sm overflow-hidden mb-6`}>
      <div className="px-8 py-8">
        {/* Top row: Score ring + CEFR + Stats */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {/* Score Ring */}
          <div className="flex flex-col items-center gap-2">
            <ScoreRing score={isGraded ? score : 0} maxScore={maxScore} color={colors} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{scoreLabel}</span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-24 bg-slate-200" />

          {/* CEFR Level */}
          {cefrLevel !== undefined && (
            <>
              <CefrBadge level={cefrLevel} isGraded={isGraded} />
              {correctCount !== undefined && <div className="hidden md:block w-px h-24 bg-slate-200" />}
            </>
          )}

          {/* Correct Answers */}
          {correctCount !== undefined && totalQuestions !== undefined && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-center">
                <div className="text-3xl font-black text-slate-800 leading-none">
                  {correctCount}<span className="text-lg text-slate-400 font-bold"> / {totalQuestions}</span>
                </div>
                <div className="text-sm text-slate-500 font-medium mt-1.5">{getEncouragingMessage(ratio)}</div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct Answers</span>
            </div>
          )}
        </div>

        {/* Bottom: Submit date */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
          <ClockCircleOutlined />
          <span>Submitted: <strong className="text-slate-600">{submitDate}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ScoreHeroCard;

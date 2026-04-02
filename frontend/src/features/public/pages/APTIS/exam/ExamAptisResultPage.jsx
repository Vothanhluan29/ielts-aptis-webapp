import React from 'react';
import { Spin } from 'antd';
import { ClipboardList, BookOpen, Headphones, PenTool, Mic, ArrowLeft, Clock, Award, Info } from 'lucide-react';

// Nhúng Custom Hook vào
import { useExamAptisResult } from '../../../hooks/APTIS/exam/useExamAptisResult';

const SKILL_THEMES = {
  GRAMMAR:   { label: 'Grammar & Vocab', color: '#059669', bg: '#ecfdf5', icon: ClipboardList },
  READING:   { label: 'Reading',         color: '#ea580c', bg: '#fff7ed', icon: BookOpen },
  LISTENING: { label: 'Listening',       color: '#2563eb', bg: '#eff6ff', icon: Headphones },
  WRITING:   { label: 'Writing',         color: '#9333ea', bg: '#faf5ff', icon: PenTool },
  SPEAKING:  { label: 'Speaking',        color: '#e11d48', bg: '#fff1f2', icon: Mic },
};

const CEFR_COLORS = {
  A0: '#94a3b8', A1: '#60a5fa', A2: '#3b82f6',
  B1: '#22c55e', B2: '#16a34a', C: '#f59e0b',
};

const Ring = ({ percent, color, size = 80, stroke = 7 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }} />
    </svg>
  );
};

const SkillCard = ({ theme, score, maxScore, isPending }) => {
  const Icon = theme.icon;
  const pct = isPending ? 0 : Math.round(((score || 0) / maxScore) * 100);
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: '20px 22px',
      display: 'flex', alignItems: 'center',
      gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.11)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Ring percent={pct} color={isPending ? '#e2e8f0' : theme.color} size={68} stroke={6} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: theme.bg, borderRadius: '50%', margin: 6,
        }}>
          <Icon size={18} color={isPending ? '#94a3b8' : theme.color} />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
          {theme.label}
        </div>
        {isPending ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', fontWeight: 700, fontSize: 13 }}>
            <Clock size={13} /> Awaiting review
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: theme.color, lineHeight: 1 }}>{score || 0}</span>
            <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 700 }}>/ {maxScore}</span>
          </div>
        )}
        <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4, width: `${pct}%`,
            background: isPending ? '#e2e8f0' : theme.color,
            transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
          }} />
        </div>
      </div>

      <div style={{
        fontSize: 13, fontWeight: 800, color: isPending ? '#cbd5e1' : theme.color,
        background: isPending ? '#f8fafc' : theme.bg,
        borderRadius: 10, padding: '4px 10px', flexShrink: 0,
      }}>
        {isPending ? '—' : `${pct}%`}
      </div>
    </div>
  );
};

const ExamAptisResultPage = () => {
  // 🔥 Lấy Data và Logic từ Hook
  const { loading, resultData, computedData, handleGoBack } = useExamAptisResult();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: 16 }}>
      <Spin size="large" />
      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Calculating your scores...</span>
    </div>
  );

  if (!resultData || !computedData) return null;

  const { showFinal, skills } = computedData;
  const cefrColor = CEFR_COLORS[resultData.overall_cefr_level?.toUpperCase()] || '#6366f1';

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={handleGoBack} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            border: '1px solid #e2e8f0', background: '#f8fafc',
            color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            <ArrowLeft size={14} /> Test List
          </button>

          <div style={{ width: 1, height: 20, background: '#a5b4fc', flexShrink: 0 }} />

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            background: '#eef2ff', border: '1px solid #a5b4fc',
            color: '#4f46e5', fontWeight: 700, fontSize: 13,
          }}>
            <ClipboardList size={14} />
            FULL MOCK TEST
          </div>

          <span style={{
            fontSize: 16, fontWeight: 700, color: '#1e293b',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {resultData.full_test?.title || 'Aptis Assessment Result'}
          </span>
        </div>

        {/* Hero Card */}
        <div style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 8px 40px rgba(79,70,229,0.13)', marginBottom: 24, background: 'linear-gradient(135deg,#4f46e5,#6366f1)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: 180, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', padding: '22px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Certification</div>
              
              {showFinal ? (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: cefrColor, borderRadius: 14, padding: '10px 20px', width: 'fit-content' }}>
                    <Award size={20} color="#fff" />
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>
                      {resultData.overall_cefr_level || '?'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>CEFR Level · 5 skills · 250 pts</div>
                </>
              ) : (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 12, padding: '8px 16px', width: 'fit-content' }}>
                    <Clock size={15} color="#fcd34d" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#fcd34d' }}>Pending</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Writing & Speaking under review</div>
                </>
              )}
            </div>

            <div style={{ flex: '0 1 190px', padding: '22px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 6 }}>Overall Score</div>
              {showFinal ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 58, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{resultData.overall_score || 0}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>/250</span>
                </div>
              ) : (
                <span style={{ fontSize: 42, fontWeight: 900, color: 'rgba(255,255,255,0.2)' }}>—</span>
              )}
            </div>
          </div>
        </div>

        {/* Warning */}
        {!showFinal && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Clock size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
              Some sections are awaiting teacher review. Your overall score will be updated once all skills are graded.
            </span>
          </div>
        )}

        {/* Skills Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
          {skills.map(s => (
            <SkillCard key={s.key} theme={SKILL_THEMES[s.key]} score={s.score} maxScore={s.max} isPending={s.pending} />
          ))}
        </div>

        {/* UI "What happens next?" cho Student */}
        {!showFinal && (
          <div style={{ 
            marginTop: 24, 
            padding: '20px', 
            background: '#f8fafc', 
            borderRadius: 16, 
            border: '2px dashed #cbd5e1', 
            display: 'flex', 
            gap: 16, 
            alignItems: 'center' 
          }}>
            <div style={{ background: '#e0e7ff', padding: 12, borderRadius: '50%', flexShrink: 0 }}>
              <Info size={24} color="#4f46e5" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                What happens next?
              </div>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                Our certified teachers have received your Writing and Speaking responses. 
                Please check back later for your complete CEFR certification!
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExamAptisResultPage;
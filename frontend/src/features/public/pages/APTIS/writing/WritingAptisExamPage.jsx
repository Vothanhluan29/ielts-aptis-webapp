import React from 'react';
import { createPortal } from 'react-dom';
import { Clock, PenLine, ChevronLeft, ChevronRight, Send, MessageSquare, Mail, AlignLeft, Info } from 'lucide-react';
import { useWritingAptisExam } from '../../../hooks/APTIS/writing/useWritingAptisExam';
import { usePreventNavigation } from '../../../hooks/usePreventNavigation';

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS — đồng nhất với Reading / Listening / Grammar
───────────────────────────────────────────────────────── */
const T = {
  bg:                '#F5F6FA',
  surface:           '#FFFFFF',
  border:            '#E5E7EB',
  borderMid:         '#D1D5DB',
  navy:              '#1E3A8A',
  navyLight:         '#EFF4FF',
  navyBorder:        '#BFDBFE',
  textPrimary:       '#111827',
  textSecondary:     '#6B7280',
  textMuted:         '#9CA3AF',
  timerUrgent:       '#DC2626',
  timerUrgentBg:     '#FEF2F2',
  timerUrgentBorder: '#FCA5A5',
};

/* ─────────────────────────────────────────────────────────
   WORD COUNT HELPER
───────────────────────────────────────────────────────── */
const WordCountBar = ({ current, min, max }) => {
  const inRange = min && max && current >= min && current <= max;
  const hasContent = current > 0;
  const pct = max ? Math.min(100, (current / max) * 100) : 0;
  const color = inRange ? '#16A34A' : hasContent ? '#D97706' : T.textMuted;

  return (
    <div style={{ marginTop: 8 }}>
      {max && (
        <div style={{ height: 4, borderRadius: 99, background: T.border, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', borderRadius: 99, background: color, width: `${pct}%`, transition: 'all 0.3s' }} />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12, fontWeight: 600, color }}>
        {current} word{current !== 1 ? 's' : ''}{max ? ` / ${max}` : ''}
        {min && max && ` (target: ${min}–${max})`}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   SHARED STYLES
───────────────────────────────────────────────────────── */
const textareaStyle = {
  width: '100%', borderRadius: 8, border: `1.5px solid ${T.borderMid}`,
  padding: '12px 14px', fontSize: 14, lineHeight: 1.7, color: T.textPrimary,
  background: '#FAFAFA', resize: 'vertical', outline: 'none',
  fontFamily: "'Inter', -apple-system, sans-serif",
  transition: 'border-color 0.2s, background 0.2s',
};

const inputStyle = {
  width: '100%', height: 40, borderRadius: 8, border: `1.5px solid ${T.borderMid}`,
  padding: '0 12px', fontSize: 14, color: T.textPrimary,
  background: '#FAFAFA', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Inter', -apple-system, sans-serif",
  transition: 'border-color 0.2s, background 0.2s',
};

const instrBanner = (text) => (
  <div style={{
    background: T.navyLight, borderLeft: `3px solid ${T.navy}`,
    borderRadius: 8, padding: '12px 16px', marginBottom: 20,
    fontSize: 14, color: T.navy, fontWeight: 500, whiteSpace: 'pre-wrap',
    display: 'flex', alignItems: 'flex-start', gap: 10
  }}>
    <Info size={16} color={T.navy} style={{ marginTop: 2, flexShrink: 0 }} />
    <span>{text}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const WritingAptisExamPage = ({ isFullTest = false, testIdFromProps = null, onSkillFinish = null }) => {
  const {
    loading, submitting, testDetail, currentPart, setCurrentPart, timeLeft,
    answers, updateAnswer, confirmSubmit, formatTime, countWords,
    getPart, getQuestionText, isTimeRunningOut
  } = useWritingAptisExam({ isFullTest, testIdFromProps, onSkillFinish });

  usePreventNavigation(!isFullTest && !submitting, '/aptis/writing');

  /* ── Timer widget ── */
  const TimerWidget = ({ compact = false }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: compact ? '4px 11px' : '5px 13px',
      borderRadius: 7,
      background: isTimeRunningOut ? T.timerUrgentBg : 'transparent',
      border: `1.5px solid ${isTimeRunningOut ? T.timerUrgentBorder : T.borderMid}`,
      color: isTimeRunningOut ? T.timerUrgent : T.textPrimary,
      fontWeight: 700,
      fontSize: compact ? 14 : 16,
      fontFamily: "'Inter', sans-serif",
      transition: 'all 0.3s',
    }}>
      <Clock size={compact ? 14 : 15} />
      {formatTime(timeLeft)}
    </div>
  );

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: `3px solid ${T.navy}`, borderTopColor: 'transparent',
          animation: 'aptis-spin 0.8s linear infinite', margin: '0 auto 14px'
        }} />
        <p style={{ color: T.textMuted, margin: 0, fontSize: 14 }}>Loading test...</p>
      </div>
      <style>{`@keyframes aptis-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const p1 = getPart(1), p2 = getPart(2), p3 = getPart(3), p4 = getPart(4);

  // Labels for the tab navigation
  const PART_LABELS = ['Word-level', 'Short Text', '3 Responses', 'Formal & Informal'];

  return (
    <div style={{
      height: isFullTest ? 'calc(100vh - 64px)' : '100vh',
      background: T.bg, display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden',
    }}>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      {!isFullTest ? (
        <div style={{
          height: 54, background: T.surface, borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: T.navy, color: '#fff',
              padding: '3px 9px', borderRadius: 5, fontWeight: 700, fontSize: 11,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <PenLine size={11} />
              Writing
            </div>
            {testDetail?.title && <span style={{ fontSize: 13, color: T.textSecondary, fontWeight: 500 }}>{testDetail.title}</span>}
          </div>
          <TimerWidget />
        </div>
      ) : document.getElementById('aptis-timer-portal') ? (
        createPortal(<TimerWidget compact />, document.getElementById('aptis-timer-portal'))
      ) : null}

      {/* ═══════════════ TAB UNDERLINE NAVIGATION ═══════════════ */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, width: '100%' }}>
          {[1, 2, 3, 4].map((n, idx) => {
            const active = currentPart === n;
            return (
              <button
                key={n}
                onClick={() => setCurrentPart(n)}
                style={{
                  padding: '14px 22px 12px',
                  border: 'none',
                  borderBottom: active ? `2px solid ${T.navy}` : '2px solid transparent',
                  background: 'transparent',
                  color: active ? T.navy : T.textSecondary,
                  fontWeight: active ? 700 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  lineHeight: 1,
                  marginBottom: -1,
                  outline: 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = T.textPrimary; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = T.textSecondary; }}
              >
                Part {n} — {PART_LABELS[idx]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="custom-scrollbar">
        <div style={{ width: '100%', margin: '0 auto' }}>

          {/* ─── PART 1: Word-level ─── */}
          {currentPart === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <MessageSquare size={18} color={T.navy} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
                  Part 1 — Word-level Writing
                </h2>
              </div>
              {instrBanner(p1.instruction || 'You are joining a club. You have 5 messages from a member of the club. Write short answers (1 to 5 words) to each message.')}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx} style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    {/* Sender bubble */}
                    <div style={{ background: '#FAFAFA', padding: '12px 16px', borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.navyLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: T.navy }}>
                          M{idx + 1}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message {idx + 1}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: T.textPrimary, fontWeight: 500, lineHeight: 1.5 }}>
                        {getQuestionText(p1, idx, `Question ${idx + 1}?`)}
                      </p>
                    </div>
                    {/* Reply input */}
                    <div style={{ padding: '16px' }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                        Your reply (1–5 words)
                      </label>
                      <input
                        type="text"
                        className="navy-focus"
                        style={inputStyle}
                        placeholder="Type here..."
                        value={answers.part_1[idx] || ''}
                        onChange={(e) => updateAnswer('part_1', idx, e.target.value)}
                        disabled={submitting}
                      />
                      <WordCountBar current={countWords(answers.part_1[idx] || '')} min={1} max={5} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PART 2: Short text ─── */}
          {currentPart === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlignLeft size={18} color={T.navy} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
                  Part 2 — Short Text Writing
                </h2>
              </div>
              {instrBanner(p2.instruction || 'You are a new member of the club. Fill in the form. Write in sentences. Use 20–30 words.')}
              <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p style={{ margin: '0 0 16px', fontSize: 15, color: T.textPrimary, fontWeight: 600, lineHeight: 1.6 }}>
                  {getQuestionText(p2, 0, 'Please tell us why you are interested in joining this club.')}
                </p>
                <textarea
                  className="navy-focus"
                  rows={8}
                  style={{ ...textareaStyle }}
                  placeholder="Start typing your response here..."
                  value={answers.part_2 || ''}
                  onChange={(e) => updateAnswer('part_2', null, e.target.value)}
                  disabled={submitting}
                />
                <WordCountBar current={countWords(answers.part_2)} min={20} max={30} />
              </div>
            </div>
          )}

          {/* ─── PART 3: Chat responses ─── */}
          {currentPart === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <MessageSquare size={18} color={T.navy} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
                  Part 3 — Three Written Responses
                </h2>
              </div>
              {instrBanner(p3.instruction || 'You are talking to other members of the club in the chat room. Talk to them using sentences. Use 30–40 words per answer.')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {[0, 1, 2].map((idx) => (
                  <div key={idx} style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    {/* Incoming message bubble */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: T.textSecondary, flexShrink: 0 }}>
                        M{idx + 1}
                      </div>
                      <div style={{ background: '#F3F4F6', borderRadius: '12px 12px 12px 4px', padding: '12px 16px', flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                          {getQuestionText(p3, idx, `Message ${idx + 1} from a member.`)}
                        </p>
                      </div>
                    </div>
                    {/* Reply box */}
                    <div style={{ marginLeft: 44 }}>
                      <textarea
                        className="navy-focus"
                        rows={4}
                        style={{ ...textareaStyle }}
                        placeholder={`Reply to this message... (30–40 words)`}
                        value={answers.part_3[idx] || ''}
                        onChange={(e) => updateAnswer('part_3', idx, e.target.value)}
                        disabled={submitting}
                      />
                      <WordCountBar current={countWords(answers.part_3[idx])} min={30} max={40} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PART 4: Formal + Informal ─── */}
          {currentPart === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Mail size={18} color={T.navy} />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
                  Part 4 — Formal and Informal Writing
                </h2>
              </div>
              {instrBanner(p4.instruction || 'You are a member of a club. You received an email from the club manager. Read the email and write two responses.')}

              {/* Email to read */}
              <div style={{
                background: '#F9FAFB', border: `1px solid ${T.borderMid}`, borderRadius: 10,
                padding: '20px', marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                  <Mail size={15} color={T.textSecondary} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email to read</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#4B5563', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {getQuestionText(p4, 0, 'Dear Members,\n\nWe are writing to inform you that the upcoming club event will be cancelled due to bad weather. We apologize for the inconvenience.\n\nBest regards,\nThe Manager')}
                </p>
              </div>

              {/* Two writing boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                {/* Informal */}
                <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ background: '#FAFAFA', padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Task A — Informal (~50 words)
                    </span>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: T.textSecondary }}>
                      {getQuestionText(p4, 1, 'Write to a friend about this email.')}
                    </p>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <textarea
                      className="navy-focus"
                      rows={8}
                      style={textareaStyle}
                      placeholder="Dear [friend's name],..."
                      value={answers.part_4?.informal || ''}
                      onChange={(e) => updateAnswer('part_4', null, e.target.value, 'informal')}
                      disabled={submitting}
                    />
                    <WordCountBar current={countWords(answers.part_4?.informal)} min={null} max={50} />
                  </div>
                </div>

                {/* Formal */}
                <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ background: '#FAFAFA', padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Task B — Formal (120–150 words)
                    </span>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: T.textSecondary }}>
                      {getQuestionText(p4, 2, 'Write a formal reply to the manager.')}
                    </p>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <textarea
                      className="navy-focus"
                      rows={8}
                      style={textareaStyle}
                      placeholder="Dear Manager,..."
                      value={answers.part_4?.formal || ''}
                      onChange={(e) => updateAnswer('part_4', null, e.target.value, 'formal')}
                      disabled={submitting}
                    />
                    <WordCountBar current={countWords(answers.part_4?.formal)} min={120} max={150} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <div style={{
        height: 60, background: T.surface, borderTop: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', flexShrink: 0,
      }}>
        <button
          onClick={() => setCurrentPart(p => p - 1)}
          disabled={currentPart === 1 || submitting}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 16px', borderRadius: 7, border: `1.5px solid ${currentPart === 1 ? T.border : T.borderMid}`, background: T.surface,
            color: currentPart === 1 ? T.textMuted : T.textSecondary,
            fontWeight: 600, fontSize: 13, cursor: currentPart === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <ChevronLeft size={15} /> Previous
        </button>

        <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>
          Part {currentPart} of 4
        </div>

        {currentPart < 4 ? (
          <button
            onClick={() => setCurrentPart(p => p + 1)}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 16px', borderRadius: 7, border: 'none', background: T.textPrimary,
              color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={confirmSubmit}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 20px', borderRadius: 7, border: 'none',
              background: submitting ? '#93C5FD' : T.navy,
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : '0 2px 8px rgba(30,58,138,0.25)',
              transition: 'all 0.15s'
            }}
          >
            {submitting
              ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'aptis-spin 0.8s linear infinite' }} /> Submitting...</>
              : <><Send size={14} /> {isFullTest ? 'Submit & Go to Speaking' : 'Submit Test'}</>
            }
          </button>
        )}
      </div>

      <style>{`
        @keyframes aptis-spin { to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .navy-focus:focus { border-color: ${T.navy} !important; background: #FFFFFF !important; box-shadow: 0 0 0 2px ${T.navyLight}; }
      `}</style>
    </div>
  );
};

export default WritingAptisExamPage;
import React from 'react';
import { Clock, PenLine, ChevronLeft, ChevronRight, Send, MessageSquare, Mail, AlignLeft } from 'lucide-react';
import { useWritingAptisExam } from '../../../hooks/APTIS/writing/useWritingAptisExam';

/* ─────────────────────────────────────────────────────────
   WORD COUNT HELPER
───────────────────────────────────────────────────────── */
const WordCountBar = ({ current, min, max }) => {
  const inRange = min && max && current >= min && current <= max;
  const hasContent = current > 0;
  const pct = max ? Math.min(100, (current / max) * 100) : 0;
  const color = inRange ? '#16a34a' : hasContent ? '#d97706' : '#94a3b8';

  return (
    <div style={{ marginTop: 8 }}>
      {max && (
        <div style={{ height: 4, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ height: '100%', borderRadius: 99, background: color, width: `${pct}%`, transition: 'all 0.3s' }} />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12, fontWeight: 700, color }}>
        {current} word{current !== 1 ? 's' : ''}{max ? ` / ${max}` : ''}
        {min && max && ` (target: ${min}–${max})`}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   PART STEPS INDICATOR
───────────────────────────────────────────────────────── */
const PART_LABELS = ['Word-level', 'Short Text', '3 Responses', 'Formal + Informal'];
const PartSteps = ({ currentPart, setCurrentPart }) => (
  <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
    {/* Connector line */}
    <div style={{ position: 'absolute', top: 18, left: '12%', right: '12%', height: 2, background: '#e2e8f0', zIndex: 0 }} />
    {[1, 2, 3, 4].map((n, idx) => {
      const active = currentPart === n;
      const done = currentPart > n;
      return (
        <button
          key={n}
          onClick={() => setCurrentPart(n)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer', position: 'relative', zIndex: 1,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14,
            background: active ? '#7c3aed' : done ? '#ddd6fe' : '#f1f5f9',
            color: active ? '#fff' : done ? '#7c3aed' : '#94a3b8',
            border: `2px solid ${active ? '#7c3aed' : done ? '#c4b5fd' : '#e2e8f0'}`,
            boxShadow: active ? '0 2px 8px rgba(124,58,237,0.35)' : 'none',
            transition: 'all 0.2s',
          }}>
            {done ? '✓' : n}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#7c3aed' : '#94a3b8', whiteSpace: 'nowrap' }}>
            Part {n}
          </span>
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────────────────────
   SHARED STYLES
───────────────────────────────────────────────────────── */
const textareaStyle = {
  width: '100%', borderRadius: 10, border: '1.5px solid #e2e8f0',
  padding: '12px 14px', fontSize: 14, lineHeight: 1.7, color: '#374151',
  background: '#fafbff', resize: 'vertical', outline: 'none',
  fontFamily: "'Inter', -apple-system, sans-serif",
  transition: 'border-color 0.2s, background 0.2s',
};

const inputStyle = {
  width: '100%', height: 40, borderRadius: 8, border: '1.5px solid #e2e8f0',
  padding: '0 12px', fontSize: 14, color: '#374151',
  background: '#fafbff', outline: 'none', boxSizing: 'border-box',
};

const instrBanner = (text) => (
  <div style={{
    background: '#faf5ff', border: '1px solid #e9d5ff', borderLeft: '3px solid #7c3aed',
    borderRadius: 10, padding: '12px 16px', marginBottom: 20,
    fontSize: 14, color: '#581c87', fontWeight: 500, whiteSpace: 'pre-wrap',
  }}>
    {text}
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #7c3aed', borderTopColor: 'transparent', animation: 'aptis-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8', margin: 0 }}>Loading test...</p>
      </div>
      <style>{`@keyframes aptis-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const p1 = getPart(1), p2 = getPart(2), p3 = getPart(3), p4 = getPart(4);

  return (
    <div style={{
      height: isFullTest ? 'calc(100vh - 64px)' : '100vh',
      background: '#f0f4f8', display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden',
    }}>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      <div style={{
        height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#faf5ff', color: '#7c3aed',
            padding: '4px 10px', borderRadius: 6, fontWeight: 700, fontSize: 12,
          }}>
            <PenLine size={13} />
            {isFullTest ? 'Writing' : 'Writing Test'}
          </div>
          {testDetail?.title && <span style={{ fontSize: 13, color: '#64748b' }}>{testDetail.title}</span>}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 8, fontWeight: 700, fontSize: 16,
          background: isTimeRunningOut ? '#fef2f2' : '#faf5ff',
          color: isTimeRunningOut ? '#dc2626' : '#7c3aed',
          border: `1.5px solid ${isTimeRunningOut ? '#fca5a5' : '#e9d5ff'}`,
        }}>
          <Clock size={16} /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* ═══════════════ STEP INDICATOR ═══════════════ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '14px 24px', flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <PartSteps currentPart={currentPart} setCurrentPart={setCurrentPart} />
        </div>
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }} className="custom-scrollbar">
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* ─── PART 1: Word-level ─── */}
          {currentPart === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <MessageSquare size={18} color="#7c3aed" />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                  Part 1 — Word-level Writing
                </h2>
              </div>
              {instrBanner(p1.instruction || 'You are joining a club. You have 5 messages from a member of the club. Write short answers (1 to 5 words) to each message.')}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {/* Sender bubble */}
                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#7c3aed' }}>
                          M{idx + 1}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message {idx + 1}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: '#374151', fontWeight: 500, lineHeight: 1.5 }}>
                        {getQuestionText(p1, idx, `Question ${idx + 1}?`)}
                      </p>
                    </div>
                    {/* Reply input */}
                    <div style={{ padding: '12px 16px' }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                        Your reply (1–5 words)
                      </label>
                      <input
                        type="text"
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
                <AlignLeft size={18} color="#7c3aed" />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                  Part 2 — Short Text Writing
                </h2>
              </div>
              {instrBanner(p2.instruction || 'You are a new member of the club. Fill in the form. Write in sentences. Use 20–30 words.')}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '24px' }}>
                <p style={{ margin: '0 0 16px', fontSize: 15, color: '#1e293b', fontWeight: 600, lineHeight: 1.6 }}>
                  {getQuestionText(p2, 0, 'Please tell us why you are interested in joining this club.')}
                </p>
                <textarea
                  rows={7}
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
                <MessageSquare size={18} color="#7c3aed" />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                  Part 3 — Three Written Responses
                </h2>
              </div>
              {instrBanner(p3.instruction || 'You are talking to other members of the club in the chat room. Talk to them using sentences. Use 30–40 words per answer.')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[0, 1, 2].map((idx) => (
                  <div key={idx} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px' }}>
                    {/* Incoming message bubble */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#6b7280', flexShrink: 0 }}>
                        M{idx + 1}
                      </div>
                      <div style={{ background: '#f3f4f6', borderRadius: '12px 12px 12px 4px', padding: '12px 16px', maxWidth: '85%' }}>
                        <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                          {getQuestionText(p3, idx, `Message ${idx + 1} from a member.`)}
                        </p>
                      </div>
                    </div>
                    {/* Reply box */}
                    <div style={{ marginLeft: 48 }}>
                      <textarea
                        rows={3}
                        style={{ ...textareaStyle, background: '#faf5ff', borderColor: '#e9d5ff' }}
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
                <Mail size={18} color="#7c3aed" />
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                  Part 4 — Formal and Informal Writing
                </h2>
              </div>
              {instrBanner(p4.instruction || 'You are a member of a club. You received an email from the club manager. Read the email and write two responses.')}

              {/* Email to read */}
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12,
                padding: '20px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #fde68a' }}>
                  <Mail size={15} color="#92400e" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email to read</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#78350f', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {getQuestionText(p4, 0, 'Dear Members,\n\nWe are writing to inform you that the upcoming club event will be cancelled due to bad weather. We apologize for the inconvenience.\n\nBest regards,\nThe Manager')}
                </p>
              </div>

              {/* Two writing boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Informal */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ background: '#faf5ff', padding: '12px 16px', borderBottom: '1px solid #e9d5ff' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Task A — Informal (~50 words)
                    </span>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>
                      {getQuestionText(p4, 1, 'Write to a friend about this email.')}
                    </p>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <textarea
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
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ background: '#faf5ff', padding: '12px 16px', borderBottom: '1px solid #e9d5ff' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Task B — Formal (120–150 words)
                    </span>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>
                      {getQuestionText(p4, 2, 'Write a formal reply to the manager.')}
                    </p>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <textarea
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
        height: 64, background: '#fff', borderTop: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', flexShrink: 0,
      }}>
        <button
          onClick={() => setCurrentPart(p => p - 1)}
          disabled={currentPart === 1 || submitting}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff',
            color: currentPart === 1 ? '#cbd5e1' : '#475569',
            fontWeight: 600, fontSize: 14, cursor: currentPart === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: currentPart === n ? '#7c3aed' : currentPart > n ? '#c4b5fd' : '#cbd5e1',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        {currentPart < 4 ? (
          <button
            onClick={() => setCurrentPart(p => p + 1)}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8, border: 'none', background: '#1e293b',
              color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={confirmSubmit}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 22px', borderRadius: 8, border: 'none',
              background: submitting ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
            }}
          >
            {submitting
              ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'aptis-spin 0.8s linear infinite' }} /> Submitting...</>
              : <><Send size={15} /> {isFullTest ? 'Submit & Go to Speaking' : 'Submit Test'}</>
            }
          </button>
        )}
      </div>

      <style>{`
        @keyframes aptis-spin { to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        textarea:focus { border-color: #7c3aed !important; background: #fff !important; }
        input:focus { border-color: #7c3aed !important; background: #fff !important; }
      `}</style>
    </div>
  );
};

export default WritingAptisExamPage;
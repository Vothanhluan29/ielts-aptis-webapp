import React from 'react';
import { createPortal } from 'react-dom';
import {
  Clock, BookOpen, ChevronLeft, ChevronRight, Send,
  FileText, CheckCircle2, AlertCircle, BookOpenCheck
} from 'lucide-react';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion';
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion';
import ReorderQuestion from '../../../components/APTIS/ExamForms/ReorderQuestion';
import FillInBlankQuestion from '../../../components/APTIS/ExamForms/FillInBlankQuestion';
import { useReadingAptisExam } from '../../../hooks/APTIS/reading/useReadingAptisExam';
import { usePreventNavigation } from '../../../hooks/usePreventNavigation';

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────── */
const T = {
  bg:           '#F5F6FA',
  surface:      '#FFFFFF',
  border:       '#E5E7EB',
  borderMid:    '#D1D5DB',
  navy:         '#1E3A8A',
  navyLight:    '#EFF4FF',
  navyBorder:   '#BFDBFE',
  textPrimary:  '#111827',
  textSecondary:'#6B7280',
  textMuted:    '#9CA3AF',
  timerUrgent:  '#DC2626',
  timerUrgentBg:'#FEF2F2',
  timerUrgentBorder:'#FCA5A5',
};

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const getTrueQuestionCount = (groups) => {
  if (!groups?.length) return 0;
  return groups.reduce((acc, g) =>
    acc + (g.questions || []).reduce((s, q) => {
      if (q.question_type === 'REORDER_SENTENCES') {
        const n = Array.isArray(q.options) ? q.options.length : 0;
        return s + (n > 0 ? n : 1);
      }
      return s + 1;
    }, 0), 0);
};

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const ReadingAptisExamPage = ({
  isFullTest = false,
  testIdFromProps = null,
  onSkillFinish = null
}) => {
  const {
    loading, submitting, testDetail,
    currentPartId, setCurrentPartId, timeLeft,
    answers, parts, activePart, currentTabIndex,
    hasReadingPassage, isTimeRunningOut,
    handleAnswerChange, confirmSubmit, formatTime, handleGoBackEmpty
  } = useReadingAptisExam({ isFullTest, testIdFromProps, onSkillFinish });

  usePreventNavigation(!isFullTest && !submitting, '/aptis/reading');

  /* ── Dynamic question numbering ── */
  const renderQuestionsList = (groups) => {
    if (!groups?.length) return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: T.textMuted, fontSize: 14 }}>
        No questions in this section.
      </div>
    );

    let globalQNum = 1;
    const currentPartIndex = parts.findIndex(p => p.id === currentPartId);
    for (let i = 0; i < currentPartIndex; i++) {
      parts[i].groups?.forEach(g => {
        (g.questions || []).forEach(q => {
          globalQNum += q.question_type === 'REORDER_SENTENCES'
            ? (Array.isArray(q.options) ? q.options.length || 1 : 1)
            : 1;
        });
      });
    }

    return groups.map((group) => (
      <div key={group.id} style={{ marginBottom: 8 }}>
        {!hasReadingPassage && group.instruction && (
          <div style={{
            fontSize: 13, color: T.textSecondary,
            fontStyle: 'italic', marginBottom: 16,
            paddingLeft: 4,
          }}>
            {group.instruction}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {group.questions?.map((q) => {
            const qType = q.question_type?.toUpperCase() || '';
            const pType = q.part_type?.toUpperCase() || '';
            const isDropdown = ['DROPDOWN', 'MATCHING', 'MATCHING_HEADINGS', 'MATCHING_OPINIONS'].includes(qType) || pType.includes('PART_4');
            const isReorder = qType === 'REORDER_SENTENCES';
            const isFillInBlank = qType === 'FILL_IN_BLANKS';

            let numDisplay = globalQNum.toString();
            let steps = 1;
            if (isReorder && Array.isArray(q.options) && q.options.length > 1) {
              numDisplay = `${globalQNum}–${globalQNum + q.options.length - 1}`;
              steps = q.options.length;
            }
            globalQNum += steps;

            if (isReorder) return <ReorderQuestion key={q.id} questionId={q.id} questionNumber={numDisplay} questionText={q.question_text} options={q.options} selectedValue={answers[q.id]} onChange={handleAnswerChange} />;
            if (isFillInBlank) return <FillInBlankQuestion key={q.id} questionId={q.id} questionNumber={numDisplay} questionText={q.question_text} selectedValue={answers[q.id]} onChange={handleAnswerChange} />;
            if (isDropdown) return <DropdownQuestion key={q.id} questionId={q.id} questionNumber={numDisplay} questionText={q.question_text} options={q.options} selectedValue={answers[q.id]} onChange={handleAnswerChange} />;
            return <MultipleChoiceQuestion key={q.id} questionId={q.id} questionNumber={numDisplay} questionText={q.question_text} options={q.options} selectedValue={answers[q.id]} onChange={handleAnswerChange} />;
          })}
        </div>
      </div>
    ));
  };

  /* ── Answered count for current part ── */
  const getAnsweredCount = () => {
    if (!activePart?.groups) return 0;
    const qIds = activePart.groups.flatMap(g => (g.questions || []).map(q => q.id));
    return qIds.filter(id => answers[id] !== undefined && answers[id] !== '').length;
  };

  /* ── Loading / Empty ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${T.navy}`, borderTopColor: 'transparent', animation: 'aptis-spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: T.textMuted, margin: 0, fontSize: 14 }}>Loading test...</p>
      </div>
      <style>{`@keyframes aptis-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (parts.length === 0) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: T.surface, padding: '48px 40px', borderRadius: 12, border: `1px solid ${T.border}` }}>
        <AlertCircle size={36} color="#F87171" style={{ marginBottom: 14 }} />
        <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: T.textPrimary }}>Empty Test</p>
        <p style={{ fontSize: 13, color: T.textSecondary, margin: '0 0 20px' }}>This test has no questions yet.</p>
        <button onClick={handleGoBackEmpty} style={{
          padding: '8px 22px', borderRadius: 8, border: 'none',
          background: T.navy, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>Go Back</button>
      </div>
    </div>
  );

  const currentPartTrueQCount = getTrueQuestionCount(activePart?.groups);
  const answeredCount = getAnsweredCount();
  const progressPct = currentPartTrueQCount > 0 ? Math.round((answeredCount / currentPartTrueQCount) * 100) : 0;

  /* ── Timer widget (reusable) ── */
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

  return (
    <div style={{
      minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh',
      background: T.bg, display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      {!isFullTest ? (
        <div style={{
          height: 54, background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          {/* LEFT: Skill badge + test title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: T.navy, color: '#fff',
              padding: '3px 9px', borderRadius: 5,
              fontWeight: 700, fontSize: 11,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <BookOpen size={11} />
              Reading
            </div>
            {testDetail?.title && (
              <span style={{
                fontSize: 13, color: T.textSecondary,
                fontWeight: 500, maxWidth: 320,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {testDetail.title}
              </span>
            )}
          </div>

          {/* RIGHT: Timer */}
          <TimerWidget />
        </div>
      ) : document.getElementById('aptis-timer-portal') ? (
        createPortal(<TimerWidget compact />, document.getElementById('aptis-timer-portal'))
      ) : null}

      {/* ═══════════════ PART NAVIGATION — Tab Underline ═══════════════ */}
      <div style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: '0 24px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 0,
          width: '100%',
          margin: '0 auto',
        }}>
          {parts.map((p, idx) => {
            const active = currentPartId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setCurrentPartId(p.id)}
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
                Part {p.part_number || idx + 1}
              </button>
            );
          })}

          {/* Right: progress badge */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, paddingBottom: 12, fontSize: 12, color: T.textMuted, fontWeight: 500 }}>
            <CheckCircle2 size={13} color={answeredCount === currentPartTrueQCount && currentPartTrueQCount > 0 ? '#16A34A' : T.textMuted} />
            <span style={{ color: answeredCount === currentPartTrueQCount && currentPartTrueQCount > 0 ? '#16A34A' : T.textMuted }}>
              {answeredCount}/{currentPartTrueQCount} answered
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════ CONTENT AREA ═══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ width: '100%', margin: '0 auto' }}>

          {hasReadingPassage ? (
            /* ── SPLIT SCREEN ── */
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>

              {/* LEFT: Passage */}
              <div style={{ flex: 1.35, position: 'sticky', top: 20 }}>
                <div style={{
                  background: T.surface, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}>
                  {/* Passage header */}
                  <div style={{
                    padding: '11px 18px',
                    borderBottom: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: '#FAFAFA',
                  }}>
                    <FileText size={14} color={T.navy} />
                    <span style={{ fontWeight: 600, fontSize: 12, color: T.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Passage
                    </span>
                  </div>

                  {/* Passage body */}
                  <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '20px 22px' }} className="exam-scrollbar">
                    {/* Instructions first */}
                    {activePart?.groups?.map((group) => {
                      if (!group.instruction) return null;
                      return (
                        <p key={`inst-${group.id}`} style={{ fontWeight: 700, fontSize: 14, color: T.textPrimary, whiteSpace: 'pre-wrap', marginBottom: 16 }}>
                          {group.instruction}
                        </p>
                      );
                    })}

                    {/* Then activePart content */}
                    {activePart?.content && (
                      <p style={{
                        fontSize: 15, lineHeight: 1.85, color: '#374151',
                        whiteSpace: 'pre-wrap', textAlign: 'justify',
                        margin: '0 0 18px',
                      }}>{activePart.content}</p>
                    )}

                    {/* Then group resources/contents */}
                    {activePart?.groups?.map((group) => {
                      const groupContent = group.transcript || group.content || group.text;
                      if (!group.image_url && !groupContent) return null;
                      return (
                        <div key={group.id} style={{ marginBottom: 18 }}>
                          {group.image_url && (
                            <img src={group.image_url} alt="Reading Resource" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 14 }} />
                          )}
                          {groupContent && (
                            <p style={{
                              fontSize: 15, lineHeight: 1.85, color: '#374151',
                              whiteSpace: 'pre-wrap', textAlign: 'justify', margin: 0,
                            }}>{groupContent}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: Questions */}
              <div style={{ flex: 1 }}>
                <div style={{
                  background: T.surface, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}>
                  {/* Questions header */}
                  <div style={{
                    padding: '11px 18px',
                    borderBottom: `1px solid ${T.border}`,
                    background: '#FAFAFA',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <BookOpenCheck size={14} color={T.navy} />
                      <span style={{ fontWeight: 600, fontSize: 12, color: T.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Questions
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: T.textMuted }}>
                      {currentPartTrueQCount} questions
                    </span>
                  </div>

                  {/* Questions body */}
                  <div style={{ padding: '18px 20px' }}>
                    <p style={{ fontSize: 13, color: T.textSecondary, fontStyle: 'italic', margin: '0 0 18px', lineHeight: 1.6 }}>
                      Read the passage carefully and answer the following questions.
                    </p>
                    {renderQuestionsList(activePart.groups)}
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── SINGLE COLUMN ── */
            <div style={{
              background: T.surface, borderRadius: 10,
              border: `1px solid ${T.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '11px 20px',
                borderBottom: `1px solid ${T.border}`,
                background: '#FAFAFA',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 3, height: 16, background: T.navy, borderRadius: 99 }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: T.textPrimary }}>
                    Questions
                  </span>
                </div>
                <span style={{ fontSize: 12, color: T.textMuted }}>{currentPartTrueQCount} questions</span>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 13, color: T.textSecondary, fontStyle: 'italic', margin: '0 0 20px', lineHeight: 1.6 }}>
                  Read the instructions carefully and answer the questions below.
                </p>
                {renderQuestionsList(activePart?.groups)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <div style={{
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        position: 'sticky', bottom: 0, zIndex: 40,
        padding: '0 24px',
      }}>
        {/* Navigation row */}
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          {/* Previous */}
          <button
            onClick={() => setCurrentPartId(parts[currentTabIndex - 1]?.id)}
            disabled={currentTabIndex === 0 || submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 16px', borderRadius: 7,
              border: `1.5px solid ${currentTabIndex === 0 ? T.border : T.borderMid}`,
              background: T.surface,
              color: currentTabIndex === 0 ? T.textMuted : T.textSecondary,
              fontWeight: 600, fontSize: 13,
              cursor: currentTabIndex === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <ChevronLeft size={15} /> Previous
          </button>

          {/* Center: Part progress text */}
          <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, flexShrink: 0 }}>
            Part {currentTabIndex + 1} of {parts.length}
          </div>

          {/* Next / Submit */}
          {currentTabIndex < parts.length - 1 ? (
            <button
              onClick={() => setCurrentPartId(parts[currentTabIndex + 1]?.id)}
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 16px', borderRadius: 7,
                border: 'none',
                background: T.textPrimary,
                color: '#fff',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s',
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
                padding: '7px 20px', borderRadius: 7,
                border: 'none',
                background: submitting ? '#93C5FD' : T.navy,
                color: '#fff', fontWeight: 700, fontSize: 13,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: submitting ? 'none' : '0 2px 8px rgba(30,58,138,0.25)',
                transition: 'all 0.15s',
              }}
            >
              {submitting
                ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'aptis-spin 0.8s linear infinite' }} /> Submitting...</>
                : <><Send size={14} /> {isFullTest ? 'Submit & Continue' : 'Submit Test'}</>
              }
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes aptis-spin { to { transform: rotate(360deg); } }
        .exam-scrollbar::-webkit-scrollbar { width: 5px; }
        .exam-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .exam-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
        .exam-scrollbar::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `}</style>
    </div>
  );
};

export default ReadingAptisExamPage;
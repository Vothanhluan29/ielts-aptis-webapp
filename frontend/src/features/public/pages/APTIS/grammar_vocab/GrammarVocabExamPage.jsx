import React from 'react';
import { createPortal } from 'react-dom';
import {
  Clock, BookMarked, ChevronLeft, ChevronRight, Send,
  CheckCircle2, AlertCircle, Info, BookOpen
} from 'lucide-react';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion';
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion';
import { useGrammarVocabExam, TABS } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabExam';
import { usePreventNavigation } from '../../../hooks/usePreventNavigation';

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS — đồng nhất với Reading / Listening
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
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const GrammarVocabExamPage = ({
  isFullTest = false,
  testIdFromProps = null,
  onSkillFinish = null
}) => {
  const {
    loading, submitting, testDetail,
    currentTab, setCurrentTab, timeLeft,
    answers, currentGroups, currentTabIndex,
    isTimeRunningOut, handleAnswerChange,
    confirmSubmit, formatTime
  } = useGrammarVocabExam({ isFullTest, testIdFromProps, onSkillFinish });

  const formatPartType = (partType) => {
    if (!partType) return '';
    const map = {
      'VOCAB_WORD_PAIRS': 'Word Pairs',
      'VOCAB_WORD_DEFINITION': 'Word Definition',
      'VOCAB_WORD_MATCH': 'Word Match',
      'VOCAB_WORD_USAGE': 'Word Usage',
      'VOCAB_COLLOCATIONS': 'Collocations'
    };
    return map[partType] || partType;
  };

  usePreventNavigation(!isFullTest && !submitting, '/aptis/grammar-vocab');

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
          animation: 'gv-spin 0.8s linear infinite', margin: '0 auto 14px',
        }} />
        <p style={{ color: T.textMuted, margin: 0, fontSize: 14 }}>Loading test...</p>
      </div>
      <style>{`@keyframes gv-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = currentGroups.reduce((sum, g) => sum + g.questions.length, 0);

  return (
    <div style={{
      minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh',
      background: T.bg,
      display: 'flex', flexDirection: 'column',
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
          {/* LEFT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: T.navy, color: '#fff',
              padding: '3px 9px', borderRadius: 5,
              fontWeight: 700, fontSize: 11,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <BookMarked size={11} />
              Grammar &amp; Vocab
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
          {/* RIGHT */}
          <TimerWidget />
        </div>
      ) : document.getElementById('aptis-timer-portal') ? (
        createPortal(<TimerWidget compact />, document.getElementById('aptis-timer-portal'))
      ) : null}

      {/* ═══════════════ TAB UNDERLINE NAVIGATION ═══════════════ */}
      <div style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, width: '100%' }}>
          {TABS.map((tab, idx) => {
            const active = currentTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
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
                Part {idx + 1} — {tab}
              </button>
            );
          })}

          {/* Right: answered badge */}
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
            paddingBottom: 12, fontSize: 12, fontWeight: 500,
            color: answeredCount === totalQuestions && totalQuestions > 0 ? '#16A34A' : T.textMuted,
          }}>
            <CheckCircle2
              size={13}
              color={answeredCount === totalQuestions && totalQuestions > 0 ? '#16A34A' : T.textMuted}
            />
            <span>{answeredCount}/{totalQuestions} answered</span>
          </div>
        </div>
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ width: '100%', margin: '0 auto' }}>

          {/* Question Card */}
          <div style={{
            background: T.surface, borderRadius: 10,
            border: `1px solid ${T.border}`,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>

            {/* Card Header */}
            <div style={{
              padding: '11px 20px',
              borderBottom: `1px solid ${T.border}`,
              background: '#FAFAFA',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 3, height: 16, background: T.navy, borderRadius: 99 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                {currentTab === 'Grammar'
                  ? 'Choose the correct word to complete each sentence.'
                  : 'Choose the correct word that best fits each gap.'}
              </span>
            </div>

            {/* Questions Body */}
            <div style={{ padding: '4px 20px' }}>
              {currentGroups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: T.textMuted, fontSize: 14 }}>
                  No questions available for this section.
                </div>
              ) : (
                currentGroups.map((group, gIdx) => (
                  <div
                    key={group.id}
                    style={
                      currentTab === 'VOCABULARY' ? {
                        background: '#FAFAFA',
                        borderRadius: 12,
                        border: `1px solid ${T.border}`,
                        padding: '20px',
                        marginBottom: 24,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      } : {
                        paddingBottom: gIdx < currentGroups.length - 1 ? 16 : 0,
                        marginBottom: gIdx < currentGroups.length - 1 ? 16 : 0,
                        borderBottom: gIdx < currentGroups.length - 1 ? `1px solid ${T.border}` : 'none',
                      }
                    }
                  >
                    {/* Header for Vocabulary */}
                    {currentTab === 'VOCABULARY' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 16,
                        paddingBottom: 12,
                        borderBottom: `1px dashed ${T.borderMid}`
                      }}>
                        <div style={{ padding: '8px', background: '#E0E7FF', borderRadius: '10px', color: '#4338CA' }}>
                          <BookOpen size={18} />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#4338CA' }}>
                          {formatPartType(group.part_type)}
                        </span>
                      </div>
                    )}

                    {/* Group instruction */}
                    {group.instruction && (
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 9,
                        background: T.navyLight, borderRadius: 8, padding: '12px 16px',
                        marginBottom: 20,
                        marginTop: currentTab === 'GRAMMAR' ? 16 : 0,
                        borderLeft: `4px solid ${T.navy}`,
                      }}>
                        <Info size={16} color={T.navy} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: T.navy, fontWeight: 500, lineHeight: 1.5 }}>
                          {group.instruction}
                        </span>
                      </div>
                    )}

                    {/* Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {group.questions.map((q) => {
                        const isGrammar = group.part_type === 'GRAMMAR';
                        return isGrammar ? (
                          <MultipleChoiceQuestion
                            key={q.id}
                            questionId={q.id}
                            questionNumber={q.question_number}
                            questionText={q.question_text}
                            options={q.options}
                            selectedValue={answers[q.id]}
                            onChange={handleAnswerChange}
                          />
                        ) : (
                          <DropdownQuestion
                            key={q.id}
                            questionId={q.id}
                            questionNumber={q.question_number}
                            questionText={q.question_text}
                            options={q.options}
                            selectedValue={answers[q.id]}
                            onChange={handleAnswerChange}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <div style={{
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        position: 'sticky', bottom: 0, zIndex: 40,
        padding: '0 24px',
      }}>
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          {/* Previous */}
          <button
            onClick={() => setCurrentTab(TABS[currentTabIndex - 1])}
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

          {/* Center: Part indicator */}
          <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, flexShrink: 0 }}>
            Part {currentTabIndex + 1} of {TABS.length}
          </div>

          {/* Next / Submit */}
          {currentTabIndex < TABS.length - 1 ? (
            <button
              onClick={() => setCurrentTab(TABS[currentTabIndex + 1])}
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
                boxShadow: submitting ? 'none' : `0 2px 8px rgba(30,58,138,0.25)`,
                transition: 'all 0.15s',
              }}
            >
              {submitting
                ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'gv-spin 0.8s linear infinite' }} /> Submitting...</>
                : <><Send size={14} /> {isFullTest ? 'Submit & Continue' : 'Submit Test'}</>
              }
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes gv-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default GrammarVocabExamPage;
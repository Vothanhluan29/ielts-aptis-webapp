import React from 'react';
import { Skeleton } from 'antd';
import {
  Clock, BookMarked, ChevronLeft, ChevronRight, Send,
  Info, CheckCircle2, AlertCircle
} from 'lucide-react';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion';
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion';
import { useGrammarVocabExam, TABS } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabExam';

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────── */
const ACCENT = '#6366f1';
const ACCENT_LIGHT = '#ede9fe';

/* ─────────────────────────────────────────────────────────
   TIMER DISPLAY
───────────────────────────────────────────────────────── */
const TimerBadge = ({ timeLeft, formatTime, isRunningOut }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '5px 14px', borderRadius: 8, fontWeight: 700,
      fontSize: 16, letterSpacing: '0.5px',
      background: isRunningOut ? '#fef2f2' : '#f0f4ff',
      color: isRunningOut ? '#dc2626' : '#4338ca',
      border: `1.5px solid ${isRunningOut ? '#fca5a5' : '#c7d2fe'}`,
      transition: 'all 0.3s',
    }}
  >
    <Clock size={16} />
    {formatTime(timeLeft)}
  </div>
);

/* ─────────────────────────────────────────────────────────
   PART STEP INDICATOR
───────────────────────────────────────────────────────── */
const PartStepBar = ({ tabs, currentTab, setCurrentTab }) => (
  <div style={{ display: 'flex', gap: 0, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
    {tabs.map((tab, idx) => {
      const active = currentTab === tab;
      return (
        <button
          key={tab}
          onClick={() => setCurrentTab(tab)}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 9,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
            background: active ? '#fff' : 'transparent',
            color: active ? ACCENT : '#94a3b8',
            boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
            transition: 'all 0.18s',
          }}
        >
          Part {idx + 1} — {tab}
        </button>
      );
    })}
  </div>
);

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

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', margin: 0 }}>Loading test...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = currentGroups.reduce((sum, g) => sum + g.questions.length, 0);

  return (
    <div style={{
      minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh',
      background: '#f0f4f8',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      <div style={{
        height: 56, background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: ACCENT_LIGHT, color: ACCENT,
            padding: '4px 10px', borderRadius: 6, fontWeight: 700, fontSize: 12,
          }}>
            <BookMarked size={13} />
            {isFullTest ? 'Grammar & Vocabulary' : 'Grammar & Vocab Test'}
          </div>
          {testDetail?.title && (
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              {testDetail.title}
            </span>
          )}
        </div>
        {/* Right */}
        <TimerBadge timeLeft={timeLeft} formatTime={formatTime} isRunningOut={isTimeRunningOut} />
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>

          {/* Part Step Bar */}
          <div style={{ marginBottom: 20 }}>
            <PartStepBar tabs={TABS} currentTab={currentTab} setCurrentTab={setCurrentTab} />
          </div>

          {/* Progress hint */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              Part {currentTabIndex + 1} of {TABS.length} · {currentTab}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: answeredCount === totalQuestions ? '#16a34a' : '#64748b' }}>
              {answeredCount === totalQuestions ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {answeredCount}/{totalQuestions} answered
            </div>
          </div>

          {/* Question Card */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>

            {/* Card Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #fafafe 0%, #f8f9ff 100%)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 4, height: 20, background: ACCENT, borderRadius: 99 }} />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                {currentTab === 'Grammar'
                  ? 'Choose the correct word to complete each sentence.'
                  : 'Choose the correct word that best fits each gap.'}
              </h2>
            </div>

            {/* Questions */}
            <div style={{ padding: '24px' }}>
              {currentGroups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  No questions available for this section.
                </div>
              ) : (
                currentGroups.map((group, gIdx) => (
                  <div
                    key={group.id}
                    style={{
                      marginBottom: gIdx < currentGroups.length - 1 ? 32 : 0,
                      paddingBottom: gIdx < currentGroups.length - 1 ? 32 : 0,
                      borderBottom: gIdx < currentGroups.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}
                  >
                    {group.instruction && (
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        background: '#f0f4ff', borderRadius: 10, padding: '12px 16px',
                        marginBottom: 20, borderLeft: `3px solid ${ACCENT}`,
                      }}>
                        <Info size={15} color={ACCENT} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: '#3730a3', fontWeight: 500 }}>
                          {group.instruction}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

      {/* ═══════════════ FOOTER NAV ═══════════════ */}
      <div style={{
        height: 64, background: '#fff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', bottom: 0, zIndex: 20,
      }}>
        <button
          onClick={() => setCurrentTab(TABS[currentTabIndex - 1])}
          disabled={currentTabIndex === 0 || submitting}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8,
            border: '1.5px solid #e2e8f0', background: '#fff',
            color: currentTabIndex === 0 ? '#cbd5e1' : '#475569',
            fontWeight: 600, fontSize: 14, cursor: currentTabIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Part dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              style={{
                width: 10, height: 10, borderRadius: '50%', border: 'none',
                background: currentTab === tab ? ACCENT : '#cbd5e1',
                cursor: 'pointer', padding: 0, transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        {currentTabIndex < TABS.length - 1 ? (
          <button
            onClick={() => setCurrentTab(TABS[currentTabIndex + 1])}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8,
              border: 'none', background: '#1e293b',
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
              padding: '8px 22px', borderRadius: 8,
              border: 'none',
              background: submitting ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
            }}
          >
            {submitting
              ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
              : <><Send size={15} /> {isFullTest ? 'Submit & Continue' : 'Submit Test'}</>
            }
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default GrammarVocabExamPage;
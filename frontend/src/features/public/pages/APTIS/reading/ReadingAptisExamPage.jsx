import React from 'react';
import {
  Clock, BookOpen, ChevronLeft, ChevronRight, Send,
  FileText, CheckCircle2, AlertCircle, BookOpenCheck
} from 'lucide-react';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion';
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion';
import ReorderQuestion from '../../../components/APTIS/ExamForms/ReorderQuestion';
import FillInBlankQuestion from '../../../components/APTIS/ExamForms/FillInBlankQuestion';
import { useReadingAptisExam } from '../../../hooks/APTIS/reading/useReadingAptisExam';

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

  /* ── Dynamic question numbering ── */
  const renderQuestionsList = (groups) => {
    if (!groups?.length) return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>
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
      <div key={group.id} style={{ marginBottom: 28 }}>
        {!hasReadingPassage && group.instruction && (
          <div style={{
            background: '#f0fdfa', border: '1px solid #99f6e4',
            borderLeft: '3px solid #14b8a6', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16, fontSize: 14,
            color: '#0f766e', fontWeight: 600,
          }}>
            {group.instruction}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

  /* ── Loading / Empty ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #0d9488', borderTopColor: 'transparent', animation: 'aptis-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8', margin: 0 }}>Loading test...</p>
      </div>
      <style>{`@keyframes aptis-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (parts.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: '48px 40px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
        <AlertCircle size={40} color="#f87171" style={{ marginBottom: 16 }} />
        <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>Empty Test</p>
        <button onClick={handleGoBackEmpty} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#0d9488', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
      </div>
    </div>
  );

  const currentPartTrueQCount = getTrueQuestionCount(activePart?.groups);
  const totalAnswered = Object.keys(answers).length;

  return (
    <div style={{
      minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh',
      background: '#f0f4f8', display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      <div style={{
        height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f0fdfa', color: '#0f766e',
            padding: '4px 10px', borderRadius: 6, fontWeight: 700, fontSize: 12,
          }}>
            <BookOpen size={13} />
            {isFullTest ? 'Reading' : 'Reading Test'}
          </div>
          {testDetail?.title && <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{testDetail.title}</span>}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 8, fontWeight: 700, fontSize: 16,
          background: isTimeRunningOut ? '#fef2f2' : '#f0fdfa',
          color: isTimeRunningOut ? '#dc2626' : '#0f766e',
          border: `1.5px solid ${isTimeRunningOut ? '#fca5a5' : '#99f6e4'}`,
        }}>
          <Clock size={16} /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* ═══════════════ PART TABS ═══════════════ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '10px 24px' }}>
        <div style={{ display: 'flex', gap: 6, maxWidth: hasReadingPassage ? 1240 : 820, margin: '0 auto', alignItems: 'center' }}>
          {parts.map((p, idx) => {
            const active = currentPartId === p.id;
            return (
              <button key={p.id} onClick={() => setCurrentPartId(p.id)} style={{
                padding: '6px 18px', borderRadius: 20, border: '1.5px solid',
                borderColor: active ? '#0d9488' : '#e2e8f0',
                background: active ? '#0d9488' : '#fff',
                color: active ? '#fff' : '#64748b',
                fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Part {p.part_number || idx + 1}
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
            <CheckCircle2 size={13} />
            {currentPartTrueQCount} questions in this part
          </div>
        </div>
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ maxWidth: hasReadingPassage ? 1240 : 820, margin: '0 auto' }}>

          {hasReadingPassage ? (
            /* ── SPLIT SCREEN: Passage left, Questions right ── */
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

              {/* LEFT: Passage */}
              <div style={{ flex: 1, position: 'sticky', top: 20 }}>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{
                    padding: '14px 20px', borderBottom: '1px solid #f0fdfa',
                    background: '#f0fdfa', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <FileText size={16} color="#0d9488" />
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f766e' }}>Reading Passage</span>
                  </div>
                  <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '20px 24px' }} className="custom-scrollbar">
                    {activePart?.content && (
                      <p style={{
                        fontSize: 15, lineHeight: 1.9, color: '#374151',
                        whiteSpace: 'pre-wrap', textAlign: 'justify',
                        background: '#fafffe', border: '1px solid #ccfbf1',
                        borderRadius: 10, padding: '20px', marginBottom: 20,
                      }}>{activePart.content}</p>
                    )}
                    {activePart?.groups?.map((group) => {
                      const groupContent = group.transcript || group.content || group.text;
                      if (!group.instruction && !group.image_url && !groupContent) return null;
                      return (
                        <div key={group.id} style={{ marginBottom: 20 }}>
                          {group.image_url && <img src={group.image_url} alt="Reading Resource" style={{ maxWidth: '100%', borderRadius: 10, marginBottom: 16 }} />}
                          {group.instruction && <p style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', whiteSpace: 'pre-wrap', marginBottom: 12 }}>{group.instruction}</p>}
                          {groupContent && (
                            <p style={{
                              fontSize: 15, lineHeight: 1.9, color: '#374151',
                              whiteSpace: 'pre-wrap', textAlign: 'justify',
                              background: '#fafffe', border: '1px solid #ccfbf1',
                              borderRadius: 10, padding: '20px',
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
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{
                    padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
                    background: '#fafbff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpenCheck size={16} color="#0d9488" />
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Questions</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                      {currentPartTrueQCount} questions
                    </span>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{
                      background: '#f0fdfa', border: '1px solid #99f6e4',
                      borderLeft: '3px solid #14b8a6', borderRadius: 10,
                      padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#0f766e', fontWeight: 500,
                    }}>
                      Read the passage and answer the questions. Use the text to support your answers.
                    </div>
                    {renderQuestionsList(activePart.groups)}
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── SINGLE COLUMN ── */
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
                background: '#fafbff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 4, height: 18, background: '#0d9488', borderRadius: 99 }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Questions</span>
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{currentPartTrueQCount} questions</span>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <div style={{
                  background: '#f0fdfa', border: '1px solid #99f6e4', borderLeft: '3px solid #14b8a6',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#0f766e', fontWeight: 500,
                }}>
                  Read the instructions and answer the questions below.
                </div>
                {renderQuestionsList(activePart?.groups)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <div style={{
        height: 64, background: '#fff', borderTop: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', bottom: 0, zIndex: 40,
      }}>
        <button
          onClick={() => setCurrentPartId(parts[currentTabIndex - 1]?.id)}
          disabled={currentTabIndex === 0 || submitting}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff',
            color: currentTabIndex === 0 ? '#cbd5e1' : '#475569',
            fontWeight: 600, fontSize: 14, cursor: currentTabIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {parts.map((p, idx) => (
            <div key={p.id} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: currentPartId === p.id ? '#0d9488' : '#cbd5e1',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        {currentTabIndex < parts.length - 1 ? (
          <button
            onClick={() => setCurrentPartId(parts[currentTabIndex + 1]?.id)}
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
              background: submitting ? '#5eead4' : 'linear-gradient(135deg, #0d9488, #0f766e)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(13,148,136,0.35)',
            }}
          >
            {submitting
              ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'aptis-spin 0.8s linear infinite' }} /> Submitting...</>
              : <><Send size={15} /> {isFullTest ? 'Submit & Go to Writing' : 'Submit Test'}</>
            }
          </button>
        )}
      </div>

      <style>{`
        @keyframes aptis-spin { to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ReadingAptisExamPage;
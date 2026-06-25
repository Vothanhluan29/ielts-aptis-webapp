import React from 'react';
import { Image } from 'antd';
import {
  Mic, Square, CheckCircle2, Loader2, Send,
  PlayCircle, ChevronRight, FileText
} from 'lucide-react';
import { useSpeakingAptisExam } from '../../../hooks/APTIS/speaking/useSpeakingAptisExam';

/* ─────────────────────────────────────────────────────────
   PROGRESS DOTS  (questions in current part)
───────────────────────────────────────────────────────── */
const ProgressDots = ({ total, current }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === current ? 24 : 8,
          height: 8, borderRadius: 99,
          background: i < current ? '#a855f7' : i === current ? '#7c3aed' : '#e2e8f0',
          transition: 'all 0.25s',
        }}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────
   CIRCULAR TIMER RING
───────────────────────────────────────────────────────── */
const TimerRing = ({ seconds, maxSeconds, isRecording, isPrep }) => {
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const pct = maxSeconds > 0 ? seconds / maxSeconds : 0;
  const dashOffset = CIRC * (1 - pct);
  const color = isRecording ? '#ef4444' : '#f59e0b';

  return (
    <div style={{ position: 'relative', width: 130, height: 130 }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={R} fill="none" stroke="#f1f5f9" strokeWidth={8} />
        <circle
          cx={65} cy={65} r={R} fill="none"
          stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 30, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isPrep ? 'Prep' : 'Record'}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const SpeakingAptisExamPage = ({
  isFullTest = false,
  testIdFromProps = null,
  onSkillFinish = null
}) => {
  const {
    loading, submitting, testDetail, currentPart, currentQuestion,
    currentQuestionIdx, allQuestions, isPart4,
    step, timer, audioBlocked, setAudioBlocked,
    examinerAudioRef, startPrep, startRecording, stopRecording, handleFinishTest,
    PREP_TIME, RECORD_TIME, EXAM_STEPS
  } = useSpeakingAptisExam({ isFullTest, testIdFromProps, onSkillFinish });

  /* ── Loading ── */
  if (loading || !testDetail) return (
    <div style={{ minHeight: '100vh', background: '#0f0a1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={44} color="#a855f7" style={{ animation: 'aptis-spin 1s linear infinite', marginBottom: 16 }} />
        <p style={{ color: '#94a3b8', margin: 0, fontSize: 15 }}>Initializing recording system...</p>
      </div>
      <style>{`@keyframes aptis-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Done state ── */
  if (step === EXAM_STEPS.DONE) return (
    <div style={{ minHeight: '100vh', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '48px 40px',
        textAlign: 'center', maxWidth: 440, width: '100%',
        border: '1px solid #e9d5ff',
        boxShadow: '0 8px 40px rgba(124,58,237,0.12)',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
        }}>
          <CheckCircle2 size={40} color="#fff" />
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 800, color: '#1e1b4b' }}>
          All Recordings Complete
        </h2>
        <p style={{ margin: '0 0 32px', fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>
          {isFullTest
            ? "Great job! You have completed the Speaking section — the final part of the test."
            : "You have recorded all your answers. Click the button below to submit."}
        </p>
        <button
          onClick={handleFinishTest}
          disabled={submitting}
          style={{
            width: '100%', height: 52, borderRadius: 12, border: 'none',
            background: submitting ? '#c4b5fd' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff', fontWeight: 700, fontSize: 16, cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 16px rgba(124,58,237,0.40)',
          }}
        >
          {submitting
            ? <><Loader2 size={18} style={{ animation: 'aptis-spin 0.8s linear infinite' }} /> Submitting...</>
            : <><Send size={18} /> {isFullTest ? 'Finish Full Test' : 'Submit Test'}</>
          }
        </button>
      </div>
      <style>{`@keyframes aptis-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!currentQuestion && !isPart4) return (
    <div style={{ minHeight: '100vh', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#ef4444', fontWeight: 600 }}>Question data error. Please reload.</p>
    </div>
  );

  /* Compute images */
  const isPart3 = currentPart?.part_number === 3;
  const img1 = isPart4
    ? (currentPart?.image_url || allQuestions[0]?.image_url)
    : (currentQuestion?.image_url || currentPart?.image_url);
  const img2 = isPart4
    ? (currentPart?.image_url_2 || allQuestions[0]?.image_url_2)
    : (currentQuestion?.image_url_2 || currentPart?.image_url_2);
  const hasTwoImages = isPart3 && img1 && img2;

  const isPrep = step === EXAM_STEPS.PREP;
  const isRecording = step === EXAM_STEPS.RECORDING;
  const isIntro = step === EXAM_STEPS.INTRO;
  const isUploading = step === EXAM_STEPS.UPLOADING;

  const maxTime = isPrep ? PREP_TIME : RECORD_TIME;
  const totalQ = currentPart?.questions?.length || 1;

  /* ── Shared recording controls panel ── */
  const RecordingPanel = () => (
    <div style={{
      background: '#fff', borderRadius: 20, border: '1px solid #e9d5ff',
      padding: '32px',
      minHeight: isPart4 ? 'auto' : 320,
      boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 24,
    }}>

      {/* INTRO */}
      {isIntro && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#faf5ff', border: '2px solid #e9d5ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Mic size={32} color="#c4b5fd" />
          </div>
          <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#1e1b4b' }}>
            {isPart4 ? 'Read all questions, then start' : 'Ready to answer?'}
          </h4>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#94a3b8' }}>
            {PREP_TIME > 0
              ? <>You will have <strong style={{ color: '#7c3aed' }}>{PREP_TIME}s</strong> to prepare, then{' '}
                  <strong style={{ color: '#ef4444' }}>{RECORD_TIME}s</strong> to record your answer.</>
              : <>You will have <strong style={{ color: '#ef4444' }}>{RECORD_TIME}s</strong> to record your answer. Recording starts immediately.</>
            }
          </p>
          <button
            onClick={startPrep}
            style={{
              width: '100%', height: 52, borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.40)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {isPart4 ? 'Start Preparation (1 min)' : 'Start'} <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* PREP / RECORDING */}
      {(isPrep || isRecording) && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          {/* Status label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20, marginBottom: 24,
            background: isPrep ? '#fffbeb' : '#fef2f2',
            border: `1px solid ${isPrep ? '#fde68a' : '#fecaca'}`,
            color: isPrep ? '#92400e' : '#991b1b',
            fontWeight: 700, fontSize: 13,
          }}>
            {isRecording && (
              <span style={{ position: 'relative', width: 10, height: 10 }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: '#ef4444', opacity: 0.75,
                  animation: 'ping 1s ease infinite',
                }} />
                <span style={{ position: 'relative', display: 'block', width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              </span>
            )}
            {isPrep ? '⏳ Preparation time' : '🔴 Recording in progress'}
          </div>

          {/* Timer ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <TimerRing seconds={timer} maxSeconds={maxTime} isRecording={isRecording} isPrep={isPrep} />
          </div>

          {/* Buttons */}
          {isRecording && (
            <button
              onClick={stopRecording}
              style={{
                width: '100%', height: 48, borderRadius: 12,
                border: '1.5px solid #fecaca', background: '#fff',
                color: '#dc2626', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}
            >
              <Square size={16} fill="#dc2626" /> Stop Recording Early
            </button>
          )}
          {isPrep && (
            <button
              onClick={startRecording}
              style={{
                marginTop: 12, background: 'none', border: 'none',
                color: '#f59e0b', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', textDecoration: 'underline',
              }}
            >
              Skip preparation — record now
            </button>
          )}
        </div>
      )}

      {/* UPLOADING */}
      {isUploading && (
        <div style={{ textAlign: 'center', width: '100%', padding: '20px 0' }}>
          <Loader2 size={48} color="#a855f7" style={{ animation: 'aptis-spin 1s linear infinite', marginBottom: 20 }} />
          <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#1e1b4b' }}>
            Saving your recording...
          </h4>
          <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>
            Please do not close this page
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      height: isFullTest ? 'calc(100vh - 64px)' : '100vh',
      background: '#f5f3ff',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflow: 'hidden',
    }}>

      {/* ═══════════════ TOP BAR ═══════════════ */}
      <div style={{
        height: 56, background: '#fff',
        borderBottom: '1px solid #e9d5ff',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px', flexShrink: 0,
        boxShadow: '0 1px 4px rgba(124,58,237,0.08)',
      }}>
        {/* Left: Part badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#faf5ff', color: '#7c3aed',
            padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12,
            border: '1px solid #e9d5ff',
          }}>
            <Mic size={12} />
            Part {currentPart?.part_number}
          </div>
          {!isFullTest && (
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              {testDetail.title}
            </span>
          )}
          {isFullTest && (
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Speaking — Part {currentPart?.part_number}
            </span>
          )}
        </div>

        {/* Right: progress indicator */}
        {!isPart4 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ProgressDots total={totalQ} current={currentQuestionIdx} />
            <div style={{
              background: '#f3f4f6', borderRadius: 8, padding: '4px 12px',
              fontSize: 13, fontWeight: 700, color: '#475569',
              border: '1px solid #e2e8f0',
            }}>
              {currentQuestionIdx + 1} / {totalQ}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#faf5ff', color: '#7c3aed',
            padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12,
            border: '1px solid #e9d5ff',
          }}>
            <FileText size={12} />
            {totalQ} questions — 1 recording
          </div>
        )}
      </div>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px', overflow: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: isPart4 ? 1100 : 900 }}>

          {/* ═══ PART 4: All questions shown at once ═══ */}
          {isPart4 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, alignItems: 'start' }}>

              {/* LEFT: Image + all questions */}
              <div style={{
                background: '#fff', borderRadius: 20, border: '1px solid #e9d5ff',
                padding: '28px 32px',
                boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                {/* Image */}
                {img1 && (
                  <div style={{ textAlign: 'center' }}>
                    <Image src={img1} style={{ borderRadius: 12, maxHeight: 200, objectFit: 'contain' }} />
                  </div>
                )}

                {/* Section label */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10,
                  background: '#faf5ff', border: '1px solid #e9d5ff',
                }}>
                  <FileText size={14} color="#7c3aed" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    All Questions — Answer in one 2-minute response
                  </span>
                </div>

                {/* Questions list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {allQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      style={{
                        display: 'flex', gap: 14, alignItems: 'flex-start',
                        padding: '16px 18px',
                        background: '#f8f7ff',
                        borderRadius: 14,
                        border: '1px solid #ede9fe',
                      }}
                    >
                      {/* Number badge */}
                      <div style={{
                        flexShrink: 0,
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 13,
                        boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                      }}>
                        {idx + 1}
                      </div>
                      {/* Question text */}
                      <p style={{
                        margin: 0, fontSize: 15, fontWeight: 600, color: '#1e1b4b',
                        lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      }}>
                        {q.question_text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Recording controls */}
              <RecordingPanel />
            </div>

          ) : (
            /* ═══ PARTS 1-3: Single question per screen ═══ */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

              {/* LEFT: Question card */}
              <div style={{
                background: '#fff', borderRadius: 20, border: '1px solid #e9d5ff',
                padding: '28px 32px', minHeight: 320,
                boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                {/* Images */}
                {hasTwoImages ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <Image src={img1} style={{ borderRadius: 12, maxHeight: 200, objectFit: 'contain' }} />
                    <Image src={img2} style={{ borderRadius: 12, maxHeight: 200, objectFit: 'contain' }} />
                  </div>
                ) : img1 ? (
                  <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <Image src={img1} style={{ borderRadius: 12, maxHeight: 220, objectFit: 'contain' }} />
                  </div>
                ) : null}

                {/* Examiner audio */}
                {currentQuestion?.audio_url && (
                  <>
                    <audio ref={examinerAudioRef} src={currentQuestion.audio_url} className="hidden" />
                    {audioBlocked && (
                      <div style={{ marginBottom: 16 }}>
                        <button
                          onClick={() => { examinerAudioRef.current?.play(); setAudioBlocked(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: '#7c3aed', color: '#fff', fontWeight: 600,
                            fontSize: 13, cursor: 'pointer',
                          }}
                        >
                          <PlayCircle size={16} /> Play question audio
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Question label */}
                <span style={{
                  display: 'inline-block', marginBottom: 12,
                  fontSize: 11, fontWeight: 800, letterSpacing: '1px',
                  textTransform: 'uppercase', color: '#a855f7',
                }}>
                  Question
                </span>

                {/* Question text */}
                <h3 style={{
                  margin: 0, fontSize: 18, fontWeight: 700, color: '#1e1b4b',
                  lineHeight: 1.55, whiteSpace: 'pre-wrap',
                }}>
                  {currentQuestion?.question_text}
                </h3>
              </div>

              {/* RIGHT: Recording controls */}
              <RecordingPanel />
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes aptis-spin { to { transform: rotate(360deg); } }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SpeakingAptisExamPage;
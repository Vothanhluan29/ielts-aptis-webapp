import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { message } from 'antd';
import {
  Clock, Headphones, ChevronLeft, ChevronRight, Send,
  Play, CheckCircle2, AlertCircle, Volume2, VolumeX
} from 'lucide-react';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion';
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion';
import { useListeningAptisExam } from '../../../hooks/APTIS/listening/useListeningAptisExam';
import { usePreventNavigation } from '../../../hooks/usePreventNavigation';

/* ─────────────────────────────────────────────────────────
   DESIGN TOKENS — đồng nhất với ReadingAptisExamPage
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
   AUDIO PLAYER — navy style
───────────────────────────────────────────────────────── */
const AptisAudioPlayer = ({ src, startTime, endTime }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const MAX_PLAYS = 2;

  useEffect(() => {
    if (audioRef.current && startTime != null) {
      audioRef.current.currentTime = startTime;
    }
  }, [startTime]);

  const handlePlay = () => {
    if (playCount >= MAX_PLAYS || isPlaying) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (startTime != null && (audio.currentTime < startTime || (endTime && audio.currentTime >= endTime))) {
      audio.currentTime = startTime;
    }
    audio.play().catch(e => {
      console.error('Audio error:', e);
      message.error('Audio playback failed. Check your browser settings.');
    });
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const current = audio.currentTime;
    if (endTime && current >= endTime) {
      audio.pause();
      setIsPlaying(false);
      audio.currentTime = startTime ?? 0;
      setProgress(0);
      setPlayCount(p => p + 1);
      return;
    }
    const start = startTime ?? 0;
    const end = endTime || audio.duration || 0;
    const dur = end - start;
    if (dur > 0) setProgress(Math.min(100, Math.max(0, ((current - start) / dur) * 100)));
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setPlayCount(p => p + 1);
    if (audioRef.current && startTime != null) audioRef.current.currentTime = startTime;
  };

  const playsLeft = MAX_PLAYS - playCount;
  const isLocked = playsLeft <= 0;

  if (!src) return (
    <div style={{
      background: T.timerUrgentBg, border: `1px solid ${T.timerUrgentBorder}`,
      borderRadius: 8, padding: '10px 14px',
      color: T.timerUrgent, fontSize: 13, fontWeight: 600, marginBottom: 14,
    }}>
      ⚠ Audio file missing for this question.
    </div>
  );

  const baseUrl = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : 'http://localhost:8000';
  const resolvedSrc = src.startsWith('http') ? src : `${baseUrl}${src}`;

  return (
    <div style={{
      background: isLocked ? '#F9FAFB' : T.navyLight,
      border: `1.5px solid ${isLocked ? T.border : T.navyBorder}`,
      borderRadius: 10, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 18, transition: 'all 0.2s',
    }}>
      <audio
        ref={audioRef} src={resolvedSrc}
        onEnded={handleEnded} onTimeUpdate={handleTimeUpdate}
        preload="metadata"
      />

      {/* Play button */}
      <button
        onClick={handlePlay}
        disabled={isLocked || isPlaying}
        title={isLocked ? 'Maximum plays reached' : 'Play audio'}
        style={{
          width: 42, height: 42, borderRadius: '50%', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isLocked ? 'not-allowed' : isPlaying ? 'default' : 'pointer',
          background: isLocked ? T.borderMid : isPlaying ? '#6B8EC8' : T.navy,
          color: '#fff', flexShrink: 0,
          boxShadow: isLocked ? 'none' : `0 2px 8px rgba(30,58,138,0.30)`,
          transition: 'all 0.2s',
        }}
      >
        {isLocked ? <VolumeX size={17} /> : <Play size={17} fill="white" />}
      </button>

      {/* Progress & label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: isLocked ? T.textMuted : T.navy }}>
            {isPlaying ? 'Playing…' : isLocked ? 'Audio played' : 'Press play to listen'}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            background: isLocked ? '#F3F4F6' : T.navyBorder,
            color: isLocked ? T.textMuted : T.navy,
            padding: '2px 8px', borderRadius: 20,
          }}>
            {isLocked ? '0 plays left' : `${playsLeft} play${playsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 99, background: isLocked ? T.border : T.navyBorder, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: isLocked ? T.textMuted : T.navy,
            width: `${isLocked ? 100 : progress}%`,
            transition: 'width 0.1s linear',
          }} />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const ListeningAptisExamPage = ({
  isFullTest = false,
  testIdFromProps = null,
  onSkillFinish = null
}) => {
  const {
    loading, submitting, testDetail,
    currentPartId, setCurrentPartId, timeLeft,
    answers, parts, activePart, currentTabIndex,
    isTimeRunningOut, handleAnswerChange,
    confirmSubmit, formatTime, handleGoBackEmpty
  } = useListeningAptisExam({ isFullTest, testIdFromProps, onSkillFinish });

  usePreventNavigation(!isFullTest && !submitting, '/aptis/listening');

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
          animation: 'aptis-spin 0.8s linear infinite', margin: '0 auto 14px',
        }} />
        <p style={{ color: T.textMuted, margin: 0, fontSize: 14 }}>Loading test...</p>
      </div>
      <style>{`@keyframes aptis-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Empty ── */
  if (parts.length === 0) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: T.surface, padding: '48px 40px', borderRadius: 12, border: `1px solid ${T.border}` }}>
        <AlertCircle size={36} color="#F87171" style={{ marginBottom: 14 }} />
        <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: T.textPrimary }}>Empty Test</p>
        <p style={{ fontSize: 13, color: T.textSecondary, margin: '0 0 20px' }}>No content has been added to this test.</p>
        <button onClick={handleGoBackEmpty} style={{
          padding: '8px 22px', borderRadius: 8, border: 'none',
          background: T.navy, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>Go Back</button>
      </div>
    </div>
  );

  const totalQ = parts.reduce((total, p) => total + (p.groups?.reduce((s, g) => s + (g.questions?.length || 0), 0) || 0), 0);
  const answeredQ = Object.keys(answers).length;

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
              <Headphones size={11} />
              Listening
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

          {/* Right: answered badge */}
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
            paddingBottom: 12, fontSize: 12, fontWeight: 500,
            color: answeredQ === totalQ && totalQ > 0 ? '#16A34A' : T.textMuted,
          }}>
            <CheckCircle2
              size={13}
              color={answeredQ === totalQ && totalQ > 0 ? '#16A34A' : T.textMuted}
            />
            <span>{answeredQ}/{totalQ} answered</span>
          </div>


        </div>
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ width: '100%', margin: '0 auto' }}>

          {/* Instructions — plain italic */}
          <p style={{
            fontSize: 13, color: T.textSecondary, fontStyle: 'italic',
            margin: '0 0 18px', lineHeight: 1.6,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Volume2 size={13} color={T.textMuted} style={{ flexShrink: 0 }} />
            Listen carefully to each audio clip. You may listen to each clip a maximum of <strong style={{ fontStyle: 'normal' }}>2 times</strong>. Select the best answer for each question.
          </p>

          {/* Groups */}
          {!activePart?.groups || activePart.groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: T.textMuted, fontSize: 14 }}>
              No questions in this section.
            </div>
          ) : (
            activePart.groups.map((group) => {
              const groupAudioSrc = group.audio_url || group.media_url || activePart?.audio_url || testDetail?.audio_url;
              const hasQAudio = group.questions?.some(q => q.audio_url || q.media_url);

              return (
                <div
                  key={group.id}
                  style={{
                    background: T.surface, borderRadius: 10,
                    border: `1px solid ${T.border}`,
                    overflow: 'hidden', marginBottom: 18,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Group header */}
                  <div style={{
                    padding: '11px 18px',
                    borderBottom: `1px solid ${T.border}`,
                    background: '#FAFAFA',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ width: 3, height: 16, background: T.navy, borderRadius: 99 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                      Questions {group.questions?.[0]?.question_number}
                      {group.questions?.length > 1 && ` – ${group.questions?.[group.questions.length - 1]?.question_number}`}
                    </span>
                  </div>

                  <div style={{ padding: '18px 20px' }}>
                    {/* Group-level audio */}
                    {(groupAudioSrc || !hasQAudio) && (
                      <AptisAudioPlayer
                        src={groupAudioSrc}
                        startTime={group.start_time}
                        endTime={group.end_time}
                      />
                    )}

                    {/* Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {group.questions?.map((q, qIdx) => {
                        const qType = q.question_type?.toUpperCase() || '';
                        const pType = q.part_type?.toUpperCase() || '';
                        const isDropdown = qType === 'DROPDOWN' || qType === 'MATCHING' || pType.includes('PART_4');
                        const qKey = String(q.question_number || qIdx + 1);
                        const qAudioSrc = q.audio_url || q.media_url;

                        return (
                          <div key={q.id} className="listening-question-card" style={{
                            border: `1px solid ${T.borderMid}`,
                            borderRadius: 12,
                            padding: '20px 24px',
                            background: '#FFFFFF',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                          }}>
                            {qAudioSrc && (
                              <div style={{ marginBottom: 12 }}>
                                <AptisAudioPlayer src={qAudioSrc} />
                              </div>
                            )}
                            {isDropdown ? (
                              <DropdownQuestion
                                questionId={q.id}
                                questionNumber={q.question_number || qIdx + 1}
                                questionText={q.question_text}
                                options={q.options}
                                selectedValue={answers[qKey]}
                                onChange={(a, b) => handleAnswerChange(qKey, b !== undefined ? b : a)}
                              />
                            ) : (
                              <MultipleChoiceQuestion
                                questionId={q.id}
                                questionNumber={q.question_number || qIdx + 1}
                                questionText={q.question_text}
                                options={q.options}
                                selectedValue={answers[qKey]}
                                onChange={(a, b) => handleAnswerChange(qKey, b !== undefined ? b : a)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
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

          {/* Center: Part indicator */}
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
                boxShadow: submitting ? 'none' : `0 2px 8px rgba(30,58,138,0.25)`,
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
        .listening-question-card > div:last-child {
          border-top: none !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default ListeningAptisExamPage;
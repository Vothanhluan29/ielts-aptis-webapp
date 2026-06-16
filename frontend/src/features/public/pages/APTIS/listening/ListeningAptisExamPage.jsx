import React, { useState, useEffect, useRef } from 'react';
import { Progress, message } from 'antd';
import {
  Clock, Headphones, ChevronLeft, ChevronRight, Send,
  Play, CheckCircle2, AlertCircle, Volume2, VolumeX
} from 'lucide-react';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion';
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion';
import { useListeningAptisExam } from '../../../hooks/APTIS/listening/useListeningAptisExam';

/* ─────────────────────────────────────────────────────────
   AUDIO PLAYER — APTIS style
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
      background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
      padding: '10px 16px', color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 16,
    }}>
      ⚠ Audio file missing for this question.
    </div>
  );

  const resolvedSrc = src.startsWith('http') ? src : `http://localhost:8000${src}`;

  return (
    <div style={{
      background: isLocked ? '#f8fafc' : '#eff6ff',
      border: `1.5px solid ${isLocked ? '#e2e8f0' : '#bfdbfe'}`,
      borderRadius: 12, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 20, transition: 'all 0.2s',
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
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isLocked ? 'not-allowed' : isPlaying ? 'default' : 'pointer',
          background: isLocked ? '#e2e8f0' : isPlaying ? '#93c5fd' : '#2563eb',
          color: '#fff', flexShrink: 0,
          boxShadow: isLocked ? 'none' : '0 2px 8px rgba(37,99,235,0.30)',
          transition: 'all 0.2s',
        }}
      >
        {isLocked ? <VolumeX size={18} /> : <Play size={18} fill="white" />}
      </button>

      {/* Progress & label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: isLocked ? '#94a3b8' : '#1d4ed8' }}>
            {isPlaying ? 'Playing…' : isLocked ? 'Audio played' : 'Press play to listen'}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            background: isLocked ? '#f1f5f9' : '#dbeafe',
            color: isLocked ? '#94a3b8' : '#1e40af',
            padding: '2px 8px', borderRadius: 20,
          }}>
            {isLocked ? '0 plays left' : `${playsLeft} play${playsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: '#dbeafe', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: isLocked ? '#94a3b8' : '#2563eb',
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

  useEffect(() => {
    if (!loading && activePart) {
      console.log('[Listening] activePart audio:', testDetail?.audio_url, activePart);
    }
  }, [loading, activePart, testDetail]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #2563eb', borderTopColor: 'transparent', animation: 'aptis-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8', margin: 0 }}>Loading test...</p>
      </div>
    </div>
  );

  if (parts.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: '48px 40px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
        <AlertCircle size={40} color="#f87171" style={{ marginBottom: 16 }} />
        <p style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', margin: '0 0 8px' }}>Empty Test</p>
        <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 20px' }}>No content has been added to this test.</p>
        <button onClick={handleGoBackEmpty} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
      </div>
    </div>
  );

  const totalQ = activePart?.groups?.reduce((s, g) => s + (g.questions?.length || 0), 0) || 0;
  const answeredQ = Object.keys(answers).length;

  return (
    <div style={{
      minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh',
      background: '#f0f4f8', display: 'flex', flexDirection: 'column',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#eff6ff', color: '#1d4ed8',
            padding: '4px 10px', borderRadius: 6, fontWeight: 700, fontSize: 12,
          }}>
            <Headphones size={13} />
            {isFullTest ? 'Listening' : 'Listening Test'}
          </div>
          {testDetail?.title && (
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{testDetail.title}</span>
          )}
        </div>
        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 8, fontWeight: 700, fontSize: 16,
          background: isTimeRunningOut ? '#fef2f2' : '#eff6ff',
          color: isTimeRunningOut ? '#dc2626' : '#1d4ed8',
          border: `1.5px solid ${isTimeRunningOut ? '#fca5a5' : '#bfdbfe'}`,
        }}>
          <Clock size={16} /> {formatTime(timeLeft)}
        </div>
      </div>

      {/* ═══════════════ PART TABS ═══════════════ */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f1f5f9',
        padding: '10px 24px',
      }}>
        <div style={{ display: 'flex', gap: 6, maxWidth: 820, margin: '0 auto' }}>
          {parts.map((p, idx) => {
            const active = currentPartId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setCurrentPartId(p.id)}
                style={{
                  padding: '6px 18px', borderRadius: 20, border: '1.5px solid',
                  borderColor: active ? '#2563eb' : '#e2e8f0',
                  background: active ? '#2563eb' : '#fff',
                  color: active ? '#fff' : '#64748b',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Part {p.part_number || idx + 1}
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: answeredQ === totalQ && totalQ > 0 ? '#16a34a' : '#94a3b8' }}>
            {answeredQ === totalQ && totalQ > 0 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {answeredQ}/{totalQ} answered
          </div>
        </div>
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>

          {/* Instructions banner */}
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 10, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          }}>
            <Volume2 size={16} color="#1d4ed8" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 13, color: '#1e40af', fontWeight: 500 }}>
              Listen carefully to each audio clip. You may listen to each clip a maximum of <strong>2 times</strong>. Select the best answer for each question.
            </p>
          </div>

          {/* Groups */}
          {!activePart?.groups || activePart.groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>No questions in this section.</div>
          ) : (
            activePart.groups.map((group, gIdx) => {
              const groupAudioSrc = group.audio_url || group.media_url || activePart?.audio_url || testDetail?.audio_url;
              const hasQAudio = group.questions?.some(q => q.audio_url || q.media_url);

              return (
                <div
                  key={group.id}
                  style={{
                    background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                    overflow: 'hidden', marginBottom: 20,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Group header */}
                  <div style={{
                    padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
                    background: '#fafbff', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ width: 3, height: 16, background: '#2563eb', borderRadius: 99 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>
                      Questions {group.questions?.[0]?.question_number} – {group.questions?.[group.questions.length - 1]?.question_number}
                    </span>
                  </div>

                  <div style={{ padding: '20px' }}>
                    {/* Group-level audio */}
                    {(groupAudioSrc || !hasQAudio) && (
                      <AptisAudioPlayer
                        src={groupAudioSrc}
                        startTime={group.start_time}
                        endTime={group.end_time}
                      />
                    )}

                    {/* Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {group.questions?.map((q, qIdx) => {
                        const qType = q.question_type?.toUpperCase() || '';
                        const pType = q.part_type?.toUpperCase() || '';
                        const isDropdown = qType === 'DROPDOWN' || qType === 'MATCHING' || pType.includes('PART_4');
                        const qKey = String(q.question_number || qIdx + 1);
                        const qAudioSrc = q.audio_url || q.media_url;

                        return (
                          <div key={q.id} style={{ borderRadius: 10, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                            {qAudioSrc && <div style={{ padding: '12px 16px 0' }}><AptisAudioPlayer src={qAudioSrc} /></div>}
                            <div style={{ padding: qAudioSrc ? '0 8px 8px' : '4px 8px 8px' }}>
                              {isDropdown ? (
                                <DropdownQuestion
                                  questionId={q.id} questionNumber={q.question_number || qIdx + 1}
                                  questionText={q.question_text} options={q.options}
                                  selectedValue={answers[qKey]}
                                  onChange={(a, b) => handleAnswerChange(qKey, b !== undefined ? b : a)}
                                />
                              ) : (
                                <MultipleChoiceQuestion
                                  questionId={q.id} questionNumber={q.question_number || qIdx + 1}
                                  questionText={q.question_text} options={q.options}
                                  selectedValue={answers[qKey]}
                                  onChange={(a, b) => handleAnswerChange(qKey, b !== undefined ? b : a)}
                                />
                              )}
                            </div>
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
        height: 64, background: '#fff', borderTop: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', bottom: 0, zIndex: 20,
      }}>
        <button
          onClick={() => setCurrentPartId(parts[currentTabIndex - 1]?.id)}
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
          {parts.map((p, idx) => (
            <div key={p.id} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: currentPartId === p.id ? '#2563eb' : '#cbd5e1',
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
              padding: '8px 22px', borderRadius: 8, border: 'none',
              background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
            }}
          >
            {submitting
              ? <><div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'aptis-spin 0.8s linear infinite' }} /> Submitting...</>
              : <><Send size={15} /> {isFullTest ? 'Submit & Continue to Reading' : 'Submit Test'}</>
            }
          </button>
        )}
      </div>

      <style>{`@keyframes aptis-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ListeningAptisExamPage;
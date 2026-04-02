import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button, Typography, Layout, Row, Col, Card } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CustomerServiceOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  TrophyFilled,
  AimOutlined
} from '@ant-design/icons';
import listeningAptisStudentApi from '../../../api/APTIS/listening/listeningAptisStudentApi';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

/* ─── helpers ───────────────────────────── */
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

// 🔥 TỐI ƯU 1: Dịch option mượt mà cho cả Array và Object
const getOptionLabel = (optionsObj, key) => {
  if (!key || String(key).trim() === "") return 'No answer selected';
  const p = safeParse(optionsObj);
  
  if (Array.isArray(p)) {
    const idx = parseInt(key);
    // Nếu key là index (0, 1, 2), dịch thành A, B, C
    if (!isNaN(idx) && p[idx]) return `${String.fromCharCode(65 + idx)}. ${p[idx]}`;
    return key;
  }
  
  return p[key] ? `${key}. ${p[key]}` : key;
};

const getCefrColor = (level) => {
  if (level === 'C') return '#10b981';
  if (level?.includes('B')) return '#3b82f6';
  if (level?.includes('A')) return '#f59e0b';
  return '#94a3b8';
};

/* ─── Question Review Card ──────────────── */
const QuestionReviewCard = ({ q, index, qResult }) => {
  const userAnswerKey = qResult?.user_answer;
  const correctAnswerRaw = qResult?.correct_answer || q.correct_answer;
  const isCorrect = qResult?.is_correct || false;
  
  // 🔥 TỐI ƯU 2: Chống lỗi học viên nộp đáp án là khoảng trắng ("   ")
  const isSkipped = userAnswerKey === undefined || userAnswerKey === null || String(userAnswerKey).trim() === ""; 
  
  const explanation = qResult?.explanation || q.explanation;
  const parsedOptions = safeParse(q.options);

  // 🔥 TỐI ƯU 3: Hiển thị đáp án đúng đẹp mắt (Convert 0,1,2 -> A,B,C nếu là Array)
  const getCorrectDisplay = () => {
    if (!correctAnswerRaw) return 'Answer not yet provided by system';
    if (parsedOptions[correctAnswerRaw]) return `${correctAnswerRaw}. ${parsedOptions[correctAnswerRaw]}`;

    const found = Object.entries(parsedOptions).find(
      ([, v]) => String(v).trim().toLowerCase() === String(correctAnswerRaw).trim().toLowerCase()
    );
    
    if (found) {
      if (Array.isArray(parsedOptions)) {
         const letter = String.fromCharCode(65 + parseInt(found[0])); // 0 -> A
         return `${letter}. ${found[1]}`;
      }
      return `${found[0]}. ${found[1]}`;
    }
    return correctAnswerRaw;
  };

  const accent = isCorrect ? '#10b981' : isSkipped ? '#94a3b8' : '#ef4444';
  const bg     = isCorrect ? '#f0fdf4' : isSkipped ? '#f8fafc' : '#fff5f5';
  const border = isCorrect ? '#bbf7d0' : isSkipped ? '#e2e8f0' : '#fecaca';

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 16,
      padding: '18px 20px', marginBottom: 12, display: 'flex', gap: 14,
      animation: 'fadeUp .3s ease both',
    }}>
      <div style={{
        minWidth: 32, height: 32, borderRadius: 10, background: accent, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 2,
      }}>
        {q.question_number || index + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, lineHeight: 1.5 }}>
          {q.question_text}
        </div>

        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 14px', borderRadius: 10,
          background: isCorrect ? '#dcfce7' : '#fee2e2', border: `1px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
          marginBottom: !isCorrect && correctAnswerRaw ? 8 : 0,
        }}>
          {isCorrect
            ? <CheckCircleFilled style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
            : <CloseCircleFilled style={{ color: '#dc2626', marginTop: 2, flexShrink: 0 }} />
          }
          <span style={{ fontSize: 13 }}>
            <strong style={{ color: isCorrect ? '#15803d' : '#b91c1c' }}>Your answer: </strong>
            <span style={{ color: isCorrect ? '#166534' : '#7f1d1d' }}>
              {isSkipped ? "Skipped" : getOptionLabel(q.options, userAnswerKey)}
            </span>
          </span>
        </div>

        {!isCorrect && correctAnswerRaw && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 14px', borderRadius: 10,
            background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: explanation ? 8 : 0,
          }}>
            <CheckCircleFilled style={{ color: '#2563eb', marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 13 }}>
              <strong style={{ color: '#1d4ed8' }}>Correct answer: </strong>
              <span style={{ color: '#1e3a8a' }}>{getCorrectDisplay()}</span>
            </span>
          </div>
        )}

        {explanation && (
          <div style={{
            display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#faf5ff',
            border: '1px solid #e9d5ff', marginTop: explanation && !isCorrect ? 0 : 8,
          }}>
            <BulbOutlined style={{ color: '#9333ea', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Explanation / Transcript
              </div>
              <div style={{ fontSize: 13, color: '#6b21a8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {explanation}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────── */
const ListeningAptisResultPage = () => {
  const { id } = useParams(); // submission_id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [activePartId, setActivePartId] = useState(null);

  /* ── fetch logic ── */
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);

        const detailsRes = await listeningAptisStudentApi.getSubmissionDetail(id);
        const subData = detailsRes.data || detailsRes;
        setSubmission(subData);

        if (subData?.test_id) {
          const testRes = await listeningAptisStudentApi.getTestDetail(subData.test_id);
          const testData = testRes.data || testRes;
          setTestDetail(testData);

          if (testData.parts?.length > 0) {
            setActivePartId(testData.parts[0].id);
          }
        }

      } catch (err) {
        console.error('Error fetching result:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResult();
  }, [id]);

  /* ── loading & not found ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 14 }}>Loading results...</div>
      </div>
    </div>
  );

  if (!submission || !testDetail) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        status="404"
        title="Result not found"
        subTitle="This submission has not been submitted or does not exist."
        extra={<Button type="primary" onClick={() => navigate('/aptis/listening')} className="bg-blue-600">Back to list</Button>}
      />
    </div>
  );

  /* ── data ── */
  const parts = testDetail?.parts || [];
  const resultsArray = submission.results || [];

  const cefrLevel = submission.cefr_level || 'N/A';
  const scoreVal = submission.score || 0;
  const correctCount = submission.correct_count || 0;

  let totalQuestions = 0;
  parts.forEach(p => {
    p.groups?.forEach(g => {
      totalQuestions += g.questions?.length || 0;
    });
  });

  const dateStr = submission.submitted_at || submission.created_at;
  const submitDate = dateStr
    ? new Date(dateStr).toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';

  const cefrColor = getCefrColor(cefrLevel);
  const activePart = parts.find(p => p.id === activePartId);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tab-btn { transition: all .2s ease; }
        .tab-btn:hover { opacity: .85; }
        .review-audio::-webkit-media-controls-panel {
          background-color: #eff6ff;
        }
      `}</style>

      <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 28,
            padding: '24px 24px 0 24px',
          }}
        >
          <button
            onClick={() => navigate('/aptis/listening')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeftOutlined />
            Test List
          </button>

          <div style={{ width: 1, height: 20, background: '#bfdbfe' }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontWeight: 700,
              fontSize: 13
            }}
          >
            <CustomerServiceOutlined />
            LISTENING
          </div>

          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1e293b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {testDetail?.title}
          </span>
      </div>

      <Content style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>

        {/* ── SCORE CARD ── */}
        <Card variant="borderless" className="rounded-3xl mb-8 shadow-sm border-slate-200" styles={{ body: { padding: '32px' } }}>
          <Row gutter={[24, 24]} align="middle">

            {/* Col 1: CEFR */}
            <Col xs={24} md={8} className="text-center md:border-r border-slate-200">
              <div className="mx-auto flex flex-col items-center justify-center w-32 h-32 rounded-full mb-3 shadow-inner" style={{ backgroundColor: `${cefrColor}15`, border: `4px solid ${cefrColor}` }}>
                <TrophyFilled style={{ fontSize: 24, color: cefrColor, marginBottom: 8 }} />
                <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: cefrColor }}>
                  {cefrLevel}
                </span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs">CEFR Level</Text>
            </Col>

            {/* Col 2: Aptis Score */}
            <Col xs={12} md={8} className="text-center md:border-r border-slate-200">
              <div className="mb-2">
                <AimOutlined className="text-3xl text-blue-500 mb-2" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                {scoreVal} <span className="text-xl text-slate-400 font-bold">/ 50</span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs mt-2 block">Aptis Score</Text>
            </Col>

            {/* Col 3: Correct answers */}
            <Col xs={12} md={8} className="text-center">
              <div className="mb-2">
                <CheckCircleFilled className="text-3xl text-emerald-500 mb-2" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                {correctCount} <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs mt-2 block">Correct Answers</Text>
            </Col>

          </Row>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500">
            <ClockCircleOutlined />
            <span>Submitted at: <strong className="text-slate-700">{submitDate}</strong></span>
          </div>
        </Card>

        {/* ── TABS (PARTS) ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, animation: 'fadeUp .45s ease both', overflowX: 'auto', paddingBottom: 8 }} className="custom-scrollbar">
          {parts.map((p, i) => {
            const isActive = activePartId === p.id;
            const count = p.groups?.reduce((sum, g) => sum + (g.questions?.length || 0), 0) || 0;

            return (
              <button
                key={p.id}
                className="tab-btn"
                onClick={() => setActivePartId(p.id)}
                style={{
                  padding: '10px 24px', borderRadius: 14, flexShrink: 0,
                  border: isActive ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                  background: isActive ? '#eff6ff' : '#fff', color: isActive ? '#1e40af' : '#64748b',
                  fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                Part {p.part_number || i + 1}
                <span style={{
                  background: isActive ? '#3b82f6' : '#f1f5f9', color: isActive ? '#fff' : '#94a3b8',
                  borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 800,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '12px 18px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', fontSize: 14, color: '#475569', marginBottom: 20, animation: 'fadeUp .5s ease both' }}>
          Reviewing <strong>Part {activePart?.part_number || 1}</strong>. You can replay the audio as many times as needed to review your mistakes.
        </div>

        {/* ── GROUPS & QUESTIONS ── */}
        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '32px 24px' } }}>
          <div style={{ animation: 'fadeUp .5s ease both' }}>
            {!activePart?.groups || activePart.groups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>No data available for this part.</div>
            ) : (
              activePart.groups.map(group => {
                const src = group.audio_url || group.media_url || group.audio_file || group.attached_audio;
                return (
                  <div key={group.id} style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px dashed #cbd5e1' }} className="last:border-0 last:mb-0 last:pb-0">

                    {src ? (
                      <div className="mb-6 p-5 rounded-2xl bg-blue-50/70 border border-blue-100 shadow-sm flex flex-col gap-3">
                        <Text className="font-bold text-blue-800 text-sm flex items-center gap-2">
                          <CustomerServiceOutlined /> Audio Recording:
                        </Text>
                        <audio controls src={src.startsWith('http') ? src : `http://localhost:8000${src}`} className="w-full h-12 outline-none review-audio" controlsList="nodownload" />
                      </div>
                    ) : (
                      <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <Text type="secondary" className="italic text-sm">No audio file attached.</Text>
                      </div>
                    )}

                    <div className="pl-2">
                      {group.questions?.map((q, idx) => {
                        const qResult = resultsArray.find(r => 
                          String(r.id) === String(q.id) || 
                          String(r.question_number) === String(q.question_number)
                        );

                        return (
                          <QuestionReviewCard
                            key={q.id}
                            q={q}
                            index={idx}
                            qResult={qResult}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

      </Content>
    </Layout>
  );
};

export default ListeningAptisResultPage;
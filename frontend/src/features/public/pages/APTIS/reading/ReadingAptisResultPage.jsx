import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Button, Typography, Layout, Row, Col, Card, Tag, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ReadOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  TrophyFilled,
  AimOutlined
} from '@ant-design/icons';
import readingAptisStudentApi from '../../../api/APTIS/reading/readingAptisStudentApi';

const { Header, Content } = Layout;
const { Text, Title, Paragraph } = Typography;

/* ─── helpers ───────────────────────────── */
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

const getOptionLabel = (optionsObj, key) => {
  if (!key) return 'No answer selected';
  const p = safeParse(optionsObj);
  // If answer is a joined string (e.g. Matching/Reorder "A-B-C"), display as-is
  if (typeof key === 'string' && key.includes('-')) return key;
  return p[key] ? `${key}. ${p[key]}` : key;
};

// CEFR color helper
const getCefrColor = (level) => {
  if (level === 'C') return '#10b981'; // Emerald
  if (level?.includes('B')) return '#3b82f6'; // Blue
  if (level?.includes('A')) return '#f59e0b'; // Amber
  return '#94a3b8'; // Gray
};

/* ─── Score Arc SVG ─────────────────────── */
const ScoreArc = ({ pct }) => {
  const r = 54;
  const circ = Math.PI * r; 
  const dash = circ * Math.min(pct, 1);
  const color = pct >= 0.8 ? '#10b981' : pct >= 0.5 ? '#f97316' : '#ef4444'; 
  
  return (
    <svg width="140" height="82" viewBox="0 0 140 82">
      <path d="M 14 76 A 56 56 0 0 1 126 76" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
      <path d="M 14 76 A 56 56 0 0 1 126 76" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
      />
      <TrophyOutlined style={{ display: 'none' }} />
    </svg>
  );
};

/* ─── Question Review Card ──────────────── */
const QuestionReviewCard = ({ q, index, qResult }) => {
  const userAnswerKey = qResult?.user_answer;
  const correctAnswerRaw = qResult?.correct_answer || q.correct_answer;
  const isCorrect = qResult?.is_correct || false;
  const isSkipped = !userAnswerKey;
  const explanation = qResult?.explanation || q.explanation;
  const parsedOptions = safeParse(q.options);

  const getCorrectDisplay = () => {
    if (!correctAnswerRaw) return 'Answer not provided by the system';
    if (parsedOptions[correctAnswerRaw]) return `${correctAnswerRaw}. ${parsedOptions[correctAnswerRaw]}`;
    
    if (typeof correctAnswerRaw === 'string' && correctAnswerRaw.includes('-')) return correctAnswerRaw;

    const found = Object.entries(parsedOptions).find(
      ([, v]) => String(v).trim().toLowerCase() === String(correctAnswerRaw).trim().toLowerCase()
    );
    return found ? `${found[0]}. ${found[1]}` : correctAnswerRaw;
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
              {getOptionLabel(q.options, userAnswerKey)}
            </span>
          </span>
        </div>

        {!isCorrect && correctAnswerRaw && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 14px', borderRadius: 10,
            background: '#fff7ed', border: '1px solid #fed7aa', marginBottom: explanation ? 8 : 0,
          }}>
            <CheckCircleFilled style={{ color: '#ea580c', marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 13 }}>
              <strong style={{ color: '#c2410c' }}>Correct answer: </strong>
              <span style={{ color: '#9a3412' }}>{getCorrectDisplay()}</span>
            </span>
          </div>
        )}

        {explanation && (
          <div style={{
            display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#fffbeb',
            border: '1px solid #ffedd5', marginTop: explanation && !isCorrect ? 0 : 8,
          }}>
            <BulbOutlined style={{ color: '#f97316', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Explanation
              </div>
              <div style={{ fontSize: 13, color: '#9a3412', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
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
const ReadingAptisResultPage = () => {
  const { id } = useParams();
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

        const testRes = await readingAptisStudentApi.getTestDetail(id);
        const testData = testRes.data || testRes;
        setTestDetail(testData);

        if (testData.parts?.length > 0) {
          setActivePartId(testData.parts[0].id);
        }

        const historyRes = await readingAptisStudentApi.getMyHistory();
        const historyList = historyRes.data || historyRes || [];
        const testSubmissions = historyList.filter(item => item.test_id === parseInt(id));

        if (testSubmissions.length > 0) {
          const latestSub = testSubmissions.sort((a, b) => b.id - a.id)[0];
          const detailsRes = await readingAptisStudentApi.getSubmissionDetail(latestSub.id);
          const subData = detailsRes.data || detailsRes;
          setSubmission(subData);
        } else {
          setSubmission(null);
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

  if (!submission) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        status="404"
        title="Result Not Found"
        subTitle="This submission has not been submitted or does not exist."
        extra={<Button type="primary" onClick={() => navigate('/aptis/reading')} className="bg-orange-500 border-none">Back to List</Button>}
      />
    </div>
  );

  /* ── DATA FROM BACKEND ── */
  const parts = testDetail?.parts || [];
  const resultsArray = submission.results || [];
  
  const cefrLevel = submission.cefr_level || "N/A";
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
    ? new Date(dateStr).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';

  const cefrColor = getCefrColor(cefrLevel);
  const activePart = parts.find(p => p.id === activePartId);

  // --- RENDER QUESTION REVIEW (SINGLE COLUMN LAYOUT) ---
  const renderReviewQuestions = (groups) => {
    return groups?.map((group) => (
      <div key={group.id} className="mb-10 last:mb-0">
        {group.instruction && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
            <Text className="text-orange-800 font-bold text-base whitespace-pre-wrap">
              {group.instruction}
            </Text>
          </div>
        )}

        <div className="space-y-4 pl-2">
          {group.questions?.map((q, idx) => {
            const qResult = resultsArray.find(r => r.id === q.id);
            return <QuestionReviewCard key={q.id} q={q} index={idx} qResult={qResult} />;
          })}
        </div>
        <Divider dashed className="my-8 border-slate-200" />
      </div>
    ));
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tab-btn { transition: all .2s ease; }
        .tab-btn:hover { opacity: .85; }
        .animation-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 28,
          padding: '24px 24px 0',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/aptis/reading')}
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

        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: '#fdba74'
          }}
        />

        {/* Category badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            background: '#fff7ed',
            border: '1px solid #fdba74',
            color: '#ea580c',
            fontWeight: 700,
            fontSize: 13
          }}
        >
          <ReadOutlined />
          READING
        </div>

        {/* Test title */}
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

        {/* ── SCORE CARD (3 COLUMNS) ── */}
        <Card variant="borderless" className="rounded-3xl mb-8 shadow-sm border-slate-200" styles={{ body: { padding: '32px' } }}>
          <Row gutter={[24, 24]} align="middle">
            
            {/* Column 1: CEFR */}
            <Col xs={24} md={8} className="text-center md:border-r border-slate-200">
              <div className="mx-auto flex flex-col items-center justify-center w-32 h-32 rounded-full mb-3 shadow-inner" style={{ backgroundColor: `${cefrColor}15`, border: `4px solid ${cefrColor}` }}>
                <TrophyFilled style={{ fontSize: 24, color: cefrColor, marginBottom: 8 }} />
                <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: cefrColor }}>
                  {cefrLevel}
                </span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs">CEFR Level</Text>
            </Col>

            {/* Column 2: Aptis Score */}
            <Col xs={12} md={8} className="text-center md:border-r border-slate-200">
              <div className="mb-2">
                <AimOutlined className="text-3xl text-orange-500 mb-2" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                {scoreVal} <span className="text-xl text-slate-400 font-bold">/ 50</span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs mt-2 block">Aptis Score</Text>
            </Col>

            {/* Column 3: Correct Answers */}
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

        {/* ── PART TABS ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, animation: 'fadeUp .45s ease both', overflowX: 'auto', paddingBottom: 8 }} className="custom-scrollbar">
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
                  border: isActive ? '2px solid #f97316' : '2px solid #e2e8f0',
                  background: isActive ? '#fff7ed' : '#fff', color: isActive ? '#c2410c' : '#64748b',
                  fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                Part {p.part_number || i + 1}
                <span style={{
                  background: isActive ? '#f97316' : '#f1f5f9', color: isActive ? '#fff' : '#94a3b8',
                  borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 800,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SINGLE COLUMN LAYOUT — Question Review for all Parts */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animation-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
                <ReadOutlined className="text-orange-500 text-2xl" />
                <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Detailed Question Explanations</Title>
              </div>
              
              {renderReviewQuestions(activePart?.groups)}
            </div>
        </div>

      </Content>
    </Layout>
  );
};

export default ReadingAptisResultPage;
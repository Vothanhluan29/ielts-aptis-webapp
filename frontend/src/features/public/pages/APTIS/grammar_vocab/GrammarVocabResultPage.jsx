import React from 'react';
import { Spin, Result, Button, Typography, Layout, Row, Col, Card } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  BookOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  AimOutlined
} from '@ant-design/icons';

// Nhúng Custom Hook
import { useGrammarVocabResult } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabResult';

const { Content } = Layout;
const { Text, Title } = Typography;

/* ─── Helpers ───────────────────────────── */
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

const getOptionLabel = (optionsObj, key) => {
  if (!key) return 'No answer selected';
  const p = safeParse(optionsObj);
  return p[key] ? `${key}. ${p[key]}` : key;
};

/* ─── Question Review Card ──────────────── */
const QuestionReviewCard = ({ q, index, userAnswerKey, answerDetail }) => {
  const correctAnswerRaw = answerDetail?.correct_answer || q.correct_answer;
  const isCorrect = answerDetail?.is_correct || false;
  const isSkipped = !userAnswerKey;
  const explanation = answerDetail?.explanation || q.explanation;
  const parsedOptions = safeParse(q.options);

  const getCorrectDisplay = () => {
    if (!correctAnswerRaw) return 'Answer not yet provided by system';
    if (parsedOptions[correctAnswerRaw]) return `${correctAnswerRaw}. ${parsedOptions[correctAnswerRaw]}`;

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
        {index + 1}
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
                Explanation
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
const GrammarVocabResultPage = () => {
  // 🔥 Lấy toàn bộ State và Hàm từ Hook
  const {
    loading,
    submission,
    testDetail,
    activeTab,
    setActiveTab,
    computedData,
    handleGoBack
  } = useGrammarVocabResult();

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
        title="Result not found"
        subTitle="This submission has not been submitted or does not exist."
        extra={<Button type="primary" onClick={handleGoBack} className="bg-emerald-600">Back to list</Button>}
      />
    </div>
  );

  // Giải nén các biến đã được Hook tính toán xong xuôi
  const {
    userAnswers,
    answerDetails,
    totalQuestions,
    scoreVal,
    correctCount,
    submitDate,
    activeQuestions,
    tabsConfig
  } = computedData;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tab-btn { transition: all .2s ease; }
        .tab-btn:hover { opacity: .85; }
      `}</style>

      {/* ── CUSTOM HEADER ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '24px 24px 0 24px',
        }}
      >
        <button
          onClick={handleGoBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 999, border: '1px solid #e2e8f0', background: '#f8fafc',
            color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <ArrowLeftOutlined />
          Test List
        </button>

        <div style={{ width: 1, height: 20, background: '#a7f3d0' }} />

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 999, background: '#ecfdf5', border: '1px solid #a7f3d0',
            color: '#059669', fontWeight: 700, fontSize: 13
          }}
        >
          <BookOutlined />
          GRAMMAR & VOCAB
        </div>

        <span
          style={{
            fontSize: 16, fontWeight: 700, color: '#1e293b',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}
        >
          {testDetail?.title}
        </span>
      </div>

      <Content style={{ padding: '0px 24px 32px 24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>

        {/* ── SCORE CARD ── */}
        <Card variant="borderless" className="rounded-3xl mb-8 shadow-sm border-slate-200" styles={{ body: { padding: '32px' } }}>
          <Row gutter={[24, 24]} align="middle" justify="center">

            {/* Col 1: Aptis Score */}
            <Col xs={12} md={12} className="text-center md:border-r border-slate-200">
              <div className="mb-2">
                <AimOutlined className="text-3xl text-emerald-500 mb-2" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                {scoreVal} <span className="text-xl text-slate-400 font-bold">/ 50</span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs mt-2 block">Converted Score</Text>
            </Col>

            {/* Col 2: Correct answers */}
            <Col xs={12} md={12} className="text-center">
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

        {/* ── TABS (GRAMMAR / VOCAB) ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, animation: 'fadeUp .45s ease both', overflowX: 'auto', paddingBottom: 8 }} className="custom-scrollbar">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="tab-btn"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 24px', borderRadius: 14, flexShrink: 0,
                  border: isActive ? '2px solid #10b981' : '2px solid #e2e8f0',
                  background: isActive ? '#ecfdf5' : '#fff', color: isActive ? '#065f46' : '#64748b',
                  fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                {tab.label}
                <span style={{
                  background: isActive ? '#10b981' : '#f1f5f9', color: isActive ? '#fff' : '#94a3b8',
                  borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 800,
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '12px 18px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', fontSize: 14, color: '#475569', marginBottom: 20, animation: 'fadeUp .5s ease both' }}>
          Reviewing <strong>{activeTab === 'GRAMMAR' ? 'Grammar' : 'Vocabulary'}</strong> section. Check your mistakes and read the explanations below.
        </div>

        {/* ── QUESTIONS ── */}
        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '32px 24px' } }}>
          <div style={{ animation: 'fadeUp .5s ease both' }}>
            {activeQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>No data available for this part.</div>
            ) : (
              activeQuestions.map((q, idx) => (
                <QuestionReviewCard
                  key={q.id}
                  q={q}
                  index={idx}
                  userAnswerKey={userAnswers[q.id]}
                  answerDetail={answerDetails[q.id]}
                />
              ))
            )}
          </div>
        </Card>

      </Content>
    </Layout>
  );
};

export default GrammarVocabResultPage;
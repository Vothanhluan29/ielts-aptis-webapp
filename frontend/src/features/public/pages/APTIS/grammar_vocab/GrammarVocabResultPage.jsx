import React from 'react';
import { Spin, Result, Button, Typography, Layout, Row, Col, Card } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled,
  BookOutlined, BulbOutlined, ClockCircleOutlined, AimOutlined
} from '@ant-design/icons';

// Nhúng Custom Hook
import { useGrammarVocabResult } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabResult';

const { Content } = Layout;
const { Text, Title } = Typography;

const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

const getOptionLabel = (optionsObj, key) => {
  if (!key) return 'No answer';
  const p = safeParse(optionsObj);
  return p[key] ? `${key}. ${p[key]}` : key;
};

/* ─── Question Review Card (Thu gọn UI) ──────────────── */
const QuestionReviewCard = ({ q, index, userAnswerKey, answerDetail }) => {
  const correctAnswerRaw = answerDetail?.correct_answer || q.correct_answer;
  const isCorrect = answerDetail?.is_correct || false;
  const isSkipped = !userAnswerKey;
  const explanation = answerDetail?.explanation || q.explanation;
  const parsedOptions = safeParse(q.options);

  const getCorrectDisplay = () => {
    if (!correctAnswerRaw) return 'N/A';
    if (parsedOptions[correctAnswerRaw]) return `${correctAnswerRaw}. ${parsedOptions[correctAnswerRaw]}`;

    const found = Object.entries(parsedOptions).find(
      ([, v]) => String(v).trim().toLowerCase() === String(correctAnswerRaw).trim().toLowerCase()
    );
    return found ? `${found[0]}. ${found[1]}` : correctAnswerRaw;
  };

  const cardStyle = isCorrect ? 'bg-green-50/50 border-green-200' : isSkipped ? 'bg-slate-50 border-slate-200' : 'bg-red-50/50 border-red-200';
  const badgeStyle = isCorrect ? 'bg-green-500' : isSkipped ? 'bg-slate-400' : 'bg-red-500';

  return (
    <div className={`border rounded-xl p-3.5 mb-3 flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${cardStyle}`}>
      {/* Số thứ tự câu hỏi */}
      <div className={`min-w-7 h-7 rounded-md text-white flex items-center justify-center text-xs font-bold mt-0.5 ${badgeStyle}`}>
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        {/* Câu hỏi */}
        <div className="text-[13px] font-semibold text-slate-800 mb-2 leading-snug">{q.question_text}</div>

        {/* Khối hiển thị đáp án thu gọn (Inline Tags) */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${isCorrect ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
            {isCorrect ? <CheckCircleFilled /> : <CloseCircleFilled />}
            <span><strong>Your answer :</strong> {isSkipped ? "Skipped" : getOptionLabel(q.options, userAnswerKey)}</span>
          </div>

          {!isCorrect && correctAnswerRaw && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs">
              <CheckCircleFilled />
              <span><strong>Correct:</strong> {getCorrectDisplay()}</span>
            </div>
          )}
        </div>

        {/* Giải thích (Nhỏ gọn hơn) */}
        {explanation && (
          <div className="mt-2 bg-emerald-50/50 border border-emerald-100 rounded-md p-2 text-xs text-emerald-900 leading-relaxed">
            <strong className="text-emerald-600 block mb-0.5 uppercase tracking-wide text-[10px]">Explanation</strong>
            {explanation}
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-3 text-slate-400 text-sm">Loading results...</div>
      </div>
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Result
        status="404"
        title="Result not found"
        subTitle="This submission has not been submitted or does not exist."
        extra={<Button type="primary" onClick={handleGoBack} className="bg-emerald-600 border-none">Back to list</Button>}
      />
    </div>
  );

  // Giải nén các biến đã được Hook tính toán
  const {
    userAnswers, answerDetails, totalQuestions, scoreVal, correctCount, 
    submitDate, activeQuestions, tabsConfig
  } = computedData;

  return (
    <Layout className="min-h-screen bg-slate-50">

      {/* ── CUSTOM HEADER ── */}
      <div className="flex items-center gap-3 mb-6 px-6 pt-6">
        <button onClick={handleGoBack} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-semibold hover:bg-slate-100 transition-all text-sm">
          <ArrowLeftOutlined /> Test List
        </button>
        <div className="w-px h-5 bg-emerald-300" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-[13px]">
          <BookOutlined /> GRAMMAR & VOCAB
        </div>
        <span className="text-base font-bold text-slate-800 truncate">{testDetail?.title}</span>
      </div>

      <Content className="px-6 pb-8 max-w-4xl mx-auto w-full">

        {/* ── SCORE CARD ── */}
        <Card variant="borderless" className="rounded-3xl mb-6 shadow-sm border-slate-200" styles={{ body: { padding: '24px 32px' } }}>
          <Row gutter={[24, 24]} align="middle" justify="center">

            {/* Col 1: Aptis Score */}
            <Col xs={12} md={12} className="text-center md:border-r border-slate-200">
              <AimOutlined className="text-2xl text-emerald-500 mb-1 block" />
              <div className="text-3xl font-black text-slate-800 leading-none">
                {scoreVal} <span className="text-lg text-slate-400">/ 50</span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-[10px] mt-1.5 block">Converted Score</Text>
            </Col>

            {/* Col 2: Correct answers */}
            <Col xs={12} md={12} className="text-center">
              <CheckCircleFilled className="text-2xl text-green-500 mb-1 block" />
              <div className="text-3xl font-black text-slate-800 leading-none">
                {correctCount} <span className="text-lg text-slate-400">/ {totalQuestions}</span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-[10px] mt-1.5 block">Correct Answers</Text>
            </Col>

          </Row>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
            <ClockCircleOutlined />
            <span>Submitted at: <strong className="text-slate-600">{submitDate}</strong></span>
          </div>
        </Card>

        {/* ── TABS (GRAMMAR / VOCAB) ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all border-2 ${
                  isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── INFO BOX ── */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 border-l-4 border-l-emerald-500 text-sm text-slate-600 mb-5 animate-in fade-in">
          Reviewing <strong>{activeTab === 'GRAMMAR' ? 'Grammar' : 'Vocabulary'}</strong> section. Check your mistakes and read the explanations below.
        </div>

        {/* ── QUESTIONS REVIEW ── */}
        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '24px 32px' } }}>
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {activeQuestions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">No data available for this part.</div>
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
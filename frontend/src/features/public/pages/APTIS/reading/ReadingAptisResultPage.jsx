import React from 'react';
import { Spin, Result, Button, Typography, Layout, Row, Col, Card, Tag, Divider } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled,
  ReadOutlined, BulbOutlined, ClockCircleOutlined,
  TrophyFilled, AimOutlined
} from '@ant-design/icons';

// Nhúng Custom Hook
import { useReadingAptisResult } from '../../../hooks/APTIS/reading/useReadingAptisResult';

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
  // Dành cho Matching/Reorder "A-B-C"
  if (typeof key === 'string' && key.includes('-')) return key;
  return p[key] ? `${key}. ${p[key]}` : key;
};

const getCefrColor = (level) => {
  if (level === 'C') return '#10b981'; // Emerald
  if (level?.includes('B')) return '#3b82f6'; // Blue
  if (level?.includes('A')) return '#f59e0b'; // Amber
  return '#94a3b8'; // Gray
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

  // Tailwind dynamic classes
  const cardStyle = isCorrect ? 'bg-green-50 border-green-200' : isSkipped ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200';
  const badgeStyle = isCorrect ? 'bg-green-500' : isSkipped ? 'bg-slate-400' : 'bg-red-500';

  return (
    <div className={`border rounded-2xl p-5 mb-3 flex gap-3.5 animate-in fade-in slide-in-from-bottom-2 ${cardStyle}`}>
      <div className={`min-w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-extrabold mt-0.5 ${badgeStyle}`}>
        {q.question_number || index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">{q.question_text}</div>

        <div className={`flex items-start gap-2 p-2.5 rounded-lg border mb-2 ${isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
          {isCorrect ? <CheckCircleFilled className="text-green-600 mt-0.5" /> : <CloseCircleFilled className="text-red-600 mt-0.5" />}
          <span className="text-[13px]">
            <strong className={isCorrect ? 'text-green-800' : 'text-red-800'}>Your answer: </strong>
            <span className={isCorrect ? 'text-green-900' : 'text-red-900'}>{isSkipped ? "Skipped" : getOptionLabel(q.options, userAnswerKey)}</span>
          </span>
        </div>

        {!isCorrect && correctAnswerRaw && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-50 border border-orange-200 mb-2">
            <CheckCircleFilled className="text-orange-600 mt-0.5" />
            <span className="text-[13px]">
              <strong className="text-orange-700">Correct answer: </strong>
              <span className="text-orange-900">{getCorrectDisplay()}</span>
            </span>
          </div>
        )}

        {explanation && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-orange-50/50 border border-orange-100 mt-2">
            <BulbOutlined className="text-orange-500 mt-0.5" />
            <div>
              <div className="text-xs font-extrabold text-orange-600 mb-1 uppercase tracking-wide">Explanation</div>
              <div className="text-[13px] text-orange-900 leading-relaxed whitespace-pre-wrap">{explanation}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────── */
const ReadingAptisResultPage = () => {
  // 🔥 Rút Data và Handlers từ Hook
  const {
    loading,
    submission,
    testDetail,
    activePartId,
    setActivePartId,
    computedData,
    handleGoBack
  } = useReadingAptisResult();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-3 text-slate-400 text-sm">Loading results...</div>
      </div>
    </div>
  );

  if (!submission || !testDetail || !computedData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Result status="404" title="Result Not Found" subTitle="This submission does not exist." extra={<Button type="primary" onClick={handleGoBack} className="bg-orange-500 border-none">Back to List</Button>} />
    </div>
  );

  // Giải nén các biến đã được hook tính toán xong
  const { parts, resultsArray, cefrLevel, scoreVal, correctCount, totalQuestions, submitDate, activePart } = computedData;
  const cefrColor = getCefrColor(cefrLevel);

  // Render câu hỏi cho phần Review
  const renderReviewQuestions = (groups) => {
    return groups?.map((group) => (
      <div key={group.id} className="mb-10 last:mb-0">
        {group.instruction && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
            <Text className="text-orange-800 font-bold text-base whitespace-pre-wrap">{group.instruction}</Text>
          </div>
        )}
        <div className="space-y-4 pl-2">
          {group.questions?.map((q, idx) => {
            const qResult = resultsArray.find(r => r.id === q.id || String(r.question_number) === String(q.question_number));
            return <QuestionReviewCard key={q.id} q={q} index={idx} qResult={qResult} />;
          })}
        </div>
        <Divider dashed className="my-8 border-slate-200" />
      </div>
    ));
  };

  return (
    <Layout className="min-h-screen bg-slate-50">
      
      {/* CUSTOM HEADER */}
      <div className="flex items-center gap-3 mb-7 px-6 pt-6">
        <button onClick={handleGoBack} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-semibold hover:bg-slate-100 transition-all">
          <ArrowLeftOutlined /> Test List
        </button>
        <div className="w-px h-5 bg-orange-300" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-300 text-orange-600 font-bold text-[13px]">
          <ReadOutlined /> READING
        </div>
        <span className="text-base font-bold text-slate-800 truncate">{testDetail?.title}</span>
      </div>

      <Content className="px-6 pb-8 max-w-5xl mx-auto w-full">

        {/* ── SCORE CARD ── */}
        <Card variant="borderless" className="rounded-3xl mb-8 shadow-sm border-slate-200" styles={{ body: { padding: '32px' } }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={8} className="text-center md:border-r border-slate-200">
              <div className="mx-auto flex flex-col items-center justify-center w-32 h-32 rounded-full mb-3 shadow-inner" style={{ backgroundColor: `${cefrColor}15`, border: `4px solid ${cefrColor}` }}>
                <TrophyFilled style={{ fontSize: 24, color: cefrColor, marginBottom: 8 }} />
                <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: cefrColor }}>{cefrLevel}</span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs">CEFR Level</Text>
            </Col>

            <Col xs={12} md={8} className="text-center md:border-r border-slate-200">
              <AimOutlined className="text-3xl text-orange-500 mb-2 block" />
              <div className="text-3xl font-black text-slate-800 leading-none">{scoreVal} <span className="text-xl text-slate-400">/ 50</span></div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs mt-2 block">Aptis Score</Text>
            </Col>

            <Col xs={12} md={8} className="text-center">
              <CheckCircleFilled className="text-3xl text-green-500 mb-2 block" />
              <div className="text-3xl font-black text-slate-800 leading-none">{correctCount} <span className="text-xl text-slate-400">/ {totalQuestions}</span></div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-xs mt-2 block">Correct Answers</Text>
            </Col>
          </Row>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-slate-500 flex items-center justify-center gap-2">
            <ClockCircleOutlined /> Submitted at: <strong className="text-slate-700">{submitDate}</strong>
          </div>
        </Card>

        {/* ── PART TABS ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2">
          {parts.map((p, i) => {
            const isActive = activePartId === p.id;
            const count = p.groups?.reduce((sum, g) => sum + (g.questions?.length || 0), 0) || 0;
            return (
              <button
                key={p.id} onClick={() => setActivePartId(p.id)}
                className={`shrink-0 flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all border-2 ${
                  isActive ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-slate-200 bg-white text-slate-500 hover:opacity-80'
                }`}
              >
                Part {p.part_number || i + 1}
                <span className={`px-2.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── SINGLE COLUMN LAYOUT ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animate-in fade-in">
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
import React from 'react';
import { Spin, Result, Button, Typography, Layout, Row, Col, Card, Divider } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled,
  ReadOutlined, ClockCircleOutlined, TrophyFilled, AimOutlined, ExclamationCircleFilled
} from '@ant-design/icons';

// Import Custom Hook
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
  if (!key) return 'No answer';
  const p = safeParse(optionsObj);
  if (typeof key === 'string' && key.includes('-')) return key;
  return p[key] ? `${key}. ${p[key]}` : key;
};

const getCefrColor = (level) => {
  if (level === 'C') return '#10b981';
  if (level?.includes('B')) return '#3b82f6';
  if (level?.includes('A')) return '#f59e0b';
  return '#94a3b8';
};

/* ─── Individual Question Review Card ─── */
const QuestionReviewCard = ({ q, qResult, questionNumberDisplay }) => {
  const userAnswerKey = qResult?.user_answer;
  const correctAnswerRaw = qResult?.correct_answer || q.correct_answer;
  const isCorrect = qResult?.is_correct || false;
  const isSkipped = !userAnswerKey;
  const explanation = qResult?.explanation || q.explanation;
  const parsedOptions = safeParse(q.options);
  const qType = q.question_type?.toUpperCase();

  // 🔥 PARTIAL SCORE LOGIC FOR REORDER QUESTIONS
  let isPartial = false;
  let partialScore = 0;
  let totalPositions = 0;

  if (qType === 'REORDER_SENTENCES' && userAnswerKey && correctAnswerRaw && !isCorrect) {
    const userArr = String(userAnswerKey).split('-');
    const correctArr = String(correctAnswerRaw).split('-');

    if (userArr.length === correctArr.length) {
      totalPositions = correctArr.length;
      for (let i = 0; i < correctArr.length; i++) {
        if (userArr[i] === correctArr[i]) partialScore++;
      }
      if (partialScore > 0) isPartial = true;
    }
  }

  // Card style based on answer status
  const cardStyle = isCorrect
    ? 'bg-green-50/50 border-green-200'
    : isPartial
      ? 'bg-orange-50/50 border-orange-200' // Orange for Partial
      : isSkipped
        ? 'bg-slate-50 border-slate-200'
        : 'bg-red-50/50 border-red-200';

  const badgeStyle = isCorrect
    ? 'bg-green-500'
    : isPartial
      ? 'bg-orange-500' // Orange badge for partial
      : isSkipped
        ? 'bg-slate-400'
        : 'bg-red-500';

  const getCorrectDisplay = () => {
    if (!correctAnswerRaw) return 'N/A';
    if (parsedOptions[correctAnswerRaw]) return `${correctAnswerRaw}. ${parsedOptions[correctAnswerRaw]}`;
    if (typeof correctAnswerRaw === 'string' && correctAnswerRaw.includes('-')) return correctAnswerRaw;

    const found = Object.entries(parsedOptions).find(
      ([, v]) => String(v).trim().toLowerCase() === String(correctAnswerRaw).trim().toLowerCase()
    );
    return found ? `${found[0]}. ${found[1]}` : correctAnswerRaw;
  };

  return (
    <div className={`border rounded-xl p-3.5 mb-3 flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${cardStyle}`}>
      {/* Question number badge (supports range display e.g. 6 - 10) */}
      <div className={`px-2 min-w-7 h-7 rounded-md text-white flex items-center justify-center text-xs font-bold mt-0.5 whitespace-nowrap ${badgeStyle}`}>
        {questionNumberDisplay}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-slate-800 mb-2 leading-snug">{q.question_text}</div>

        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          {/* User answer tag */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${
            isCorrect ? 'bg-green-100 border-green-300 text-green-800' :
            isPartial ? 'bg-orange-100 border-orange-300 text-orange-800' :
            'bg-red-100 border-red-300 text-red-800'
          }`}>
            {isCorrect ? <CheckCircleFilled /> : isPartial ? <ExclamationCircleFilled /> : <CloseCircleFilled />}
            <span><strong>Yours:</strong> {isSkipped ? "Skipped" : getOptionLabel(q.options, userAnswerKey)}</span>
          </div>

          {/* Partial correct indicator tag */}
          {isPartial && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-orange-300 text-orange-600 text-xs font-semibold shadow-sm">
              ✨ Partial Score: {partialScore}/{totalPositions} correct positions
            </div>
          )}

          {/* Correct answer tag */}
          {(!isCorrect && correctAnswerRaw) && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs">
              <CheckCircleFilled />
              <span><strong>Correct:</strong> {getCorrectDisplay()}</span>
            </div>
          )}
        </div>

        {explanation && (
          <div className="mt-2 bg-white/60 border border-slate-200 rounded-md p-2 text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-500 block mb-0.5 uppercase tracking-wide text-[10px]">Explanation</strong>
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────── */
const ReadingAptisResultPage = () => {
  const {
    loading, submission, testDetail, activePartId, setActivePartId, computedData, handleGoBack
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

  const { parts, resultsArray, cefrLevel, scoreVal,submitDate, activePart } = computedData;
  const cefrColor = getCefrColor(cefrLevel);

  const renderReviewQuestions = (groups) => {
    // 🔥 Calculate sequential question numbers for the active part
    let globalQNum = 1;

    // Accumulate question counts from previous parts to get the correct starting number
    const currentPartIndex = parts.findIndex(p => p.id === activePartId);
    for (let i = 0; i < currentPartIndex; i++) {
      parts[i].groups?.forEach(g => {
        (g.questions || []).forEach(q => {
          if (q.question_type === 'REORDER_SENTENCES') {
            const optCount = Array.isArray(q.options) ? q.options.length : 0;
            globalQNum += (optCount > 0 ? optCount : 1);
          } else {
            globalQNum += 1;
          }
        });
      });
    }

    return groups?.map((group) => (
      <div key={group.id} className="mb-8 last:mb-0">
        {group.instruction && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <Text className="text-orange-800 font-bold text-[13px] whitespace-pre-wrap">{group.instruction}</Text>
          </div>
        )}
        <div className="space-y-3 pl-1">
          {group.questions?.map((q) => {
            const qResult = resultsArray.find(r => r.id === q.id || String(r.question_number) === String(q.question_number));

            // 🔥 Handle range label for Reorder questions (e.g. "6 - 10")
            let qNumDisplay = globalQNum.toString();
            let stepsToAdvance = 1;

            if (q.question_type === 'REORDER_SENTENCES') {
              const optCount = Array.isArray(q.options) ? q.options.length : 0;
              if (optCount > 1) {
                const endNum = globalQNum + optCount - 1;
                qNumDisplay = `${globalQNum} - ${endNum}`;
                stepsToAdvance = optCount;
              }
            }

            // Advance the counter for the next iteration
            globalQNum += stepsToAdvance;

            return <QuestionReviewCard key={q.id} q={q} qResult={qResult} questionNumberDisplay={qNumDisplay} />;
          })}
        </div>
        <Divider dashed className="my-6 border-slate-200" />
      </div>
    ));
  };

  return (
    <Layout className="min-h-screen bg-slate-50">

      {/* CUSTOM HEADER */}
      <div className="flex items-center gap-3 mb-6 px-6 pt-6">
        <button onClick={handleGoBack} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-semibold hover:bg-slate-100 transition-all text-sm">
          <ArrowLeftOutlined /> Test List
        </button>
        <div className="w-px h-5 bg-orange-300" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-300 text-orange-600 font-bold text-[13px]">
          <ReadOutlined /> READING
        </div>
        <span className="text-base font-bold text-slate-800 truncate">{testDetail?.title}</span>
      </div>

      <Content className="px-6 pb-8 max-w-4xl mx-auto w-full">

        {/* ── SCORE CARD ── */}
        <Card variant="borderless" className="rounded-3xl mb-6 shadow-sm border-slate-200" styles={{ body: { padding: '24px 32px' } }}>
          <Row gutter={[24, 24]} align="middle" justify="center">
            <Col xs={24} md={10} className="text-center md:border-r border-slate-200">
              <div className="mx-auto flex flex-col items-center justify-center w-24 h-24 rounded-full mb-2 shadow-inner" style={{ backgroundColor: `${cefrColor}15`, border: `3px solid ${cefrColor}` }}>
                <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: cefrColor }}>{cefrLevel}</span>
              </div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-[10px]">Certification Level</Text>
            </Col>

            <Col xs={24} md={10} className="text-center">
              <AimOutlined className="text-2xl text-orange-500 mb-1 block" />
              <div className="text-3xl font-black text-slate-800 leading-none">{scoreVal} <span className="text-lg text-slate-400">/ 50</span></div>
              <Text strong className="text-slate-500 uppercase tracking-widest text-[10px] mt-1.5 block">Aptis Score</Text>
            </Col>
          </Row>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
            <ClockCircleOutlined /> Submitted at: <strong className="text-slate-600">{submitDate}</strong>
          </div>
        </Card>

        {/* ── PART TABS ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2">
          {parts.map((p, i) => {
            const isActive = activePartId === p.id;
            return (
              <button
                key={p.id} onClick={() => setActivePartId(p.id)}
                className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all border-2 ${
                  isActive ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Part {p.part_number || i + 1}
              </button>
            );
          })}
        </div>

        {/* ── SINGLE COLUMN LAYOUT ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8 animate-in fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <ReadOutlined className="text-orange-500 text-xl" />
              <Title level={5} style={{ margin: 0, color: '#1e293b' }}>Detailed Explanations</Title>
            </div>
            {renderReviewQuestions(activePart?.groups)}
          </div>
        </div>

      </Content>
    </Layout>
  );
};

export default ReadingAptisResultPage;
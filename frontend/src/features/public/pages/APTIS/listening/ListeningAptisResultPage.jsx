import React from 'react';
import { Spin, Result, Button, Typography, Layout, Row, Col, Card, Divider } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled,
  CustomerServiceOutlined, ClockCircleOutlined, TrophyFilled, AimOutlined
} from '@ant-design/icons';
import { useListeningAptisResult } from '../../../hooks/APTIS/listening/useListeningAptisResult';

const { Content } = Layout;
const { Text, Title } = Typography;

/* ─── Helpers ───────────────────────────── */
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

const getOptionLabel = (optionsObj, key) => {
  if (!key || String(key).trim() === "") return 'No answer';
  const p = safeParse(optionsObj);
  if (Array.isArray(p)) {
    const idx = parseInt(key);
    return (!isNaN(idx) && p[idx]) ? `${String.fromCharCode(65 + idx)}. ${p[idx]}` : key;
  }
  return p[key] ? `${key}. ${p[key]}` : key;
};

const getCefrColor = (level) => {
  if (level === 'C') return '#10b981';
  if (level?.includes('B')) return '#3b82f6';
  if (level?.includes('A')) return '#f59e0b';
  return '#94a3b8';
};

/* ─── Individual Question Review Card ───────────────────────────── */
const QuestionReviewCard = ({ q, index, qResult }) => {
  const userAnswerKey = qResult?.user_answer;
  const correctAnswerRaw = qResult?.correct_answer || q.correct_answer;
  const isCorrect = qResult?.is_correct || false;
  const isSkipped = !userAnswerKey || String(userAnswerKey).trim() === "";
  const explanation = qResult?.explanation || q.explanation;
  const parsedOptions = safeParse(q.options);

  const getCorrectDisplay = () => {
    if (!correctAnswerRaw) return 'N/A';
    if (parsedOptions[correctAnswerRaw]) return `${correctAnswerRaw}. ${parsedOptions[correctAnswerRaw]}`;
    const found = Object.entries(parsedOptions).find(([, v]) => String(v).trim().toLowerCase() === String(correctAnswerRaw).trim().toLowerCase());

    if (found) {
      return Array.isArray(parsedOptions)
        ? `${String.fromCharCode(65 + parseInt(found[0]))}. ${found[1]}`
        : `${found[0]}. ${found[1]}`;
    }
    return correctAnswerRaw;
  };

  const cardStyle = isCorrect ? 'bg-green-50/50 border-green-200' : isSkipped ? 'bg-slate-50 border-slate-200' : 'bg-red-50/50 border-red-200';
  const badgeStyle = isCorrect ? 'bg-green-500' : isSkipped ? 'bg-slate-400' : 'bg-red-500';

  return (
    <div className={`border rounded-xl p-3.5 mb-3 flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${cardStyle}`}>
      {/* Question number badge */}
      <div className={`min-w-7 h-7 rounded-md text-white flex items-center justify-center text-xs font-bold mt-0.5 ${badgeStyle}`}>
        {q.question_number || index + 1}
      </div>

      <div className="flex-1 min-w-0">
        {/* Question text */}
        <div className="text-[13px] font-semibold text-slate-800 mb-2 leading-snug">{q.question_text}</div>

        {/* Inline answer tags */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${isCorrect ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
            {isCorrect ? <CheckCircleFilled /> : <CloseCircleFilled />}
            <span><strong>Yours:</strong> {isSkipped ? "Skipped" : getOptionLabel(q.options, userAnswerKey)}</span>
          </div>

          {!isCorrect && correctAnswerRaw && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 border border-blue-300 text-blue-800 text-xs">
              <CheckCircleFilled />
              <span><strong>Correct:</strong> {getCorrectDisplay()}</span>
            </div>
          )}
        </div>

        {/* Explanation / Transcript */}
        {explanation && (
          <div className="mt-2 bg-blue-50/50 border border-blue-100 rounded-md p-2 text-xs text-blue-900 leading-relaxed">
            <strong className="text-blue-600 block mb-0.5 uppercase tracking-wide text-[10px]">Explanation / Transcript</strong>
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────── */
const ListeningAptisResultPage = () => {
  const { loading, submission, testDetail, activePartId, setActivePartId, computedData, handleGoBack } = useListeningAptisResult();

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
      <Result status="404" title="Result not found" subTitle="This submission does not exist." extra={<Button type="primary" onClick={handleGoBack} className="bg-blue-600">Back to list</Button>} />
    </div>
  );

  const { parts, resultsArray, cefrLevel, scoreVal,submitDate, activePart } = computedData;
  const cefrColor = getCefrColor(cefrLevel);

  return (
    <Layout className="min-h-screen bg-slate-50">
      <style>{`.review-audio::-webkit-media-controls-panel { background-color: #eff6ff; }`}</style>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 px-6 pt-6">
        <button onClick={handleGoBack} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-semibold hover:bg-slate-100 transition-all text-sm">
          <ArrowLeftOutlined /> Test List
        </button>
        <div className="w-px h-5 bg-blue-200" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[13px]">
          <CustomerServiceOutlined /> LISTENING
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
              <AimOutlined className="text-2xl text-blue-500 mb-1 block" />
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
                  isActive ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Part {p.part_number || i + 1}
              </button>
            );
          })}
        </div>

        {/* ── QUESTIONS REVIEW ── */}
        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '24px 32px' } }}>
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {!activePart?.groups || activePart.groups.length === 0 ? (
              <div className="text-center py-10 text-slate-400">No data available for this part.</div>
            ) : (
              activePart.groups.map(group => {
                const src = group.audio_url || group.media_url || group.audio_file || group.attached_audio;
                return (
                  <div key={group.id} className="mb-8 last:mb-0 pb-6 border-b border-dashed border-slate-300 last:border-0 last:pb-0">

                    {src ? (
                      <div className="mb-4 p-4 rounded-xl bg-blue-50/70 border border-blue-100 shadow-sm flex flex-col gap-2">
                        <Text className="font-bold text-blue-800 text-[13px] flex items-center gap-2"><CustomerServiceOutlined /> Audio Recording:</Text>
                        <audio controls src={src.startsWith('http') ? src : `http://localhost:8000${src}`} className="w-full h-10 outline-none review-audio" controlsList="nodownload" />
                      </div>
                    ) : (
                      <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 italic text-[13px]">No audio file attached.</div>
                    )}

                    <div className="pl-1">
                      {group.questions?.map((q, idx) => {
                        const qResult = resultsArray.find(r => String(r.id) === String(q.id) || String(r.question_number) === String(q.question_number));
                        return <QuestionReviewCard key={q.id} q={q} index={idx} qResult={qResult} />;
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
import React from 'react';
import { Spin, Result, Button, Typography, Layout, Row, Col, Card } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled,
  CustomerServiceOutlined, BulbOutlined, ClockCircleOutlined,
  TrophyFilled, AimOutlined
} from '@ant-design/icons';
import { useListeningAptisResult } from '../../../hooks/APTIS/listening /useListeningAptisResult';

const { Content } = Layout;
const { Text } = Typography;

/* ─── Helpers ───────────────────────────── */
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

const getOptionLabel = (optionsObj, key) => {
  if (!key || String(key).trim() === "") return 'No answer selected';
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

/* ─── Question Review Card ──────────────── */
const QuestionReviewCard = ({ q, index, qResult }) => {
  const userAnswerKey = qResult?.user_answer;
  const correctAnswerRaw = qResult?.correct_answer || q.correct_answer;
  const isCorrect = qResult?.is_correct || false;
  const isSkipped = !userAnswerKey || String(userAnswerKey).trim() === ""; 
  const explanation = qResult?.explanation || q.explanation;
  const parsedOptions = safeParse(q.options);

  const getCorrectDisplay = () => {
    if (!correctAnswerRaw) return 'Answer not yet provided by system';
    if (parsedOptions[correctAnswerRaw]) return `${correctAnswerRaw}. ${parsedOptions[correctAnswerRaw]}`;
    const found = Object.entries(parsedOptions).find(([, v]) => String(v).trim().toLowerCase() === String(correctAnswerRaw).trim().toLowerCase());
    
    if (found) {
      return Array.isArray(parsedOptions) 
        ? `${String.fromCharCode(65 + parseInt(found[0]))}. ${found[1]}` 
        : `${found[0]}. ${found[1]}`;
    }
    return correctAnswerRaw;
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
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 mb-2">
            <CheckCircleFilled className="text-blue-600 mt-0.5" />
            <span className="text-[13px]">
              <strong className="text-blue-800">Correct answer: </strong>
              <span className="text-blue-900">{getCorrectDisplay()}</span>
            </span>
          </div>
        )}

        {explanation && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-purple-50 border border-purple-200 mt-2">
            <BulbOutlined className="text-purple-600 mt-0.5" />
            <div>
              <div className="text-xs font-extrabold text-purple-600 mb-1 uppercase tracking-wide">Explanation / Transcript</div>
              <div className="text-[13px] text-purple-900 leading-relaxed whitespace-pre-wrap">{explanation}</div>
            </div>
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

  const { parts, resultsArray, cefrLevel, scoreVal, correctCount, totalQuestions, submitDate, activePart } = computedData;
  const cefrColor = getCefrColor(cefrLevel);

  return (
    <Layout className="min-h-screen bg-slate-50">
      <style>{`.review-audio::-webkit-media-controls-panel { background-color: #eff6ff; }`}</style>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-7 px-6 pt-6">
        <button onClick={handleGoBack} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-semibold hover:bg-slate-100 transition-all">
          <ArrowLeftOutlined /> Test List
        </button>
        <div className="w-px h-5 bg-blue-200" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[13px]">
          <CustomerServiceOutlined /> LISTENING
        </div>
        <span className="text-base font-bold text-slate-800 truncate">{testDetail?.title}</span>
      </div>

      <Content className="px-6 pb-8 max-w-5xl mx-auto w-full">
        
        {/* SCORE CARD */}
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
              <AimOutlined className="text-3xl text-blue-500 mb-2 block" />
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

        {/* TABS */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2">
          {parts.map((p, i) => {
            const isActive = activePartId === p.id;
            const count = p.groups?.reduce((sum, g) => sum + (g.questions?.length || 0), 0) || 0;
            return (
              <button
                key={p.id} onClick={() => setActivePartId(p.id)}
                className={`shrink-0 flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all border-2 ${
                  isActive ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-500 hover:opacity-80'
                }`}
              >
                Part {p.part_number || i + 1}
                <span className={`px-2.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 border-l-4 border-l-blue-500 text-sm text-slate-600 mb-5 animate-in fade-in">
          Reviewing <strong>Part {activePart?.part_number || 1}</strong>. You can replay the audio as many times as needed.
        </div>

        {/* QUESTIONS */}
        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '32px 24px' } }}>
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {!activePart?.groups || activePart.groups.length === 0 ? (
              <div className="text-center py-10 text-slate-400">No data available for this part.</div>
            ) : (
              activePart.groups.map(group => {
                const src = group.audio_url || group.media_url || group.audio_file || group.attached_audio;
                return (
                  <div key={group.id} className="mb-10 pb-8 border-b border-dashed border-slate-300 last:border-0 last:mb-0 last:pb-0">
                    {src ? (
                      <div className="mb-6 p-5 rounded-2xl bg-blue-50/70 border border-blue-100 shadow-sm flex flex-col gap-3">
                        <Text className="font-bold text-blue-800 text-sm flex items-center gap-2"><CustomerServiceOutlined /> Audio Recording:</Text>
                        <audio controls src={src.startsWith('http') ? src : `http://localhost:8000${src}`} className="w-full h-12 outline-none review-audio" controlsList="nodownload" />
                      </div>
                    ) : (
                      <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 italic text-sm">No audio file attached.</div>
                    )}
                    <div className="pl-2">
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
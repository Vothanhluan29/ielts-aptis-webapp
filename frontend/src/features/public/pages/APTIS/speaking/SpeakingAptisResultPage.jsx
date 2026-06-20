import React from 'react';
import { Spin, Result, Typography, Layout, Tag, Alert, Tabs } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Mic, MessageSquare, PlayCircle, UserCheck } from 'lucide-react';

import { useSpeakingAptisResult } from '../../../hooks/APTIS/speaking/useSpeakingAptisResult';
import ResultHeader from '../../../components/APTIS/result/ResultHeader';
import ScoreHeroCard from '../../../components/APTIS/result/ScoreHeroCard';

const { Content } = Layout;
const { Text, Title, Paragraph } = Typography;

/* ─── COMPONENT: Phần Feedback của Giám khảo ─── */
const PartFeedback = ({ isGraded, feedback, score }) => {
  if (!isGraded && !feedback) return null;

  return (
    <div className="mt-4 p-4 rounded-xl bg-purple-50/80 border border-purple-100 flex gap-3">
      <MessageSquare className="text-purple-400 shrink-0 mt-0.5" size={20} />
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Text className="font-bold text-purple-700 block">Detailed Feedback</Text>
          {score !== undefined && score !== null && (
            <Tag color="purple" className="m-0 text-xs font-bold border-0 px-2 py-0.5">Score: {score}</Tag>
          )}
        </div>
        <Text className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">
          {feedback ? feedback : <span className="italic text-slate-400">No detailed feedback available yet.</span>}
        </Text>
      </div>
    </div>
  );
};

/* ─── MAIN PAGE ─── */
const SpeakingAptisResultPage = () => {
  const {
    loading, submission, testDetail, computedData, handleGoBack
  } = useSpeakingAptisResult();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-3 text-slate-400 text-sm">Loading recording results...</div>
      </div>
    </div>
  );

  if (!submission || !testDetail || !computedData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Result
        status="404"
        title="Result Not Found"
        subTitle="This submission has not been submitted or does not exist."
        extra={
          <button onClick={handleGoBack} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-colors">
            Back to List
          </button>
        }
      />
    </div>
  );

  const { parts, resultsArray, isGraded, cefrLevel, scoreVal, submitDate, overallFeedback } = computedData;

  // Map dữ liệu vào cấu trúc Tabs của Ant Design
  const tabItems = parts.map((part) => {
    const partResult = resultsArray.find(r => String(r.part_number) === String(part.part_number));
    const audioUrls = partResult?.audioUrls || [];
    const feedback = partResult?.admin_feedback;
    const score = partResult?.part_score ?? partResult?.score;

    return {
      key: `part-${part.id}`,
      label: <span className="font-bold text-[15px]">Part {part.part_number}</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 mt-2 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
            <Mic className="text-purple-500 w-6 h-6" />
            <Title level={4} className="m-0! text-slate-800">
              Part {part.part_number}: {part.title || 'Speaking Part'}
            </Title>
          </div>

          <div className="space-y-4 pl-2 mb-8">
            {part.questions?.map((q, qIdx) => (
              <div key={q.id} className="flex gap-4 items-start">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs shrink-0 mt-0.5">
                  Q{q.order_number || qIdx + 1}
                </div>
                <Text className="text-slate-700 font-medium text-[15px] whitespace-pre-wrap leading-relaxed mt-1">
                  {q.question_text}
                </Text>
              </div>
            ))}
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <PlayCircle size={16}/> Recordings for this part
              </Text>

              {audioUrls.length > 0 ? (
                <div className="space-y-3">
                  {audioUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {audioUrls.length > 1 && (
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 text-purple-600 font-bold text-xs shrink-0">
                          Q{idx + 1}
                        </div>
                      )}
                      <audio
                        controls
                        src={url}
                        controlsList="nodownload"
                        className="flex-1 max-w-md bg-white rounded-lg shadow-sm h-11"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Text type="secondary" className="italic text-red-400">No recording file found for this part.</Text>
              )}
            </div>

            <PartFeedback isGraded={isGraded} feedback={feedback} score={score} />
          </div>
        </div>
      )
    };
  });

  return (
    <Layout className="min-h-screen bg-slate-50">
      <style>{`
        audio::-webkit-media-controls-panel { background-color: #f8fafc; }
        .ant-tabs-nav::before { border-bottom: 1px solid #e2e8f0 !important; }
        .ant-tabs-tab { padding: 12px 0 !important; margin: 0 32px 0 0 !important; }
        .ant-tabs-tab-btn { color: #64748b !important; }
        .ant-tabs-tab-active .ant-tabs-tab-btn { color: #9333ea !important; }
        .ant-tabs-ink-bar { background: #9333ea !important; height: 3px !important; border-radius: 3px 3px 0 0 !important; }
      `}</style>

      <ResultHeader
        onGoBack={handleGoBack}
        skillName="SPEAKING"
        skillIcon={<Mic size={16} strokeWidth={2.5} />}
        skillColor="purple"
        testTitle={testDetail.title}
      />

      <Content className="px-6 pb-8 max-w-5xl mx-auto w-full">
        
        <div className="animate-in fade-in slide-in-from-bottom-2 mb-6">
          {!isGraded && (
            <Alert
              message="This exam is awaiting teacher grading"
              description="Your recording data has been saved. Please return after the teacher completes the evaluation to view your score and detailed feedback."
              type="warning"
              showIcon
              icon={<SyncOutlined spin />}
              className="mb-6 rounded-2xl border-amber-200 bg-amber-50/70 shadow-sm"
            />
          )}

          <ScoreHeroCard
            score={scoreVal}
            maxScore={50}
            cefrLevel={cefrLevel}
            submitDate={submitDate}
            skillColor="purple"
            isGraded={isGraded}
            scoreLabel="Speaking Score"
          />
        </div>

        {/* OVERALL FEEDBACK */}
        {isGraded && overallFeedback && (
          <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6 md:p-8 shadow-sm mb-6 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><UserCheck size={24} /></div>
              <Title level={4} className="m-0! text-purple-800">Overall Teacher Feedback</Title>
            </div>
            <Paragraph className="text-purple-900 text-[15px] leading-relaxed whitespace-pre-wrap m-0">
              {overallFeedback}
            </Paragraph>
          </div>
        )}

        {/* TABS */}
        <Tabs defaultActiveKey={`part-${parts[0]?.id}`} items={tabItems} className="mt-4" />

      </Content>
    </Layout>
  );
};

export default SpeakingAptisResultPage;
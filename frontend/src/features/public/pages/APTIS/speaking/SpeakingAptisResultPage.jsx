import React from 'react';
import { Spin, Result, Typography, Layout, Row, Col, Card, Tag, Alert, Tabs } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, SyncOutlined } from '@ant-design/icons';
import { Mic, Trophy, Target, MessageSquare, PlayCircle, UserCheck } from 'lucide-react';

// Nhúng Custom Hook
import { useSpeakingAptisResult } from '../../../hooks/APTIS/speaking/useSpeakingAptisResult';

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
    loading, submission, testDetail, computedData, handleGoBack, getCefrColor
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
  const cefrStyle = getCefrColor(cefrLevel);



  const tabItems = parts.map((part) => {
    const partFeedbackObj = resultsArray.find(r => String(r.part_number) === String(part.part_number) && r.admin_feedback);
    const feedback = partFeedbackObj?.admin_feedback;
    const score = partFeedbackObj?.part_score ?? partFeedbackObj?.score;

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

          <div className="space-y-6 pl-2 mb-8">
            {part.questions?.map((q, qIdx) => {
              const qResult = resultsArray.find(r => String(r.question_id) === String(q.id) || String(r.id) === String(q.id));
              const qAudioUrl = qResult?.audio_url || qResult?.user_answer || qResult?.audio_path || qResult?.user_audio_url;

              return (
                <div key={q.id} className="flex gap-4 items-start pb-6 border-b border-dashed border-slate-200 last:border-0 last:pb-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs shrink-0 mt-0.5">
                    Q{q.order_number || qIdx + 1}
                  </div>
                  
                  <div className="flex-1">
                    {/* Text Câu hỏi */}
                    <Text className="text-slate-700 font-medium text-[15px] whitespace-pre-wrap leading-relaxed mt-1 block mb-3">
                      {q.question_text}
                    </Text>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 inline-block w-full max-w-md">
                       <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                         <PlayCircle size={14}/> Your Response
                       </Text>
                       {qAudioUrl ? (
                         <audio controls src={qAudioUrl.startsWith('http') ? qAudioUrl : `http://localhost:8000${qAudioUrl}`} controlsList="nodownload" className="w-full h-9" />
                       ) : (
                         <Text type="secondary" className="italic text-red-400 text-xs">No recording submitted for this question.</Text>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            {/* Gọi component PartFeedback */}
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

      {/* CUSTOM HEADER */}
      <div className="flex items-center gap-3 mb-4 px-6 pt-6 max-w-5xl mx-auto w-full">
        <button onClick={handleGoBack} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 font-semibold hover:border-purple-300 hover:text-purple-600 transition-all text-sm">
          <ArrowLeftOutlined /> Test List
        </button>
        <div className="w-px h-5 bg-purple-200" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-bold text-[13px]">
          <Mic size={16} strokeWidth={2.5} /> SPEAKING
        </div>
        <span className="text-base font-bold text-slate-800 truncate">{testDetail.title}</span>
      </div>

      <Content className="px-6 pb-8 max-w-5xl mx-auto w-full">
        
        {/* SCORING SECTION */}
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

          <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '32px' } }}>
            <Row gutter={[24, 24]} align="middle" justify="center">
              <Col xs={12} md={8} className="text-center md:border-r border-slate-200">
                <div className={`mx-auto flex items-center justify-center w-28 h-28 rounded-full mb-3 shadow-inner border-4 ${isGraded ? cefrStyle : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                  <span className="text-4xl font-black">{isGraded ? cefrLevel : '?'}</span>
                </div>
                <Text strong className="text-slate-500 uppercase tracking-widest text-xs">CEFR Level</Text>
              </Col>

              <Col xs={12} md={8} className="text-center">
                <Target className={`w-8 h-8 mx-auto mb-2 ${isGraded ? 'text-purple-500' : 'text-slate-300'}`} />
                <div className="text-4xl font-black text-slate-800 mb-1">
                  {isGraded ? scoreVal : '--'} <span className="text-xl text-slate-400">/ 50</span>
                </div>
                <Text strong className="text-slate-500 uppercase tracking-widest text-xs">Speaking Score</Text>
              </Col>
            </Row>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-sm">
              <CheckCircleFilled className="text-green-500" />
              <span>Successfully submitted at: <strong className="text-slate-700">{submitDate}</strong></span>
            </div>
          </Card>
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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Typography, Layout, Row, Col, Card, Tag, Alert, Tabs, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  SyncOutlined,
} from '@ant-design/icons';
import { 
  Mic, Trophy, Target, MessageSquare, PlayCircle, UserCheck 
} from 'lucide-react';

import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

const { Content } = Layout;
const { Text, Title, Paragraph } = Typography;

const getCefrColor = (level) => {
  if (level === 'C') return '#10b981';
  if (level?.includes('B')) return '#3b82f6';
  if (level?.includes('A')) return '#f59e0b';
  return '#94a3b8';
};

const SpeakingAptisResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [testDetail, setTestDetail] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const testRes = await speakingAptisStudentApi.getTestDetail(id);
        const testData = testRes.data || testRes;
        setTestDetail(testData);

        const historyRes = await speakingAptisStudentApi.getMyHistory();
        const historyList = historyRes.data || historyRes || [];
        const testSubmissions = historyList.filter(item => Number(item.test_id) === Number(id));

        if (testSubmissions.length > 0) {
          const latestSub = testSubmissions.sort((a, b) => b.id - a.id)[0];
          const detailsRes = await speakingAptisStudentApi.getSubmissionDetail(latestSub.id);
          const subData = detailsRes.data || detailsRes;
          setSubmission(subData);
        } else {
          setSubmission(null);
        }
      } catch (err) {
        console.error('Error loading Speaking result:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 14 }}>Loading recording results...</div>
      </div>
    </div>
  );

  if (!submission) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        status="404"
        title="Result Not Found"
        subTitle="This submission has not been submitted or does not exist."
        extra={
          <button 
            onClick={() => navigate('/aptis/speaking')} 
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Back to List
          </button>
        }
      />
    </div>
  );

  const parts = testDetail?.parts || [];
  const resultsArray = submission.results || submission.responses || submission.answers || [];
  
  const isGraded = submission.status?.toUpperCase() === 'GRADED';
  const cefrLevel = submission.cefr_level || "N/A";
  const scoreVal = submission.total_score || 0;

  const dateStr = submission.submitted_at || submission.created_at;
  const submitDate = dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';

  const cefrColor = getCefrColor(cefrLevel);

  // ─────────────────────────────────────────────────────────────────
  // SCORING SECTION (always shown above tabs)
  // ─────────────────────────────────────────────────────────────────
  const ScoringSection = (
    <div className="animation-fade-in mb-6">
      {!isGraded && (
        <Alert
          message="This exam is awaiting teacher grading"
          description="Your recording data has been saved by the system. Please return after the teacher completes the evaluation to view your score and detailed feedback."
          type="warning"
          showIcon
          icon={<SyncOutlined spin />}
          className="mb-8 rounded-2xl border-orange-200 bg-orange-50/50 shadow-sm"
        />
      )}

      <Card variant="borderless" className="rounded-3xl mb-8 shadow-sm border-slate-200" styles={{ body: { padding: '32px' } }}>
        <Row gutter={[24, 24]} align="middle" justify="center">
          <Col xs={12} md={8} className="text-center md:border-r border-slate-200">
            <div className="mx-auto flex flex-col items-center justify-center w-28 h-28 rounded-full mb-3 shadow-inner transition-colors" 
                 style={{ backgroundColor: isGraded ? `${cefrColor}15` : '#f1f5f9', border: `4px solid ${isGraded ? cefrColor : '#cbd5e1'}` }}>
              <Trophy style={{ width: 24, height: 24, color: isGraded ? cefrColor : '#94a3b8', marginBottom: 8 }} />
              <span style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: isGraded ? cefrColor : '#94a3b8' }}>
                {isGraded ? cefrLevel : '?'}
              </span>
            </div>
            <Text strong className="text-slate-500 uppercase tracking-widest text-xs">CEFR Level</Text>
          </Col>

          <Col xs={12} md={8} className="text-center">
            <div className="mb-2 flex justify-center">
              <Target className={`w-8 h-8 ${isGraded ? 'text-purple-500' : 'text-slate-300'} mb-2`} />
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
              {isGraded ? scoreVal : '--'} <span className="text-xl text-slate-400 font-bold">/ 50</span>
            </div>
            <Text strong className="text-slate-500 uppercase tracking-widest text-xs mt-2 block">Speaking Score</Text>
          </Col>
        </Row>
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <CheckCircleFilled className="text-green-500" />
          <span>Successfully submitted at: <strong className="text-slate-700">{submitDate}</strong></span>
        </div>
      </Card>

      {isGraded && submission.overall_feedback && (
        <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
              <UserCheck size={24} />
            </div>
            <Title level={4} className="!m-0 text-purple-800">Overall Teacher Feedback</Title>
          </div>
          <Paragraph className="text-purple-900 text-base leading-relaxed whitespace-pre-wrap m-0">
            {submission.overall_feedback}
          </Paragraph>
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  // PART TABS (shown below scoring section)
  // ─────────────────────────────────────────────────────────────────
  const tabItems = parts.map((part) => {
    const partResult = resultsArray.find(r => String(r.part_number) === String(part.part_number));
    const audioUrl = partResult?.audio_url || partResult?.user_answer || partResult?.audio_path;
    const feedback = partResult?.admin_feedback;
    const score = partResult?.part_score ?? partResult?.score;

    return {
      key: `part-${part.id}`,
      label: `Part ${part.part_number}`,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animation-fade-in mt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
            <Mic className="text-purple-500 w-6 h-6" />
            <Title level={4} style={{ margin: 0, color: '#1e293b' }}>
              Part {part.part_number}: {part.title || 'Speaking Part'}
            </Title>
            {isGraded && score !== undefined && score !== null && (
              <Tag color="purple" className="ml-auto m-0 text-sm font-bold border-0 px-3 py-1">Score: {score}</Tag>
            )}
          </div>

          <div className="space-y-4 pl-2 mb-8">
            {part.questions?.map((q, qIdx) => (
              <div key={q.id} className="flex gap-4 items-start">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs shrink-0 mt-0.5">
                  Q{q.order_number || qIdx + 1}
                </div>
                <Text className="text-slate-700 font-medium text-base whitespace-pre-wrap">
                  {q.question_text}
                </Text>
              </div>
            ))}
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                <PlayCircle size={14}/> Recording for this part
              </Text>
              {audioUrl ? (
                <audio controls src={audioUrl} controlsList="nodownload" className="w-full max-w-md bg-white rounded-lg shadow-sm" />
              ) : (
                <Text type="secondary" className="italic text-red-400">No recording file found for this part.</Text>
              )}
            </div>

            {(isGraded || feedback) && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50/80 border border-purple-100 flex gap-3">
                <MessageSquare className="text-purple-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <Text className="font-bold text-purple-700 block mb-1">Detailed Feedback</Text>
                  <Text className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {feedback ? feedback : <span className="italic text-slate-400">No detailed feedback available.</span>}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    };
  });

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .animation-fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        audio {
          height: 40px;
          border-radius: 8px;
          width: 100%;
        }
        audio::-webkit-media-controls-panel {
          background-color: #f1f5f9;
        }
        
        /* Custom UI for Ant Design Tabs - Purple Theme */
        .ant-tabs-nav::before {
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .ant-tabs-tab {
          padding: 12px 0 !important;
          margin: 0 32px 0 0 !important;
        }
        .ant-tabs-tab-btn {
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #64748b !important;
        }
        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #9333ea !important;
        }
        .ant-tabs-ink-bar {
          background: #9333ea !important;
          height: 3px !important;
          border-radius: 3px 3px 0 0 !important;
        }
      `}</style>

      {/* ── CUSTOM HEADER ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          padding: '24px 24px 0', 
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/aptis/speaking')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#475569',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#9333ea'; e.currentTarget.style.borderColor = '#d8b4fe'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <ArrowLeftOutlined />
          Test List
        </button>

        {/* Vertical divider (light purple) */}
        <div
          style={{
            width: 1,
            height: 20,
            background: '#d8b4fe'
          }}
        />

        {/* Category badge (Purple theme) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            background: '#faf5ff',
            border: '1px solid #d8b4fe',
            color: '#9333ea',
            fontWeight: 700,
            fontSize: 13
          }}
        >
          <Mic size={16} strokeWidth={2.5} />
          SPEAKING
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

      {/* ── MAIN CONTENT: SCORING SECTION FIRST, THEN PART TABS ── */}
      <Content style={{ padding: '0 24px 32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        {ScoringSection}
        <Tabs defaultActiveKey={`part-${parts[0]?.id}`} items={tabItems} />
      </Content>
      
    </Layout>
  );
};

export default SpeakingAptisResultPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, Typography, Spin, Card, Row, Col, Tag, Alert, Tabs, Result
} from 'antd';
import { 
  ArrowLeftOutlined, CheckCircleFilled, SyncOutlined,
  MessageOutlined, FormOutlined, FileTextOutlined, MailOutlined,
} from '@ant-design/icons';
import { 
  PenLine, Trophy, Target, UserCheck
} from 'lucide-react';
import writingAptisStudentApi from '../../../api/APTIS/writing/writingAptisStudentApi';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const getCefrColor = (level) => {
  if (level === 'C') return '#10b981';
  if (level?.includes('B')) return '#3b82f6';
  if (level?.includes('A')) return '#f59e0b';
  return '#94a3b8';
};

const WritingAptisResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const historyRes = await writingAptisStudentApi.getMyHistory();
        const history = historyRes.data || historyRes;
        const currentSub = history.find(item => item.test_id === parseInt(id));

        if (currentSub) {
          const detailsRes = await writingAptisStudentApi.getSubmissionDetail(currentSub.id);
          setSubmission(detailsRes.data || detailsRes);
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id]);

  // --- Helpers ---
  const renderSafeText = (data) => {
    if (!data) return "";
    if (typeof data === 'string') return data;
    if (typeof data === 'object') return data.message || data.text || JSON.stringify(data);
    return String(data);
  };

  const safeParse = (data, defaultVal) => {
    if (!data) return defaultVal;
    if (Array.isArray(data) || typeof data === 'object') return data;
    try { return JSON.parse(data); } catch { return defaultVal; }
  };

  const countWords = (str) => {
    const text = renderSafeText(str);
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  // --- Sub-Components ---
  const PartFeedback = ({ partKey }) => {
    const fb = submission?.teacher_feedback?.[partKey];
    if (!submission || submission.status !== 'GRADED' || !fb) return null;

    return (
      <div className="mt-4 p-4 rounded-xl bg-purple-50/80 border border-purple-100 flex gap-3">
        <div className="shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Text className="font-bold text-purple-700 block">Teacher's Feedback</Text>
            <Tag color="purple" className="m-0 text-xs font-bold border-0 px-2 py-0.5">Score: {fb.score}</Tag>
          </div>
          <Text className="text-slate-600 whitespace-pre-wrap leading-relaxed" style={{ fontSize: 14 }}>
            {fb.comments || "No specific comments for this part."}
          </Text>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 14 }}>Loading writing results...</div>
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
            onClick={() => navigate('/aptis/writing')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Back to List
          </button>
        }
      />
    </div>
  );

  const isGraded = submission.status === 'GRADED';
  const testInfo = submission.test || {};
  const userAnswers = safeParse(submission.user_answers, {});

  const ansPart1 = safeParse(userAnswers.part_1, ["", "", "", "", ""]);
  const ansPart2 = userAnswers.part_2 || "";
  const ansPart3 = safeParse(userAnswers.part_3, ["", "", ""]);
  const ansPart4 = safeParse(userAnswers.part_4, { informal: "", formal: "" });

  const getPart = (num) => (testInfo.parts || []).find(p => p.part_number === num) || { questions: [] };
  const getQText = (part, idx, def) => (part.questions?.[idx]?.question_text || def);

  const cefrLevel = submission.cefr_level || "N/A";
  const scoreVal = submission.score || 0;
  const cefrColor = getCefrColor(cefrLevel);

  const dateStr = submission.submitted_at || submission.created_at;
  const submitDate = dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';

  // ─────────────────────────────────────────────────────────────────
  // SCORING SECTION (always shown above tabs)
  // ─────────────────────────────────────────────────────────────────
  const ScoringSection = (
    <div className="animation-fade-in mb-6">
      {!isGraded && (
        <Alert
          message="This exam is awaiting teacher grading"
          description="Your writing data has been saved by the system. Please return after the teacher completes the evaluation to view your score and detailed feedback."
          type="warning"
          showIcon
          icon={<SyncOutlined spin />}
          className="mb-8 rounded-2xl border-orange-200 bg-orange-50/50 shadow-sm"
        />
      )}

      <Card variant="borderless" className="rounded-3xl mb-8 shadow-sm border-slate-200" styles={{ body: { padding: '32px' } }}>
        <Row gutter={[24, 24]} align="middle" justify="center">
          <Col xs={12} md={8} className="text-center md:border-r border-slate-200">
            <div
              className="mx-auto flex flex-col items-center justify-center w-28 h-28 rounded-full mb-3 shadow-inner transition-colors"
              style={{ backgroundColor: isGraded ? `${cefrColor}15` : '#f1f5f9', border: `4px solid ${isGraded ? cefrColor : '#cbd5e1'}` }}
            >
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
            <Text strong className="text-slate-500 uppercase tracking-widest text-xs mt-2 block">Writing Score</Text>
          </Col>
        </Row>
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <CheckCircleFilled className="text-green-500" />
          <span>Successfully submitted at: <strong className="text-slate-700">{submitDate}</strong></span>
        </div>
      </Card>

      {isGraded && submission.overall_feedback && (
        <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 md:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
              <UserCheck size={24} />
            </div>
            <Title level={4} className="!m-0 text-purple-800">Overall Teacher Feedback</Title>
          </div>
          <Paragraph className="text-purple-900 text-base leading-relaxed whitespace-pre-wrap m-0">
            {renderSafeText(submission.overall_feedback) || "No overall feedback has been provided yet."}
          </Paragraph>
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────
  // PART TABS (shown below scoring section)
  // ─────────────────────────────────────────────────────────────────
  const tabItems = [
    {
      key: '1',
      label: <span><MessageOutlined /> Part 1</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animation-fade-in mt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
            <MessageOutlined className="text-purple-500 text-lg" />
            <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Part 1: Short Answers</Title>
          </div>
          {getPart(1).instruction && (
            <Text type="secondary" className="block mb-6">{getPart(1).instruction}</Text>
          )}
          <div className="space-y-4 pl-2 mb-8">
            {ansPart1.map((ans, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs shrink-0 mt-0.5">
                  Q{i + 1}
                </div>
                <div className="flex-1">
                  <Text type="secondary" style={{ fontSize: 12 }}>{getQText(getPart(1), i, `Q${i + 1}`)}</Text>
                  <div className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Text className="text-slate-800 font-semibold text-base">{renderSafeText(ans) || "---"}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PartFeedback partKey="PART_1" />
        </div>
      ),
    },
    {
      key: '2',
      label: <span><FormOutlined /> Part 2</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animation-fade-in mt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
            <FormOutlined className="text-purple-500 text-lg" />
            <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Part 2: Short Writing</Title>
          </div>
          {getPart(2).instruction && (
            <Text type="secondary" className="block mb-6">{getPart(2).instruction}</Text>
          )}
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm mb-4">
            <Text strong className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Prompt</Text>
            <Text className="text-slate-700 font-medium block mb-4">{getQText(getPart(2), 0, "Prompt...")}</Text>
            <div className="border-t border-slate-200 pt-4">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Your Answer</Text>
              <Paragraph className="text-slate-800 text-base whitespace-pre-wrap m-0 leading-relaxed">
                {renderSafeText(ansPart2) || <span className="italic text-slate-400">No answer</span>}
              </Paragraph>
            </div>
            <div className="text-right mt-3">
              <Text type="secondary" className="text-xs">Word count: {countWords(ansPart2)}</Text>
            </div>
          </div>
          <PartFeedback partKey="PART_2" />
        </div>
      ),
    },
    {
      key: '3',
      label: <span><FileTextOutlined /> Part 3</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animation-fade-in mt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
            <FileTextOutlined className="text-purple-500 text-lg" />
            <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Part 3: Extended Writing</Title>
          </div>
          {getPart(3).instruction && (
            <Text type="secondary" className="block mb-6">{getPart(3).instruction}</Text>
          )}
          <div className="space-y-6 mb-4">
            {ansPart3.map((ans, i) => (
              <div key={i} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Member: {getQText(getPart(3), i, `Message ${i + 1}`)}
                </Text>
                <Paragraph className="text-slate-800 text-base whitespace-pre-wrap m-0 font-medium leading-relaxed">
                  {renderSafeText(ans) || <span className="italic text-slate-400">No answer</span>}
                </Paragraph>
                <div className="text-right mt-3">
                  <Text type="secondary" className="text-xs">Word count: {countWords(ans)}</Text>
                </div>
              </div>
            ))}
          </div>
          <PartFeedback partKey="PART_3" />
        </div>
      ),
    },
    {
      key: '4',
      label: <span><MailOutlined /> Part 4</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animation-fade-in mt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-8">
            <MailOutlined className="text-purple-500 text-lg" />
            <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Part 4: Email Writing</Title>
          </div>
          {getPart(4).instruction && (
            <Text type="secondary" className="block mb-6">{getPart(4).instruction}</Text>
          )}
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm mb-8">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Context / Email</Text>
            <Paragraph className="text-slate-700 text-sm m-0">{getQText(getPart(4), 0, "Scenario context...")}</Paragraph>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag color="blue" className="m-0 font-bold">Informal Email</Tag>
              </div>
              <Paragraph className="text-slate-800 whitespace-pre-wrap m-0 leading-relaxed" style={{ minHeight: 100 }}>
                {renderSafeText(ansPart4.informal) || <span className="italic text-slate-400">No answer</span>}
              </Paragraph>
              <div className="text-right mt-3">
                <Text type="secondary" className="text-xs">Words: {countWords(ansPart4.informal)}</Text>
              </div>
              <PartFeedback partKey="PART_4_INF" />
            </div>
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag color="orange" className="m-0 font-bold">Formal Email</Tag>
              </div>
              <Paragraph className="text-slate-800 whitespace-pre-wrap m-0 leading-relaxed" style={{ minHeight: 100 }}>
                {renderSafeText(ansPart4.formal) || <span className="italic text-slate-400">No answer</span>}
              </Paragraph>
              <div className="text-right mt-3">
                <Text type="secondary" className="text-xs">Words: {countWords(ansPart4.formal)}</Text>
              </div>
              <PartFeedback partKey="PART_4_FORM" />
            </div>
          </div>
        </div>
      ),
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .animation-fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '24px 24px 0' }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/aptis/writing')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            border: '1px solid #e2e8f0', background: '#fff',
            color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#9333ea'; e.currentTarget.style.borderColor = '#d8b4fe'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <ArrowLeftOutlined />
          Test List
        </button>

        {/* Vertical divider (light purple) */}
        <div style={{ width: 1, height: 20, background: '#d8b4fe' }} />

        {/* Category badge (Purple theme) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 999,
          background: '#eff6ff',     // nền xanh nhạt
          border: '1px solid #93c5fd', // viền xanh
          color: '#1d4ed8',          // chữ xanh đậm
          fontWeight: 700,
          fontSize: 13
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          WRITING
        </div>

        {/* Test title */}
        <span style={{
          fontSize: 16, fontWeight: 700, color: '#1e293b',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {testInfo.title}
        </span>
      </div>

      {/* ── MAIN CONTENT: SCORING SECTION FIRST, THEN PART TABS ── */}
      <Content style={{ padding: '0 24px 32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        {ScoringSection}
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Content>

    </Layout>
  );
};

export default WritingAptisResultPage;
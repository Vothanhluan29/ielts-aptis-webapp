import React from 'react';
import { Typography, Spin, Card, Row, Col, Tag, Alert, Tabs, Result, Layout } from 'antd';
import { 
  ArrowLeftOutlined, CheckCircleFilled, SyncOutlined,
  MessageOutlined, FormOutlined, FileTextOutlined, MailOutlined,
} from '@ant-design/icons';
import { Trophy, Target, UserCheck } from 'lucide-react';

// Nhúng Custom Hook
import { useWritingAptisResult } from '../../../hooks/APTIS/writing/useWritingAptisResult';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// 🔥 Đưa component này ra ngoài component chính và nhận props
const PartFeedback = ({ partKey, isGraded, feedback }) => {
  const fb = feedback?.[partKey];
  if (!isGraded || !fb) return null;

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
        <Text className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">
          {fb.comments || "No specific comments for this part."}
        </Text>
      </div>
    </div>
  );
};

/* ─── 2. MAIN PAGE COMPONENT ─── */
const WritingAptisResultPage = () => {
  // 🔥 Rút Data và Logic từ Hook
  const {
    loading,
    submission,
    computedData,
    handleGoBack,
    getCefrColor,
    getPartInfo,
    getQText,
    renderSafeText,
    countWords
  } = useWritingAptisResult();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-3 text-slate-400 text-sm">Loading writing results...</div>
      </div>
    </div>
  );

  if (!submission || !computedData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Result
        status="404"
        title="Result Not Found"
        subTitle="This submission has not been submitted or does not exist."
        extra={
          <button onClick={handleGoBack} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold transition-colors">
            Back to List
          </button>
        }
      />
    </div>
  );

  const { isGraded, testInfo, ansPart1, ansPart2, ansPart3, ansPart4, cefrLevel, scoreVal, submitDate, feedback, overallFeedback } = computedData;
  const cefrStyle = getCefrColor(cefrLevel);

  // Cấu hình Tabs cho 4 Part
  const tabItems = [
    {
      key: '1',
      label: <span><MessageOutlined /> Part 1</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 mt-2 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <MessageOutlined className="text-indigo-500 text-lg" />
            <Title level={4} className="m-0! text-slate-800">Part 1</Title>
          </div>
          {getPartInfo(1).instruction && <Text type="secondary" className="block mb-6 whitespace-pre-wrap">{getPartInfo(1).instruction}</Text>}
          
          <div className="space-y-4 pl-2 mb-8">
            {ansPart1.map((ans, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs shrink-0 mt-0.5">Q{i + 1}</div>
                <div className="flex-1">
                  <Text type="secondary" className="text-xs">{getQText(getPartInfo(1), i, `Question ${i + 1}`)}</Text>
                  <div className="mt-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Text className="text-slate-800 font-semibold text-base">{renderSafeText(ans) || <span className="italic text-slate-400">---</span>}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* 🔥 Gọi component và truyền props */}
          <PartFeedback partKey="PART_1" isGraded={isGraded} feedback={feedback} />
        </div>
      ),
    },
    {
      key: '2',
      label: <span><FormOutlined /> Part 2</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 mt-2 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <FormOutlined className="text-indigo-500 text-lg" />
            <Title level={4} className="m-0! text-slate-800">Part 2</Title>
          </div>
          {getPartInfo(2).instruction && <Text type="secondary" className="block mb-6 whitespace-pre-wrap">{getPartInfo(2).instruction}</Text>}
          
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm mb-4">
            <Text strong className="text-xs text-slate-400 uppercase tracking-widest mb-3 block">Prompt</Text>
            <Text className="text-slate-700 font-medium block mb-4 whitespace-pre-wrap">{getQText(getPartInfo(2), 0, "Prompt...")}</Text>
            <div className="border-t border-slate-200 pt-4">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Your Answer</Text>
              <Paragraph className="text-slate-800 text-base whitespace-pre-wrap m-0 leading-relaxed">
                {renderSafeText(ansPart2) || <span className="italic text-slate-400">No answer</span>}
              </Paragraph>
            </div>
            <div className="text-right mt-3 text-xs text-slate-400">Word count: {countWords(ansPart2)}</div>
          </div>
          {/* 🔥 Gọi component và truyền props */}
          <PartFeedback partKey="PART_2" isGraded={isGraded} feedback={feedback} />
        </div>
      ),
    },
    {
      key: '3',
      label: <span><FileTextOutlined /> Part 3</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 mt-2 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <FileTextOutlined className="text-indigo-500 text-lg" />
            <Title level={4} className="m-0! text-slate-800">Part 3</Title>
          </div>
          {getPartInfo(3).instruction && <Text type="secondary" className="block mb-6 whitespace-pre-wrap">{getPartInfo(3).instruction}</Text>}
          
          <div className="space-y-6 mb-4">
            {ansPart3.map((ans, i) => (
              <div key={i} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Member: <span className="text-slate-600 font-medium normal-case">{getQText(getPartInfo(3), i, `Message ${i + 1}`)}</span>
                </Text>
                <Paragraph className="text-slate-800 text-base whitespace-pre-wrap m-0 font-medium leading-relaxed mt-3">
                  {renderSafeText(ans) || <span className="italic text-slate-400">No answer</span>}
                </Paragraph>
                <div className="text-right mt-3 text-xs text-slate-400">Word count: {countWords(ans)}</div>
              </div>
            ))}
          </div>
          {/* 🔥 Gọi component và truyền props */}
          <PartFeedback partKey="PART_3" isGraded={isGraded} feedback={feedback} />
        </div>
      ),
    },
    {
      key: '4',
      label: <span><MailOutlined /> Part 4</span>,
      children: (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 mt-2 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <MailOutlined className="text-indigo-500 text-lg" />
            <Title level={4} className="m-0! text-slate-800">Part 4</Title>
          </div>
          {getPartInfo(4).instruction && <Text type="secondary" className="block mb-6 whitespace-pre-wrap">{getPartInfo(4).instruction}</Text>}
          
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Context / Email</Text>
            <Paragraph className="text-slate-700 text-[15px] whitespace-pre-wrap m-0">{getQText(getPartInfo(4), 0, "Scenario context...")}</Paragraph>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <Tag color="blue" className="m-0 mb-4 font-bold px-3">Informal Email</Tag>
              <Paragraph className="text-slate-800 whitespace-pre-wrap m-0 leading-relaxed min-h-25">
                {renderSafeText(ansPart4.informal) || <span className="italic text-slate-400">No answer</span>}
              </Paragraph>
              <div className="text-right mt-3 text-xs text-slate-400">Words: {countWords(ansPart4.informal)}</div>
              <PartFeedback partKey="PART_4_INF" isGraded={isGraded} feedback={feedback} />
            </div>
            
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <Tag color="orange" className="m-0 mb-4 font-bold px-3">Formal Email</Tag>
              <Paragraph className="text-slate-800 whitespace-pre-wrap m-0 leading-relaxed min-h-25">
                {renderSafeText(ansPart4.formal) || <span className="italic text-slate-400">No answer</span>}
              </Paragraph>
              <div className="text-right mt-3 text-xs text-slate-400">Words: {countWords(ansPart4.formal)}</div>
              <PartFeedback partKey="PART_4_FORM" isGraded={isGraded} feedback={feedback} />
            </div>
          </div>
        </div>
      ),
    }
  ];

  return (
    <Layout className="min-h-screen bg-slate-50">
      <style>{`
        /* Tùy chỉnh Tabs của Ant Design sang tông màu Indigo/Purple */
        .ant-tabs-nav::before { border-bottom: 1px solid #e2e8f0 !important; }
        .ant-tabs-tab { padding: 12px 0 !important; margin: 0 32px 0 0 !important; }
        .ant-tabs-tab-btn { font-size: 16px !important; font-weight: 600 !important; color: #64748b !important; }
        .ant-tabs-tab-active .ant-tabs-tab-btn { color: #6366f1 !important; }
        .ant-tabs-ink-bar { background: #6366f1 !important; height: 3px !important; border-radius: 3px 3px 0 0 !important; }
      `}</style>

      {/* CUSTOM HEADER */}
      <div className="flex items-center gap-3 mb-4 px-6 pt-6 max-w-5xl mx-auto w-full">
        <button onClick={handleGoBack} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm">
          <ArrowLeftOutlined /> Test List
        </button>
        <div className="w-px h-5 bg-indigo-200" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[13px]">
          <FormOutlined /> WRITING
        </div>
        <span className="text-base font-bold text-slate-800 truncate">{testInfo.title}</span>
      </div>

      {/* MAIN CONTENT */}
      <Content className="px-6 pb-8 max-w-5xl mx-auto w-full">
        
        {/* SCORING CARD */}
        <div className="animate-in fade-in slide-in-from-bottom-2 mb-6">
          {!isGraded && (
            <Alert
              message="This exam is awaiting teacher grading"
              description="Your writing data has been saved. Please return after the teacher completes the evaluation to view your score and detailed feedback."
              type="warning"
              showIcon
              icon={<SyncOutlined spin />}
              className="mb-6 rounded-2xl border-orange-200 bg-orange-50/70 shadow-sm"
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
                <Target className={`w-8 h-8 mx-auto mb-2 ${isGraded ? 'text-indigo-500' : 'text-slate-300'}`} />
                <div className="text-4xl font-black text-slate-800 mb-1">
                  {isGraded ? scoreVal : '--'} <span className="text-xl text-slate-400">/ 50</span>
                </div>
                <Text strong className="text-slate-500 uppercase tracking-widest text-xs">Writing Score</Text>
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
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 md:p-8 shadow-sm mb-6 animate-in fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600"><UserCheck size={24} /></div>
              <Title level={4} className="m-0! text-indigo-800">Overall Teacher Feedback</Title>
            </div>
            <Paragraph className="text-indigo-900 text-[15px] leading-relaxed whitespace-pre-wrap m-0">
              {renderSafeText(overallFeedback)}
            </Paragraph>
          </div>
        )}

        {/* TABS COMPONENT */}
        <Tabs defaultActiveKey="1" items={tabItems} className="mt-4" />

      </Content>
    </Layout>
  );
};

export default WritingAptisResultPage;
import React from 'react';
import { Layout, Button, Input, Typography, Spin, Space, Card, Row, Col, Divider, Tag } from 'antd';
import { 
  ClockCircleOutlined, SendOutlined, LeftOutlined, RightOutlined, EditOutlined
} from '@ant-design/icons';

// Nhúng Custom Hook
import { useWritingAptisExam } from '../../../hooks/APTIS/writing/useWritingAptisExam';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const WritingAptisExamPage = ({ isFullTest = false, testIdFromProps = null, onSkillFinish = null }) => {
  const {
    loading, submitting, testDetail, currentPart, setCurrentPart, timeLeft,
    answers, updateAnswer, confirmSubmit, formatTime, countWords,
    getPart, getQuestionText, isTimeRunningOut
  } = useWritingAptisExam({ isFullTest, testIdFromProps, onSkillFinish });

  const renderWordCount = (current, min, max) => {
    let colorClass = 'text-slate-400'; 
    if (min && max) {
      if (current >= min && current <= max) colorClass = 'text-emerald-500'; 
      else if (current > 0) colorClass = 'text-amber-500'; 
    }
    return (
      <div className={`text-right mt-2 text-xs font-bold ${colorClass}`}>
        Words: {current} {max ? `/ ${max}` : ''}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <Text type="secondary">Loading test...</Text>
        </div>
      </div>
    );
  }

  // Khai báo 4 part
  const p1 = getPart(1);
  const p2 = getPart(2);
  const p3 = getPart(3);
  const p4 = getPart(4);

  return (
    <Layout className={`bg-slate-50 overflow-hidden ${isFullTest ? 'h-[calc(100vh-64px)]' : 'h-screen'}`}>
      
      {/* HEADER: Chế độ thi đơn */}
      {!isFullTest && (
        <Header className="bg-white border-b border-slate-200 flex justify-between items-center px-6 z-10 shrink-0"
        style={{backgroundColor: '#ffffff', lineHeight: 'normal'}}>
          <Space>
            <Tag color="indigo" className="text-sm px-3 py-1 font-bold rounded-md m-0 border-0 bg-indigo-50 text-indigo-600">
              <EditOutlined className="mr-1"/> Aptis Writing
            </Tag>
            <Text strong className="text-base text-slate-800">{testDetail?.title}</Text>
          </Space>
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
            <ClockCircleOutlined /> {formatTime(timeLeft)}
          </div>
        </Header>
      )}

      {/* HEADER: Chế độ Full Test */}
      {isFullTest && (
        <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center z-10 shadow-sm shrink-0"
        style={{backgroundColor: '#ffffff', lineHeight: 'normal'}}>
          <Text strong className="text-lg text-slate-700">Skill: Writing</Text>
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-base transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
            <ClockCircleOutlined /> Time remaining: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <Content className="overflow-y-auto custom-scrollbar flex-1 w-full p-4 md:p-8">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* TABS NAVIGATION */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar shrink-0">
            {[1, 2, 3, 4].map(partNum => (
              <Button 
                key={partNum} 
                type={currentPart === partNum ? 'primary' : 'default'} 
                onClick={() => setCurrentPart(partNum)} 
                className={`flex-1 min-w-25 h-11 font-bold rounded-xl transition-all ${
                  currentPart === partNum 
                    ? 'bg-indigo-600 hover:bg-indigo-500 border-none shadow-md shadow-indigo-200 text-white' 
                    : 'text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-300 bg-white'
                }`}
              >
                Part {partNum}
              </Button>
            ))}
          </div>

          <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '32px' } }}>
            
            {/* ----- PART 1 ----- */}
            {currentPart === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <Title level={4} className="text-slate-800">Part 1: Word-level writing</Title>
                <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500 text-indigo-900 text-[15px] whitespace-pre-wrap mb-6">
                  {p1.instruction || "You are joining a club. You have 5 messages from a member of the club. Write short answers (1 to 5 words) to each message."}
                </div>
                <Row gutter={[24, 24]}>
                  {[...Array(5)].map((_, idx) => (
                    <Col xs={24} sm={12} key={idx}>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 h-full flex flex-col">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Message {idx + 1}</div>
                        <Text strong className="block mb-4 text-slate-700 whitespace-pre-wrap flex-1">
                          {getQuestionText(p1, idx, `Question ${idx + 1}?`)}
                        </Text>
                        <Input 
                          placeholder="Write your answer here..." 
                          className="h-10 rounded-lg"
                          value={answers.part_1[idx]} 
                          onChange={(e) => updateAnswer('part_1', idx, e.target.value)} 
                          disabled={submitting} 
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* ----- PART 2 ----- */}
            {currentPart === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <Title level={4} className="text-slate-800">Part 2: Short text writing</Title>
                <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500 text-indigo-900 text-[15px] whitespace-pre-wrap mb-6">
                  {p2.instruction || "You are a new member of the club. Fill in the form. Write in sentences. Use 20 - 30 words."}
                </div>
                <div className="mb-4">
                  <Text strong className="text-base text-slate-700 whitespace-pre-wrap">
                    {getQuestionText(p2, 0, "Please tell us why you are interested in joining this club.")}
                  </Text>
                </div>
                <TextArea 
                  rows={6} 
                  className="rounded-xl p-4 text-base bg-slate-50 focus:bg-white"
                  placeholder="Start typing your response here..." 
                  value={answers.part_2} 
                  onChange={(e) => updateAnswer('part_2', null, e.target.value)} 
                  disabled={submitting} 
                />
                {renderWordCount(countWords(answers.part_2), 20, 30)}
              </div>
            )}

            {/* ----- PART 3 ----- */}
            {currentPart === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <Title level={4} className="text-slate-800">Part 3: Three written responses</Title>
                <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500 text-indigo-900 text-[15px] whitespace-pre-wrap mb-6">
                  {p3.instruction || "You are talking to other members of the club in the chat room. Talk to them using sentences. Use 30 - 40 words per answer."}
                </div>
                <div className="flex flex-col gap-8">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex justify-center items-center text-slate-500 font-black shrink-0 mt-2 text-xs">M{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-100 text-slate-700 p-3.5 rounded-2xl rounded-tl-sm inline-block mb-3 border border-slate-200">
                          <Text className="whitespace-pre-wrap text-[15px] font-medium">
                              {getQuestionText(p3, idx, `Message ${idx + 1} from a member.`)}
                          </Text>
                        </div>
                        <TextArea 
                          rows={3} 
                          className="rounded-xl p-3 bg-indigo-50/30 focus:bg-white text-[15px]"
                          placeholder="Reply to the member..." 
                          value={answers.part_3[idx]} 
                          onChange={(e) => updateAnswer('part_3', idx, e.target.value)} 
                          disabled={submitting} 
                        />
                        {renderWordCount(countWords(answers.part_3[idx]), 30, 40)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----- PART 4 ----- */}
            {currentPart === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <Title level={4} className="text-slate-800">Part 4: Formal and informal writing</Title>
                <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500 text-indigo-900 text-[15px] whitespace-pre-wrap mb-6">
                  {p4.instruction || "You are a member of a club. You received an email from the club manager. Read the email and write two responses."}
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 shadow-sm">
                  <Text className="whitespace-pre-wrap text-[15px] text-amber-900 font-medium">
                    {getQuestionText(p4, 0, "Dear Members,\n\nWe are writing to inform you that the upcoming club event will be cancelled due to bad weather. We apologize for the inconvenience.\n\nManager.")}
                  </Text>
                </div>

                <Row gutter={[32, 32]}>
                  <Col xs={24} md={12}>
                    <Text strong className="text-indigo-600 text-base flex items-center gap-2 mb-3">
                      <EditOutlined /> Task 1: Informal (approx. 50 words)
                    </Text>
                    <div className="text-sm text-slate-500 mb-3 line-clamp-2" title={getQuestionText(p4, 1, "")}>
                       {getQuestionText(p4, 1, "Write to a friend.")}
                    </div>
                    <TextArea 
                      rows={8} 
                      className="rounded-xl p-4 bg-slate-50 focus:bg-white text-[15px]" 
                      placeholder="Start your email to your friend here..." 
                      value={answers.part_4.informal} 
                      onChange={(e) => updateAnswer('part_4', null, e.target.value, 'informal')} 
                      disabled={submitting} 
                    />
                    {renderWordCount(countWords(answers.part_4.informal), null, 50)}
                  </Col>

                  <Col xs={24} md={12}>
                    <Text strong className="text-indigo-600 text-base flex items-center gap-2 mb-3">
                      <EditOutlined /> Task 2: Formal (120-150 words)
                    </Text>
                    <div className="text-sm text-slate-500 mb-3 line-clamp-2" title={getQuestionText(p4, 2, "")}>
                       {getQuestionText(p4, 2, "Write to the manager.")}
                    </div>
                    <TextArea 
                      rows={8} 
                      className="rounded-xl p-4 bg-slate-50 focus:bg-white text-[15px]" 
                      placeholder="Start your formal email here..." 
                      value={answers.part_4.formal} 
                      onChange={(e) => updateAnswer('part_4', null, e.target.value, 'formal')} 
                      disabled={submitting} 
                    />
                    {renderWordCount(countWords(answers.part_4.formal), 120, 150)}
                  </Col>
                </Row>
              </div>
            )}

          </Card>
        </div>
      </Content>

      {/* FOOTER */}
      <Footer className="bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center z-10 shrink-0">
        <Button 
          size="large" 
          disabled={currentPart === 1 || submitting} 
          onClick={() => setCurrentPart(prev => prev - 1)} 
          icon={<LeftOutlined />}
          className="rounded-xl font-bold text-slate-600 h-11 px-6"
        >
          Previous
        </Button>

        {currentPart < 4 ? (
          <Button 
            type="primary" 
            size="large" 
            onClick={() => setCurrentPart(prev => prev + 1)} 
            disabled={submitting}
            className="rounded-xl font-bold bg-slate-800 hover:bg-slate-700 border-none h-11 px-8 shadow-md shadow-slate-200"
          >
            Next <RightOutlined />
          </Button>
        ) : (
          <Button 
            type="primary" 
            size="large" 
            onClick={confirmSubmit} 
            loading={submitting} 
            icon={<SendOutlined />}
            className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 border-none h-11 px-8 shadow-lg shadow-indigo-200"
          >
            {isFullTest ? 'Submit & Go to Speaking' : 'Submit Test'}
          </Button>
        )}
      </Footer>
    </Layout>
  );
};

export default WritingAptisExamPage;
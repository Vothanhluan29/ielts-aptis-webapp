import React from 'react';
import { Layout, Button, Typography, Spin, Space, Card, Tag } from 'antd'; 
import { 
  ClockCircleOutlined, SendOutlined, 
  LeftOutlined, RightOutlined, BookOutlined 
} from '@ant-design/icons';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion'; 
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion'; // Make sure this path is correct

// Gọi Custom Hook
import { useGrammarVocabExam, TABS } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabExam';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const GrammarVocabExamPage = ({ 
  isFullTest = false, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  // 🔥 Lấy toàn bộ vũ khí từ Hook
  const {
    loading,
    submitting,
    testDetail,
    currentTab,
    setCurrentTab,
    timeLeft,
    answers,
    currentQuestions,
    currentTabIndex,
    isTimeRunningOut,
    handleAnswerChange,
    confirmSubmit,
    formatTime
  } = useGrammarVocabExam({ isFullTest, testIdFromProps, onSkillFinish });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Space orientation="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary">Loading test...</Text>
        </Space>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* HEADER Ẩn đi nếu là Full Test vì Layout mẹ đã có Header rồi */}
      {!isFullTest && (
        <Header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
          <Space>
            <Tag color="emerald" className="px-3 py-1 font-bold rounded-lg border-0 bg-emerald-100 text-emerald-700">
              <BookOutlined className="mr-1"/> Grammar & Vocab
            </Tag>
            <Text strong className="text-base hidden sm:block">{testDetail?.title}</Text>
          </Space>
          
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            <ClockCircleOutlined /> {formatTime(timeLeft)}
          </div>
        </Header>
      )}

      {/* Nếu ĐANG LÀ FULL TEST thì vẫn phải hiện đồng hồ đếm ngược nội bộ */}
      {isFullTest && (
        <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <Text strong className="text-lg text-slate-700">Section: Grammar & Vocabulary</Text>
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
             <ClockCircleOutlined /> Time remaining: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      <Content style={{ padding: '24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab, idx) => (
            <Button 
              key={tab} 
              type={currentTab === tab ? 'primary' : 'default'} 
              onClick={() => setCurrentTab(tab)} 
              className={`flex-1 min-w-30 h-12 font-bold rounded-xl ${
                currentTab === tab 
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-none' 
                  : 'text-slate-500'
              }`}
            >
              Part {idx + 1}: {tab}
            </Button>
          ))}
        </div>

        <Card variant="borderless" className="rounded-2xl shadow-sm border-slate-200" styles={{ body: { padding: '32px 24px' } }}>
          <div className="mb-8 p-4 bg-slate-50 rounded-xl border-l-4 border-emerald-500 text-slate-700 font-medium">
            {currentTab === 'GRAMMAR' 
              ? "Choose the best answer to complete the sentence." 
              : "Select the correct word from the dropdown menu to match the definition."}
          </div>

          {currentQuestions.map((q, index) => {
            // CONDITIONAL RENDERING BASED ON TAB (or q.part_type)
            if (currentTab === 'GRAMMAR' || q.part_type === 'GRAMMAR') {
               return (
                 <MultipleChoiceQuestion 
                   key={q.id}
                   questionId={q.id}
                   questionNumber={index + 1}
                   questionText={q.question_text}
                   options={q.options}
                   selectedValue={answers[q.id]}
                   onChange={handleAnswerChange}
                 />
               );
            } else {
               // RENDER DROPDOWN FOR VOCABULARY
               return (
                 <DropdownQuestion 
                   key={q.id}
                   questionId={q.id}
                   questionNumber={index + 1}
                   questionText={q.question_text} // This is now the definition
                   options={q.options}            // This is the array of short vocabulary words
                   selectedValue={answers[q.id]}
                   onChange={handleAnswerChange}
                 />
               );
            }
          })}
        </Card>
      </Content>

      <Footer style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Button
          size="large"
          className="rounded-xl font-semibold"
          disabled={currentTabIndex === 0 || submitting}
          onClick={() => setCurrentTab(TABS[currentTabIndex - 1])}
          icon={<LeftOutlined />}
        >
          Previous Part
        </Button>
        
        {currentTabIndex < TABS.length - 1 ? (
          <Button
            type="primary"
            size="large"
            className="rounded-xl font-bold bg-slate-800 hover:bg-slate-700 border-none"
            onClick={() => setCurrentTab(TABS[currentTabIndex + 1])}
            disabled={submitting}
          >
            Next Part <RightOutlined />
          </Button>
        ) : (
          <Button
            type="primary"
            danger
            size="large"
            className="rounded-xl font-bold px-8 shadow-md shadow-red-200"
            onClick={confirmSubmit}
            loading={submitting}
            icon={<SendOutlined />}
          >
             {isFullTest ? 'Submit and move to Reading' : 'Submit & Grade'}
          </Button>
        )}
      </Footer>
    </Layout>
  );
};

export default GrammarVocabExamPage;
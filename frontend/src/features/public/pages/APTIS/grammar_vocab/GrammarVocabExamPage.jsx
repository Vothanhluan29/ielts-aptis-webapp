import React from 'react';
import { Layout, Button, Typography, Spin, Space, Card, Tag } from 'antd'; 
import { 
  ClockCircleOutlined, SendOutlined, 
  LeftOutlined, RightOutlined, BookOutlined,
  InfoCircleOutlined // Đã thêm icon này cho phần Instruction
} from '@ant-design/icons';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion'; 
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion'; 

import { useGrammarVocabExam, TABS } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabExam';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const GrammarVocabExamPage = ({ 
  isFullTest = false, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  const {
    loading,
    submitting,
    testDetail,
    currentTab,
    setCurrentTab,
    timeLeft,
    answers,
    currentGroups, // 🔥 Thay vì currentQuestions, chúng ta sẽ render từ currentGroups
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
          
          {/* 🔥 VÒNG LẶP NGOÀI: Render từng Group */}
          {currentGroups.map((group, groupIndex) => (
            <div key={group.id} className={groupIndex !== currentGroups.length - 1 ? "mb-12 border-b border-slate-100 pb-8" : ""}>
              
              {/* Hiển thị Instruction chung cho Nhóm (cực kỳ quan trọng với Vocab) */}
              {group.instruction && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-xl border-l-4 border-indigo-500 text-indigo-900 font-medium text-base shadow-sm flex items-start gap-3">
                  <InfoCircleOutlined className="mt-1 text-indigo-600" />
                  <span>{group.instruction}</span>
                </div>
              )}

              {/* 🔥 VÒNG LẶP TRONG: Render các Câu hỏi thuộc Nhóm đó */}
              <div className="flex flex-col gap-6">
                {group.questions.map((q) => {
                  const isGrammarGroup = group.part_type === 'GRAMMAR';

                  if (isGrammarGroup) {
                     return (
                       <MultipleChoiceQuestion 
                         key={q.id}
                         questionId={q.id}
                         questionNumber={q.question_number} // Dùng chuẩn số thứ tự từ Database
                         questionText={q.question_text}
                         options={q.options}
                         selectedValue={answers[q.id]}
                         onChange={handleAnswerChange}
                       />
                     );
                  } else {
                     return (
                       <DropdownQuestion 
                         key={q.id}
                         questionId={q.id}
                         questionNumber={q.question_number}
                         questionText={q.question_text} 
                         options={q.options}            
                         selectedValue={answers[q.id]}
                         onChange={handleAnswerChange}
                       />
                     );
                  }
                })}
              </div>
            </div>
          ))}

          {/* Nếu không có dữ liệu hiển thị thông báo */}
          {currentGroups.length === 0 && (
             <div className="text-center py-10 text-slate-400">
               No questions available for this section.
             </div>
          )}

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
             {isFullTest ? 'Submit and move to Listening' : 'Submit & Grade'}
          </Button>
        )}
      </Footer>
    </Layout>
  );
};

export default GrammarVocabExamPage;
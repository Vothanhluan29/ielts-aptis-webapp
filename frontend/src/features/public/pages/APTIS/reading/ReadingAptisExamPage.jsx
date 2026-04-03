import React from 'react';
import { Layout, Button, Typography, Spin, Card, Tag, Divider } from 'antd'; 
import { 
  ClockCircleOutlined, ExclamationCircleOutlined, SendOutlined, 
  LeftOutlined, RightOutlined, ReadOutlined, FileTextOutlined
} from '@ant-design/icons';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion'; 
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion'; 
import ReorderQuestion from '../../../components/APTIS/ExamForms/ReorderQuestion'; 
import FillInBlankQuestion from '../../../components/APTIS/ExamForms/FillInBlankQuestion'; 

// Nhúng Custom Hook
import { useReadingAptisExam } from '../../../hooks/APTIS/reading/useReadingAptisExam';

const { Header, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const ReadingAptisExamPage = ({ 
  isFullTest = false, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  const {
    loading,
    submitting,
    testDetail,
    currentPartId,
    setCurrentPartId,
    timeLeft,
    answers,
    parts,
    activePart,
    currentTabIndex,
    hasReadingPassage,
    isTimeRunningOut,
    handleAnswerChange,
    confirmSubmit,
    formatTime,
    handleGoBackEmpty
  } = useReadingAptisExam({ isFullTest, testIdFromProps, onSkillFinish });

  const renderQuestionsList = (groups) => {
    return groups?.map((group) => (
      <div key={group.id} className="mb-10 last:mb-0">
        {!hasReadingPassage && group.instruction && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
            <Text className="text-orange-800 font-bold text-base whitespace-pre-wrap">
              {group.instruction}
            </Text>
          </div>
        )}

        <div className="space-y-8 pl-2">
          {group.questions?.map((q, idx) => {
            const qType = q.question_type?.toUpperCase() || "";
            const pType = q.part_type?.toUpperCase() || "";
            
            const isDropdown = qType === 'DROPDOWN' || qType === 'MATCHING' || qType === 'MATCHING_HEADINGS' || qType === 'MATCHING_OPINIONS' || pType.includes('PART_4');
            const isReorder = qType === 'REORDER_SENTENCES';
            const isFillInBlank = qType === 'FILL_IN_BLANKS'; 

            if (isReorder) {
              return (
                <ReorderQuestion 
                  key={q.id}
                  questionId={q.id}
                  questionNumber={q.question_number || idx + 1}
                  questionText={q.question_text}
                  options={q.options}
                  selectedValue={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              );
            } else if (isFillInBlank) {
              return (
                <FillInBlankQuestion 
                  key={q.id}
                  questionId={q.id}
                  questionNumber={q.question_number || idx + 1}
                  questionText={q.question_text}
                  selectedValue={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              );
            } else if (isDropdown) {
              return (
                <DropdownQuestion 
                  key={q.id}
                  questionId={q.id}
                  questionNumber={q.question_number || idx + 1}
                  questionText={q.question_text}
                  options={q.options}
                  selectedValue={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              );
            } else {
              return (
                <MultipleChoiceQuestion 
                  key={q.id}
                  questionId={q.id}
                  questionNumber={q.question_number || idx + 1}
                  questionText={q.question_text}
                  options={q.options}
                  selectedValue={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              );
            }
          })}
        </div>
        {!hasReadingPassage && <Divider dashed className="my-8 border-slate-200" />}
      </div>
    ));
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <Text type="secondary" className="font-medium text-lg">Loading test data...</Text>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (parts.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="text-center rounded-3xl shadow-sm border-0 py-10 px-8">
          <ExclamationCircleOutlined className="text-red-400 text-5xl mb-4 block" />
          <Title level={4}>Empty Test</Title>
          <Text type="secondary">No content has been added to this Reading test yet.</Text>
          <Button type="primary" onClick={handleGoBackEmpty} className="mt-6 bg-orange-500 border-none">Go Back</Button>
        </Card>
      </div>
    );
  }

  // MAIN EXAM RENDER
  return (
    <Layout style={{ height: isFullTest ? 'calc(100vh - 64px)' : '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      
      {!isFullTest && (
        <Header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', zIndex: 10 }}>
          <div className="flex items-center gap-3">
            <Tag color="orange" className="px-3 py-1 font-bold rounded-lg border-0 bg-orange-100 text-orange-700 m-0">
              <ReadOutlined className="mr-1"/> Reading
            </Tag>
            <Text strong className="text-base hidden sm:block text-slate-800">{testDetail?.title}</Text>
          </div>
          
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
            <ClockCircleOutlined /> {formatTime(timeLeft)}
          </div>
        </Header>
      )}

      {isFullTest && (
        <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center z-10 shadow-sm shrink-0">
          <Text strong className="text-lg text-slate-700">Section: Reading</Text>
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
            <ClockCircleOutlined /> Time remaining: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 w-full max-w-400 mx-auto p-4 sm:p-6 overflow-hidden">
        
        {/* TABS NAVIGATION */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar shrink-0">
          {parts.map((p, idx) => (
            <Button 
              key={p.id} 
              type={currentPartId === p.id ? 'primary' : 'default'} 
              onClick={() => setCurrentPartId(p.id)} 
              className={`flex-1 min-w-35 h-12 font-bold rounded-xl transition-all ${
                currentPartId === p.id 
                  ? 'bg-orange-500 hover:bg-orange-400 border-none shadow-md shadow-orange-200 text-white' 
                  : 'text-slate-500 border-slate-200 hover:text-orange-500 hover:border-orange-300 bg-white'
              }`}
            >
              Part {p.part_number || idx + 1}
            </Button>
          ))}
        </div>
        
        {/* DYNAMIC CONTENT (Split Screen or Single Column) */}
        {hasReadingPassage ? (
          <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden animation-fade-in">
            {/* LEFT PANEL: READING PASSAGE */}
            <div className="w-full lg:w-1/2 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex items-center gap-2">
                <FileTextOutlined className="text-orange-500 text-lg" />
                <Text strong className="text-slate-700">Reading Passage</Text>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                {activePart?.content && (
                  <div className="text-slate-700 text-base leading-loose whitespace-pre-wrap text-justify bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50 mb-8">
                    {activePart.content}
                  </div>
                )}

                {activePart?.groups?.map((group, idx) => {
                  const groupContent = group.transcript || group.content || group.text;
                  if (!group.instruction && !group.image_url && !groupContent) return null;
                  
                  return (
                    <div key={group.id} className="mb-10 last:mb-0">
                      {group.image_url && <img src={group.image_url} alt="Reading Resource" className="max-w-full rounded-xl mb-6 shadow-sm border border-slate-100" />}
                      {group.instruction && <Paragraph className="text-slate-800 font-bold text-lg mb-4 whitespace-pre-wrap">{group.instruction}</Paragraph>}
                      {groupContent && (
                        <div className="text-slate-700 text-base leading-loose whitespace-pre-wrap text-justify bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50">
                          {groupContent}
                        </div>
                      )}
                      {idx < activePart.groups.length - 1 && <Divider dashed className="my-8 border-slate-300" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* RIGHT PANEL: QUESTIONS */}
            <div className="w-full lg:w-1/2 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ReadOutlined className="text-orange-500 text-lg" />
                  <Text strong className="text-slate-700">Questions</Text>
                </div>
                <Tag className="rounded-full bg-slate-200 text-slate-600 border-0 m-0">
                  {activePart?.groups?.reduce((acc, g) => acc + (g.questions?.length || 0), 0) || 0} questions
                </Tag>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                {renderQuestionsList(activePart.groups)}
              </div>
            </div>
          </div>
        ) : (
          /* SINGLE COLUMN (NO PASSAGE) */
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animation-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
                <div className="flex items-center gap-2">
                  <ReadOutlined className="text-orange-500 text-2xl" />
                  <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Question List</Title>
                </div>
                <Tag className="rounded-full bg-orange-50 text-orange-600 font-bold border-orange-200 px-3 py-1 m-0 text-sm">
                  {activePart?.groups?.reduce((acc, g) => acc + (g.questions?.length || 0), 0) || 0} questions
                </Tag>
              </div>
              
              {renderQuestionsList(activePart.groups)}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <Footer style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, shrink: 0 }}>
        <Button
          size="large"
          className="rounded-xl font-semibold text-slate-600 border-slate-300"
          disabled={currentTabIndex === 0 || submitting}
          onClick={() => setCurrentPartId(parts[currentTabIndex - 1]?.id)}
          icon={<LeftOutlined />}
        >
          Previous Part
        </Button>
        
        {currentTabIndex < parts.length - 1 ? (
          <Button
            type="primary"
            size="large"
            className="rounded-xl font-bold bg-slate-800 hover:bg-slate-700 border-none shadow-md shadow-slate-300 text-white"
            onClick={() => setCurrentPartId(parts[currentTabIndex + 1]?.id)}
            disabled={submitting}
          >
            Next Part <RightOutlined />
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            className="rounded-xl font-bold px-10 bg-orange-500 hover:bg-orange-400 border-none shadow-lg shadow-orange-200 text-white"
            onClick={confirmSubmit}
            loading={submitting}
            icon={<SendOutlined />}
          >
            {isFullTest ? 'Submit & Go to Listening' : 'Submit Test'}
          </Button>
        )}
      </Footer>

      <style>{`
        .animation-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
};

export default ReadingAptisExamPage;
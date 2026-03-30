import { useWritingExam } from '../../hooks/writing/useWritingExam';
import {
  Layout, Button, Typography, Space, Tag, Spin, Alert
} from 'antd';
import {
  ClockCircleOutlined, SendOutlined, LeftOutlined, RightOutlined, 
  InfoCircleOutlined, EditOutlined, FileTextOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const MIN_WORDS_TASK_1 = 150;
const MIN_WORDS_TASK_2 = 250;

const WritingExamPage = ({ testId, onFinish }) => {
  const {
    test, loading, submitting, activeTask, setActiveTask, answers, handleContentChange,
    wordCounts, timeLeft, formatTime, isTask1Valid, isTask2Valid, canSubmit,
    isQuotaFull, handleSubmit, isFullTestMode,
    questionContainerRef, editorRef, leftWidth, setIsDragging
  } = useWritingExam(testId, onFinish);

  if (loading || !test) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" description={<span className="font-bold text-slate-500 mt-2 block">Loading Exam Environment...</span>} />
      </div>
    );
  }

  const currentTaskData = test.tasks?.find((t) => t.task_type === activeTask);
  const currentWordCount = wordCounts[activeTask];
  const minWords = activeTask === 'TASK_1' ? MIN_WORDS_TASK_1 : MIN_WORDS_TASK_2;
  const isCurrentTaskValid = activeTask === 'TASK_1' ? isTask1Valid : isTask2Valid;

  const goToTask = (task) => {
    setActiveTask(task);
  };

  return (
    <Layout className="h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* ================= HEADER ================= */}
      {!isFullTestMode && (
        <Header 
          style={{ background: '#ffffff', padding: '0 24px' }}
          className="border-b border-slate-200 h-16 flex items-center justify-between shadow-sm z-10 leading-none"
        >
          {/* Left: Branding & Title */}
          <Space size="middle">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
            <div className="flex flex-col justify-center">
              <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                IELTS Writing Practice
              </Text>
              <Text strong className="text-slate-800 text-base truncate max-w-sm mt-1 leading-tight">
                {test.title}
              </Text>
            </div>
          </Space>

          {/* Right: Timer & Submit */}
          <Space size="large" align="center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-mono font-bold text-lg transition-colors ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-slate-700 border-slate-200'}`}>
              <ClockCircleOutlined /> {formatTime(timeLeft)}
            </div>
            <Button 
              type="primary" 
              size="large"
              icon={<SendOutlined />}
              onClick={handleSubmit} 
              disabled={submitting || isQuotaFull} 
              loading={submitting}
              className={`font-bold tracking-wide shadow-sm px-8 ${canSubmit ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-400'}`}
            >
              Submit Test
            </Button>
          </Space>
        </Header>
      )}

      {/* Quota Alert */}
      {isQuotaFull && !isFullTestMode && (
        <Alert 
          message="Daily limit reached. You cannot submit more tests today." 
          type="error" 
          banner 
          className="font-bold text-center"
        />
      )}

      {/* ================= MAIN CONTENT (SPLIT VIEW) ================= */}
      <Content className="flex flex-1 overflow-hidden p-4 gap-4 bg-[#f0f2f5]">
        
        {/* LEFT PANEL: QUESTION */}
        <div 
          className="h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="p-8 md:p-10 max-w-3xl mx-auto">
            
            {/* Task Info Header */}
            <div className="mb-8 pb-4 border-b-2 border-slate-100 flex items-center justify-between">
              <Space align="center">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                  {activeTask === 'TASK_1' ? '1' : '2'}
                </div>
                <div>
                  <Title level={3} className="!m-0 !font-serif text-slate-800">
                    Writing Task {activeTask === 'TASK_1' ? '1' : '2'}
                  </Title>
                  <Text type="secondary" className="uppercase font-bold tracking-wide text-xs">
                    {activeTask === 'TASK_1' ? 'Report / Letter' : 'Essay'}
                  </Text>
                </div>
              </Space>

              <Tag color="default" icon={<InfoCircleOutlined />} className="px-3 py-1 text-sm font-semibold border-slate-200 bg-slate-50 text-slate-600 m-0">
                Minimum: {minWords} words
              </Tag>
            </div>

            {/* Task 1 Image */}
            {activeTask === 'TASK_1' && currentTaskData?.image_url && (
              <div className="mb-8 p-3 border border-slate-200 rounded-xl bg-white shadow-sm flex justify-center">
                <img
                  src={currentTaskData.image_url}
                  alt="Task Chart"
                  className="max-w-full h-auto max-h-[450px] object-contain rounded-md"
                />
              </div>
            )}

            {/* Question Text */}
            <div 
              ref={questionContainerRef}
              className="font-serif text-[17px] leading-loose text-justify text-slate-800 whitespace-pre-wrap bg-slate-50/50 p-6 rounded-xl border border-slate-100"
            >
              {currentTaskData?.question_text ? (
                currentTaskData.question_text
              ) : (
                <Text type="secondary" italic>No question content available.</Text>
              )}
            </div>

          </div>
        </div>

        {/* RESIZER DRAG BAR */}
        <div 
          onMouseDown={() => setIsDragging(true)}
          className="w-[8px] rounded-full bg-slate-300/50 hover:bg-blue-400 cursor-col-resize flex-shrink-0 transition-colors z-10 my-auto h-24 flex items-center justify-center group"
          title="Drag to resize"
        >
          <div className="w-0.5 h-8 bg-slate-400 group-hover:bg-white rounded-full"></div>
        </div>

        {/* RIGHT PANEL: EDITOR */}
        <div 
          className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Editor Header */}
          <div className="px-8 py-4 border-b border-slate-100 bg-[#f8f9fa] flex justify-between items-center shrink-0">
            <Text strong className="uppercase tracking-widest text-xs text-slate-500 flex items-center">
              <EditOutlined className="mr-2 text-blue-500" /> Your Answer Sheet
            </Text>
            <div className={`px-4 py-1 rounded-full font-bold text-sm transition-colors border ${isCurrentTaskValid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
              <FileTextOutlined className="mr-1" /> {currentWordCount} / {minWords} words
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 relative bg-white">
            <textarea
              ref={editorRef}
              className="w-full h-full p-8 text-[18px] text-slate-800 leading-[2.2] outline-none resize-none font-serif transition-colors custom-scrollbar"
              placeholder="Start typing your answer here..."
              value={answers[activeTask]}
              onChange={(e) => handleContentChange(e.target.value, activeTask)}
              spellCheck="false"
            />
          </div>
        </div>

      </Content>

      {/* ================= FOOTER ================= */}
      <Footer 
        style={{ background: '#ffffff', padding: '0 24px' }}
        className="border-t border-slate-200 h-16 flex items-center shadow-sm z-10"
      >
        <div className="w-full mx-auto flex items-center justify-between">
          
          {/* Left: Previous */}
          <Button 
            type="text" 
            size="large"
            icon={<LeftOutlined />} 
            onClick={() => activeTask === 'TASK_2' && goToTask('TASK_1')}
            disabled={activeTask === 'TASK_1'}
            className="font-semibold text-slate-500 hover:text-blue-600"
          >
            Previous Task
          </Button>
          
          {/* Center: Task Tabs */}
          <Space size="large" className="bg-slate-50 p-1 rounded-xl border border-slate-200">
            <Button 
              type={activeTask === 'TASK_1' ? 'primary' : 'text'}
              size="large"
              onClick={() => goToTask('TASK_1')}
              className={`font-bold w-36 rounded-lg transition-all ${activeTask === 'TASK_1' ? 'bg-blue-600 shadow-md' : 'text-slate-600 hover:bg-white'}`}
            >
              Task 1
              <div className={`w-2 h-2 rounded-full ml-2 inline-block ${isTask1Valid ? 'bg-green-400' : 'bg-orange-400'}`} />
            </Button>

            <Button 
              type={activeTask === 'TASK_2' ? 'primary' : 'text'}
              size="large"
              onClick={() => goToTask('TASK_2')}
              className={`font-bold w-36 rounded-lg transition-all ${activeTask === 'TASK_2' ? 'bg-blue-600 shadow-md' : 'text-slate-600 hover:bg-white'}`}
            >
              Task 2
              <div className={`w-2 h-2 rounded-full ml-2 inline-block ${isTask2Valid ? 'bg-green-400' : 'bg-orange-400'}`} />
            </Button>
          </Space>

          {/* Right: Next Task hoặc Finish Section */}
          {isFullTestMode && activeTask === 'TASK_2' ? (
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              disabled={submitting || isQuotaFull}
              loading={submitting}
              className="font-bold px-6 bg-blue-600 hover:bg-blue-500 shadow-md"
            >
              Finish Section
            </Button>
          ) : (
            <Button 
              type="text" 
              size="large"
              onClick={() => activeTask === 'TASK_1' && goToTask('TASK_2')}
              disabled={activeTask === 'TASK_2'}
              className="font-semibold text-slate-500 hover:text-blue-600"
            >
              Next Task <RightOutlined />
            </Button>
          )}

        </div>
      </Footer>

    </Layout>
  );
};

export default WritingExamPage;
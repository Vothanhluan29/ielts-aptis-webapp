import React, { useState, useEffect } from 'react';
import { Spin, Steps, Typography, Result, Modal } from 'antd';
import {
  CustomerServiceOutlined,
  ReadOutlined,
  EditOutlined,
  AudioOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import { useExamTaking } from '../../../hooks/IELTS/exam/useExamTaking';

import ListeningExamPage from '../../listening/ListeningExamPage';
import ReadingExamPage from '../../reading/ReadingExamPage';
import WritingExamPage from '../../writing/WritingExamPage';
import SpeakingExamPage from '../../speaking/SpeakingExamPage';

const { Title, Text } = Typography;

// ============================
// CONSTANTS & HELPERS
// ============================
const STEPS = [
  { key: 'LISTENING', label: 'Listening', icon: <CustomerServiceOutlined />, standardTime: 40 }, // 40 phút
  { key: 'READING', label: 'Reading', icon: <ReadOutlined />, standardTime: 60 },     // 60 phút
  { key: 'WRITING', label: 'Writing', icon: <EditOutlined />, standardTime: 60 },     // 60 phút
  { key: 'SPEAKING', label: 'Speaking', icon: <AudioOutlined />, standardTime: 15 },   // 15 phút
];

// ============================
// SUB-COMPONENT: TIMER
// ============================
const ExamTimer = ({ minutes, onTimeUp }) => {
  // Khởi tạo thời gian ban đầu
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  // 🔥 ĐÃ XÓA useEffect reset thời gian bị lỗi đi!

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  
  const isWarning = timeLeft > 0 && timeLeft <= 300; 
  const isDanger = timeLeft === 0;

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold border-2 transition-colors duration-300 ${
        isDanger 
          ? 'bg-red-100 text-red-600 border-red-500' 
          : isWarning 
            ? 'bg-orange-50 text-orange-600 border-orange-400 animate-pulse' 
            : 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <ClockCircleOutlined />
      <span>{m}:{s}</span>
    </div>
  );
};


// ============================
// MAIN COMPONENT
// ============================
const ExamTakingPage = () => {
  const {
    loading,
    examData,
    processingStep,
    handleStepComplete
  } = useExamTaking();

  // ============================
  // EARLY RETURNS
  // ============================
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <Text className="mt-4 text-slate-500 font-medium text-lg">
          Syncing exam room...
        </Text>
      </div>
    );
  }

  if (!examData) return null;

  // ============================
  // DATA PREP
  // ============================
  const { full_test, current_step } = examData;
  const currentIndex = STEPS.findIndex(step => step.key === current_step);
  const currentStepInfo = STEPS[currentIndex] || {};

  const commonProps = {
    // Truyền callback để component con báo cáo nộp bài
    onFinish: (submissionId) => handleStepComplete(submissionId),
  };

  // Hàm xử lý khi hết giờ (Ép buộc nộp bài)
  const handleTimeUp = () => {
    Modal.warning({
      title: 'Time is up!',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: `The time allocated for the ${currentStepInfo.label} section has expired. Your answers are being auto-submitted.`,
      okText: 'Continue to Next Section',
      onOk: () => {
        // Gọi hàm submit rỗng hoặc gọi trigger vào component con
        // Tùy thuộc vào thiết kế của component con, bạn có thể truyền ID bài nộp vào đây.
        handleStepComplete(null); 
      }
    });
  };

  // ============================
  // RENDER CURRENT STEP
  // ============================
  const renderCurrentStep = () => {
    switch (current_step) {
      case 'LISTENING':
        return <ListeningExamPage testId={full_test.listening_test_id} {...commonProps} />;
      
      case 'READING':
        return <ReadingExamPage testId={full_test.reading_test_id} {...commonProps} />;
      
      case 'WRITING':
        return <WritingExamPage testId={full_test.writing_test_id} {...commonProps} />;
      
      case 'SPEAKING':
        console.log('Speaking test ID:', full_test.speaking_test_id); 
        return <SpeakingExamPage testId={full_test.speaking_test_id} {...commonProps} />;
      
      case 'FINISHED':
        return (
          <div className="h-full flex items-center justify-center py-20 bg-white">
            <Result
              status="success"
              title={<span className="text-3xl font-black text-slate-800">Exam Completed Successfully!</span>}
              subTitle={<span className="text-slate-500 text-base mt-2 block">Your answers have been securely saved. Please wait while we generate your detailed band score...</span>}
              icon={<Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#10b981' }} spin />} />}
            />
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <Result
              status="500"
              title="Invalid Exam State"
              subTitle={`The system encountered an unknown state: ${current_step}.`}
            />
          </div>
        );
    }
  };

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">

      {/* ================= COMPACT HEADER ================= */}
      <header className="shrink-0 bg-white border-b border-slate-200 shadow-sm px-4 py-2 flex items-center justify-between z-40 relative">
        
        {/* LEFT: Exam Title & Badge */}
        <div className="flex items-center gap-3 w-1/4">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
            IELTS
          </div>
          <div className="hidden sm:block">
            <Title level={5} className="m-0! text-slate-800 line-clamp-1" title={full_test.title}>
              {full_test.title}
            </Title>
          </div>
        </div>

        {/* CENTER: Compact Progress Steps */}
        <div className="flex-1 max-w-lg hidden md:block">
          {currentIndex !== -1 && (
            <Steps
              size="small"
              current={currentIndex}
              items={STEPS.map(step => ({
                title: <span className="text-xs font-semibold">{step.label}</span>,
                icon: step.icon
              }))}
              className="mt-1"
            />
          )}
        </div>

        {/* RIGHT: Timer */}
        <div className="w-1/4 flex justify-end items-center gap-4">
          {currentIndex !== -1 && (
            <>
              {/* Hiển thị cho Mobile khi bị ẩn mất Steps */}
              <div className="md:hidden text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                Part {currentIndex + 1}/4
              </div>
              
              <ExamTimer 
                key={current_step}
                minutes={currentStepInfo.standardTime} 
                currentStep={current_step} 
                onTimeUp={handleTimeUp} 
              />
            </>
          )}
        </div>
      </header>

      {/* ================= MAIN CONTENT (SCROLLABLE AREA) ================= */}
      <main className="flex-1 relative overflow-y-auto w-full">
        
        {/* Processing/Transition Overlay */}
        {processingStep && (
          <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center border border-slate-100">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 44, color: '#4f46e5' }} spin />} />
              <Title level={4} className="mt-6! mb-2! text-slate-800 font-bold">
                Saving your progress...
              </Title>
              <Text type="secondary">
                Securely submitting your answers. Please do not close this window.
              </Text>
            </div>
          </div>
        )}

        {/* Khối bọc giao diện làm bài (Giới hạn độ rộng để dễ nhìn) */}
        <div className="h-full w-full mx-auto">
          {renderCurrentStep()}
        </div>

      </main>
    </div>
  );
};

export default ExamTakingPage;
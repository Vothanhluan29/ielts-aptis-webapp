import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Steps, Modal, Typography, Button } from 'antd';
import { ClipboardList, BookOpen, Headphones, PenTool, Mic, ShieldAlert } from 'lucide-react';

// Nhúng Custom Hook vào
import { useAptisExam } from '../../../hooks/APTIS/exam/useExamAptisExam'; 

import GrammarVocabExamPage from '../grammar_vocab/GrammarVocabExamPage';
import ListeningAptisExamPage from '../listening/ListeningAptisExamPage';
import ReadingAptisExamPage from '../reading/ReadingAptisExamPage';
import WritingAptisExamPage from '../writing/WritingAptisExamPage';
import SpeakingAptisExamPage from '../speaking/SpeakingAptisExamPage';

const { Title, Text } = Typography;

// Mảng giao diện chứa Icon cho component Steps
const APTIS_UI_STEPS = [
  { id: 'GRAMMAR_VOCAB', title: 'Grammar & Vocab', icon: <ClipboardList size={18} /> },
  { id: 'LISTENING', title: 'Listening', icon: <Headphones size={18} /> },
  { id: 'READING', title: 'Reading', icon: <BookOpen size={18} /> },
  { id: 'WRITING', title: 'Writing', icon: <PenTool size={18} /> },
  { id: 'SPEAKING', title: 'Speaking', icon: <Mic size={18} /> },
];

const ExamAptisExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🔥 Gọi Hook để lấy State và Function
  const { 
    loading, 
    submission, 
    transitioning, 
    transitionMsg, 
    handleSkillFinish 
  } = useAptisExam(id);

  const renderCurrentSkill = () => {
    if (!submission) return null;

    const commonProps = {
      isFullTest: true,
      onSkillFinish: handleSkillFinish,
    };

    const fullTestObj = submission?.full_test || submission?.test || {};
    const safeStep = String(submission?.current_step || '').toUpperCase();

    switch (safeStep) {
      case 'GRAMMAR_VOCAB':
        return <GrammarVocabExamPage {...commonProps} testIdFromProps={fullTestObj?.grammar_vocab_test_id} />;
      case 'LISTENING':
        return <ListeningAptisExamPage {...commonProps} testIdFromProps={fullTestObj?.listening_test_id} />;
      case 'READING':
        return <ReadingAptisExamPage {...commonProps} testIdFromProps={fullTestObj?.reading_test_id} />;
      case 'WRITING':
        return <WritingAptisExamPage {...commonProps} testIdFromProps={fullTestObj?.writing_test_id} />;
      case 'SPEAKING':
        return <SpeakingAptisExamPage {...commonProps} testIdFromProps={fullTestObj?.speaking_test_id} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-white m-8 rounded-3xl shadow-sm border border-slate-200">
            <ShieldAlert size={64} className="text-red-500 mb-6" />
            <Title level={3} className="text-slate-800!">
              Invalid Exam Status
            </Title>
            <Text className="text-slate-500 text-lg">
              The system cannot determine the next exam part. Please contact the Administrator.
            </Text>
          </div>
        );
    }
  };

  if (loading || transitioning) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spin size="large" />
        <Text className="mt-6 text-indigo-600 font-bold text-lg animate-pulse">
          {transitionMsg}
        </Text>
      </div>
    );
  }

  const currentStepIndex = APTIS_UI_STEPS.findIndex(
    (s) => s.id === submission?.current_step
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* HEADER */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200">
            FULL MOCK TEST
          </div>

          <Text className="font-bold text-slate-700 hidden md:block">
            {submission?.full_test?.title || submission?.test?.title || "Aptis Assessment"}
          </Text>
        </div>

        {/* STEP PROGRESS */}
        <div className="flex-1 max-w-2xl px-8 hidden lg:block">
          <Steps
            size="small"
            current={currentStepIndex !== -1 ? currentStepIndex : 0}
            items={APTIS_UI_STEPS.map((step) => ({
              title: step.title,
              icon: step.icon,
            }))}
          />
        </div>

        {/* EXIT BUTTON */}
        <Button
          danger
          type="text"
          className="font-bold"
          onClick={() => {
            Modal.confirm({
              title: 'Are you sure you want to exit?',
              content: 'Your progress for the current part might not be fully saved. You can still return to continue later.',
              okText: 'Exit Exam',
              cancelText: 'Continue',
              okButtonProps: { danger: true },
              onOk: () => navigate('/aptis/exam'),
            });
          }}
        >
          Exit
        </Button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative overflow-auto bg-slate-100">
        {renderCurrentSkill()}
      </div>
    </div>
  );
};

export default ExamAptisExamPage;
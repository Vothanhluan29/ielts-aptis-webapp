import React, { useMemo } from 'react';
import { 
  Card, Button, Typography, Progress, 
  Spin, Tag, Alert 
} from 'antd';
import { 
  AudioOutlined, SendOutlined, 
  RightOutlined, SyncOutlined, SoundOutlined,
  PlayCircleOutlined, StopOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, LoadingOutlined, ReadOutlined, ClockCircleOutlined,
  StepForwardOutlined
} from '@ant-design/icons';
import { useSpeakingExam } from '../../../hooks/IELTS/speaking/useSpeakingExam'; 

const { Title, Text, Paragraph } = Typography;

const SpeakingExamPage = ({ testId, onFinish }) => {
  const {
    testDetail, loading, saving,
    currentPart, currentQuestion,
    currentPartIdx, currentQuestionIdx,
    isLastQuestionOfTest,
    isRecording, audioBlob, audioUrl, recordingTime,
    startRecording, stopRecording, discardRecording, handleNextOrSubmit,
    isPreparing, prepTimeLeft, handleSkipPreparation
  } = useSpeakingExam(testId, onFinish); 

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const { totalQuestions, currentOverallIndex } = useMemo(() => {
    if (!testDetail?.parts) return { totalQuestions: 0, currentOverallIndex: 0 };
    
    let total = 0;
    let currentIndex = 0;

    testDetail.parts.forEach((part, pIdx) => {
      total += part.questions?.length || 0;
      if (pIdx < currentPartIdx) {
        currentIndex += part.questions?.length || 0;
      } else if (pIdx === currentPartIdx) {
        currentIndex += currentQuestionIdx + 1; 
      }
    });

    return { totalQuestions: total, currentOverallIndex: currentIndex };
  }, [testDetail, currentPartIdx, currentQuestionIdx]);

  // ==========================================
  // RENDER LOADING
  // ==========================================
  if (loading || !testDetail || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4 py-20">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 44, color: '#4f46e5' }} spin />} />
        <Text className="text-indigo-600 font-semibold text-lg">Preparing your speaking room...</Text>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden">
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* ================= HEADER ================= */}
      <div className="bg-white border-b border-slate-200 shrink-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Title level={5} className="m-0! text-slate-800!">
              {testDetail.title}
            </Title>
            <Text type="secondary" className="flex items-center gap-1 mt-1 text-xs font-semibold uppercase tracking-wider">
              <SoundOutlined /> Speaking Section
            </Text>
          </div>

          <div className="w-full md:w-72">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>Section Progress</span>
              <span>Question {currentOverallIndex} of {totalQuestions}</span>
            </div>
            <Progress 
              percent={Math.round((currentOverallIndex / totalQuestions) * 100)} 
              strokeColor="#4f46e5" 
              showInfo={false}
              size="small"
              className="m-0"
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT (SPLIT SCREEN) ================= */}
      {/* Đổi thành flex-row trên màn hình lớn (lg), mở rộng max-w-6xl */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* --- LEFT COLUMN: QUESTION CARD --- */}
        <div className="w-full lg:w-1/2 h-full flex flex-col overflow-hidden">
          <Card 
            className="rounded-2xl shadow-sm border-slate-200 h-full flex flex-col overflow-y-auto custom-scrollbar"
            styles={{ body: { padding: '32px', flex: 1 } }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Tag color="indigo" className="px-3 py-1 text-sm font-bold tracking-wider rounded-md m-0 border-0 bg-indigo-50 text-indigo-600">
                PART {currentPart.part_number}
              </Tag>
              {currentPart.part_number === 2 && (
                <Tag color="orange" className="px-3 py-1 text-sm font-bold tracking-wider rounded-md m-0 border-0 bg-orange-50 text-orange-600">
                  LONG TURN
                </Tag>
              )}
            </div>

            {/* Instruction */}
            {currentPart.instruction && (
              <Alert
                message={<span className="font-semibold">{currentPart.instruction}</span>}
                type="info"
                showIcon
                icon={<SoundOutlined />}
                className="mb-6 rounded-xl bg-blue-50/50 border-blue-100 text-blue-800"
              />
            )}

            {/* Cue Card (Dành riêng Part 2) */}
            {currentPart.part_number === 2 && currentPart.cue_card && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                <Text className="text-amber-800 font-bold mb-3 uppercase text-xs tracking-widest flex items-center gap-2">
                  <ReadOutlined /> Candidate Task Card
                </Text>
                <Paragraph className="text-slate-800 text-base whitespace-pre-wrap mb-0! font-medium leading-relaxed">
                  {currentPart.cue_card}
                </Paragraph>
              </div>
            )}

            {/* Current Question */}
            <Title level={3} className="text-slate-800! leading-snug! mt-0! mb-6!">
              {currentQuestion.question_text}
            </Title>

            {/* Audio Question */}
            {currentQuestion.audio_question_url && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3 w-fit mt-auto">
                <SoundOutlined className="text-slate-400 text-lg ml-2" />
                <audio controls className="h-10 outline-none">
                  <source src={currentQuestion.audio_question_url.startsWith('http') ? currentQuestion.audio_question_url : `http://localhost:8000${currentQuestion.audio_question_url}`} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </Card>
        </div>

        {/* --- RIGHT COLUMN: RECORDING ZONE --- */}
        <div className="w-full lg:w-1/2 h-full flex flex-col">
          <Card 
            className="rounded-2xl shadow-sm border-slate-200 h-full flex flex-col"
            styles={{ body: { padding: '40px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
          >
            {!audioBlob ? (
              // TRẠNG THÁI 1: CHƯA CÓ FILE GHI ÂM
              <div className="flex flex-col items-center gap-6">
                
                {/* Vòng tròn Icon */}
                <div 
                  className={`w-28 h-28 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-50 text-red-500 border-4 border-red-200 animate-pulse' 
                      : isPreparing
                        ? 'bg-amber-50 text-amber-500 border-4 border-amber-200'
                        : 'bg-indigo-50 text-indigo-500 border-4 border-indigo-100'
                  }`}
                >
                  {isPreparing ? <ClockCircleOutlined style={{ fontSize: '48px' }} /> : <AudioOutlined style={{ fontSize: '48px' }} />}
                </div>

                {/* KHỐI HIỂN THỊ NÚT BẤM */}
                {isPreparing ? (
                  // 1A. ĐANG CHUẨN BỊ
                  <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <Text className="text-amber-600 font-bold text-sm uppercase tracking-wider">
                      Preparation Time
                    </Text>
                    <Text className="text-slate-800 font-bold text-5xl tracking-widest font-mono">
                      00:{prepTimeLeft.toString().padStart(2, '0')}
                    </Text>
                    <Text className="text-slate-500 font-medium text-center max-w-sm mb-2 mt-2">
                      You have 1 minute to prepare. Recording will start automatically when time is up.
                    </Text>
                    <Button 
                      type="dashed" 
                      shape="round"
                      icon={<StepForwardOutlined />}
                      onClick={handleSkipPreparation}
                      className="text-amber-600 hover:text-amber-700 hover:border-amber-400 font-semibold mt-2"
                    >
                      Skip & Start Recording
                    </Button>
                  </div>

                ) : isRecording ? (
                  // 1B. ĐANG GHI ÂM
                  <div className="flex flex-col items-center gap-5">
                    <Text className="text-red-500 font-bold text-4xl tracking-widest font-mono">
                      {formatTime(recordingTime)}
                    </Text>
                    <Button 
                      type="primary" 
                      danger 
                      size="large" 
                      shape="round"
                      icon={<StopOutlined />}
                      onClick={stopRecording}
                      className="font-bold px-10 h-14 text-lg shadow-sm mt-4"
                    >
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  // 1C. TRƯỚC KHI GHI ÂM
                  <div className="flex flex-col items-center gap-3">
                    <Text className="text-slate-500 font-medium text-center">
                      Ready? Click the button below to start answering.
                    </Text>
                    <Button 
                      type="primary" 
                      size="large" 
                      shape="round"
                      icon={<PlayCircleOutlined />}
                      onClick={startRecording}
                      className="bg-indigo-600 hover:bg-indigo-500 font-bold px-10 h-14 text-lg mt-4 shadow-sm"
                    >
                      Start Recording
                    </Button>
                  </div>
                )}
              </div>

            ) : (
              // TRẠNG THÁI 2: ĐÃ GHI ÂM XONG
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
                  <CheckCircleOutlined style={{ fontSize: '40px' }} />
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 w-full max-w-md text-center">
                  <Text className="block text-slate-500 font-semibold mb-4 text-sm">
                    Your recorded answer ({formatTime(recordingTime)})
                  </Text>
                  <audio controls src={audioUrl} className="w-full h-12 outline-none" />
                </div>

                <Button 
                  type="dashed" 
                  icon={<SyncOutlined />} 
                  onClick={discardRecording}
                  className="text-slate-500 hover:text-indigo-600 hover:border-indigo-400 font-medium rounded-xl h-12 px-8 mt-2"
                >
                  Retake Answer
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ================= FOOTER / ACTION BAR ================= */}
      <div className="bg-white border-t border-slate-200 shrink-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
          <Text className="text-slate-400 hidden sm:block text-sm">
            <ExclamationCircleOutlined className="mr-1" />
            Please make sure you have spoken clearly before submitting.
          </Text>

          <Button 
            type="primary" 
            size="large"
            disabled={!audioBlob || saving || isPreparing || isRecording}
            loading={saving}
            onClick={handleNextOrSubmit}
            icon={isLastQuestionOfTest ? <SendOutlined /> : <RightOutlined />}
            iconPosition="end"
            className={`font-bold px-10 h-12 rounded-xl transition-all shadow-sm ml-auto ${
              !audioBlob ? 'bg-slate-200 text-slate-400 border-0' 
              : isLastQuestionOfTest ? 'bg-emerald-600 hover:bg-emerald-500' 
              : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {saving 
              ? (isLastQuestionOfTest ? "Submitting..." : "Saving...") 
              : (isLastQuestionOfTest ? "Submit Section" : "Next Question")
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpeakingExamPage;
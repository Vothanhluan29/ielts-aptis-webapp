import React, { useState, useRef } from 'react';
import { Layout, Button, Typography, Spin, Card, Tag, message, Progress } from 'antd'; 
import { 
  ClockCircleOutlined, ExclamationCircleOutlined, SendOutlined, 
  LeftOutlined, RightOutlined, CustomerServiceOutlined, PlayCircleFilled, CheckCircleFilled
} from '@ant-design/icons';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion'; 
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion'; 

// Gọi Custom Hook vào
import { useListeningAptisExam } from '../../../hooks/APTIS/listening/useListeningAptisExam';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// ==========================================
// COMPONENT: AUDIO PLAYER (Giữ nguyên)
// ==========================================
const AptisAudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const MAX_PLAYS = 2;

  const handlePlay = () => {
    if (playCount >= MAX_PLAYS || isPlaying) return;
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
         console.error("Audio playback error:", e);
         message.error("Audio playback error. Please check your speakers/browser!");
      });
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setPlayCount(prev => prev + 1);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress(total > 0 ? (current / total) * 100 : 0);
    }
  };

  const playsLeft = MAX_PLAYS - playCount;
  const isLocked = playsLeft <= 0;

  if (!src) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-4">
        <Text type="danger" className="font-bold">⚠️ This question is missing its audio file from the system!</Text>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 mb-6 flex items-center gap-5 transition-all shadow-sm">
      <audio 
        ref={audioRef} 
        src={src.startsWith('http') ? src : `http://localhost:8000${src}`} 
        onEnded={handleEnded} 
        onTimeUpdate={handleTimeUpdate} 
        preload="metadata"
      />
      
      <Button 
        type="primary" 
        shape="circle" 
        size="large"
        icon={isLocked ? <CheckCircleFilled /> : <PlayCircleFilled />}
        onClick={handlePlay}
        disabled={isLocked || isPlaying}
        className={`w-16 h-16 flex items-center justify-center text-3xl shadow-md ${
          isLocked ? 'bg-slate-300 text-white border-none shadow-none' : 
          isPlaying ? 'bg-blue-300 text-white border-none' : 
          'bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-transform'
        }`}
      />
      
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <Text className="font-bold text-blue-800 text-base">
            {isPlaying ? 'Playing audio...' : isLocked ? 'Listening complete' : 'Press Play to start listening'}
          </Text>
          <Tag color={isLocked ? "default" : "blue"} className="font-bold rounded-full border-0 px-3 py-1">
            Plays remaining: {playsLeft}
          </Tag>
        </div>
        <Progress 
          percent={isLocked ? 100 : progress} 
          showInfo={false} 
          strokeColor={isLocked ? "#94a3b8" : "#2563eb"}
          railColor="#e2e8f0" 
          size="small"
        />
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT: LISTENING EXAM PAGE
// ==========================================
const ListeningAptisExamPage = ({ 
  isFullTest = false, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  // 🔥 Rút vũ khí từ Hook ra sử dụng
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
    isTimeRunningOut,
    handleAnswerChange,
    confirmSubmit,
    formatTime,
    handleGoBackEmpty
  } = useListeningAptisExam({ isFullTest, testIdFromProps, onSkillFinish });

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

  if (parts.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="text-center rounded-3xl shadow-sm border-0 py-10 px-8">
          <ExclamationCircleOutlined className="text-red-400 text-5xl mb-4 block" />
          <Title level={4}>Empty Test</Title>
          <Text type="secondary">No questions have been added to this test yet.</Text>
          <Button type="primary" onClick={handleGoBackEmpty} className="mt-6">Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh', backgroundColor: '#f8fafc' }}>
      
      {!isFullTest && (
        <Header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div className="flex items-center gap-3">
            <Tag color="blue" className="px-3 py-1 font-bold rounded-lg border-0 bg-blue-100 text-blue-700 m-0">
              <CustomerServiceOutlined className="mr-1"/> Listening
            </Tag>
            <Text strong className="text-base hidden sm:block text-slate-800">{testDetail?.title}</Text>
          </div>
          
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <ClockCircleOutlined /> {formatTime(timeLeft)}
          </div>
        </Header>
      )}

      {isFullTest && (
        <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <Text strong className="text-lg text-slate-700">Section: Listening</Text>
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <ClockCircleOutlined /> Time remaining: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      <Content style={{ padding: '24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {parts.map((p, idx) => (
            <Button 
              key={p.id} 
              type={currentPartId === p.id ? 'primary' : 'default'} 
              onClick={() => setCurrentPartId(p.id)} 
              className={`flex-1 min-w-35 h-12 font-bold rounded-xl transition-all ${
                currentPartId === p.id 
                  ? 'bg-blue-600 hover:bg-blue-500 border-none shadow-md shadow-blue-200' 
                  : 'text-slate-500 border-slate-200 hover:text-blue-500 hover:border-blue-300'
              }`}
            >
              Part {p.part_number || idx + 1}
            </Button>
          ))}
        </div>

        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200 overflow-hidden" styles={{ body: { padding: '32px 24px' } }}>
          
          <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border-l-4 border-blue-500 text-slate-700 font-medium flex items-start gap-3">
            <CustomerServiceOutlined className="text-blue-600 text-xl mt-0.5" />
            <div>
              Listen carefully to the audio and select the most accurate answer. Remember that you only have <strong>2 plays</strong> for each audio clip.
            </div>
          </div>

          {!activePart?.groups || activePart.groups.length === 0 ? (
             <div className="text-center py-10 text-slate-400">No questions in this section.</div>
          ) : (
            activePart.groups.map((group) => (
              <div key={group.id} className="mb-14 last:mb-0 pb-8 border-b border-slate-100 last:border-0 last:pb-0">
                
                <AptisAudioPlayer 
                  src={group.audio_url || group.media_url || group.audio_file || group.attached_audio} 
                />
                
                <div className="pl-2 space-y-8">
                  {group.questions?.map((q, idx) => {
                    const qType = q.question_type?.toUpperCase() || "";
                    const pType = q.part_type?.toUpperCase() || "";
                    
                    const isDropdown = qType === 'DROPDOWN' || 
                                       qType === 'MATCHING' || 
                                       pType.includes('PART_4');

                    const qKey = String(q.question_number || idx + 1);

                    if (isDropdown) {
                      return (
                        <DropdownQuestion 
                          key={q.id}
                          questionId={q.id}
                          questionNumber={q.question_number || idx + 1}
                          questionText={q.question_text}
                          options={q.options}
                          selectedValue={answers[qKey]} 
                          onChange={(arg1, arg2) => {
                            const val = arg2 !== undefined ? arg2 : arg1;
                            handleAnswerChange(qKey, val);
                          }} 
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
                          selectedValue={answers[qKey]} 
                          onChange={(arg1, arg2) => {
                            const val = arg2 !== undefined ? arg2 : arg1;
                            handleAnswerChange(qKey, val);
                          }} 
                        />
                      );
                    }
                  })}
                </div>
              </div>
            ))
          )}

        </Card>
      </Content>

      <Footer style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, zIndex: 10 }}>
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
            className="rounded-xl font-bold bg-slate-800 hover:bg-slate-700 border-none shadow-md shadow-slate-300"
            onClick={() => setCurrentPartId(parts[currentTabIndex + 1]?.id)}
            disabled={submitting}
          >
            Next Part <RightOutlined />
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            className="rounded-xl font-bold px-10 bg-blue-600 hover:bg-blue-500 border-none shadow-lg shadow-blue-200"
            onClick={confirmSubmit}
            loading={submitting}
            icon={<SendOutlined />}
          >
            {isFullTest ? 'Submit & Continue to Writing' : 'Submit Test'}
          </Button>
        )}
      </Footer>
    </Layout>
  );
};

export default ListeningAptisExamPage;
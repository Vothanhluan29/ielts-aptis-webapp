import React, { useState, useEffect, useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, Button, Typography, Spin, Card, Tag, message, Modal, Progress 
} from 'antd'; 
import { 
  ClockCircleOutlined, ExclamationCircleOutlined, SendOutlined, 
  LeftOutlined, RightOutlined, CustomerServiceOutlined, PlayCircleFilled, CheckCircleFilled
} from '@ant-design/icons';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion'; 
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion'; 
import listeningAptisStudentApi from '../../../api/APTIS/listening/listeningAptisStudentApi';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// ==========================================
// 🎵 CUSTOM AUDIO PLAYER CHUẨN APTIS
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
         console.error("🎵 [PLAYER] Lỗi khi phát âm thanh:", e);
         message.error("Lỗi phát âm thanh. Vui lòng kiểm tra lại loa/trình duyệt!");
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
        <Text type="danger" className="font-bold">⚠️ Câu hỏi này đang bị thiếu file âm thanh từ hệ thống!</Text>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 mb-6 flex items-center gap-5 transition-all shadow-sm">
      <audio 
        ref={audioRef} 
        src={src} 
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
            {isPlaying ? 'Đang phát âm thanh...' : isLocked ? 'Đã hoàn thành nghe' : 'Nhấn Play để bắt đầu nghe'}
          </Text>
          <Tag color={isLocked ? "default" : "blue"} className="font-bold rounded-full border-0 px-3 py-1">
            Lượt nghe còn lại: {playsLeft}
          </Tag>
        </div>
        <Progress 
          percent={isLocked ? 100 : progress} 
          showInfo={false} 
          strokeColor={isLocked ? "#94a3b8" : "#2563eb"}
          trailColor="#e2e8f0"
          size="small"
        />
      </div>
    </div>
  );
};

// ==========================================
// 📝 MAIN EXAM PAGE
// ==========================================

// 🔥 NHẬN PROPS TỪ LAYOUT MẸ (ExamAptisExamPage) NẾU ĐANG THI FULL TEST
const ListeningAptisExamPage = ({ 
  isFullTest = false, 
  fullTestSubmissionId = null, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  // 🔥 NẾU thi Full Test -> Lấy ID bài thi được truyền từ component mẹ xuống.
  // NẾU thi Độc lập -> Lấy ID bài thi từ trên URL xuống.
  const testId = isFullTest ? testIdFromProps : urlId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  
  const [currentPartId, setCurrentPartId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [answers, setAnswers] = useState({});
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // 1. FETCH API
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        if (!testId) {
          throw new Error("Không tìm thấy ID bài thi Listening!");
        }

        // 🔥 Đã đổi `id` thành `testId`
        const response = await listeningAptisStudentApi.getTestDetail(testId);
        const data = response.data || response;
        
        setTestDetail(data);
        setTimeLeft((data?.time_limit || 40) * 60); 

        if (data.parts && data.parts.length > 0) {
          setCurrentPartId(data.parts[0].id);
        }
      } catch (error) {
        console.error("Lỗi tải đề thi:", error);
        message.error(`Không thể tải đề thi: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const parts = testDetail?.parts || [];
  const activePart = parts.find(p => p.id === currentPartId);
  const currentTabIndex = parts.findIndex(p => p.id === currentPartId);

  // 2. SUBMIT TEST
  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (isAutoSubmit) {
        message.warning({ content: "Đã hết thời gian! Hệ thống tự động thu bài.", duration: 5 });
      } else {
        message.loading({ content: 'Đang nộp bài Listening...', key: 'submit' });
      }

      const payload = {
        test_id: parseInt(testId), // 🔥 Đã đổi `id` thành `testId`
        is_full_test_only: isFullTest, // 🔥 Báo cho DB biết có phải full test không
        user_answers: answersRef.current 
      };

      const res = await listeningAptisStudentApi.submitTest(payload);
      const submissionData = res.data || res;
      
      message.success({ content: 'Nộp bài và chấm điểm thành công!', key: 'submit' });
      
      // 🔥 RẼ NHÁNH ĐIỀU HƯỚNG DỰA THEO CHẾ ĐỘ THI
      if (isFullTest && onSkillFinish) {
        // Trả ID bài nộp (skill_submission_id) về cho Layout mẹ để nó gọi API chuyển skill
        onSkillFinish(submissionData.id);
      } else {
        // Thi lẻ độc lập thì mới chuyển trang xem kết quả
        navigate(`/aptis/listening/result/${submissionData.id}`); 
      }
      
    } catch (error) {
      console.error("Submit error:", error);
      message.error({ content: 'Lỗi hệ thống khi nộp bài. Vui lòng thử lại!', key: 'submit', duration: 5 });
      setSubmitting(false);
    }
  };

  // 3. COUNTDOWN TIMER
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) {
      if (timeLeft <= 0 && !loading && !submitting && testDetail) handleSubmit(true);
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading, submitting, testDetail]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: String(value) }));
  };

  const confirmSubmit = () => {
    Modal.confirm({
      title: 'Xác nhận nộp bài',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: isFullTest 
        ? 'Sau khi nộp, hệ thống sẽ tự động chuyển sang phần Writing. Bạn sẽ không thể nghe hoặc sửa lại đáp án phần này. Tiếp tục?' 
        : 'Bạn có chắc chắn muốn nộp bài? Hệ thống sẽ kết thúc bài thi của bạn ngay lập tức.',
      okText: 'Nộp bài',
      cancelText: 'Hủy',
      okButtonProps: { danger: true, className: 'rounded-lg' },
      cancelButtonProps: { className: 'rounded-lg' },
      onOk: () => handleSubmit(false)
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <Text type="secondary" className="font-medium text-lg">Đang tải dữ liệu bài thi...</Text>
        </div>
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="text-center rounded-3xl shadow-sm border-0 py-10 px-8">
          <ExclamationCircleOutlined className="text-red-400 text-5xl mb-4 block" />
          <Title level={4}>Bài thi trống</Title>
          <Text type="secondary">Chưa có câu hỏi nào được thêm vào bài thi này.</Text>
          <Button type="primary" onClick={() => navigate('/aptis/listening')} className="mt-6">Quay lại</Button>
        </Card>
      </div>
    );
  }

  const isTimeRunningOut = timeLeft < 120;

  return (
    <Layout style={{ minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* HEADER: Ẩn đi nếu là Full Test vì Layout mẹ đã có Header to rồi */}
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

      {/* HEADER PHỤ CHO FULL TEST: Chứa đồng hồ đếm ngược nội bộ của kỹ năng Listening */}
      {isFullTest && (
        <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <Text strong className="text-lg text-slate-700">Phần thi: Listening</Text>
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <ClockCircleOutlined /> Thời gian còn lại: {formatTime(timeLeft)}
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
              className={`flex-1 min-w-[140px] h-12 font-bold rounded-xl transition-all ${
                currentPartId === p.id 
                  ? 'bg-blue-600 hover:bg-blue-500 border-none shadow-md shadow-blue-200' 
                  : 'text-slate-500 border-slate-200 hover:text-blue-500 hover:border-blue-300'
              }`}
            >
              Phần {p.part_number || idx + 1}
            </Button>
          ))}
        </div>

        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200 overflow-hidden" styles={{ body: { padding: '32px 24px' } }}>
          
          <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border-l-4 border-blue-500 text-slate-700 font-medium flex items-start gap-3">
            <CustomerServiceOutlined className="text-blue-600 text-xl mt-0.5" />
            <div>
              Hãy nghe kỹ đoạn băng và chọn đáp án chính xác nhất. Nhớ rằng bạn chỉ có <strong>2 lượt nghe</strong> cho mỗi đoạn audio.
            </div>
          </div>

          {!activePart?.groups || activePart.groups.length === 0 ? (
             <div className="text-center py-10 text-slate-400">Không có câu hỏi trong phần này.</div>
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

                    if (isDropdown) {
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
          Phần trước
        </Button>
        
        {currentTabIndex < parts.length - 1 ? (
          <Button
            type="primary"
            size="large"
            className="rounded-xl font-bold bg-slate-800 hover:bg-slate-700 border-none shadow-md shadow-slate-300"
            onClick={() => setCurrentPartId(parts[currentTabIndex + 1]?.id)}
            disabled={submitting}
          >
            Phần tiếp theo <RightOutlined />
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
            {isFullTest ? 'Nộp và chuyển sang Writing' : 'Nộp bài thi'}
          </Button>
        )}
      </Footer>
    </Layout>
  );
};

export default ListeningAptisExamPage;
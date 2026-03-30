import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Button, Typography, Spin, Space, Card, Tag, message, Modal } from 'antd'; 
import { 
  ClockCircleOutlined, ExclamationCircleOutlined, SendOutlined, 
  LeftOutlined, RightOutlined, BookOutlined 
} from '@ant-design/icons';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion'; 
// import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion'; // Tạm thời comment lại
import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// 🔥 Fix cứng 2 tabs
const TABS = ['GRAMMAR', 'VOCABULARY'];

// 🔥 NHẬN PROPS TỪ LAYOUT MẸ (ExamAptisExamPage) NẾU ĐANG THI FULL TEST
const GrammarVocabExamPage = ({ 
  isFullTest = false, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  // NẾU thi Full Test -> Lấy ID bài thi được truyền từ component mẹ xuống.
  // NẾU thi Độc lập -> Lấy ID bài thi từ trên URL xuống.
  const testId = isFullTest ? testIdFromProps : urlId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  
  // Mặc định luôn ở Tab GRAMMAR
  const [currentTab, setCurrentTab] = useState(TABS[0]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Store answers as { "203": "A", "204": "C" }
  const [answers, setAnswers] = useState({});
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // FETCH API
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        if (!testId) {
          throw new Error("Không tìm thấy ID bài thi Grammar & Vocab!");
        }
        
        // 🔥 Đã đổi `id` thành `testId`
        const data = await grammarVocabAptisStudentApi.getTestDetail(testId);
        setTestDetail(data);
        setTimeLeft((data?.time_limit || 25) * 60); 
      } catch (error) {
        message.error(`Không thể tải đề thi: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // SUBMIT TEST
  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (isAutoSubmit) {
        message.warning({ content: "Đã hết giờ! Hệ thống đang tự động nộp bài...", duration: 5 });
      } else {
        message.loading({ content: 'Đang chấm điểm bài thi của bạn...', key: 'submit' });
      }

      const payload = {
        test_id: parseInt(testId), // 🔥 Đã đổi `id` thành `testId`
        is_full_test_only: isFullTest, // 🔥 Khai báo chính xác trạng thái cho DB
        user_answers: answersRef.current 
      };

      const res = await grammarVocabAptisStudentApi.submitTest(payload);
      const submissionData = res.data || res;
      
      message.success({ content: 'Nộp bài và chấm điểm thành công!', key: 'submit' });
      
      // 🔥 RẼ NHÁNH ĐIỀU HƯỚNG DỰA THEO CHẾ ĐỘ THI
      if (isFullTest && onSkillFinish) {
        // Trả ID bài nộp (skill_submission_id) về cho Layout mẹ để nó gọi API chuyển skill
        onSkillFinish(submissionData.id);
      } else {
        // Thi lẻ độc lập thì mới chuyển trang xem kết quả
        navigate(`/aptis/grammar-vocab/result/${submissionData.id}`); 
      }
      
    } catch (error) {
      console.error("Submit error:", error);
      message.error({ content: 'Lỗi hệ thống. Vui lòng kiểm tra lại!', key: 'submit', duration: 5 });
      setSubmitting(false);
    }
  };

  // COUNTDOWN TIMER
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
      icon: <ExclamationCircleOutlined />,
      content: isFullTest 
        ? 'Sau khi nộp bài, hệ thống sẽ tự động chuyển sang kỹ năng Reading. Bạn không thể sửa lại đáp án phần này. Tiếp tục?' 
        : 'Hệ thống sẽ chấm điểm ngay lập tức. Bạn có chắc chắn muốn nộp bài?',
      okText: 'Nộp bài',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
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
        <Space orientation="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary">Loading test...</Text>
        </Space>
      </div>
    );
  }

  // 🔥 FILTER CÂU HỎI THÔNG MINH
  const questions = testDetail?.questions || [];
  const currentQuestions = questions.filter(q => {
    const type = q.part_type?.toUpperCase() || "";
    if (currentTab === 'GRAMMAR') return type.includes('GRAMMAR');
    if (currentTab === 'VOCABULARY') return type.includes('VOCAB');
    return false;
  });

  const currentTabIndex = TABS.indexOf(currentTab);
  const isTimeRunningOut = timeLeft < 120;

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

      {/* Nếu ĐANG LÀ FULL TEST thì vẫn phải hiện đồng hồ đếm ngược nội bộ của kỹ năng này ở đây cho học viên thấy */}
      {isFullTest && (
        <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <Text strong className="text-lg text-slate-700">Phần thi: Grammar & Vocabulary</Text>
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            <ClockCircleOutlined /> Thời gian còn lại: {formatTime(timeLeft)}
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
              className={`flex-1 min-w-[140px] h-12 font-bold rounded-xl ${
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
              : "Choose the most appropriate word or phrase."}
          </div>

          {currentQuestions.map((q, index) => {
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
            {isFullTest ? 'Nộp và chuyển sang Reading' : 'Submit & Grade'}
          </Button>
        )}
      </Footer>
    </Layout>
  );
};

export default GrammarVocabExamPage;
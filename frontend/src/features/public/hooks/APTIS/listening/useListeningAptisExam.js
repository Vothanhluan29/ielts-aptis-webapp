import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';
import listeningAptisStudentApi from '../../../api/APTIS/listening/listeningAptisStudentApi';

export const useListeningAptisExam = ({ isFullTest, testIdFromProps, onSkillFinish }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  // Xác định ID chuẩn xác tùy theo chế độ thi
  const testId = isFullTest ? testIdFromProps : urlId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  const [currentPartId, setCurrentPartId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [answers, setAnswers] = useState({});
  const answersRef = useRef(answers);
  
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // 1. Fetch Dữ liệu đề thi
  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      if (!testId) throw new Error("Listening test ID not found!");

      const response = await listeningAptisStudentApi.getTestDetail(testId);
      const data = response.data || response;
      
      setTestDetail(data);
      setTimeLeft((data?.time_limit || 40) * 60); 

      if (data.parts && data.parts.length > 0) {
        setCurrentPartId(data.parts[0].id);
      }
    } catch (error) {
      console.error("Error loading test:", error);
      message.error(`Failed to load test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // 2. Logic Submit Bài Thi
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (isAutoSubmit) {
        message.warning({ content: "Time's up! The system has automatically submitted your test.", duration: 5 });
      } else {
        message.loading({ content: 'Submitting Listening test...', key: 'submit' });
      }

      // Xóa bỏ các đáp án rác
      const cleanedAnswers = {};
      Object.entries(answersRef.current).forEach(([key, val]) => {
        if (val && val !== 'undefined' && val !== 'null' && val.trim() !== '') {
          cleanedAnswers[key] = val;
        }
      });

      const payload = {
        test_id: parseInt(testId),
        is_full_test_only: isFullTest,
        user_answers: cleanedAnswers 
      };

      const res = await listeningAptisStudentApi.submitTest(payload);
      let submissionData = res.data ? res.data : res;

      if (!submissionData || !submissionData.id) {
        message.error("System Error: Could not retrieve Submission ID!");
        setSubmitting(false);
        return; 
      }

      message.success({ content: 'Test submitted and graded successfully!', key: 'submit' });
      
      if (isFullTest && onSkillFinish) {
        onSkillFinish(submissionData.id);
      } else {
        // 🔥 ĐÃ FIX LỖI ID: Chuyển hướng theo testId thay vì submissionData.id
        navigate(`/aptis/listening/result/${submissionData.id}`); 
      }
      
    } catch (error) {
      console.error("Submit error:", error);
      message.error({ content: 'System error while submitting. Please try again!', key: 'submit', duration: 5 });
      setSubmitting(false);
    }
  }, [submitting, testId, isFullTest, navigate, onSkillFinish]);

  // 3. Đếm ngược thời gian
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) {
      if (timeLeft <= 0 && !loading && !submitting && testDetail) handleSubmit(true);
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, submitting, testDetail, handleSubmit]);

  // 4. Handlers
  const handleAnswerChange = useCallback((qKey, incomingValue) => {
    let finalValue = incomingValue;
    if (incomingValue && incomingValue.target && incomingValue.target.value !== undefined) {
      finalValue = incomingValue.target.value;
    }
    const stringValue = String(finalValue).trim();

    setAnswers(prev => ({ ...prev, [qKey]: stringValue }));
  }, []);

  const confirmSubmit = () => {
    Modal.confirm({
      title: 'Confirm Submission',
      // 🔥 ĐÃ FIX LỖI JSX Syntax Error: Đã gỡ bỏ icon truyền vào, Modal tự dùng icon mặc định của nó.
      content: isFullTest 
        ? 'After submitting, the system will automatically move to the next section. You will not be able to change your answers. Continue?' 
        : 'Are you sure you want to submit? The system will end your test immediately.',
      okText: 'Submit',
      cancelText: 'Cancel',
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

  const handleGoBackEmpty = () => navigate('/aptis/listening');

  // 5. Computed Variables
  const parts = testDetail?.parts || [];
  const activePart = parts.find(p => p.id === currentPartId);
  const currentTabIndex = parts.findIndex(p => p.id === currentPartId);
  const isTimeRunningOut = timeLeft < 120;

  return {
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
  };
};
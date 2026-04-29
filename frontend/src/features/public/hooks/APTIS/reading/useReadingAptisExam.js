import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';
import readingAptisStudentApi from '../../../api/APTIS/reading/readingAptisStudentApi';

export const useReadingAptisExam = ({ isFullTest, testIdFromProps, onSkillFinish }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  const testId = isFullTest ? testIdFromProps : urlId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  
  const [currentPartId, setCurrentPartId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [answers, setAnswers] = useState({});
  const answersRef = useRef(answers);
  
  useEffect(() => { answersRef.current = answers; }, [answers]);


  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      if (!testId) throw new Error("Reading test ID not found!");

      const response = await readingAptisStudentApi.getTestDetail(testId);
      const data = response.data || response;
      
      setTestDetail(data);
      setTimeLeft((data?.time_limit || 35) * 60);

      if (data.parts && data.parts.length > 0) {
        setCurrentPartId(data.parts[0].id);
      }
    } catch (error) {
      console.error("Error loading test:", error);
      message.error("Unable to load the test. Please check your connection!");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (isAutoSubmit) {
        message.warning({ content: "Time's up! The system has automatically submitted your test.", duration: 5 });
      } else {
        message.loading({ content: 'Submitting Reading test...', key: 'submit' });
      }

      const payload = {
        test_id: parseInt(testId),
        is_full_test_only: isFullTest,
        answers: answersRef.current
      };

      const res = await readingAptisStudentApi.submitTest(payload);
      const submissionData = res.data || res;
      
      message.success({ content: 'Test submitted successfully!', key: 'submit' });
      
      if (isFullTest && onSkillFinish) {
        onSkillFinish(submissionData.id);
      } else {
   
        navigate(`/aptis/reading/result/${submissionData.id || testId}`); 
      }
    } catch (error) {
      console.error("Submit error:", error);
      message.error({ content: 'A system error occurred while submitting. Please try again!', key: 'submit', duration: 5 });
      setSubmitting(false);
    }
  }, [submitting, testId, isFullTest, navigate, onSkillFinish]);


  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) {
      if (timeLeft <= 0 && !loading && !submitting && testDetail) handleSubmit(true);
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, submitting, testDetail, handleSubmit]);


  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: String(value) }));
  }, []);

  const confirmSubmit = () => {
    Modal.confirm({
      title: 'Confirm Submission',
      content: isFullTest 
        ? 'Are you sure you want to submit? The system will automatically move to the Listening section.'
        : 'Are you sure you want to submit? The system will end your Reading test immediately.',
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

  const handleGoBackEmpty = () => navigate('/aptis/reading');

 
  const parts = testDetail?.parts || [];
  const activePart = parts.find(p => p.id === currentPartId);
  const currentTabIndex = parts.findIndex(p => p.id === currentPartId);

 
  const hasReadingPassage = !!(
    activePart?.content || 
    activePart?.groups?.some(g => g.transcript || g.content || g.text || g.image_url)
  );

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
    hasReadingPassage,
    isTimeRunningOut,
    handleAnswerChange,
    confirmSubmit,
    formatTime,
    handleGoBackEmpty
  };
};
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';
import writingAptisStudentApi from '../../../api/APTIS/writing/writingAptisStudentApi';

export const useWritingAptisExam = ({ isFullTest, testIdFromProps, onSkillFinish }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  const testId = isFullTest ? testIdFromProps : urlId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  const [currentPart, setCurrentPart] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);


  const [answers, setAnswers] = useState({
    part_1: ["", "", "", "", ""],
    part_2: "",
    part_3: ["", "", ""],
    part_4: { informal: "", formal: "" }
  });

  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // 1. Fetch API & Map Database
  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      if (!testId) throw new Error("Test ID not found!");

      const data = await writingAptisStudentApi.getTestDetail(testId);
      setTestDetail(data);
      setTimeLeft((data?.time_limit || 50) * 60); 
    } catch (error) {
      message.error(`Unable to load the test: ${error.message || "Please try again!"}`);
      console.error(error);
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
        message.loading({ content: 'Submitting test...', key: 'submit' });
      }

      const currentAnswers = answersRef.current;
      
      const payload = {
        test_id: parseInt(testId),
        is_full_test_only: isFullTest,
        user_answers: {
          part_1: JSON.stringify(currentAnswers.part_1), 
          part_2: String(currentAnswers.part_2 || ""),   
          part_3: JSON.stringify(currentAnswers.part_3), 
          part_4: JSON.stringify(currentAnswers.part_4)  
        }
      };

      const res = await writingAptisStudentApi.submitTest(payload);
      const submissionData = res.data || res;
      
      message.success({ content: 'Test submitted successfully!', key: 'submit' });
      
      if (isFullTest && onSkillFinish) {
        onSkillFinish(submissionData?.id || testId);
      } else {
        navigate(`/aptis/writing/result/${submissionData?.id || testId}`); 
      }

    } catch (error) {
      console.error("submission error:", error?.response?.data || error);
      message.error({ content: 'Submission failed. Please check and try again!', key: 'submit' });
      setSubmitting(false);
    }
  }, [submitting, testId, isFullTest, navigate, onSkillFinish]);

  // 3. Timer Logic
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) {
      if (timeLeft <= 0 && !loading && !submitting && testDetail) {
        handleSubmit(true);
      }
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, submitting, testDetail, handleSubmit]);

  // 4. Handlers & Computed Data
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const countWords = (str) => {
    if (!str || str.trim() === '') return 0;
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const updateAnswer = (part, index, value, subKey = null) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (subKey) {
        newAnswers[part] = { ...newAnswers[part], [subKey]: value };
      } else if (index !== null) {
        const newArr = [...newAnswers[part]];
        newArr[index] = value;
        newAnswers[part] = newArr;
      } else {
        newAnswers[part] = value;
      }
      return newAnswers;
    });
  };

  const confirmSubmit = () => {
    Modal.confirm({
      title: 'Confirm Submission',
      content: isFullTest 
        ? 'After submitting, the system will automatically move to the Speaking section. You will not be able to edit your answers for this section. Continue?' 
        : 'Are you sure you want to submit? You cannot change your answers after submission.',
      okText: 'Submit',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => handleSubmit(false)
    });
  };

  const partsList = testDetail?.parts || [];
  const getPart = (num) => partsList.find(p => p.part_number === num) || { instruction: "", questions: [] };
  
  const getQuestionText = (part, index, defaultText) => {
    if (part.questions && part.questions[index]) {
      return part.questions[index].question_text;
    }
    return defaultText;
  };

  const isTimeRunningOut = timeLeft < 300;

  return {
    loading,
    submitting,
    testDetail,
    currentPart,
    setCurrentPart,
    timeLeft,
    answers,
    updateAnswer,
    confirmSubmit,
    formatTime,
    countWords,
    getPart,
    getQuestionText,
    isTimeRunningOut
  };
}; 
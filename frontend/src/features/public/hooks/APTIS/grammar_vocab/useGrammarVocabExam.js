import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';

import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

export const TABS = ['GRAMMAR', 'VOCABULARY'];

export const useGrammarVocabExam = ({ isFullTest, testIdFromProps, onSkillFinish }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  const testId = isFullTest ? testIdFromProps : urlId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  const [currentTab, setCurrentTab] = useState(TABS[0]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  
  // Dùng ref để giữ giá trị mới nhất của answers cho hàm auto-submit trong Timer
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // 1. Fetch Dữ liệu đề thi
  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      if (!testId) throw new Error("Grammar & Vocab test ID not found!");
      
      const data = await grammarVocabAptisStudentApi.getTestDetail(testId);
      setTestDetail(data);
      setTimeLeft((data?.time_limit || 25) * 60); 
    } catch (error) {
      message.error(`Unable to load test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // 2. Logic Submit Bài
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (isAutoSubmit) {
         message.warning({ content: "Time is up! The system is automatically submitting your test...", duration: 5 });
      } else {
        message.loading({ content: 'Grading your test...', key: 'submit' });
      }

      const payload = {
        test_id: parseInt(testId),
        is_full_test_only: isFullTest,
        user_answers: answersRef.current 
      };

      const res = await grammarVocabAptisStudentApi.submitTest(payload);
      const submissionData = res.data || res;
      
      message.success({ content: 'Test submitted and graded successfully!', key: 'submit' });
      
      if (isFullTest && onSkillFinish) {
        onSkillFinish(submissionData.id);
      } else {
        navigate(`/aptis/grammar-vocab/result/${testId}`);
      }
      
    } catch (error) {
      console.error("Submit error:", error);
      message.error({ content: 'Lỗi hệ thống. Vui lòng kiểm tra lại!', key: 'submit', duration: 5 });
      setSubmitting(false);
    }
  }, [isFullTest, navigate, onSkillFinish, submitting, testId]);

  // 3. Countdown Timer
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

  // 4. Handlers
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: String(value) }));
  };

  const confirmSubmit = () => {
    Modal.confirm({
      title: 'Xác nhận nộp bài',
      content: isFullTest 
       ? 'After submission, the system will automatically move to the Reading section. You cannot modify your answers for this part. Continue?' 
        : 'The system will grade your test immediately. Are you sure you want to submit?',
      okText: 'Submit',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => handleSubmit(false)
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 5. Phân loại câu hỏi dựa trên Tab hiện tại (Tối ưu bằng useMemo)
  const currentQuestions = useMemo(() => {
    const questions = testDetail?.questions || [];
    return questions.filter(q => {
      const type = q.part_type?.toUpperCase() || "";
      if (currentTab === 'GRAMMAR') return type.includes('GRAMMAR');
      if (currentTab === 'VOCABULARY') return type.includes('VOCAB');
      return false;
    });
  }, [testDetail, currentTab]);

  const currentTabIndex = TABS.indexOf(currentTab);
  const isTimeRunningOut = timeLeft < 120;

  return {
    loading,
    submitting,
    testDetail,
    currentTab,
    setCurrentTab,
    timeLeft,
    answers,
    currentQuestions,
    currentTabIndex,
    isTimeRunningOut,
    handleAnswerChange,
    confirmSubmit,
    formatTime
  };
};
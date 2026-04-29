// updated
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';

import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

export const TABS = ['GRAMMAR', 'VOCABULARY'];

export const useGrammarVocabExam = ({ isFullTest, testIdFromProps, onSkillFinish }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  const testId = isFullTest ? testIdFromProps : urlId;

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  const [currentTab, setCurrentTab] = useState(TABS[0]);
  const [timeLeft, setTimeLeft]     = useState(0);
  const [answers, setAnswers]       = useState({});

  // Giữ giá trị mới nhất của answers cho auto-submit
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // ─── 1. Fetch đề thi ────────────────────────────────────────────────────────
  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      if (!testId) throw new Error('Grammar & Vocab test ID not found!');

      const res = await grammarVocabAptisStudentApi.getTestDetail(testId);
      // Unwrap axios response nếu có
      const testData = res?.data || res;

      setTestDetail(testData);
      setTimeLeft((testData?.time_limit || 25) * 60);
    } catch (error) {
      message.error(`Unable to load test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => { fetchTest(); }, [fetchTest]);

  // ─── 2. Submit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);

      if (isAutoSubmit) {
        message.warning({
          content: 'Time is up! The system is automatically submitting your test...',
          duration: 5,
        });
      } else {
        message.loading({ content: 'Grading your test...', key: 'submit' });
      }

      const payload = {
        test_id: parseInt(testId),
        is_full_test_only: Boolean(isFullTest),

        user_answers: answersRef.current,
      };

      const res = await grammarVocabAptisStudentApi.submitTest(payload);
      const submissionData = res?.data || res;

      message.success({ content: 'Test submitted and graded successfully!', key: 'submit' });

      if (isFullTest && onSkillFinish) {
        onSkillFinish(submissionData.id);
      } else {
  
        navigate(`/aptis/grammar-vocab/result/${submissionData.id}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      message.error({ content: 'System error. Please try again!', key: 'submit', duration: 5 });
      setSubmitting(false);
    }
  }, [isFullTest, navigate, onSkillFinish, submitting, testId]);

  // ─── 3. Countdown Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || submitting) return;

    if (timeLeft <= 0 && testDetail) {
      handleSubmit(true);
      return;
    }

    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, submitting, testDetail, handleSubmit]);

  // ─── 4. Handlers ────────────────────────────────────────────────────────────
  const handleAnswerChange = useCallback((questionId, value) => {

    setAnswers(prev => ({ ...prev, [String(questionId)]: String(value) }));
  }, []);

  const confirmSubmit = useCallback(() => {
    Modal.confirm({
      title: 'Confirm Submission',
      content: isFullTest
        ? 'After submission, the system will move to the next section automatically. You cannot modify your answers. Continue?'
        : 'The system will grade your test immediately. Are you sure you want to submit?',
      okText: 'Submit',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => handleSubmit(false),
    });
  }, [isFullTest, handleSubmit]);

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);


const currentGroups = useMemo(() => {
    const groups = testDetail?.groups || [];
    
    return groups.filter(group => {
      const type = group.part_type?.toUpperCase() || '';
      if (currentTab === 'GRAMMAR')    return type === 'GRAMMAR';
      if (currentTab === 'VOCABULARY') return type.includes('VOCAB');
      return false;
    }).map(group => {
   
      const sortedQuestions = [...(group.questions || [])].sort(
        (a, b) => a.question_number - b.question_number
      );
      
   
      return { ...group, questions: sortedQuestions };
    });
  }, [testDetail, currentTab]);

 
  const currentQuestions = useMemo(() => {
    return currentGroups.flatMap(group => group.questions || []);
  }, [currentGroups]);


  const answeredCount = useMemo(() => {
    return currentQuestions.filter(q => {
      const ans = answers[String(q.id)];
      return ans !== undefined && ans !== null && ans !== '';
    }).length;
  }, [currentQuestions, answers]);


  const totalGrammarQuestions = useMemo(() => {
    return (testDetail?.groups || [])
      .filter(g => g.part_type?.toUpperCase() === 'GRAMMAR')
      .flatMap(g => g.questions || [])
      .length;
  }, [testDetail]);


  const totalVocabQuestions = useMemo(() => {
    return (testDetail?.groups || [])
      .filter(g => g.part_type?.toUpperCase().includes('VOCAB'))
      .flatMap(g => g.questions || [])
      .length;
  }, [testDetail]);

  const currentTabIndex  = TABS.indexOf(currentTab);
  const isTimeRunningOut = timeLeft < 120;

  return {
    // ── Core state ──────────────────────────────
    loading,
    submitting,
    testDetail,
    answers,

    // ── Tab control ─────────────────────────────
    currentTab,
    setCurrentTab,
    currentTabIndex,

    // ── Timer ───────────────────────────────────
    timeLeft,
    isTimeRunningOut,

    
    currentGroups,      
    currentQuestions,   
    answeredCount,
    totalGrammarQuestions,
    totalVocabQuestions,

    // ── Handlers ────────────────────────────────
    handleAnswerChange,
    confirmSubmit,
    formatTime,
  };
};
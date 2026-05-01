import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readingStudentApi } from '../../../api/IELTS/reading/readingStudentApi'; 
import toast from 'react-hot-toast';

export const useReadingExam = (propsTestId, propsOnFinish) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const testId = propsTestId || paramId;
  const isFullTestMode = !!propsTestId;

  // STATE
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(null);

  const answersRef = useRef(answers);

  // COMPUTED
  const totalQuestions = useMemo(() => {
    if (!test?.passages) return 0;
    return test.passages.reduce((total, passage) => {
        const passageQuestions = passage.groups?.reduce((groupTotal, group) => {
            return groupTotal + (group.questions?.length || 0);
        }, 0) || 0;
        return total + passageQuestions;
    }, 0);
  }, [test]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(val => {
      if (Array.isArray(val)) return val.length > 0;
      return typeof val === 'string' && val.trim() !== '';
    }).length;
  }, [answers]);

  // HANDLERS
  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [String(questionId)]: value };
      answersRef.current = newAnswers; 
      return newAnswers;
    });
  }, []);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return;

    
    try {
      setSubmitting(true);

      if (isAutoSubmit) {
        toast('Time is up! The system is automatically submitting your test...');
      }

      const currentAnswers = answersRef.current;

      const cleanedAnswers = {};
      Object.entries(currentAnswers).forEach(([qid, val]) => {
        if (val !== undefined && val !== null) {
          if (Array.isArray(val) && val.length > 0) {
            cleanedAnswers[qid] = val; 
          } else if (typeof val === 'string' && val.trim() !== '') {
            cleanedAnswers[qid] = val.trim(); 
          }
        }
      });

      const payload = {
        test_id: Number(testId),
        user_answers: cleanedAnswers, 
        is_full_test_only: isFullTestMode 
      };

      const response = await readingStudentApi.submitTest(payload);
      
      const submissionId = response?.data?.id || response?.id;

      if (!submissionId) {
        throw new Error("Submission ID was not returned from the server");
      }

      if (isFullTestMode && propsOnFinish) {
        propsOnFinish(submissionId);
      } else {
        toast.success("Submission successful!");
        navigate(`/reading/result/${submissionId}`, { replace: true });
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred while submitting the test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [testId, submitting, navigate, isFullTestMode, propsOnFinish]);

  // EFFECTS

  useEffect(() => {
    if (!testId) return;
    let mounted = true;

    const fetchTest = async () => {
      try {
        setLoading(true);
        const res = await readingStudentApi.getTestById(testId);
        const data = res.data || res;
        
        if (!mounted) return;
        if (!data) throw new Error("No data found");

        if (data.passages) {
          data.passages.sort((a, b) => a.order - b.order);
          data.passages.forEach(p => {
            if (p.groups) {
              p.groups.sort((a, b) => a.order - b.order);
              p.groups.forEach(g => {
                if (g.questions) g.questions.sort((a, b) => a.question_number - b.question_number);
              });
            }
          });
        }

        setTest(data);
        
        if (data.time_limit) {
          setTimeLeft(prev => prev === null ? data.time_limit * 60 : prev);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error('Unable to load the test data.');
        if (!isFullTestMode && mounted) navigate('/reading');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchTest();
    return () => { mounted = false; };
  }, [testId, isFullTestMode, navigate]); 

  useEffect(() => {
    if (timeLeft === null || submitting) return;

    if (timeLeft <= 0) {
      if (!submitting) {
         handleSubmit(true); 
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting, handleSubmit]);

  return {
    test,
    loading,
    submitting,
    answers,
    timeLeft,
    totalQuestions,
    answeredCount,
    handleAnswerChange,
    handleSubmit,
    isFullTestMode
  };
};
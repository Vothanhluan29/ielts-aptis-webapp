import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listeningStudentApi } from '../../../api/IELTS/listening/listeningStudentApi'; 
import toast from 'react-hot-toast';

export const useListeningExam = (propsTestId, propsOnFinish) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const testId = propsTestId || paramId;
  const isFullTestMode = !!propsTestId; 

  /* =========================
     STATE
  ========================= */
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const answersRef = useRef(answers);

  /* =========================
     COMPUTED VALUES
  ========================= */
  
  const totalQuestions = useMemo(() => {
    if (!test?.parts) return 0;
    return test.parts.reduce((total, part) => {
        const partQuestions = part.groups?.reduce((groupTotal, group) => {
            return groupTotal + (group.questions?.length || 0);
        }, 0) || 0;
        return total + partQuestions;
    }, 0);
  }, [test]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(val => {
      if (Array.isArray(val)) return val.length > 0;
      return typeof val === 'string' && val.trim() !== '';
    }).length;
  }, [answers]);

  const currentPart = useMemo(() => {
    return test?.parts?.[currentPartIndex] || null;
  }, [test, currentPartIndex]);

  /* =========================
     HANDLERS
  ========================= */

  const handleAnswerChange = useCallback((questionNumber, value) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [String(questionNumber)]: value };
      answersRef.current = newAnswers; // Sync with Ref to get the latest value when submitting
      return newAnswers;
    });
  }, []);

  const nextPart = useCallback(() => {
    if (!test) return;
    setCurrentPartIndex((prev) => prev < test.parts.length - 1 ? prev + 1 : prev);
  }, [test]);

  const prevPart = useCallback(() => {
    setCurrentPartIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  /* =========================
     SUBMIT LOGIC (CORE)
  ========================= */
  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting) return;

      // Skip confirm dialog if it is auto submission due to time running out
      if (!isAutoSubmit) {
        const isConfirmed = window.confirm('Are you sure you want to submit your answers?');
        if (!isConfirmed) return;
      }

      try {
        setSubmitting(true);
        if (isAutoSubmit) {
          toast('Time is up! The system is automatically submitting your test...', { icon: '⏰' });
        }

        const currentAnswers = answersRef.current;

        // Filter and clean answers before sending
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

        // Ensure await to capture the result
        const response = await listeningStudentApi.submitTest(payload);
        
        // Flexibly extract ID in case Axios interceptor changes the response structure
        const submissionId = response?.data?.id || response?.id;

        if (!submissionId) {
            throw new Error("Result ID was not returned from the system");
        }

        if (isFullTestMode && propsOnFinish) {
            propsOnFinish(submissionId);
        } else {
            toast.success('Submission successful!');
            navigate(`/listening/result/${submissionId}`, { replace: true });
        }

      } catch (error) {
        console.error('Submit error:', error);
        toast.error('Submission failed. Please try again.');
      } finally {
        setSubmitting(false); 
      }
    },
    [testId, submitting, navigate, isFullTestMode, propsOnFinish]
  );

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    if (!testId) return;
    
    let mounted = true;
    const fetchTest = async () => {
      try {
        setLoading(true);
        const res = await listeningStudentApi.getTestById(testId);
        const data = res.data || res;
        
        if (!mounted) return;
        if (!data) throw new Error("No data found");

        if (data.parts) {
          data.parts.sort((a, b) => a.part_number - b.part_number);
          data.parts.forEach(p => {
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
        console.error('Fetch test error:', err);
        toast.error('Unable to load the test!');
        if (!isFullTestMode && mounted) navigate('/listening');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTest();
    return () => { mounted = false; };
  }, [testId, isFullTestMode, navigate]);

  /* =========================
     TIMER & AUTO SUBMIT
  ========================= */
  useEffect(() => {
    if (timeLeft === null || submitting) return;
    
    // 🔥 FIXED CONDITION TO AVOID LOOP CALLING SUBMIT CONTINUOUSLY
    if (timeLeft <= 0) {
      if (!submitting) {
        handleSubmit(true); 
      }
      return;
    }
    
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitting, handleSubmit]);

  return {
    test, 
    loading, 
    submitting, 
    answers,
    currentPart, 
    currentPartIndex, 
    setCurrentPartIndex,
    timeLeft, 
    totalQuestions, 
    answeredCount,
    handleAnswerChange, 
    nextPart, 
    prevPart, 
    handleSubmit,
    isFullTestMode 
  };
};
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { writingStudentApi } from '../../api/writingStudentApi'; 
import useUserUsage from '../../../../hooks/MainLayout/useUserUsage'; 
import toast from 'react-hot-toast';

const MIN_WORDS_TASK_1 = 150;
const MIN_WORDS_TASK_2 = 250; 

export const useWritingExam = (propsTestId, propsOnFinish) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  
  // 🔥 CORE LOGIC: Ưu tiên lấy ID từ Props (Full Test) -> Nếu không có mới lấy từ URL (Single Test)
  const testId = propsTestId || paramId;
  const isFullTestMode = !!propsTestId;

  // 1. User Usage Hook (Kiểm tra lượt chấm)
  const { usage } = useUserUsage();
  
  // 2. Local State - Test Data & Exam Status
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTask, setActiveTask] = useState('TASK_1');
  const [answers, setAnswers] = useState({ TASK_1: '', TASK_2: '' });
  const [wordCounts, setWordCounts] = useState({ TASK_1: 0, TASK_2: 0 });
  const [timeLeft, setTimeLeft] = useState(60 * 60); // Default 60 mins fallback

  // 3. UI State - Editor & Resizer
  const questionContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(45); 
  const [isDragging, setIsDragging] = useState(false);

  // 4. Computed Properties
  const isQuotaFull = usage?.writing_used >= usage?.writing_limit;
  const isTask1Valid = wordCounts.TASK_1 >= MIN_WORDS_TASK_1;
  const isTask2Valid = wordCounts.TASK_2 >= MIN_WORDS_TASK_2;
  const canSubmit = isTask1Valid && isTask2Valid;

  // ==========================================
  // FETCH TEST DATA
  // ==========================================
  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      try {
        setLoading(true);
        const response = await writingStudentApi.getTestById(testId);
        const data = response.data || response;
        
        setTest(data);
        if (data.time_limit) setTimeLeft(data.time_limit * 60);
      } catch (error) {
        console.error("Fetch Writing Exam Error:", error);
        toast.error("Cannot load the writing test.");
        if (!isFullTestMode) navigate('/writing');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTest();
  }, [testId, navigate, isFullTestMode]);

  // ==========================================
  // TIMER LOGIC
  // ==========================================
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast("Time is up!", { icon: '⏰' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // ==========================================
  // UI LOGIC: FOCUS & SCROLL KHI CHUYỂN TASK
  // ==========================================
  useEffect(() => {
    if (questionContainerRef.current) questionContainerRef.current.scrollTop = 0;
    if (editorRef.current) editorRef.current.focus();
  }, [activeTask]);

  // ==========================================
  // UI LOGIC: RESIZER (KÉO THẢ CHIA MÀN HÌNH)
  // ==========================================
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const containerWidth = window.innerWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      if (newLeftWidth >= 30 && newLeftWidth <= 70) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleContentChange = useCallback((content, taskType) => {
    const trimmedStr = content.trim().replace(/\s+/g, ' ');
    const count = trimmedStr === '' ? 0 : trimmedStr.split(' ').length;
    
    setAnswers(prev => ({ ...prev, [taskType]: content }));
    setWordCounts(prev => ({ ...prev, [taskType]: count }));
  }, []);

  const handleSubmit = async () => {
    if (!isFullTestMode && isQuotaFull) {
        toast.error("You have reached your daily writing grading limit.");
        return;
    }
    
    if (!canSubmit) {
      const confirmUnderLength = window.confirm(
        `WARNING: You are under the word count limit!\n\nTask 1: ${wordCounts.TASK_1}/${MIN_WORDS_TASK_1} words.\nTask 2: ${wordCounts.TASK_2}/${MIN_WORDS_TASK_2} words.\n\nSubmitting now will result in a heavy penalty. Are you sure you want to submit?`
      );
      if (!confirmUnderLength) return;
    } else {
      if (!window.confirm("Are you sure you want to submit your test?")) return;
    }

    try {
      setSubmitting(true);
      const payload = {
        test_id: parseInt(testId),
        task1_content: answers.TASK_1,
        task2_content: answers.TASK_2,
        is_full_test_only: isFullTestMode
      };

      const res = await writingStudentApi.submitTest(payload);
      const submissionId = res.data?.id || res.id;

      if (isFullTestMode && propsOnFinish) {
          propsOnFinish(submissionId);
      } else {
          toast.success("Test submitted successfully! AI is grading your writing...", { duration: 4000 });
          navigate(`/writing/result/${submissionId}`, { replace: true });
      }

    } catch (error) {
      console.error("Submit Error:", error);
      const msg = error.response?.data?.detail || "An error occurred while submitting.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    test, loading, submitting,
    activeTask, setActiveTask,
    answers, handleContentChange,
    wordCounts, timeLeft, formatTime,
    isTask1Valid, isTask2Valid, canSubmit,
    isQuotaFull, usage,
    handleSubmit,
    isFullTestMode,
    // Trả thêm các giá trị UI ra ngoài cho component
    questionContainerRef,
    editorRef,
    leftWidth,
    setIsDragging
  };
};
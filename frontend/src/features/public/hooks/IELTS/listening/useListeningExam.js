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

  // 🔥 TỐI ƯU 1: Dùng Ref để lưu answers, tránh re-render hàm Submit gây reset đồng hồ
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

  // 🔥 TỐI ƯU 2: Đếm đúng cho cả Array (Multiple Answer) và String
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
      answersRef.current = newAnswers; // Đồng bộ với Ref
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

      if (!isAutoSubmit) {
        if (!window.confirm('Bạn có chắc chắn muốn nộp bài?')) return;
      }

      try {
        setSubmitting(true);
        if (isAutoSubmit) {
          toast('Hết giờ! Hệ thống đang tự động thu bài...', { icon: '⏰' });
        }

        const currentAnswers = answersRef.current;

        // 🔥 FIX BUGS: Lọc và giữ nguyên định dạng Array/String
        const cleanedAnswers = {};
        Object.entries(currentAnswers).forEach(([qid, val]) => {
          if (val !== undefined && val !== null) {
            if (Array.isArray(val) && val.length > 0) {
              cleanedAnswers[qid] = val; // Trả về mảng
            } else if (typeof val === 'string' && val.trim() !== '') {
              cleanedAnswers[qid] = val.trim(); // Trả về chuỗi
            }
          }
        });

        const payload = {
          test_id: Number(testId),
          user_answers: cleanedAnswers, // 🔥 FIX BUGS: Đã đổi answers thành user_answers
          is_full_test_only: isFullTestMode
        };

        // Gọi API Submit
        const result = await listeningStudentApi.submitTest(payload);
        
        // Axios interceptor thường trả thẳng res.data, backup lấy res.data.id
        const submissionId = result?.id || result?.data?.id;

        if (!submissionId) {
            throw new Error("Không nhận được ID kết quả từ hệ thống");
        }

        if (isFullTestMode && propsOnFinish) {
            propsOnFinish(submissionId);
        } else {
            toast.success('Nộp bài thành công!');
            navigate(`/listening/result/${submissionId}`, { replace: true });
        }

      } catch (error) {
        console.error('Submit error:', error);
        toast.error('Nộp bài thất bại. Vui lòng thử lại.');
        setSubmitting(false);
      }
    },
    [testId, submitting, navigate, isFullTestMode, propsOnFinish] // Đã bỏ `answers` và `test` ra khỏi dependency
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

        // (Tùy chọn) Sort lại data cho chắc ăn nếu Backend quên
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
        
        // Init time (Chỉ set 1 lần)
        if (data.time_limit && timeLeft === null) {
          setTimeLeft(data.time_limit * 60);
        }
      } catch (err) {
        console.error('Fetch test error:', err);
        toast.error('Không tải được đề thi!');
        if (!isFullTestMode) navigate('/listening');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTest();
    return () => { mounted = false; };
  }, [testId, isFullTestMode, navigate]); // Bỏ timeLeft ra khỏi dependency array

  /* =========================
     TIMER & AUTO SUBMIT
  ========================= */
  useEffect(() => {
    if (timeLeft === null || submitting) return;
    if (timeLeft <= 0) {
      handleSubmit(true); 
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
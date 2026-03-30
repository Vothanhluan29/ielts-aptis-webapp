import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readingStudentApi } from '../../api/readingStudentApi'; // Đảm bảo đúng đường dẫn của bạn
import { toast } from 'react-toastify';

export const useReadingExam = (propsTestId, propsOnFinish) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  // Xác định mode: Full Test (từ Props) hay Single Test (từ URL)
  const testId = propsTestId || paramId;
  const isFullTestMode = !!propsTestId;

  // --- STATE ---
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(null);

  // Dùng Ref để lưu giá trị mới nhất của answers mà không gây re-render cho hàm submit
  const answersRef = useRef(answers);

  // --- HANDLERS ---
  
  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prev => {
      // Lưu dưới dạng chuỗi (nếu là mảng thì nối bằng dấu phẩy để Backend dễ xử lý hoặc tùy logic Backend của bạn)
      // Tạm thời giữ nguyên value gốc (có thể là String hoặc Array)
      const newAnswers = { ...prev, [String(questionId)]: value };
      answersRef.current = newAnswers; // Sync ref
      return newAnswers;
    });
  }, []);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return; // Prevent double submit

    if (!isAutoSubmit && !window.confirm('Bạn có chắc chắn muốn nộp bài?')) return;

    // Lấy answers mới nhất từ Ref
    const currentAnswers = answersRef.current;

    // 1. Dọn dẹp payload (Lọc bỏ các câu có đáp án rỗng hoặc null)
    const cleanedAnswers = {};
    Object.entries(currentAnswers).forEach(([qid, val]) => {
      // Hỗ trợ cả mảng (cho câu hỏi nhiều đáp án) và chuỗi
      if (val !== undefined && val !== null) {
        if (Array.isArray(val) && val.length > 0) {
          cleanedAnswers[qid] = val; // Trả về mảng
        } else if (typeof val === 'string' && val.trim() !== '') {
          cleanedAnswers[qid] = val.trim(); // Trả về chuỗi
        }
      }
    });

    try {
      setSubmitting(true);
      if (isAutoSubmit) toast.info('Hết giờ! Đang tự động nộp bài...', { autoClose: 2000 });

      // 🔥 FIX LỖI PAYLOAD: Đổi `answers` thành `user_answers` để khớp với Pydantic Backend
      const payload = {
        test_id: Number(testId),
        user_answers: cleanedAnswers, 
        is_full_test_only: isFullTestMode 
      };

      // 2. Gọi API
      const result = await readingStudentApi.submitTest(payload);
      
      // Axios interceptor thường trả về res.data thẳng luôn, nếu không thì tự lấy .data
      const data = result.data || result; 
      const submissionId = data?.id;

      if (!submissionId) throw new Error("Không nhận được ID bài nộp từ Server");

      // 3. Chuyển hướng
      if (isFullTestMode && propsOnFinish) {
        propsOnFinish(submissionId);
      } else {
        toast.success("Nộp bài thành công!");
        navigate(`/reading/result/${submissionId}`, { replace: true });
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
      setSubmitting(false);
    }
  }, [testId, submitting, navigate, isFullTestMode, propsOnFinish]);


  // --- EFFECTS ---

  // 1. Fetch Test Data
  useEffect(() => {
    if (!testId) return;
    let mounted = true;

    const fetchTest = async () => {
      try {
        setLoading(true);
        const res = await readingStudentApi.getTestById(testId);
        const data = res.data || res;
        
        if (!mounted) return;

        // Chuẩn hóa dữ liệu (Sắp xếp Passage -> Group -> Question)
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
        
        // Thiết lập thời gian (Chỉ set 1 lần)
        if (data.time_limit && timeLeft === null) {
          setTimeLeft(data.time_limit * 60);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error('Không thể tải dữ liệu đề thi.');
        if (!isFullTestMode) navigate('/reading/tests'); // Đảm bảo navigate đúng link danh sách
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchTest();
    return () => { mounted = false; };
  }, [testId, isFullTestMode, navigate]); 

  // 2. Timer Logic (Đồng hồ đếm ngược)
  useEffect(() => {
    if (timeLeft === null || submitting) return;

    if (timeLeft <= 0) {
      handleSubmit(true); // Gọi auto submit khi hết giờ
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting, handleSubmit]);

  // --- COMPUTED ---
  // Tính tổng số câu hỏi
  const totalQuestions = useMemo(() => {
    if (!test?.passages) return 0;
    let count = 0;
    test.passages.forEach(p => {
      p.groups?.forEach(g => {
        count += g.questions?.length || 0;
      });
    });
    return count;
  }, [test]);

  // Đếm số câu đã trả lời (Chỉ đếm các câu có dữ liệu không rỗng)
  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(val => {
      if (Array.isArray(val)) return val.length > 0;
      return typeof val === 'string' && val.trim() !== '';
    }).length;
  }, [answers]);

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
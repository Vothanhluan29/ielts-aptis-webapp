import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import writingAptisStudentApi from '../../../api/APTIS/writing/writingAptisStudentApi';

export const useWritingAptisResult = () => {
  const { id } = useParams(); // Có thể là submission_id HOẶC test_id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);

  // 1. Lấy dữ liệu với cơ chế Phòng thủ Kép
  const fetchResult = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);

      // Cách 1: Giả định 'id' trên URL là submission_id, gọi API lấy thẳng bài nộp
      try {
        const detailsRes = await writingAptisStudentApi.getSubmissionDetail(id);
        if (detailsRes && (detailsRes.data || detailsRes.id)) {
          setSubmission(detailsRes.data || detailsRes);
          return;
        }
      } catch (err) {
        console.warn("ID is not a Submission ID, trying Fallback as Test ID...", err);
      }

      // Cách 2 (Fallback): Nếu Cách 1 lỗi (tức là URL đang truyền test_id)
      // Quét qua lịch sử để tìm bài nộp mới nhất của bài test đó.
      const historyRes = await writingAptisStudentApi.getMyHistory();
      const history = historyRes.data || historyRes || [];
      const testSubmissions = history.filter(item => item.test_id === parseInt(id));

      if (testSubmissions.length > 0) {
        const latestSub = testSubmissions.sort((a, b) => b.id - a.id)[0];
        const latestDetails = await writingAptisStudentApi.getSubmissionDetail(latestSub.id);
        setSubmission(latestDetails.data || latestDetails);
      } else {
        setSubmission(null);
      }

    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  // 2. Tính toán và đóng gói dữ liệu
  const computedData = useMemo(() => {
    if (!submission) return null;

    const isGraded = submission.status === 'GRADED';
    const testInfo = submission.test || {};
    
    // Parse answers an toàn
    const safeParse = (data, defaultVal) => {
      if (!data) return defaultVal;
      if (Array.isArray(data) || typeof data === 'object') return data;
      try { return JSON.parse(data); } catch { return defaultVal; }
    };

    const userAnswers = safeParse(submission.user_answers, {});
    const ansPart1 = safeParse(userAnswers.part_1, ["", "", "", "", ""]);
    const ansPart2 = userAnswers.part_2 || "";
    const ansPart3 = safeParse(userAnswers.part_3, ["", "", ""]);
    const ansPart4 = safeParse(userAnswers.part_4, { informal: "", formal: "" });

    const cefrLevel = submission.cefr_level || "N/A";
    const scoreVal = submission.score || 0;
    
    const dateStr = submission.submitted_at || submission.created_at;
    const submitDate = dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'N/A';

    return {
      isGraded,
      testInfo,
      ansPart1,
      ansPart2,
      ansPart3,
      ansPart4,
      cefrLevel,
      scoreVal,
      submitDate,
      feedback: submission.teacher_feedback || {},
      overallFeedback: submission.overall_feedback
    };
  }, [submission]);

  // 3. Hàm Helpers
  const handleGoBack = () => navigate('/aptis/writing');

  const getCefrColor = (level) => {
    if (level === 'C') return 'text-emerald-500 border-emerald-500 bg-emerald-50';
    if (level?.includes('B')) return 'text-blue-500 border-blue-500 bg-blue-50';
    if (level?.includes('A')) return 'text-amber-500 border-amber-500 bg-amber-50';
    return 'text-slate-400 border-slate-300 bg-slate-50';
  };

  const getPartInfo = (num) => (computedData?.testInfo?.parts || []).find(p => p.part_number === num) || { questions: [] };
  const getQText = (part, idx, def) => (part.questions?.[idx]?.question_text || def);

  const renderSafeText = (data) => {
    if (!data) return "";
    if (typeof data === 'string') return data;
    if (typeof data === 'object') return data.message || data.text || JSON.stringify(data);
    return String(data);
  };

  const countWords = (str) => {
    const text = renderSafeText(str);
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  return {
    loading,
    submission,
    computedData,
    handleGoBack,
    getCefrColor,
    getPartInfo,
    getQText,
    renderSafeText,
    countWords
  };
};
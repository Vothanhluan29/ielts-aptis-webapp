import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listeningAptisStudentApi from '../../../api/APTIS/listening/listeningAptisStudentApi';

export const useListeningAptisResult = () => {
  const { id } = useParams(); // submission_id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [activePartId, setActivePartId] = useState(null);

  // 1. Fetch Dữ liệu (gọi liên tiếp 2 API)
  const fetchResult = useCallback(async () => {
    try {
      setLoading(true);

      // Bước 1: Lấy chi tiết bài nộp
      const detailsRes = await listeningAptisStudentApi.getSubmissionDetail(id);
      const subData = detailsRes.data || detailsRes;
      setSubmission(subData);

      // Bước 2: Dùng test_id từ bài nộp để lấy chi tiết đề
      if (subData?.test_id) {
        const testRes = await listeningAptisStudentApi.getTestDetail(subData.test_id);
        const testData = testRes.data || testRes;
        setTestDetail(testData);

        // Khởi tạo tab hiển thị ở Part đầu tiên
        if (testData.parts?.length > 0) {
          setActivePartId(testData.parts[0].id);
        }
      }

    } catch (err) {
      console.error('Error fetching result:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchResult();
  }, [id, fetchResult]);

  // 2. Data Processing (Tính toán và đóng gói bằng useMemo)
  const computedData = useMemo(() => {
    if (!submission || !testDetail) return null;

    const parts = testDetail.parts || [];
    const resultsArray = submission.results || [];

    const cefrLevel = submission.cefr_level || 'N/A';
    const scoreVal = submission.score || submission.total_score || 0;
    const correctCount = submission.correct_count || 0;

    let totalQuestions = 0;
    parts.forEach(p => {
      p.groups?.forEach(g => {
        totalQuestions += g.questions?.length || 0;
      });
    });

    const dateStr = submission.submitted_at || submission.created_at;
    const submitDate = dateStr
      ? new Date(dateStr).toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'N/A';

    const activePart = parts.find(p => p.id === activePartId);

    return {
      parts,
      resultsArray,
      cefrLevel,
      scoreVal,
      correctCount,
      totalQuestions,
      submitDate,
      activePart
    };
  }, [submission, testDetail, activePartId]);

  // 3. Navigation
  const handleGoBack = () => navigate('/aptis/listening');

  return {
    loading,
    submission,
    testDetail,
    activePartId,
    setActivePartId,
    computedData,
    handleGoBack
  };
};
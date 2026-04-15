import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import readingAptisStudentApi from '../../../api/APTIS/reading/readingAptisStudentApi';

export const useReadingAptisResult = () => {
  // id ở đây là submission_id từ URL
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [activePartId, setActivePartId] = useState(null);

  // 1. Fetch Dữ liệu (Lấy Submission trước -> Lấy Test sau)
  const fetchResult = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);

      // Bước 1: Lấy chi tiết bài nộp
      const detailsRes = await readingAptisStudentApi.getSubmissionDetail(id);
      const subData = detailsRes.data || detailsRes;
      setSubmission(subData);

      // Bước 2: Dùng test_id từ bài nộp để lấy chi tiết đề
      if (subData?.test_id) {
        const testRes = await readingAptisStudentApi.getTestDetail(subData.test_id);
        const testData = testRes.data || testRes;
        setTestDetail(testData);

        if (testData.parts?.length > 0) {
          setActivePartId(testData.parts[0].id);
        }
      }

    } catch (err) {
      console.error('Error fetching reading result:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  // 2. Tính toán và đóng gói dữ liệu (bọc trong useMemo)
  const computedData = useMemo(() => {
    if (!submission || !testDetail) return null;

    const parts = testDetail.parts || [];
    const resultsArray = submission.results || [];
    
    const cefrLevel = submission.cefr_level || "N/A";
    const scoreVal = submission.score || submission.total_score || 0;
    
    // correctCount bây giờ đại diện cho Điểm thô (có thể là số thập phân do partial scoring)
    const correctCount = submission.correct_count || 0;
    
    // TỐI ƯU: Tính tổng điểm thô/số câu thực tế để match với correctCount
    let totalQuestions = 0;
    parts.forEach(p => {
      p.groups?.forEach(g => {
        (g.questions || []).forEach(q => {
          if (q.question_type === 'REORDER_SENTENCES') {
            const optCount = Array.isArray(q.options) ? q.options.length : 0;
            totalQuestions += (optCount > 0 ? optCount : 1);
          } else {
            totalQuestions += 1;
          }
        });
      });
    });

    const dateStr = submission.submitted_at || submission.created_at;
    const submitDate = dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
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

  // 3. Navigation Handlers
  const handleGoBack = () => navigate('/aptis/reading');

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
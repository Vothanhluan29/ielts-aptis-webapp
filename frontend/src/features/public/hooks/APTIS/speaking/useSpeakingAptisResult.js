import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

export const useSpeakingAptisResult = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [testDetail, setTestDetail] = useState(null);

  // 1. Logic Fetch Data "Phòng thủ kép"
  const fetchResult = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);

      let currentSubmission = null;
      let currentTestDetail = null;

      // CÁCH 1: Giả định ID trên URL là submission_id
      try {
        const subRes = await speakingAptisStudentApi.getSubmissionDetail(id);
        if (subRes && (subRes.data || subRes.id)) {
          currentSubmission = subRes.data || subRes;
        }
      } catch (err) {
        console.warn("ID is not a Submission ID, trying Fallback as Test ID...", err);
      }

      if (!currentSubmission) {
        const historyRes = await speakingAptisStudentApi.getMyHistory();
        const historyList = historyRes.data || historyRes || [];
        const testSubmissions = historyList.filter(item => Number(item.test_id) === Number(id));

        if (testSubmissions.length > 0) {
          const latestSub = testSubmissions.sort((a, b) => b.id - a.id)[0];
          const detailsRes = await speakingAptisStudentApi.getSubmissionDetail(latestSub.id);
          currentSubmission = detailsRes.data || detailsRes;
        }
      }

      // Kéo thông tin chi tiết của bài Test
      if (currentSubmission?.test_id) {
        const testRes = await speakingAptisStudentApi.getTestDetail(currentSubmission.test_id);
        currentTestDetail = testRes.data || testRes;
      }

      setSubmission(currentSubmission);
      setTestDetail(currentTestDetail);

    } catch (error) {
      console.error('Error loading Speaking result:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  // 2. Tính toán và đóng gói dữ liệu hiển thị
  const computedData = useMemo(() => {
    if (!submission) return null;

    const parts = testDetail?.parts || [];
    const resultsArray = submission.results || submission.responses || submission.answers || [];
    
    const isGraded = submission.status?.toUpperCase() === 'GRADED';
    const cefrLevel = submission.cefr_level || "N/A";
    const scoreVal = submission.total_score ?? submission.score ?? 0;

    const dateStr = submission.submitted_at || submission.created_at;
    const submitDate = dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'N/A';

    return {
      parts,
      resultsArray,
      isGraded,
      cefrLevel,
      scoreVal,
      submitDate,
      overallFeedback: submission.overall_feedback
    };
  }, [submission, testDetail]);

  // 3. Hàm Helpers
  const handleGoBack = () => navigate('/aptis/speaking');

  const getCefrColor = (level) => {
    if (level === 'C') return 'text-emerald-500 border-emerald-500 bg-emerald-50';
    if (level?.includes('B')) return 'text-blue-500 border-blue-500 bg-blue-50';
    if (level?.includes('A')) return 'text-amber-500 border-amber-500 bg-amber-50';
    return 'text-slate-400 border-slate-300 bg-slate-50';
  };

  return {
    loading,
    submission,
    testDetail,
    computedData,
    handleGoBack,
    getCefrColor
  };
};
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

// Helper parse JSON
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

export const useGrammarVocabResult = () => {
  const { id: testId } = useParams(); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [testDetail, setTestDetail] = useState(null); // Lấy lại state này
  const [activeTab, setActiveTab] = useState('GRAMMAR');

  const fetchResult = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Tự gọi API lấy chi tiết Đề thi (Để lấy Instruction và Questions)
      const testRes = await grammarVocabAptisStudentApi.getTestDetail(testId);
      const testData = testRes.data || testRes;
      setTestDetail(testData);

      // 2. Quét lịch sử lấy bài nộp
      const historyRes = await grammarVocabAptisStudentApi.getMyHistory();
      const historyList = historyRes.data || historyRes || [];
      const testSubmissions = historyList.filter(item => item.test_id === parseInt(testId));

      if (testSubmissions.length > 0) {
        const latestSub = testSubmissions.sort((a, b) => b.id - a.id)[0];
        const detailsRes = await grammarVocabAptisStudentApi.getSubmissionDetail(latestSub.id);
        setSubmission(detailsRes.data || detailsRes);
      } else {
        setSubmission(null);
      }
    } catch (err) {
      console.error('Error fetching result:', err);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (testId) fetchResult();
  }, [testId, fetchResult]);

  // ─── XỬ LÝ DỮ LIỆU ───
  const computedData = useMemo(() => {
    // 🔥 Chỉ chạy khi đã load xong cả Đề thi và Bài nộp
    if (!submission || !testDetail) return null;

    const groups = testDetail.groups || []; 
    const userAnswers = safeParse(submission.user_answers, {});
    const answerDetails = safeParse(submission.answer_details, {});

    const allQuestions = groups.flatMap(g => g.questions || []);
    const totalQuestions = allQuestions.length;

    const scoreVal = submission.total_score || submission.score || 0;
    
    let correctCount = 0;
    Object.values(answerDetails).forEach(detail => {
      if (detail.is_correct) correctCount += 1;
    });

    const dateStr = submission.submitted_at || submission.created_at;
    const submitDate = dateStr
      ? new Date(dateStr).toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'N/A';

    // Phân loại nhóm
    const grammarGroups = groups.filter(g => (g.part_type?.toUpperCase() || '') === 'GRAMMAR');
    const vocabGroups = groups.filter(g => (g.part_type?.toUpperCase() || '').includes('VOCAB'));

    const activeGroups = activeTab === 'GRAMMAR' ? grammarGroups : vocabGroups;

    const grammarCount = grammarGroups.flatMap(g => g.questions || []).length;
    const vocabCount = vocabGroups.flatMap(g => g.questions || []).length;

    const tabsConfig = [
      { id: 'GRAMMAR', label: 'Grammar', count: grammarCount },
      { id: 'VOCABULARY', label: 'Vocabulary', count: vocabCount }
    ];

    return {
      testDetail,
      userAnswers,
      answerDetails,
      totalQuestions,
      scoreVal,
      correctCount,
      submitDate,
      activeGroups, 
      tabsConfig
    };
  }, [submission, testDetail, activeTab]);

  const handleGoBack = () => navigate('/aptis/grammar-vocab');

  return {
    loading,
    submission,
    activeTab,
    setActiveTab,
    computedData,
    handleGoBack
  };
};
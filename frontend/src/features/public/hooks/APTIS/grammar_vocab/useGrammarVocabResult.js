import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

// Helper parse JSON an toàn dùng nội bộ trong hook
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

export const useGrammarVocabResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. States
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('GRAMMAR'); // 'GRAMMAR' | 'VOCABULARY'

  // 2. Fetch Data bọc trong useCallback
  const fetchResult = useCallback(async () => {
    try {
      setLoading(true);

      // Lấy chi tiết đề thi
      const testRes = await grammarVocabAptisStudentApi.getTestDetail(id);
      setTestDetail(testRes.data || testRes);

      // Quét lịch sử để lấy bài nộp mới nhất của đề này
      const historyRes = await grammarVocabAptisStudentApi.getMyHistory();
      const historyList = historyRes.data || historyRes || [];
      const testSubmissions = historyList.filter(item => item.test_id === parseInt(id));

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
  }, [id]);

  // 3. Mount Effect
  useEffect(() => {
    if (id) fetchResult();
  }, [id, fetchResult]);

  // 4. Data Processing (Tính toán điểm, đếm câu, lọc Tab bằng useMemo)
  const computedData = useMemo(() => {
    if (!submission || !testDetail) return null;

    const questions = testDetail.questions || [];
    const userAnswers = safeParse(submission.user_answers, {});
    const answerDetails = submission.answer_details || {};

    const totalQuestions = questions.length;
    const scoreVal = submission.total_score || submission.score || 0;
    
    let correctCount = 0;
    Object.values(answerDetails).forEach(detail => {
      if (detail.is_correct) correctCount += 1;
    });

    const dateStr = submission.submitted_at || submission.created_at;
    const submitDate = dateStr
      ? new Date(dateStr).toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'N/A';

    // Phân loại câu hỏi
    const grammarQuestions = questions.filter(q => (q.part_type?.toUpperCase() || '').includes('GRAMMAR'));
    const vocabQuestions = questions.filter(q => (q.part_type?.toUpperCase() || '').includes('VOCAB'));

    const activeQuestions = activeTab === 'GRAMMAR' ? grammarQuestions : vocabQuestions;

    const tabsConfig = [
      { id: 'GRAMMAR', label: 'Grammar', count: grammarQuestions.length },
      { id: 'VOCABULARY', label: 'Vocabulary', count: vocabQuestions.length }
    ];

    return {
      userAnswers,
      answerDetails,
      totalQuestions,
      scoreVal,
      correctCount,
      submitDate,
      activeQuestions,
      tabsConfig
    };
  }, [submission, testDetail, activeTab]);

  // 5. Handlers
  const handleGoBack = () => navigate('/aptis/grammar-vocab');

  return {
    loading,
    submission,
    testDetail,
    activeTab,
    setActiveTab,
    computedData,
    handleGoBack
  };
};
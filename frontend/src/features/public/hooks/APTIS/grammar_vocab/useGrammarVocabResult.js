import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

// Helper parse JSON an toàn
const safeParse = (data, defaultVal = {}) => {
  if (!data) return defaultVal;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return defaultVal; }
};

export const useGrammarVocabResult = () => {
  const { id: submissionId } = useParams(); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [testDetail, setTestDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('GRAMMAR');

  // ─── LƯỒNG FETCH DATA TỐI ƯU ───
  const fetchResult = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Gọi API lấy Bài Nộp (truyền submissionId)
      const detailsRes = await grammarVocabAptisStudentApi.getSubmissionDetail(submissionId);
      const subData = detailsRes.data || detailsRes;
      setSubmission(subData);

      // 2. Từ Bài Nộp, lấy ra test_id để gọi API lấy Đề Thi
      if (subData && subData.test_id) {
        const testRes = await grammarVocabAptisStudentApi.getTestDetail(subData.test_id);
        const testData = testRes.data || testRes;
        setTestDetail(testData);
      } else {
        setTestDetail(null);
      }

    } catch (err) {
      console.error('Error fetching result:', err);
      setSubmission(null);
      setTestDetail(null);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    if (submissionId) fetchResult();
  }, [submissionId, fetchResult]);

  // ─── XỬ LÝ DỮ LIỆU & SẮP XẾP CÂU HỎI ───
  const computedData = useMemo(() => {
    // Chỉ chạy khi đã load xong cả Đề thi và Bài nộp
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

    // Phân loại nhóm và ép sắp xếp câu hỏi theo question_number tăng dần
    const grammarGroups = groups
      .filter(g => (g.part_type?.toUpperCase() || '') === 'GRAMMAR')
      .map(g => ({
        ...g, 
        questions: [...(g.questions || [])].sort((a, b) => a.question_number - b.question_number)
      }));

    const vocabGroups = groups
      .filter(g => (g.part_type?.toUpperCase() || '').includes('VOCAB'))
      .map(g => ({
        ...g, 
        questions: [...(g.questions || [])].sort((a, b) => a.question_number - b.question_number)
      }));

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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

export const useGrammarVocabHistory = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // 1. Fetch dữ liệu lịch sử
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await grammarVocabAptisStudentApi.getMyHistory();
      const data = response.data || response || [];

      // Sắp xếp bài nộp mới nhất lên đầu
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.submitted_at || b.created_at) -
          new Date(a.submitted_at || a.created_at)
      );

      setHistory(sortedData);

    } catch (error) {
      console.error("Error fetching history:", error);
      message.error("Failed to load your test history.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Tự động fetch khi vào trang
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 3. Tính toán Mini Stats bằng useMemo để tối ưu
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    return {
      totalTests: history.length,
      bestScore: Math.max(...history.map(h => h.total_score || h.score || 0))
    };
  }, [history]);

  // 4. Các hàm điều hướng dùng chung
  const handleGoBack = () => navigate('/aptis/grammar-vocab');
  // 🔥 Đã fix lỗi kinh điển: Truyền record.id thay vì record.test_id
  const handleViewResult = (submissionId) => navigate(`/aptis/grammar-vocab/result/${submissionId}`);

  return {
    loading,
    history,
    stats,
    handleGoBack,
    handleViewResult
  };
};
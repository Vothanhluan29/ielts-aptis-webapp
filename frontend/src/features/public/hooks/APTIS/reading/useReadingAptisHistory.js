import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import readingAptisStudentApi from '../../../api/APTIS/reading/readingAptisStudentApi';

export const useReadingAptisHistory = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // 1. Fetch dữ liệu lịch sử
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await readingAptisStudentApi.getMyHistory();
      let rawData = response?.data || response;

      // Lập trình phòng thủ: Đảm bảo dữ liệu luôn là một Mảng (Array)
      if (!Array.isArray(rawData)) {
        rawData = [];
      }

      // Sắp xếp bài nộp mới nhất lên đầu
      const sortedData = [...rawData].sort(
        (a, b) =>
          new Date(b.submitted_at || b.created_at) -
          new Date(a.submitted_at || a.created_at)
      );

      setHistory(sortedData);

    } catch (error) {
      console.error("Error loading Reading history:", error);
      message.error("Failed to load your test history.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Mount Effect
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 3. Tính toán Mini Stats bằng useMemo để tối ưu hiệu suất
  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;

    // Ép kiểu điểm số về Number để Math.max tính toán an toàn
    const scoresArray = history.map(h => Number(h.score) || 0);

    return {
      totalTests: history.length,
      bestScore: Math.max(...scoresArray)
    };
  }, [history]);

  // 4. Các hàm điều hướng
  const handleGoBack = () => navigate('/aptis/reading');
  const handleViewResult = (submissionId) => navigate(`/aptis/reading/result/${submissionId}`);

  return {
    loading,
    history,
    stats,
    handleGoBack,
    handleViewResult
  };
};
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import writingAptisStudentApi from '../../../api/APTIS/writing/writingAptisStudentApi';

export const useWritingAptisHistory = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // 1. Fetch dữ liệu lịch sử
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await writingAptisStudentApi.getMyHistory();
      let rawData = response?.data || response;

      // Lập trình phòng thủ: Đảm bảo dữ liệu luôn là một Mảng
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
      console.error("Error loading Writing history:", error);
      message.error("Failed to load your test history.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Mount Effect
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 3. Tính toán Mini Stats bằng useMemo
  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;

    const gradedCount = history.filter(h => h.status === 'GRADED').length;

    return {
      totalSubmissions: history.length,
      gradedSubmissions: gradedCount
    };
  }, [history]);

  // 4. Các hàm điều hướng
  const handleGoBack = () => navigate('/aptis/writing');
  // LƯU Ý QUAN TRỌNG: Điều hướng bằng record.id (Submission ID)
  const handleViewResult = (submissionId) => navigate(`/aptis/writing/result/${submissionId}`);

  return {
    loading,
    history,
    stats,
    handleGoBack,
    handleViewResult
  };
};
    import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import examAptisStudentApi from '../../../api/APTIS/exam/examAptisStudentApi';

export const useExamAptisHistory = () => {
  const navigate = useNavigate();
  
  // 1. States
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);

  // 2. Fetch Data bọc trong useCallback
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await examAptisStudentApi.getMyExamHistory();
      const data = res.data || res || [];
      
      // Sắp xếp bài mới nhất lên đầu
      const sortedData = data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      setHistoryData(sortedData);
    } catch (error) {
      console.error("Error fetching full test history:", error);
      message.error("Unable to load exam history. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Mount Effect
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 4. Tính toán thống kê (Bọc useMemo để tối ưu hiệu suất)
  const stats = useMemo(() => {
    return {
      total: historyData.length,
      completed: historyData.filter(h => ['GRADED', 'COMPLETED', 'FINISHED'].includes(h.status)).length,
      pending: historyData.filter(h => h.status === 'PENDING').length,
      inProgress: historyData.filter(h => h.status === 'IN_PROGRESS').length,
    };
  }, [historyData]);

  // 5. Handlers điều hướng
  const handleGoBack = () => navigate('/aptis/exam');
  const handleViewResult = (id) => navigate(`/aptis/exam/result/${id}`);
  const handleResumeTest = (fullTestId) => navigate(`/aptis/exam/lobby/${fullTestId}`);

  return {
    loading,
    historyData,
    stats,
    handleGoBack,
    handleViewResult,
    handleResumeTest
  };
};
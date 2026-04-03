import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import writingAptisStudentApi from '../../../api/APTIS/writing/writingAptisStudentApi';

export const useWritingAptisList = () => {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, GRADED, PENDING, NOT_STARTED

  // 1. Fetch Dữ liệu bọc trong useCallback
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      // Gửi kèm skip, limit theo API bạn đang dùng
      const response = await writingAptisStudentApi.getAllTests({ skip: 0, limit: 100 });
      let data = response?.data || response;

      // Đảm bảo data luôn là một mảng
      if (!Array.isArray(data)) {
        data = [];
      }

      setTests(data);
    } catch (error) {
      console.error("Error fetching Writing test list:", error);
      message.error("Failed to load writing tests. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Mount Effect
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // 3. Lọc dữ liệu thông minh
  const filteredTests = useMemo(() => {
    if (filterStatus === 'ALL') return tests;
    return tests.filter(test => test.status === filterStatus);
  }, [tests, filterStatus]);

  // 4. Các hàm điều hướng
  const handleNavigateHistory = () => navigate('/aptis/writing/history');
  const handleNavigateExam = (testId) => navigate(`/aptis/writing/lobby/${testId}`);
  const handleNavigateRetry = (testId) => navigate(`/aptis/writing/taking/${testId}`);
  const handleNavigateResult = (testId) => navigate(`/aptis/writing/result/${testId}`);

  return {
    loading,
    filterStatus,
    setFilterStatus,
    filteredTests,
    handleNavigateHistory,
    handleNavigateExam,
    handleNavigateRetry,
    handleNavigateResult
  };
};
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import readingAptisStudentApi from '../../../api/APTIS/reading/readingAptisStudentApi';

export const useReadingAptisList = () => {
  const navigate = useNavigate();

  // 1. States
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 2. Fetch Data bọc trong useCallback để chống re-render
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await readingAptisStudentApi.getListTests();
      let data = response?.data || response;
      
      // Lập trình phòng thủ: Đảm bảo data luôn là Array
      if (!Array.isArray(data)) {
        data = [];
      }
      
      setTests(data);
    } catch (error) {
      console.error('Error fetching Reading test list:', error);
      message.error("Failed to load reading tests. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Mount Effect
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // 4. Lọc dữ liệu thông minh (Filter)
  const filteredTests = useMemo(() => {
    if (filterStatus === 'ALL') return tests;
    return tests.filter(test => test.status === filterStatus);
  }, [tests, filterStatus]);

  // 5. Gom các hàm điều hướng (Navigation Handlers)
  const handleNavigateHistory = () => navigate('/aptis/reading/history');
  const handleNavigateLobby = (testId) => navigate(`/aptis/reading/lobby/${testId}`);
  const handleNavigateRetry = (testId) => navigate(`/aptis/reading/taking/${testId}`);

  return {
    loading,
    filterStatus,
    setFilterStatus,
    filteredTests,
    handleNavigateHistory,
    handleNavigateLobby,
    handleNavigateRetry
  };
};
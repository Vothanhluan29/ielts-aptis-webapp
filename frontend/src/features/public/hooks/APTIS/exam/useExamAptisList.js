import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import examAptisStudentApi from '../../../api/APTIS/exam/examAptisStudentApi';

export const useExamAptisList = () => {
  const navigate = useNavigate();
  
  // 1. States
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 2. Fetch Data bọc trong useCallback
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examAptisStudentApi.getLibraryTests();
      setTests(response?.data || response || []);
    } catch (error) {
      console.error("Error fetching Aptis Full Test list:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Mount Effect
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // 4. Lọc Data (Filter)
  const filteredTests = useMemo(() => {
    if (filterStatus === 'ALL') return tests;
    if (filterStatus === 'COMPLETED') {
      return tests.filter(test => ['GRADED', 'COMPLETED', 'FINISHED'].includes(test.user_status));
    }
    return tests.filter(test => test.user_status === filterStatus);
  }, [tests, filterStatus]);

  // 5. Các hàm Navigation dùng chung
  const handleNavigateLobby = (testId) => navigate(`/aptis/exam/lobby/${testId}`);
  const handleNavigateResult = (subId) => navigate(`/aptis/exam/result/${subId}`);
  const handleNavigateHistory = () => navigate('/aptis/exam/history');

  return {
    loading,
    filterStatus,
    setFilterStatus,
    filteredTests,
    handleNavigateLobby,
    handleNavigateResult,
    handleNavigateHistory
  };
};
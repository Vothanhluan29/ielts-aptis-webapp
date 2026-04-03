import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

export const useSpeakingAptisList = () => {
  const navigate = useNavigate();

  // 1. States
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 2. Fetch Data 
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await speakingAptisStudentApi.getListTests({ skip: 0, limit: 100 });
      let data = response?.data || response;
      if (!Array.isArray(data)) {
        data = [];
      }
      
      setTests(data);
    } catch (error) {
      console.error("Error fetching Speaking test list:", error);
      message.error("Failed to load speaking tests. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Mount Effect
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // 4. (Filter)
  const filteredTests = useMemo(() => {
    if (filterStatus === 'ALL') return tests;
    return tests.filter(test => test.status === filterStatus);
  }, [tests, filterStatus]);

  // 5.(Navigation Handlers)
  const handleNavigateHistory = () => navigate('/aptis/speaking/history');
  const handleNavigateLobby = (testId) => navigate(`/aptis/speaking/lobby/${testId}`);
  const handleNavigateResult = (testId) => navigate(`/aptis/speaking/result/${testId}`);

  return {
    loading,
    filterStatus,
    setFilterStatus,
    filteredTests,
    handleNavigateHistory,
    handleNavigateLobby,
    handleNavigateResult
  };
};
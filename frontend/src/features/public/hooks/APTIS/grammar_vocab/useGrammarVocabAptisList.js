import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

export const useGrammarVocabAptisList = () => {
  const navigate = useNavigate();
  
  // 1. States
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // 2. Fetch Data bọc trong useCallback
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await grammarVocabAptisStudentApi.getAllTests({ skip: 0, limit: 100 });
      setTests(response || []);
    } catch (error) {
      console.error("Error fetching Grammar & Vocabulary test list:", error);
      message.error("Failed to load tests. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Mount Effect
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // 4. Lọc dữ liệu thông minh
  const filteredTests = useMemo(() => {
    if (filterStatus === 'ALL') return tests;
    return tests.filter(test => test.status === filterStatus);
  }, [tests, filterStatus]);

  // 5. Gom các hàm điều hướng (Navigation Handlers)
  const handleNavigateHistory = () => navigate('/aptis/grammar-vocab/history');
  const handleNavigateLobby = (testId) => navigate(`/aptis/grammar-vocab/lobby/${testId}`);
  const handleNavigateRetry = (testId) => navigate(`/aptis/grammar-vocab/taking/${testId}`);

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
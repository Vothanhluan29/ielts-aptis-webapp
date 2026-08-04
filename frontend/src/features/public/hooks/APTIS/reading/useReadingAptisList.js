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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;


  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await readingAptisStudentApi.getListTests();
      const list = Array.isArray(response)
        ? response
        : response?.items ?? response?.data ?? response?.tests ?? response?.result ?? [];
      setTests(list);
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

  // 4.Filter
  const filteredTests = useMemo(() => {
    if (filterStatus === 'ALL') return tests;
    return tests.filter(test => test.status === filterStatus);
  }, [tests, filterStatus]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTests.slice(startIndex, startIndex + pageSize);
  }, [filteredTests, currentPage]);
  
  const total = filteredTests.length;


  // 5. Navigation Handlers
  const handleNavigateHistory = () => navigate('/aptis/reading/history');
  const handleNavigateLobby = (testId) => navigate(`/aptis/reading/lobby/${testId}`);
  const handleNavigateRetry = (testId) => navigate(`/aptis/reading/taking/${testId}`);

  return {
    loading,
    filterStatus,
    setFilterStatus,
    filteredTests,
    paginatedTests,
    currentPage,
    setCurrentPage,
    total,
    pageSize,
    handleNavigateHistory,
    handleNavigateLobby,
    handleNavigateRetry
  };
};
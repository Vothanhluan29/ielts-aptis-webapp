import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

export const useSpeakingAptisHistory = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [testTitles, setTestTitles] = useState({});

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      

      const [historyRes, testsRes] = await Promise.all([
        speakingAptisStudentApi.getMyHistory(),
        speakingAptisStudentApi.getListTests({ skip: 0, limit: 1000 }).catch(() => ({ data: [] }))
      ]);

      let historyData = historyRes?.data || historyRes || [];
      const testsData = testsRes?.data || testsRes || [];

   
      if (!Array.isArray(historyData)) historyData = [];

  
      const titleMap = {};
      if (Array.isArray(testsData)) {
        testsData.forEach(test => {
          titleMap[test.id] = test.title;
        });
      }
      setTestTitles(titleMap);
      
   
      const sortedData = historyData.sort((a, b) => {
        return new Date(b.created_at || b.submitted_at) - new Date(a.created_at || a.submitted_at);
      });

      setHistory(sortedData);
    } catch (error) {
      console.error("Error fetching Speaking history:", error);
      message.error("Failed to load your test history.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Mount Effect
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

 
  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;

    const gradedCount = history.filter(h => h.status?.toUpperCase() === 'GRADED').length;

    return {
      totalSubmissions: history.length,
      gradedSubmissions: gradedCount
    };
  }, [history]);


  const handleGoBack = () => navigate('/aptis/speaking');
  
 
  const handleViewResult = (submissionId) => navigate(`/aptis/speaking/result/${submissionId}`);

  return {
    loading,
    history,
    testTitles,
    stats,
    handleGoBack,
    handleViewResult
  };
};
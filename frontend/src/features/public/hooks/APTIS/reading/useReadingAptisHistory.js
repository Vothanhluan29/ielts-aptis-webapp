import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import readingAptisStudentApi from '../../../api/APTIS/reading/readingAptisStudentApi';

export const useReadingAptisHistory = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);


  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await readingAptisStudentApi.getMyHistory();
      let rawData = response?.data || response;

 
      if (!Array.isArray(rawData)) {
        rawData = [];
      }


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


  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;


    const scoresArray = history.map(h => Number(h.score) || 0);

    return {
      totalTests: history.length,
      bestScore: Math.max(...scoresArray)
    };
  }, [history]);


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
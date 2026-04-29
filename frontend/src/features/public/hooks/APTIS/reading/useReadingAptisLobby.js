import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import readingAptisStudentApi from '../../../api/APTIS/reading/readingAptisStudentApi';

export const useReadingAptisLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [testDetail, setTestDetail] = useState(null);

  // 1. Fetch test details
  const fetchTestDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await readingAptisStudentApi.getTestDetail(id);
      const data = response.data || response;
      setTestDetail(data);
    } catch (error) {
      console.error('Error loading test details:', error);
      message.error('Unable to load test details. Please try again later!');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTestDetail();
  }, [fetchTestDetail]);


  const { totalQuestions, timeLimit } = useMemo(() => {
    if (!testDetail) return { totalQuestions: 0, timeLimit: 35 };

    let count = 0;
    if (testDetail.parts) {
      testDetail.parts.forEach(part => {
        if (part.questions) count += part.questions.length;
        if (part.groups) {
          part.groups.forEach(group => {
            if (group.questions) count += group.questions.length;
          });
        }
      });
    } else if (testDetail.questions) {
      count = testDetail.questions.length;
    }

    return {
      totalQuestions: count,
      timeLimit: testDetail.time_limit || 50 // Default Aptis Reading time is approx 50 mins
    };
  }, [testDetail]);

  // 3. Navigation Handlers
  const handleStartTest = () => navigate(`/aptis/reading/taking/${id}`);
  const handleGoBack = () => navigate('/aptis/reading');

  return {
    loading,
    testDetail,
    totalQuestions,
    timeLimit,
    handleStartTest,
    handleGoBack
  };
};
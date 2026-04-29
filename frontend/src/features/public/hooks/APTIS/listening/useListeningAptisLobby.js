import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listeningAptisStudentApi from '../../../api/APTIS/listening/listeningAptisStudentApi';

export const useListeningAptisLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. States
  const [loading, setLoading] = useState(true);
  const [testDetail, setTestDetail] = useState(null);

  // 2. Fetch Data from API
  const fetchTestDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await listeningAptisStudentApi.getTestDetail(id);
      setTestDetail(data.data || data); 
    } catch (error) {
      console.error("Error fetching test details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);


  useEffect(() => {
    fetchTestDetail();
  }, [fetchTestDetail]);


  const timeLimit = testDetail?.time_limit || 40; // Default Aptis Listening time is approx 40 mins
  const totalQuestions = testDetail?.questions ? testDetail.questions.length : (testDetail?.total_questions || 25);

  // 5. Navigation Handlers
  const handleStartTest = () => navigate(`/aptis/listening/taking/${id}`);
  const handleGoBack = () => navigate('/aptis/listening');

  return {
    loading,
    testDetail,
    timeLimit,
    totalQuestions,
    handleStartTest,
    handleGoBack
  };
};
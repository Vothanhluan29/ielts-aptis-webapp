import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grammarVocabAptisStudentApi from '../../../api/APTIS/grammar_vocab/grammarvocabAptisStudentApi';

export const useGrammarVocabLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. States
  const [loading, setLoading] = useState(true);
  const [testDetail, setTestDetail] = useState(null);

  // 2. Fetch Data
  const fetchTestDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await grammarVocabAptisStudentApi.getTestDetail(id);
      setTestDetail(data);
    } catch (error) {
      console.error("Error fetching test details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 3. Mount Effect
  useEffect(() => {
    fetchTestDetail();
  }, [fetchTestDetail]);


  const timeLimit = testDetail?.time_limit || 25; // Default Aptis time is 25 minutes

  // 5. Navigation Handlers
  const handleStartTest = () => navigate(`/aptis/grammar-vocab/taking/${id}`);
  const handleGoBack = () => navigate('/aptis/grammar-vocab');

  return {
    loading,
    testDetail,
    timeLimit,
    handleStartTest,
    handleGoBack
  };
};
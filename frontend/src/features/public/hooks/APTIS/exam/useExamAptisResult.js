import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import examAptisStudentApi from '../../../api/APTIS/exam/examAptisStudentApi';

export const useExamAptisResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);

  // 1. Lấy dữ liệu từ Backend
  const fetchResult = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await examAptisStudentApi.getExamResult(id);
      setResultData(res.data || res);
    } catch (error) {
      console.error("Error fetching full test result:", error);
      message.error("Unable to load exam results. Please try again later!");
      navigate('/aptis/exam/history');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  // 2. Xào nấu và tính toán dữ liệu (Logic Pending & Điểm)
  const computedData = useMemo(() => {
    if (!resultData) return null;

    const isFullyGraded = ['GRADED', 'COMPLETED', 'FINISHED'].includes(resultData.status?.toUpperCase());

    const isWritingPending = !isFullyGraded && (resultData.writing_score === null || resultData.writing_score === undefined);
    const isSpeakingPending = !isFullyGraded && (resultData.speaking_score === null || resultData.speaking_score === undefined);
    
    const hasPendingSkills = isWritingPending || isSpeakingPending;
    const showFinal = isFullyGraded || !hasPendingSkills;

    // Đóng gói mảng kỹ năng sẵn sàng cho UI render
    const skills = [
      { key: 'GRAMMAR',   score: resultData.grammar_vocab_score || 0, max: 50, pending: false },
      { key: 'READING',   score: resultData.reading_score || 0,       max: 50, pending: false },
      { key: 'LISTENING', score: resultData.listening_score || 0,     max: 50, pending: false },
      { key: 'WRITING',   score: resultData.writing_score || 0,       max: 50, pending: isWritingPending },
      { key: 'SPEAKING',  score: resultData.speaking_score || 0,      max: 50, pending: isSpeakingPending },
    ];

    return {
      showFinal,
      skills
    };
  }, [resultData]);

  // 3. Handlers
  const handleGoBack = () => navigate('/aptis/exam');

  return {
    loading,
    resultData,
    computedData,
    handleGoBack
  };
};
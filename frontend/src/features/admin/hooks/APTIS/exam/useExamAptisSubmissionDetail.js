import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import examAptisAdminApi from '../../../api/APTIS/exam/examAptisAdminApi';

export const useExamAptisSubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examAptisAdminApi.getSubmissionDetail(id);
      setData(res.data || res);
    } catch { 
      message.error('Unable to load submission data!'); 
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => { 
    fetchDetail(); 
  }, [fetchDetail]);

  const handleGrade = useCallback((label, subId) => {
    if (!data) return;
    if (label === 'Writing') {
      navigate(`/admin/aptis/submissions/writing/${subId}`, { state: { fromExamId: data.id } });
    } else if (label === 'Speaking') {
      navigate(`/admin/aptis/submissions/speaking/${subId}`, { state: { fromExamId: data.id } });
    }
  }, [navigate, data]);

  // Các giá trị tính toán phái sinh (Derived state)
  const isCompleted = data?.status === 'COMPLETED';
  const overall = data?.overall_score || 0;
  const circumference = 2 * Math.PI * 50; // Chu vi hình tròn SVG
  const offset = circumference - (overall / 250) * circumference;

  return {
    id,
    loading,
    data,
    isCompleted,
    overall,
    circumference,
    offset,
    fetchDetail,
    handleGrade,
    navigate
  };
};
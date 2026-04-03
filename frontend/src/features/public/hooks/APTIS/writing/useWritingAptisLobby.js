import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import writingAptisStudentApi from '../../../api/APTIS/writing/writingAptisStudentApi';

export const useWritingAptisLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [testDetail, setTestDetail] = useState(null);

  // 1. Fetch Dữ liệu đề thi bọc trong useCallback
  const fetchTestDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await writingAptisStudentApi.getTestDetail(id);
      const data = response.data || response;
      setTestDetail(data);
    } catch (error) {
      console.error('Error loading test details:', error);
      message.error('Unable to load test details. Please try again later!');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 2. Mount Effect
  useEffect(() => {
    fetchTestDetail();
  }, [fetchTestDetail]);

  // 3. Tính toán các biến hiển thị
  const timeLimit = testDetail?.time_limit || 50; // Default Aptis Writing time is approx 50 mins
  const totalParts = 4; // Aptis Writing always has exactly 4 parts

  // 4. Các hàm điều hướng
  const handleStartTest = () => navigate(`/aptis/writing/taking/${id}`);
  const handleGoBack = () => navigate('/aptis/writing');

  return {
    loading,
    testDetail,
    timeLimit,
    totalParts,
    handleStartTest,
    handleGoBack
  };
};
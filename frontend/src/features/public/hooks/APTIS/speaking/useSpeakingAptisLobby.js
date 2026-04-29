import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

export const useSpeakingAptisLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [testDetail, setTestDetail] = useState(null);
  
  // Trạng thái kiểm tra Micro: 'idle' | 'checking' | 'success' | 'error'
  const [micStatus, setMicStatus] = useState('idle');


  const fetchTestDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await speakingAptisStudentApi.getTestDetail(id);
      const data = response.data || response;
      setTestDetail(data);
    } catch (error) {
        console.error("Error loading exam information:", error);
        message.error("Unable to load exam information. Please try again later!");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTestDetail();
  }, [fetchTestDetail]);


  const checkMicrophone = async () => {
    try {
      setMicStatus('checking');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      

      stream.getTracks().forEach(track => track.stop());
      
      setMicStatus('success');
      message.success("Microphone is working perfectly!");
    } catch (err) {
      console.error("Mic error:", err);
      setMicStatus('error');
      message.error("Unable to access microphone. Please check browser permissions!");
    }
  };


  const handleStartTest = () => {
    if (micStatus !== 'success') {
      message.warning("Please check your microphone before starting the test!");
      return;
    }
    navigate(`/aptis/speaking/taking/${id}`);
  };

  const handleGoBack = () => navigate('/aptis/speaking');

  // 4. Các biến tính toán
  const timeLimit = testDetail?.time_limit || 12; 

  return {
    loading,
    testDetail,
    micStatus,
    timeLimit,
    checkMicrophone,
    handleStartTest,
    handleGoBack
  };
};
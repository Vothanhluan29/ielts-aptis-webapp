import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import examAptisStudentApi from '../../../api/APTIS/exam/examAptisStudentApi';


const APTIS_SKILLS_IDS = ['GRAMMAR_VOCAB', 'READING', 'LISTENING', 'WRITING', 'SPEAKING'];

export const useExamAptisLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. States
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);

  // 2. Fetch Data
  const fetchLobbyData = useCallback(async () => {
    setLoading(true);
    try {
   
      const testRes = await examAptisStudentApi.getLibraryTestDetail(id);
      setTestDetail(testRes.data || testRes);

  
      const historyRes = await examAptisStudentApi.getMyExamHistory();
      const history = historyRes.data || historyRes || [];
      
      const inProgressSub = history.find(
        (sub) => sub.test_id === Number(id) && sub.status === 'IN_PROGRESS'
      );
      
      if (inProgressSub) {
        const progressRes = await examAptisStudentApi.getCurrentProgress(inProgressSub.id);
        setActiveSubmission(progressRes.data || progressRes);
      }
    } catch (error) {
      console.error("Lobby Error:", error);
      message.error("Unable to load exam lobby data!");
      navigate('/aptis/exam');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // 3. Mount Effect
  useEffect(() => {
    fetchLobbyData();
  }, [fetchLobbyData]);


  const currentStepIndex = useMemo(() => {
    if (!activeSubmission || !activeSubmission.current_step) return 0;
    const index = APTIS_SKILLS_IDS.indexOf(activeSubmission.current_step);
    return index === -1 ? 0 : index;
  }, [activeSubmission]);


  const handleGoBack = () => navigate('/aptis/exam');

  const handleStartOrResume = async () => {
    setStarting(true);
    try {
  
      if (activeSubmission) {
        const currentStep = activeSubmission.current_step || 'GRAMMAR_VOCAB';
        message.info(`Resuming exam at section: ${currentStep.replace('_', ' ')}`);
        navigate(`/aptis/exam/taking/${activeSubmission.id}`);
      } 

      else {
        const startRes = await examAptisStudentApi.startExam(id);
        const newSubmission = startRes.data || startRes;
        message.success("Full test started!");
        navigate(`/aptis/exam/taking/${newSubmission.id}`);
      }
    } catch (error) {
      console.error("Start Error:", error);
      message.error("Unable to start the exam. Please try again!");
      setStarting(false);
    }
  };

  return {
    loading,
    starting,
    testDetail,
    activeSubmission,
    currentStepIndex,
    handleStartOrResume,
    handleGoBack
  };
};
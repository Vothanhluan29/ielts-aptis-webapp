import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import examAptisStudentApi from '../../../api/APTIS/exam/examAptisStudentApi';


const STEP_IDS = ['GRAMMAR_VOCAB', 'LISTENING', 'READING', 'WRITING', 'SPEAKING'];
const STEP_TITLES = ['Grammar & Vocab', 'Listening', 'Reading', 'Writing', 'Speaking'];

export const useAptisExam = (id) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMsg, setTransitionMsg] = useState('Loading exam data...');


  const fetchCurrentProgress = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examAptisStudentApi.getCurrentProgress(id);
      const data = res.data || res;
      
      if (['PENDING', 'GRADED', 'COMPLETED', 'FINISHED'].includes(data.status)) {
        message.success("You have successfully submitted the Full Mock Test!");
        navigate(`/aptis/exam/result/${id}`);
        return;
      }
      
      setSubmission(data);
    } catch (error) {
      console.error("Error fetching progress:", error);
      message.error("Unable to load exam data!");
      navigate('/aptis/exam');
    } finally {
      setLoading(false);
      setTransitioning(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCurrentProgress();

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchCurrentProgress]); 

  const handleSkillFinish = async (skillSubmissionId) => {
    if (!submission) return;

    setTransitioning(true);

    try {
      const currentIndex = STEP_IDS.indexOf(submission?.current_step);

      let nextStep = 'COMPLETED';
      let nextTitle = 'Completing Exam';

      if (currentIndex >= 0 && currentIndex < STEP_IDS.length - 1) {
        nextStep = STEP_IDS[currentIndex + 1];
        nextTitle = STEP_TITLES[currentIndex + 1];
      }

      const currentTitle = currentIndex >= 0 ? STEP_TITLES[currentIndex] : 'Current Section';

      setTransitionMsg(`Submitted ${currentTitle}. Transitioning to ${nextTitle}...`);

      await examAptisStudentApi.submitSkillStep({
        exam_submission_id: Number(id),
        current_step: submission.current_step,
        next_step: nextStep,
        skill_submission_id: skillSubmissionId,
      });

      await fetchCurrentProgress();
    } catch (error) {
      console.error("Error transitioning exam part:", error);
      message.error("Error saving results. Please do not leave the page!");
      setTransitioning(false);
    }
  };

  return {
    loading,
    submission,
    transitioning,
    transitionMsg,
    handleSkillFinish
  };
};
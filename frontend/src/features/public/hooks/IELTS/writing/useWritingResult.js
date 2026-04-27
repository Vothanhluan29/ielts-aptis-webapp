import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { writingStudentApi } from '../../../api/IELTS/writing/writingStudentApi';
import toast from 'react-hot-toast';

const safeParseJSON = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  try {
    return typeof str === 'string' ? JSON.parse(str) : str;
  } catch (e) {
    console.warn("Failed to parse correction JSON", e);
    // Return an empty array on failure to prevent UI crashes
    return [];
  }
};

export const useWritingResult = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TASK_1');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await writingStudentApi.getSubmissionDetail(id);
        const data = response.data || response;
        
        if (data) {
          data.parsed_correction_t1 = safeParseJSON(data.correction_t1);
          data.parsed_correction_t2 = safeParseJSON(data.correction_t2);
        }

        setSubmission(data);
      } catch (error) {
        console.error("Error fetching writing result:", error);
        toast.error("Cannot load submission details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchResult();
  }, [id]);

  // Compute active task data
  const taskData = useMemo(() => {
    if (!submission) return null;
    const isTask1 = activeTab === 'TASK_1';

    return {
      isTask1,
      scoreOverall: isTask1 ? submission.score_t1_overall : submission.score_t2_overall,
      content: isTask1 ? submission.task1_content : submission.task2_content,
      feedback: isTask1 ? submission.feedback_t1 : submission.feedback_t2,
      corrections: isTask1 ? submission.parsed_correction_t1 : submission.parsed_correction_t2,
      // Component scores based on IELTS criteria
      scores: isTask1 ? [
        { label: "Task Achievement", score: submission.score_t1_ta },
        { label: "Coherence & Cohesion", score: submission.score_t1_cc },
        { label: "Lexical Resource", score: submission.score_t1_lr },
        { label: "Grammar Range & Accuracy", score: submission.score_t1_gra },
      ] : [
        { label: "Task Response", score: submission.score_t2_tr },
        { label: "Coherence & Cohesion", score: submission.score_t2_cc },
        { label: "Lexical Resource", score: submission.score_t2_lr },
        { label: "Grammar Range & Accuracy", score: submission.score_t2_gra },
      ]
    };
  }, [submission, activeTab]);

  return {
    submission,
    loading,
    activeTab,
    setActiveTab,
    taskData
  };
};
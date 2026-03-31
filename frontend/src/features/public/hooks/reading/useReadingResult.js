import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { readingStudentApi } from '../../api/IELTS/reading/readingStudentApi';
import toast from 'react-hot-toast';

export const useReadingResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await readingStudentApi.getSubmissionDetail(id);
        
        // Axios interceptor usually returns res.data, otherwise use res
        const submission = res.data || res;
        
        if (!submission) throw new Error("Result not found");

        const userAnswersRaw = submission.user_answers || {};
        
        const mappedDetails = (submission.results || []).map(item => {
            // 🔥 FIX 1: ONLY USE QUESTION_NUMBER, DROP ITEM.ID TO AVOID CONFLICTS
            let uAns = item.user_answer;
            if (uAns === undefined || uAns === null || uAns === "") {
                uAns = userAnswersRaw[String(item.question_number)];
            }

            return {
                ...item,
                user_answer: uAns || "",
                // 🔥 FIX 2: KEEP correct_answers AS AN ARRAY, DO NOT CAST TO STRING
                correct_answers: item.correct_answers || [],
                explanation: item.explanation || "",
                is_correct: item.is_correct || false
            };
        });

        // Set State
        setResult({
            ...submission,
            details: mappedDetails,
            band_score: submission.band_score || 0,
            correct_count: submission.correct_count || 0,
            total_questions: submission.total_questions || 0
        });

      } catch (error) {
        console.error("Reading Result Error:", error);
        toast.error("Unable to load exam results.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  return { result, loading };
};
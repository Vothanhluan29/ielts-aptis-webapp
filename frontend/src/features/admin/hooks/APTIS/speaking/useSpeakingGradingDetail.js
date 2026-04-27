import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import speakingAptisAdminApi from '../../../api/APTIS/speaking/speakingAptisAdminApi';

// Standard color palette cho các Part
export const themeColors = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', hex: '#3b82f6', leftBorder: 'border-l-blue-500' },
  green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', hex: '#22c55e', leftBorder: 'border-l-green-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', hex: '#f97316', leftBorder: 'border-l-orange-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', hex: '#a855f7', leftBorder: 'border-l-purple-500' },
};

export const gradingSections = [
  { key: 'p1', title: 'Part 1', max: 5, colorKey: 'blue' },
  { key: 'p2', title: 'Part 2', max: 5, colorKey: 'green' },
  { key: 'p3', title: 'Part 3', max: 15, colorKey: 'orange' },
  { key: 'p4', title: 'Part 4', max: 25, colorKey: 'purple' },
];

export const useSpeakingGradingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);

  const [grading, setGrading] = useState({
    p1: 0, p2: 0, p3: 0, p4: 0,
    feedback: { p1: "", p2: "", p3: "", p4: "" },
    overall_feedback: "",
    cefr_level: "A0"
  });

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await speakingAptisAdminApi.getSubmissionDetail(id);
      const data = res.data || res;
      setSubmission(data);
      
      if (data.status === 'GRADED') {
        const getAnswer = (p) => data.answers?.find(a => a.part_number === p) || {};
        setGrading({
          p1: getAnswer(1).part_score || 0, 
          p2: getAnswer(2).part_score || 0,
          p3: getAnswer(3).part_score || 0, 
          p4: getAnswer(4).part_score || 0,
          feedback: {
            p1: getAnswer(1).admin_feedback || "", 
            p2: getAnswer(2).admin_feedback || "",
            p3: getAnswer(3).admin_feedback || "", 
            p4: getAnswer(4).admin_feedback || "",
          },
          overall_feedback: data.overall_feedback || "",
          cefr_level: data.cefr_level || "A0"
        });
      }
    } catch (error) {
      message.error("Error loading submission details!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const totalScore = grading.p1 + grading.p2 + grading.p3 + grading.p4;
  
  const autoSuggestCEFR = (score) => {
    if (score >= 48) return "C"; 
    if (score >= 40) return "B2";
    if (score >= 26) return "B1"; 
    if (score >= 18) return "A2";
    if (score >= 6) return "A1"; 
    return "A0";
  };

  const getCEFRColor = (level) => {
    const colors = { "A0": "#ff4d4f", "A1": "#ff4d4f", "A2": "#fa8c16", "B1": "#fadb14", "B2": "#1677ff", "C": "#52c41a" };
    return colors[level] || "#d9d9d9";
  };

  const handleBack = useCallback(() => {
    if (location.state && location.state.fromExamId) {
      navigate(`/admin/aptis/submissions/${location.state.fromExamId}`);
    } else {
      navigate("/admin/aptis/submissions/speaking");
    }
  }, [location.state, navigate]);


  const handleSaveGrade = async () => {
    setSubmitting(true);
    try {
      const payload = {
        total_score: totalScore,
        cefr_level: grading.cefr_level || autoSuggestCEFR(totalScore),
        overall_feedback: grading.overall_feedback,
        part_feedbacks: [
          { part_number: 1, score: grading.p1, comments: grading.feedback.p1 },
          { part_number: 2, score: grading.p2, comments: grading.feedback.p2 },
          { part_number: 3, score: grading.p3, comments: grading.feedback.p3 },
          { part_number: 4, score: grading.p4, comments: grading.feedback.p4 },
        ]
      };
      await speakingAptisAdminApi.gradeSubmission(id, payload);
      message.success("Grade saved successfully!");
      
      handleBack();

    } catch (error) {
      message.error("Error saving grade!");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    submission,
    grading,
    setGrading,
    totalScore,
    autoSuggestCEFR,
    getCEFRColor,
    handleBack,
    handleSaveGrade,
    location
  };
};
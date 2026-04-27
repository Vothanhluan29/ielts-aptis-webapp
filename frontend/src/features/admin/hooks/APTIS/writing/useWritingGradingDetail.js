import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import writingAptisAdminApi from "../../../api/APTIS/writing/writingAptisAdminApi";

export const safeParseAnswers = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (error) {
    return { error };
  }
};

// Standard color palette cho 5 Writing grading sections
export const themeColors = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', hex: '#3b82f6', leftBorder: 'border-l-blue-500' },
  green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', hex: '#22c55e', leftBorder: 'border-l-green-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', hex: '#f97316', leftBorder: 'border-l-orange-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', hex: '#a855f7', leftBorder: 'border-l-purple-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', hex: '#f43f5e', leftBorder: 'border-l-rose-500' },
};

export const gradingSections = [
  { key: "p1", fbKey: "PART_1", title: "Part 1: Word Level", max: 5, colorKey: 'blue' },
  { key: "p2", fbKey: "PART_2", title: "Part 2: Personal Info", max: 5, colorKey: 'green' },
  { key: "p3", fbKey: "PART_3", title: "Part 3: Social Chat", max: 15, colorKey: 'orange' },
  { key: "p4_inf", fbKey: "PART_4_INF", title: "Part 4: Informal Email", max: 10, colorKey: 'purple' },
  { key: "p4_form", fbKey: "PART_4_FORM", title: "Part 4: Formal Email", max: 15, colorKey: 'rose' },
];

export const useWritingGradingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);

  const [grading, setGrading] = useState({
    p1: 0, p2: 0, p3: 0, p4_inf: 0, p4_form: 0,
    feedback: { PART_1: "", PART_2: "", PART_3: "", PART_4_INF: "", PART_4_FORM: "" },
    overall_feedback: "",
    cefr_level: "A0",
  });

  const fetchDetail = useCallback(async () => {
    try {
      const res = await writingAptisAdminApi.getSubmissionDetail(id);
      const data = res.data || res;
      setSubmission(data);

      if (data.status === "GRADED") {
        setGrading({
          p1: data.teacher_feedback?.PART_1?.score || 0,
          p2: data.teacher_feedback?.PART_2?.score || 0,
          p3: data.teacher_feedback?.PART_3?.score || 0,
          p4_inf: data.teacher_feedback?.PART_4_INF?.score || 0,
          p4_form: data.teacher_feedback?.PART_4_FORM?.score || 0,
          feedback: {
            PART_1: data.teacher_feedback?.PART_1?.comments || "",
            PART_2: data.teacher_feedback?.PART_2?.comments || "",
            PART_3: data.teacher_feedback?.PART_3?.comments || "",
            PART_4_INF: data.teacher_feedback?.PART_4_INF?.comments || "",
            PART_4_FORM: data.teacher_feedback?.PART_4_FORM?.comments || "",
          },
          overall_feedback: data.overall_feedback || "",
          cefr_level: data.cefr_level || "A0",
        });
      }
    } catch {
      message.error("Unable to load submission details!");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const totalScore = grading.p1 + grading.p2 + grading.p3 + grading.p4_inf + grading.p4_form;

  const autoSuggestCEFR = (score) => {
    if (score >= 48) return "C";
    if (score >= 40) return "B2";
    if (score >= 26) return "B1";
    if (score >= 18) return "A2";
    if (score >= 6) return "A1";
    return "A0";
  };

  const getCEFRColor = (level) => {
    const colors = { A0: "#ff4d4f", A1: "#ff4d4f", A2: "#fa8c16", B1: "#fadb14", B2: "#1677ff", C: "#52c41a" };
    return colors[level] || "#d9d9d9";
  };

  const handleBack = useCallback(() => {
    if (location.state && location.state.fromExamId) {
      navigate(`/admin/aptis/submissions/${location.state.fromExamId}`);
    } else {
      navigate("/admin/aptis/submissions/writing");
    }
  }, [location.state, navigate]);

  const handleSaveGrade = async () => {
    setSubmitting(true);
    try {
      const payload = {
        score: totalScore,
        cefr_level: grading.cefr_level || autoSuggestCEFR(totalScore),
        teacher_feedback: {
          PART_1: { score: grading.p1, comments: grading.feedback.PART_1 },
          PART_2: { score: grading.p2, comments: grading.feedback.PART_2 },
          PART_3: { score: grading.p3, comments: grading.feedback.PART_3 },
          PART_4_INF: { score: grading.p4_inf, comments: grading.feedback.PART_4_INF },
          PART_4_FORM: { score: grading.p4_form, comments: grading.feedback.PART_4_FORM },
        },
        overall_feedback: grading.overall_feedback,
      };

      await writingAptisAdminApi.gradeSubmission(id, payload);
      message.success("Grade saved successfully!");
      
      handleBack(); 

    } catch {
      message.error("Error saving grade!");
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
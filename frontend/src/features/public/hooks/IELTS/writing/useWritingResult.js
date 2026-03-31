import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { writingStudentApi } from '../../api/writingStudentApi'; // Đã sửa đường dẫn chuẩn
import toast from 'react-hot-toast'; // Thêm toast để báo lỗi mượt mà

export const useWritingResult = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TASK_1'); // 'TASK_1' | 'TASK_2'

  // 1. Fetch & Parse Data
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await writingStudentApi.getSubmissionDetail(id);
        
        // Tương thích với cách Axios trả data
        const data = response.data || response;
        
        // 🛠️ Parsing JSON an toàn, phòng hờ trường hợp Backend quên parse
        if (data) {
            const safeParse = (str) => {
                if (!str) return [];
                if (Array.isArray(str)) return str; // Nếu Backend đã trả về Array thì lấy luôn
                try { 
                    return typeof str === 'string' ? JSON.parse(str) : str; 
                } 
                catch (e) { 
                    console.warn("Failed to parse correction JSON", e);
                    // 🔥 TRỌNG YẾU: Phải trả về mảng rỗng để không làm crash UI
                    return []; 
                }
            };

            data.parsed_correction_t1 = safeParse(data.correction_t1);
            data.parsed_correction_t2 = safeParse(data.correction_t2);
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

  // 2. Computed Data theo Tab (Memoized để tránh tính toán lại khi không cần thiết)
  const taskData = useMemo(() => {
    if (!submission) return null;
    const isTask1 = activeTab === 'TASK_1';

    return {
        isTask1,
        // Điểm Overall của Task
        scoreOverall: isTask1 ? submission.score_t1_overall : submission.score_t2_overall,
        // Nội dung bài làm
        content: isTask1 ? submission.task1_content : submission.task2_content,
        // Feedback text từ AI
        feedback: isTask1 ? submission.feedback_t1 : submission.feedback_t2,
        // Mảng lỗi chi tiết đã parse an toàn
        corrections: isTask1 ? submission.parsed_correction_t1 : submission.parsed_correction_t2,
        // Điểm thành phần (Labels khác nhau theo tiêu chuẩn IELTS)
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
    taskData // Trả về object chứa toàn bộ data đã bóc tách sẵn cho UI render
  };
};
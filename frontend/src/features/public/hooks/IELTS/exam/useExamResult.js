import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd'; 
import { examStudentApi } from '../../../api/IELTS/exam/examStudentApi';

export const useExamResult = () => {
  const { id } = useParams(); // Submission ID
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Kết Quả
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await examStudentApi.getResult(id);
        
        // ✅ BẢO VỆ 1: Đảm bảo bóc đúng payload từ Axios
        const payload = response?.data || response;
        
        if (!payload) {
            throw new Error("Empty data");
        }
        
        setResult(payload);
      } catch (error) {
        console.error("Error fetching result:", error);
        message.error("Unable to load exam results.");
        navigate('/exam/history'); // 🔥 Đẩy về Lịch sử thay vì danh sách chung
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResult();
  }, [id, navigate]);

  // 2. Hàm tính toán Overall Band (Đã bọc useCallback)
  const calculateOverall = useCallback(() => {
    if (!result) return 0;
    
    const { listening_score, reading_score, writing_score, speaking_score } = result;
    
    // 🔥 BẢO VỆ 2 (FIXED): Kiểm tra chính xác null/undefined thay vì falsy (!score).
    // Vì điểm 0.0 vẫn là con số hợp lệ, tránh việc học viên 0 điểm bị đẩy thành "Pending"
    const scores = [listening_score, reading_score, writing_score, speaking_score];
    const isPending = scores.some(score => score === null || score === undefined);
    
    if (isPending) {
        return "Pending";
    }

    const avg = (listening_score + reading_score + writing_score + speaking_score) / 4;
    const decimal = avg % 1;

    // Quy tắc làm tròn IELTS: 0.25 -> 0.5; 0.75 -> 1.0 (Lên Band tiếp theo)
    if (decimal < 0.25) return Math.floor(avg);
    if (decimal < 0.75) return Math.floor(avg) + 0.5;
    return Math.ceil(avg);
  }, [result]);

  // 3. Điều hướng xem chi tiết từng kỹ năng
  const handleReviewSkill = useCallback((skill, submissionId) => {
      if (!submissionId) {
          message.warning("Detailed results for this section are not available yet.");
          return;
      }
      navigate(`/${skill}/result/${submissionId}`);
  }, [navigate]);

  // ✅ Xử lý logic hiển thị Overall Band mượt mà
  const finalOverall = (result?.overall_score !== null && result?.overall_score !== undefined && result?.overall_score > 0) 
      ? result.overall_score 
      : calculateOverall();

  return {
    result,
    loading,
    overallBand: finalOverall,
    handleReviewSkill
  };
};
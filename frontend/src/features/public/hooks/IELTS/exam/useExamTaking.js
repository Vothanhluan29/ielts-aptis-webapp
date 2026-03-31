import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd'; // 🔥 Đổi sang antd message
import { examStudentApi } from '../../../api/IELTS/exam/examStudentApi';

export const useExamTaking = () => {
  const { id } = useParams(); // examSubmissionId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null); // Chứa full info: current_step, test IDs...
  const [processingStep, setProcessingStep] = useState(false); // Loading khi chuyển bước

  // 1. Load trạng thái bài thi (Resume)
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await examStudentApi.getCurrentProgress(id);
        // 🔥 Giải nén an toàn dữ liệu từ Axios
        const data = response?.data || response;
        
        // Nếu đã xong -> Chuyển sang trang kết quả
        if (data.status === 'COMPLETED' || data.current_step === 'FINISHED') {
             navigate(`/exam/result/${id}`, { replace: true });
             return;
        }
        
        setExamData(data);
      } catch (error) {
        console.error("Fetch progress error:", error);
        message.error("Unable to load the exam. Please try again.");
        navigate('/exam/tests'); // Điều hướng về thư viện nếu lỗi
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProgress();
  }, [id, navigate]);

  // 2. Hàm quan trọng: Xử lý khi nộp xong 1 kỹ năng
  // skillSubmissionId: ID kết quả trả về từ API nộp bài lẻ (Reading/Listening...)
  const handleStepComplete = useCallback(async (skillSubmissionId) => {
    if (!examData) return;

    setProcessingStep(true);
    try {
      // Gọi API báo cáo hoàn thành bước
      const payload = {
        exam_submission_id: parseInt(id),
        current_step: examData.current_step,
        // Phòng hờ hết giờ nộp bài null, API backend cần int nên ta ép về 0 hoặc xử lý linh hoạt
        skill_submission_id: skillSubmissionId || 0 
      };

      const response = await examStudentApi.submitStep(payload);
      const responseData = response?.data || response;

      // Backend trả về next_step -> Update state để UI tự chuyển
      message.success(responseData.message || "Progress saved. Moving to the next section...");
      
      if (responseData.next_step === 'FINISHED') {
         navigate(`/exam/result/${id}`, { replace: true });
      } else {
         // Cập nhật step mới cho UI render component khác
         setExamData(prev => ({
           ...prev,
           current_step: responseData.next_step
         }));
         // 🔥 Tự động cuộn lên đầu trang cho kỹ năng mới
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (error) {
      console.error("Submit step error:", error);
      message.error("Error saving progress. Please try again or check your connection.");
    } finally {
      setProcessingStep(false);
    }
  }, [id, examData, navigate]);

  return {
    loading,
    examData,
    processingStep,
    handleStepComplete
  };
};
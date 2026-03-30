import axiosClient from '../../../../../services/axiosClient'; // Đảm bảo đường dẫn này khớp với project của bạn

const PREFIX = '/aptis/grammar-vocab';

const grammarVocabAptisStudentApi = {
  // =====================================================
  // 🎓 1. TEST LIST & DETAILS (PUBLIC/STUDENT)
  // =====================================================

  /**
   * Lấy danh sách các đề thi Grammar & Vocab (chỉ hiển thị đề đã publish)
   */
  getAllTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, { 
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
      } 
    });
  },

  /**
   * Lấy chi tiết đề thi để học viên làm bài (đáp án đúng đã bị ẩn)
   */
  getTestDetail: (testId) => {
    return axiosClient.get(`${PREFIX}/tests/${testId}`);
  },

  // =====================================================
  // 📝 2. SUBMISSION (NỘP BÀI & LỊCH SỬ)
  // =====================================================

  /**
   * Nộp bài thi Grammar & Vocab (Sẽ được chấm điểm tự động ngay lập tức)
   * @param {Object} data - Payload gửi lên (test_id, user_answers,...)
   */
  submitTest: (data) => {
    return axiosClient.post(`${PREFIX}/submit`, data);
  },

  /**
   * Lấy danh sách lịch sử các bài đã làm của user hiện tại
   */
  getMyHistory: () => {
    return axiosClient.get(`${PREFIX}/submissions/me`);
  },

  /**
   * Lấy chi tiết kết quả của một bài đã nộp (Xem lại câu đúng/sai)
   */
  getSubmissionDetail: (submissionId) => {
    return axiosClient.get(`${PREFIX}/submissions/${submissionId}`);
  }
};

export default grammarVocabAptisStudentApi;
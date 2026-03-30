import axiosClient from '../../../../../services/axiosClient'; // Đảm bảo đường dẫn này đúng với project của bạn

const PREFIX = '/aptis/writing';

const writingAptisStudentApi = {
  
  // =====================================================
  // 🎓 1. TEST LIST & DETAILS (PUBLIC/STUDENT)
  // =====================================================

  /**
   * Lấy danh sách các đề thi Writing (đã publish và không phải bài Mock Test độc quyền)
   * Kèm theo trạng thái làm bài (status) của User hiện tại.
   */
  getAllTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        // Có thể thêm search nếu sau này Backend hỗ trợ
      }
    });
  },

  /**
   * Lấy chi tiết một đề thi Writing cụ thể (bao gồm các Parts và Questions)
   */
  getTestDetail: (testId) => {
    return axiosClient.get(`${PREFIX}/tests/${testId}`);
  },


  // =====================================================
  // 📝 2. SUBMISSION (NỘP BÀI & LỊCH SỬ)
  // =====================================================

  /**
   * Học viên nộp bài thi Writing
   * @param {Object} data - Payload gửi lên
   * @example data: { test_id: int, is_full_test_only: bool, user_answers: Object }
   */
  submitTest: (data) => {
    return axiosClient.post(`${PREFIX}/submit`, data);
  },

  /**
   * Lấy lịch sử làm bài thi Writing của chính Học viên (Current User)
   */
  getMyHistory: () => {
    return axiosClient.get(`${PREFIX}/submissions/me`);
  },

  /**
   * Xem chi tiết một bài đã nộp (Bao gồm đề bài, câu trả lời của user, điểm số, và feedback của giáo viên nếu có)
   * Lưu ý: API này Backend đã tự kiểm tra quyền sở hữu (user_id === current_user.id)
   */
  getSubmissionDetail: (submissionId) => {
    return axiosClient.get(`${PREFIX}/submissions/${submissionId}`);
  }
};

export default writingAptisStudentApi;
import axiosClient from '../../../../../services/axiosClient'; // Nhớ kiểm tra lại đường dẫn import axiosClient của bạn

const PREFIX = '/aptis/reading/admin';

const readingAptisAdminApi = {
  // =================================================
  // 📝 1. QUẢN LÝ ĐỀ THI (TESTS)
  // =================================================
  
  /**
   * Lấy danh sách toàn bộ đề thi Reading (Dành cho Admin)
   * @param {Object} params - { skip, limit, is_mock_selector }
   */
  getAllTests: (params) => {
    return axiosClient.get(`${PREFIX}/tests`, { params });
  },

  /**
   * Lấy chi tiết một đề thi Reading bằng ID
   * @param {number} id - ID của đề thi
   */
  getTestDetail: (id) => {
    return axiosClient.get(`${PREFIX}/tests/${id}`);
  },

  /**
   * Tạo mới một đề thi Reading
   * @param {Object} data - Payload chứa thông tin đề và câu hỏi
   */
  createTest: (data) => {
    return axiosClient.post(`${PREFIX}/tests`, data);
  },

  /**
   * Cập nhật đề thi Reading
   * @param {number} id - ID của đề thi
   * @param {Object} data - Payload cập nhật
   */
  updateTest: (id, data) => {
    return axiosClient.put(`${PREFIX}/tests/${id}`, data);
  },

  /**
   * Xóa đề thi Reading
   * @param {number} id - ID của đề thi
   */
  deleteTest: (id) => {
    return axiosClient.delete(`${PREFIX}/tests/${id}`);
  },

  // =================================================
  // 🏆 2. QUẢN LÝ BÀI NỘP & ĐIỂM SỐ (SUBMISSIONS)
  // =================================================

  /**
   * Lấy danh sách toàn bộ bài nộp của học viên
   * @param {Object} params - { skip, limit, status }
   */
  getAllSubmissions: (params) => {
    return axiosClient.get(`${PREFIX}/submissions`, { params });
  },

  /**
   * Lấy lịch sử làm bài của một học viên cụ thể
   * @param {number} userId - ID của học viên
   */
  getUserHistory: (userId) => {
    return axiosClient.get(`${PREFIX}/users/${userId}/submissions`);
  },

  /**
   * Ghi đè/Chỉnh sửa điểm số của một bài nộp
   * @param {number} submissionId - ID của bài nộp
   * @param {Object} data - { score, correct_count, cefr_level }
   */
  overrideScore: (submissionId, data) => {
    return axiosClient.put(`${PREFIX}/submissions/${submissionId}/override`, data);
  }
};

export default readingAptisAdminApi;
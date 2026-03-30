import axiosClient from '../../../../../services/axiosClient'; // Đảm bảo đường dẫn này đúng với dự án của bạn

const PREFIX = '/aptis/exam';

const examAptisAdminApi = {
  // =================================================
  // 📚 1. QUẢN LÝ ĐỀ THI FULL (ADMIN CRUD)
  // =================================================
  
  /**
   * Lấy danh sách tất cả các đề thi Full Test
   */
  getAllFullTests: () => {
    return axiosClient.get(`${PREFIX}/admin/tests`);
  },

  /**
   * Lấy chi tiết một đề thi Full Test (để xem cấu trúc các ID đề con)
   */
  getFullTestDetail: (id) => {
    return axiosClient.get(`${PREFIX}/admin/tests/${id}`);
  },

  /**
   * Tạo đề thi Full Test mới
   * payload: { title, description, is_published, grammar_vocab_test_id, listening_test_id, ... }
   */
  createFullTest: (data) => {
    return axiosClient.post(`${PREFIX}/admin/tests`, data);
  },

  /**
   * Cập nhật thông tin đề thi Full Test
   */
  updateFullTest: (id, data) => {
    return axiosClient.put(`${PREFIX}/admin/tests/${id}`, data);
  },

  /**
   * Xóa đề thi Full Test
   */
  deleteFullTest: (id) => {
    return axiosClient.delete(`${PREFIX}/admin/tests/${id}`);
  },

  // =================================================
  // 👨‍🎓 2. QUẢN LÝ LỊCH SỬ LÀM BÀI (ADMIN)
  // =================================================

  /**
   * Lấy danh sách toàn bộ bài nộp Full Test của học viên (Có phân trang & Lọc)
   * params nhận từ UI: { page: 1, limit: 10, status: 'COMPLETED' }
   */
  getAllSubmissions: (params) => {
    // Tự động tính toán skip từ page cho Backend FastAPI
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const queryParams = { skip, limit };

    // Chỉ đẩy status lên URL nếu thực sự có giá trị lọc
    if (params?.status && params.status !== 'ALL' && params.status !== '') {
      queryParams.status = params.status;
    }

    return axiosClient.get(`${PREFIX}/admin/submissions`, { params: queryParams });
  },

  /**
   * Xem kết quả chi tiết của 1 bài nộp Full Test cụ thể (Gọi API chung của cả Student/Admin)
   */
  getSubmissionDetail: (submissionId) => {
    return axiosClient.get(`${PREFIX}/result/${submissionId}`);
  }
};

export default examAptisAdminApi;
import axiosClient from '../../../../../services/axiosClient';

const ADMIN_BASE_URL = '/speaking/admin';

export const adminSpeakingApi = {
  // =======================================================
  // 1. TEST MANAGEMENT (QUẢN LÝ ĐỀ THI)
  // =======================================================

  // Upload Audio (Tùy chọn: Dùng khi Admin muốn tải file âm thanh lên cho câu hỏi)
  // Backend: POST /speaking/upload
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/speaking/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Lấy danh sách đề (Admin View)
  // Backend: GET /speaking/admin/tests
  // Params: { is_mock_selector: true/false }
  getAllTests: (params) => {
    return axiosClient.get(`${ADMIN_BASE_URL}/tests`, { params:params });
  },

  // Lấy chi tiết 1 đề (Đã bao gồm: Test -> Parts -> Questions để Edit)
  // Backend: GET /speaking/tests/{id} (Dùng chung endpoint public)
  getTestDetail: (id) => {
    return axiosClient.get(`/speaking/tests/${id}`);
  },

  // Tạo đề mới
  // Backend: POST /speaking/admin/tests
  createTest: (data) => {
    return axiosClient.post(`${ADMIN_BASE_URL}/tests`, data);
  },

  // Cập nhật đề
  // Backend: PUT /speaking/admin/tests/{id}
  updateTest: (id, data) => {
    return axiosClient.put(`${ADMIN_BASE_URL}/tests/${id}`, data);
  },

  // Xóa đề
  // Backend: DELETE /speaking/admin/tests/{id}
  deleteTest: (id) => {
    return axiosClient.delete(`${ADMIN_BASE_URL}/tests/${id}`);
  },

  // =======================================================
  // 2. SUBMISSION MANAGEMENT (QUẢN LÝ BÀI NỘP) - MỚI BỔ SUNG
  // =======================================================

  // Lấy danh sách toàn bộ bài nộp của hệ thống (Có phân trang)
  // Backend: GET /speaking/admin/submissions
  // Params: { skip, limit, status }
  getAllSubmissions: (params) => {
    return axiosClient.get(`${ADMIN_BASE_URL}/submissions`, { params });
  },

  // Lấy lịch sử làm bài của 1 học viên cụ thể
  // Backend: GET /speaking/admin/users/{target_user_id}/submissions
  getUserSubmissions: (userId) => {
    return axiosClient.get(`${ADMIN_BASE_URL}/users/${userId}/submissions`);
  },


};
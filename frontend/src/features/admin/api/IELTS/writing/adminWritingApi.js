import axiosClient from '../../../../../services/axiosClient'; // Đảm bảo đường dẫn này đúng với project của bạn

const ADMIN_BASE_URL = '/writing/admin';

export const adminWritingApi = {
  // ==================== 1. TEST MANAGEMENT (QUẢN LÝ ĐỀ THI) ====================

  // 1. Upload ảnh (Task 1)
  // Backend: POST /writing/admin/upload-image
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${ADMIN_BASE_URL}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 2. Lấy danh sách (Admin View)
  // Backend: GET /writing/admin/tests
  // Params: { skip, limit, is_mock_selector: true/false }
  getAllTests: (params) => {
    return axiosClient.get(`${ADMIN_BASE_URL}/tests`, {params: params });
  },

  // 3. Lấy chi tiết 1 đề (Để Edit)
  // Backend: GET /writing/tests/{id} (Dùng chung endpoint public)
  getTestDetail: (id) => {
    return axiosClient.get(`/writing/tests/${id}`);
  },

  // 4. Tạo mới
  // Backend: POST /writing/admin/tests
  createTest: (data) => {
    return axiosClient.post(`${ADMIN_BASE_URL}/tests`, data);
  },

  // 5. Cập nhật
  // Backend: PUT /writing/admin/tests/{id}
  updateTest: (id, data) => {
    return axiosClient.put(`${ADMIN_BASE_URL}/tests/${id}`, data);
  },

  // 6. Xóa
  // Backend: DELETE /writing/admin/tests/{id}
  deleteTest: (id) => {
    return axiosClient.delete(`${ADMIN_BASE_URL}/tests/${id}`);
  },

  // ==================== 2. SUBMISSION MANAGEMENT (QUẢN LÝ BÀI NỘP) ====================

  // 7. Lấy danh sách toàn bộ bài nộp (Có phân trang)
  // Backend: GET /writing/admin/submissions
  // Params: { skip, limit, status }
  getAllSubmissions: (params) => {
    return axiosClient.get(`${ADMIN_BASE_URL}/submissions`, { params });
  },

  // 8. Xem lịch sử thi của 1 học viên cụ thể
  // Backend: GET /writing/admin/users/{target_user_id}/submissions
  getUserHistory: (userId) => {
    return axiosClient.get(`${ADMIN_BASE_URL}/users/${userId}/submissions`);
  }
};
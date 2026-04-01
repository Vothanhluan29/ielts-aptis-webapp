// ⚠️ LƯU Ý: Kiểm tra kỹ đường dẫn import này tùy vào cấu trúc folder của bạn
import axiosClient from '../../../../../services/axiosClient';

const BASE_URL = '/listening';

export const listeningAdminApi = {
  // ====================================================
  // 1. QUẢN LÝ ĐỀ THI (TEST MANAGEMENT)
  // ====================================================

  // Lấy danh sách đề thi (Hỗ trợ params _t để xóa cache, is_mock_selector...)
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/admin/tests`, { params: params });
  },

  // Lấy chi tiết đề thi (để Edit)
  getTestById: (id) => {
    return axiosClient.get(`${BASE_URL}/admin/tests/${id}`);
  },

  // Tạo đề thi mới
  createTest: (data) => {
    return axiosClient.post(`${BASE_URL}/admin/tests`, data);
  },

  // Cập nhật đề thi (PATCH cho partial update: Status, Type, Content)
  updateTest: (id, data) => {
    return axiosClient.patch(`${BASE_URL}/admin/tests/${id}`, data);
  },

  // Xóa đề thi
  deleteTest: (id) => {
    return axiosClient.delete(`${BASE_URL}/admin/tests/${id}`);
  },

  // ====================================================
  // 2. TÀI NGUYÊN (RESOURCES)
  // ====================================================

  // Upload Audio (MP3/WAV)
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`${BASE_URL}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // ====================================================
  // 3. QUẢN LÝ BÀI NỘP (SUBMISSION MANAGEMENT) - 🔥 MỚI BỔ SUNG
  // ====================================================

  // Lấy danh sách toàn bộ bài nộp của tất cả học viên (Có hỗ trợ phân trang, lọc status)
  getAllSubmissions: (params) => {
    return axiosClient.get(`${BASE_URL}/admin/submissions`, { params });
  },

  // Lấy lịch sử bài nộp của một học viên cụ thể
  getUserSubmissions: (userId) => {
    return axiosClient.get(`${BASE_URL}/admin/users/${userId}/submissions`);
  }
};
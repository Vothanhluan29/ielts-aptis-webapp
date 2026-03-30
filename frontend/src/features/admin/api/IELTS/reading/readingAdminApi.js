import axiosClient from '../../../../../services/axiosClient'; 

const BASE_URL = '/reading/admin';

export const readingAdminApi = {
  // ==========================================
  // 📚 QUẢN LÝ ĐỀ THI (TEST MANAGEMENT)
  // ==========================================
  
  // 1. Lấy danh sách đề thi (List)
  // Params: { skip, limit, is_mock_selector: true/false }
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params:params });
  },

  // 2. Lấy chi tiết đề thi (Detail - Full đáp án)
  getTestDetail: (id) => {
    return axiosClient.get(`${BASE_URL}/tests/${id}`);
  },

  // 3. Tạo đề thi mới (Create)
  // Payload: TestCreateOrUpdate Schema (có Passages -> Groups -> Questions)
  createTest: (data) => {
    return axiosClient.post(`${BASE_URL}/tests`, data);
  },

  // 4. Cập nhật đề thi (Update)
  updateTest: (id, data) => {
    return axiosClient.put(`${BASE_URL}/tests/${id}`, data);
  },

  // 5. Xóa đề thi (Delete)
  deleteTest: (id) => {
    return axiosClient.delete(`${BASE_URL}/tests/${id}`);
  },

  // ==========================================
  // 📝 QUẢN LÝ BÀI NỘP (SUBMISSION MANAGEMENT)
  // ==========================================
  
  // 6. Lấy toàn bộ danh sách bài nộp của tất cả học viên
  // Params: { skip, limit, status }
  getAllSubmissions: (params) => {
    return axiosClient.get(`${BASE_URL}/submissions`, { params });
  },

  // 7. Lấy lịch sử làm bài của một học viên cụ thể
  getUserSubmissions: (userId) => {
    return axiosClient.get(`${BASE_URL}/users/${userId}/submissions`);
  }
};
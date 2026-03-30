import axiosClient from '../../../../../services/axiosClient';

const BASE_URL = '/exam/admin';

export const examAdminApi = {
  // 1. Lấy danh sách Full Test
  // GET /exam/admin/tests
  // Bổ sung params để dự phòng sau này Backend thêm tính năng search/phân trang
  getAllTests: (params) => {
    return axiosClient.get(`${BASE_URL}/tests`, { params });
  },

  // 2. Lấy chi tiết 1 đề (để Edit)
  getTestDetail: (id) => {
    return axiosClient.get(`${BASE_URL}/tests/${id}`);
  },

  // 3. Tạo đề Full Test mới 
  createTest: (data) => {
    return axiosClient.post(`${BASE_URL}/tests`, data);
  },

  // 4. Cập nhật đề
  updateTest: (id, data) => {
    return axiosClient.put(`${BASE_URL}/tests/${id}`, data);
  },

  // 5. Xóa đề
  deleteTest: (id) => {
    return axiosClient.delete(`${BASE_URL}/tests/${id}`);
  }
};
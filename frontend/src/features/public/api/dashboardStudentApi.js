import axiosClient from '../../../services/axiosClient'; // Đảm bảo đường dẫn này khớp với project của bạn

const BASE_URL = '/stats';

export const dashboardStudentApi = {
  // 1. Lấy thống kê tổng quan (Điểm trung bình Full Test & 4 Kỹ năng)
  getOverviewStats: () => {
    return axiosClient.get(`${BASE_URL}/overview`);
  },

  // 2. Lấy dữ liệu biểu đồ (Chart) và Chuỗi ngày học (Streak)
  getProgressData: () => {
    return axiosClient.get(`${BASE_URL}/progress`);
  },

  // 3. Lấy danh sách hoạt động gần đây (Recent Activities)
  // Truyền tham số limit để giới hạn số lượng bài hiển thị (Mặc định 10)
  getRecentActivities: (limit = 10) => {
    return axiosClient.get(`${BASE_URL}/activities`, {
      params: { limit }
    });
  }
};
import axiosClient from '../../../../../services/axiosClient'; // Đảm bảo đường dẫn này trỏ đúng vào file cấu hình axios của bạn

const dashboardAptisStudentApi = {
  /**
   * 1. Lấy thông số tổng quan (Overview)
   * Trả về: Điểm trung bình các kỹ năng, tổng số bài full test, CEFR cao nhất...
   */
  getOverviewStats: () => {
    const url = '/aptis/stats/overview';
    return axiosClient.get(url);
  },

  /**
   * 2. Lấy dữ liệu vẽ biểu đồ và chuỗi ngày học (Progress)
   * Trả về: Dữ liệu chart (grammar_vocab, reading, listening, writing, speaking, full_test) & streak_info
   */
  getProgressData: () => {
    const url = '/aptis/stats/progress';
    return axiosClient.get(url);
  },

  /**
   * 3. Lấy danh sách hoạt động gần nhất (Recent Activities)
   * @param {number} limit - Số lượng bản ghi muốn lấy (mặc định là 10)
   * Trả về: Mảng các bài thi đã làm gần đây nhất
   */
  getRecentActivities: (limit = 10) => {
    const url = '/aptis/stats/activities';
    return axiosClient.get(url, { params: { limit } });
  }
};

export default dashboardAptisStudentApi;
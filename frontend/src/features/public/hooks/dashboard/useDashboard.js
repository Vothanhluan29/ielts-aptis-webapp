import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { dashboardStudentApi } from '../../api/dashboardStudentApi'; // Điều chỉnh lại đường dẫn API của bạn cho đúng

export const useDashboard = (activityLimit = 5) => {
  // --- STATES ---
  const [overview, setOverview] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA LOGIC ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 🔥 Kỹ thuật Promise.all: Gọi 3 API chạy song song cùng lúc
      const [overviewRes, progressRes, activitiesRes] = await Promise.all([
        dashboardStudentApi.getOverviewStats(),
        dashboardStudentApi.getProgressData(),
        dashboardStudentApi.getRecentActivities(activityLimit)
      ]);

      // Bóc tách dữ liệu an toàn (Đề phòng Axios bọc payload trong object .data)
      const overviewData = overviewRes?.data || overviewRes;
      const progressData = progressRes?.data || progressRes;
      const activitiesData = activitiesRes?.data || activitiesRes;

      // Cập nhật State
      setOverview(overviewData);
      setProgress(progressData);
      
      // Chú ý: API getRecentActivities trả về object RecentActivitiesResponse có chứa mảng 'activities'
      setActivities(activitiesData?.activities || []);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      message.error("Unable to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [activityLimit]);

  // --- EFFECT ---
  // Tự động fetch data khi component được mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    overview,       // Chứa full_test_stats và skill_stats (Dùng cho 4 thẻ Widget)
    progress,       // Chứa chart_data và streak_info (Dùng cho Biểu đồ & Lịch học)
    activities,     // Mảng các bài thi gần nhất (Dùng cho bảng Recent Activities)
    loading,        // Trạng thái loading để hiển thị Skeleton/Spin
    refresh: fetchDashboardData // Hàm gọi lại data (Dùng cho nút "Làm mới" nếu có)
  };
};
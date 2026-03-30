import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import dashboardAptisStudentApi from '../../../api/APTIS/dashboard/dashboardAptisStudentApi';

export const useDashboardAptis = (activityLimit = 5) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activities, setActivities] = useState([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, progressRes, activitiesRes] = await Promise.all([
        dashboardAptisStudentApi.getOverviewStats(),
        dashboardAptisStudentApi.getProgressData(),
        dashboardAptisStudentApi.getRecentActivities(activityLimit)
      ]);

      setOverview(overviewRes?.data || overviewRes);
      setProgress(progressRes?.data || progressRes);
      
      // 🔥 ĐÃ FIX: Gom dữ liệu an toàn, vét cạn mọi trường hợp trả về của Axios
      const rawActivities = activitiesRes?.data?.activities || activitiesRes?.data || activitiesRes?.activities || activitiesRes;
      
      // Đảm bảo state luôn luôn nhận vào một Mảng (Array)
      setActivities(Array.isArray(rawActivities) ? rawActivities : []);

    } catch (error) {
      console.error("Error loading Aptis Dashboard data:", error);
      message.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [activityLimit]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    overview,
    progress,
    activities,
    loading,
    refresh: fetchAllData
  };
};
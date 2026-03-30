import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import profileApi from '../../features/admin/api/profile/profileApi';

export const useAdminHeader = () => {
  const [time, setTime] = useState(new Date());
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [admin, setAdmin] = useState(null);

  // Hàm lấy thông tin Admin từ API /users/me
  const fetchAdminData = useCallback(async () => {
    try {
      const data = await profileApi.getMe();
      setAdmin(data);
    } catch (error) {
      console.error("Header Profile Sync Error:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const checkHealth = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/health`);
        setIsBackendHealthy(true);
      } catch (error) { error
        setIsBackendHealthy(false);
      }
    };

    const healthTimer = setInterval(checkHealth, 30000);
    
    // Khởi chạy lần đầu
    checkHealth();
    fetchAdminData();

    // LẮNG NGHE SỰ KIỆN CẬP NHẬT TỪ PROFILE PAGE
    window.addEventListener('admin-updated', fetchAdminData);

    return () => {
      clearInterval(timer);
      clearInterval(healthTimer);
      window.removeEventListener('admin-updated', fetchAdminData);
    };
  }, [fetchAdminData]);

  return { time, isBackendHealthy, admin };
};
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import profileApi from '../../features/admin/api/profile/profileApi';

export const useAdminHeader = () => {
  const [time, setTime] = useState(() => new Date());
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [admin, setAdmin] = useState(null);

  const isMounted = useRef(true);

  const fetchAdminData = useCallback(async () => {
    try {
      const data = await profileApi.getMe();
      if (isMounted.current) {
        setAdmin(data);
      }
    } catch (error) {
      console.error("Header Profile Sync Error:", error);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/health`);
      if (isMounted.current) {
        setIsBackendHealthy(true);
      }
    } catch {
      if (isMounted.current) {
        setIsBackendHealthy(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const init = async () => {
      await fetchAdminData();
      await checkHealth();
    };

    init();

    const clockTimer = setInterval(() => {
      if (isMounted.current) {
        setTime(new Date());
      }
    }, 1000);

    const healthTimer = setInterval(checkHealth, 30000);

    const handleAdminUpdated = () => {
      fetchAdminData();
    };

    window.addEventListener('admin-updated', handleAdminUpdated);

    return () => {
      isMounted.current = false;
      clearInterval(clockTimer);
      clearInterval(healthTimer);
      window.removeEventListener('admin-updated', handleAdminUpdated);
    };
  }, [fetchAdminData, checkHealth]);

  return {
    time,
    isBackendHealthy,
    admin
  };
};
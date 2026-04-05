import { useState, useEffect, useCallback } from 'react';
import adminApi from '../../api/dashboard/adminApi';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi tải dashboard admin', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
};
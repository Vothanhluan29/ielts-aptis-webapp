import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import examAptisAdminApi from '../../../api/APTIS/exam/examAptisAdminApi'; 

export const useExamAptisSubmissionsManager = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [stats, setStats] = useState({ total: 0, in_progress: 0, pending: 0, completed: 0 });
  const [filters, setFilters] = useState({
    status: 'PENDING', 
    searchText: '',
  });

  const { current: page, pageSize } = pagination;
  const { status, searchText } = filters;

  // Lấy các con số tổng quan (gọi limit=1 cho nhẹ server)
  const loadOverviewStats = useCallback(async () => {
    try {
      const [inProgressRes, pendingRes, completedRes] = await Promise.all([
        examAptisAdminApi.getAllSubmissions({ page: 1, limit: 1, status: 'IN_PROGRESS' }),
        examAptisAdminApi.getAllSubmissions({ page: 1, limit: 1, status: 'PENDING' }),
        examAptisAdminApi.getAllSubmissions({ page: 1, limit: 1, status: 'COMPLETED' })
      ]);
      
      const ipData = inProgressRes.data || inProgressRes;
      const pData = pendingRes.data || pendingRes;
      const cData = completedRes.data || completedRes;

      const ipCount = ipData.total !== undefined ? ipData.total : (ipData.items?.length || ipData.length || 0);
      const pCount = pData.total !== undefined ? pData.total : (pData.items?.length || pData.length || 0);
      const cCount = cData.total !== undefined ? cData.total : (cData.items?.length || cData.length || 0);
      
      setStats({
        in_progress: ipCount,
        pending: pCount,
        completed: cCount,
        total: ipCount + pCount + cCount
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, []);


  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: pageSize,
        status: status,
        search: searchText,
      };

      const res = await examAptisAdminApi.getAllSubmissions(params);
      const result = res.data || res;

      if (Array.isArray(result)) {
        setData(result);
        setPagination(prev => ({ 
          ...prev, 
          total: result.length < pageSize ? (page - 1) * pageSize + result.length : 1000 
        }));
      } else if (result && result.items) {
        setData(result.items);
        setPagination(prev => ({ ...prev, total: result.total || 0 }));
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      message.error("Unable to load submission list!");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, searchText]); 


  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);


  useEffect(() => {
    loadOverviewStats();
  }, [status, loadOverviewStats]);

  return {
    loading,
    data,
    pagination,
    setPagination,
    stats,
    filters,
    setFilters,
    fetchSubmissions
  };
};
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import writingAptisAdminApi from '../../../api/APTIS/writing/writingAptisAdminApi';

export const useWritingSubmissionList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [stats, setStats] = useState({ total: 0, pending: 0, graded: 0 });
  const [filters, setFilters] = useState({
    status: 'PENDING',
    searchText: '',
  });


  const { current: page, pageSize } = pagination;
  const { status, searchText } = filters;

  const loadOverviewStats = useCallback(async () => {
    try {
      const [pendingRes, gradedRes] = await Promise.all([
        writingAptisAdminApi.getAllSubmissions({ page: 1, limit: 1, status: 'PENDING', is_full_test_only: false }),
        writingAptisAdminApi.getAllSubmissions({ page: 1, limit: 1, status: 'GRADED', is_full_test_only: false })
      ]);
      
      const pData = pendingRes.data || pendingRes;
      const gData = gradedRes.data || gradedRes;

      const pCount = pData.total !== undefined ? pData.total : (pData.items?.length || pData.length || 0);
      const gCount = gData.total !== undefined ? gData.total : (gData.items?.length || gData.length || 0);
      
      setStats({
        pending: pCount,
        graded: gCount,
        total: pCount + gCount
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
        is_full_test_only: false, 
      };

      const res = await writingAptisAdminApi.getAllSubmissions(params);
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
      console.error("Error loading submission list:", error);
      message.error("Unable to load submission data!");
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
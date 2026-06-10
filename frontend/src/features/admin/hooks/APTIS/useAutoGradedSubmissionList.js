import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

/**
 * Generic hook cho admin Submission List của 3 kỹ năng auto-graded:
 * Listening, Reading, Grammar & Vocab
 *
 * @param {object} api - API object có method getAllSubmissions(params)
 * @param {string} detailRoute - Route prefix để navigate vào detail, vd: '/admin/aptis/submissions/listening'
 */
export const useAutoGradedSubmissionList = (api, detailRoute) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({ total: 0 });
  const [searchText, setSearchText] = useState('');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        skip: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
      };
      const res = await api.getAllSubmissions(params);
      const result = res.data || res;

      if (result && result.items) {
        setData(result.items);
        setPagination(prev => ({ ...prev, total: result.total || 0 }));
        setStats({ total: result.total || 0 });
      } else if (Array.isArray(result)) {
        setData(result);
        setPagination(prev => ({ ...prev, total: result.length }));
        setStats({ total: result.length });
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      message.error('Unable to load submission data!');
    } finally {
      setLoading(false);
    }
  }, [api, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleViewDetail = useCallback((id) => {
    navigate(`${detailRoute}/${id}`);
  }, [navigate, detailRoute]);

  // Client-side search filter
  const filteredData = searchText
    ? data.filter(item =>
        (item.user?.full_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.user?.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (item.test?.title || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : data;

  return {
    loading,
    data: filteredData,
    pagination,
    setPagination,
    stats,
    searchText,
    setSearchText,
    fetchSubmissions,
    handleViewDetail,
  };
};

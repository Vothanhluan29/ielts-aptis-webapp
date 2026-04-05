import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import speakingAptisApi from '../../../api/APTIS/speaking/speakingAptisAdminApi';

export const useSpeakingAptisManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isMockFilter, setIsMockFilter] = useState(false);

  const { current: page, pageSize } = pagination;

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await speakingAptisApi.getAllTestsForAdmin({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        is_mock_selector: isMockFilter,
      });

      const data = res.items || res.data || res;
      const total = res.total || (Array.isArray(data) ? data.length : 0);

      setTests(Array.isArray(data) ? data : []);
      setPagination(prev => ({ ...prev, total }));
    } catch (error) {
      message.error('Failed to load Speaking tests!');
      console.error('Fetch Tests Error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isMockFilter]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  const handleDelete = async (id) => {
    try {
      await speakingAptisApi.deleteTest(id);
      message.success('Test deleted successfully!');
      fetchTests();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Unable to delete this test.');
    }
  };

  return {
    tests,
    loading,
    pagination,
    isMockFilter,
    setIsMockFilter,
    handleTableChange,
    handleDelete
  };
};
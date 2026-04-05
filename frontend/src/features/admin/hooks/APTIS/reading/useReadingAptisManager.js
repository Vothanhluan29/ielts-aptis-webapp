import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import readingAptisAdminApi from '../../../api/APTIS/reading/readingAptisAdminApi';

export const useReadingAptisManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isMockFilter, setIsMockFilter] = useState(false);

  const { current: page, pageSize } = pagination;

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await readingAptisAdminApi.getAllTests({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        is_mock_selector: isMockFilter,
      });
      const dataList = response.data || response;
      setTests(dataList);
      // Fallback pagination nếu API không trả về total
      setPagination(prev => ({ 
        ...prev, 
        total: dataList.length > 0 ? page * pageSize + 10 : page * pageSize 
      }));
    } catch (error) {
      message.error('Failed to load Reading tests!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isMockFilter]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleTableChange = (newPage, newPageSize) => {
    setPagination(prev => ({ ...prev, current: newPage, pageSize: newPageSize }));
  };

  const handleDelete = async (id) => {
    try {
      await readingAptisAdminApi.deleteTest(id);
      message.success('Test deleted successfully!');
      fetchTests();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error(error.response.data.detail || 'Unable to delete this test as it is currently in use.');
      } else {
        message.error('Failed to delete test!');
      }
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
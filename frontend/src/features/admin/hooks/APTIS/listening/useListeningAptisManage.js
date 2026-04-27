import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import listeningAptisAdminApi from '../../../api/APTIS/listening/listeningAptisAdminApi';

export const useListeningAptisManage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isMockFilter, setIsMockFilter] = useState(false);


  const { current: page, pageSize } = pagination;

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listeningAptisAdminApi.getTests({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        is_mock_selector: isMockFilter,
      });
      const data = response.data || response;
      setTests(data);
      
      setPagination(prev => ({
        ...prev,
        total: data.length === pageSize ? page * pageSize + 10 : page * pageSize,
      }));
    } catch (error) {
      console.error('Error loading test list:', error);
      message.error('Failed to load Listening tests!');
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

  const handleDelete = async (testId) => {
    try {
      await listeningAptisAdminApi.deleteTest(testId);
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
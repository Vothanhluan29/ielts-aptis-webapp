import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import GrammarVocabAdminApi from '../../../api/APTIS/grammar&vocab/grammar_vocabAdminApi';

export const useGramVocabManage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isMockFilter, setIsMockFilter] = useState(false);

  // Bóc tách biến để tránh ESLint warning
  const { current: page, pageSize } = pagination;

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GrammarVocabAdminApi.getTests({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        is_mock_selector: isMockFilter,
      });
      const data = response.data || response;
      
      setTests(data);

      
    } catch (error) {
      console.error('Error loading tests:', error);
      message.error('Failed to load test list!');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isMockFilter]);

  // Tự động load lại data mỗi khi các tham số thay đổi
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
      await GrammarVocabAdminApi.deleteTest(testId);
      message.success('Test deleted successfully!');
      fetchTests(); // Refresh lại danh sách
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
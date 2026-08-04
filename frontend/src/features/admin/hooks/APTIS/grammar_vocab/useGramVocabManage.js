import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import GrammarVocabAdminApi from '../../../api/APTIS/grammar&vocab/grammar_vocabAdminApi';

export const useGramVocabManage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isMockFilter, setIsMockFilter] = useState(false);

  const { current: page, pageSize } = pagination;

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GrammarVocabAdminApi.getTests({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        is_mock_selector: isMockFilter,
      });
      const rawData = response.data || response;
      const data = rawData.items || rawData;
      const total = rawData.total || (Array.isArray(data) ? (data.length === pageSize ? page * pageSize + 10 : data.length) : 0);
      
      setTests(Array.isArray(data) ? data : []);
      
      setPagination(prev => ({
        ...prev,
        total,
      }));
    } catch (error) {
      console.error('Error loading tests:', error);
      message.error('Failed to load Grammar & Vocabulary test list. Please try again!');
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
      await GrammarVocabAdminApi.deleteTest(testId);
      message.success('Test deleted successfully!');
      fetchTests(); 
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error(error.response.data.detail || 'This test is currently in use and cannot be deleted.');
      } else {
        message.error(error.response?.data?.detail || 'Failed to delete test. Please try again!');
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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { readingAdminApi } from '../../../api/IELTS/reading/readingAdminApi';

export const useReadingManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMockOnly, setIsMockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await readingAdminApi.getAllTests({
        skip: 0,
        limit: 100,
        is_mock_selector: isMockOnly
      });

      const data = response.data || response || [];
      setTests(data);
    } catch (error) {
      console.error("Fetch reading tests error:", error);
      message.error("Unable to load the Reading test list.");
    } finally {
      setLoading(false);
    }
  }, [isMockOnly]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleDelete = async (id) => {
    try {
      await readingAdminApi.deleteTest(id);
      message.success("Test deleted successfully!");
      fetchTests();
    } catch (error) {
      console.error("Delete test error:", error);
      const msg = error.response?.data?.detail || "An error occurred while deleting the test.";
      message.error(msg);
    }
  };

  const filteredTests = useMemo(() => {
    if (!searchTerm) return tests;
    return tests.filter(
      t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(t.id).includes(searchTerm)
    );
  }, [tests, searchTerm]);

  return {
    filteredTests,
    loading,
    searchTerm,
    setSearchTerm,
    isMockOnly,
    setIsMockOnly,
    handleDelete,
    refresh: fetchTests
  };
};
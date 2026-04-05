import { useState, useCallback, useMemo, useEffect } from 'react';
import { message } from 'antd';
import { listeningAdminApi } from '../../../api/IELTS/listening/listeningAdminApi';

export const useListeningManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isMockOnly, setIsMockOnly] = useState(false);

  const fetchTests = useCallback(async () => {
    setLoading(true);

    try {
      const response = await listeningAdminApi.getAllTests({
        _t: Date.now()
      });

      const data = Array.isArray(response) ? response : response.data || [];
      setTests(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
      message.error("Failed to load listening tests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleDelete = async (id) => {
    try {
      await listeningAdminApi.deleteTest(id);
      message.success("Test deleted successfully!");
      setTests(prev => prev.filter(test => test.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      message.error(error.response?.data?.detail || "Failed to delete test.");
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchSearch =
        test.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.id.toString().includes(searchTerm);

      const matchType = Boolean(test.is_full_test_only) === isMockOnly;

      return matchSearch && matchType;
    });
  }, [tests, searchTerm, isMockOnly]);

  const stats = useMemo(() => ({
    total: tests.length,
    mock: tests.filter(t => t.is_full_test_only).length,
    public: tests.filter(t => t.is_published).length
  }), [tests]);

  return {
    tests,
    loading,
    searchTerm,
    setSearchTerm,
    isMockOnly,
    setIsMockOnly,
    fetchTests,
    handleDelete,
    filteredTests,
    stats
  };
};
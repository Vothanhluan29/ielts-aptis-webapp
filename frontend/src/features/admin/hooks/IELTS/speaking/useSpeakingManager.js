import { useState, useEffect, useMemo, useCallback } from 'react';
import { message } from 'antd';
import { adminSpeakingApi } from '../../../api/IELTS/speaking/adminSpeakingApi';

export const useSpeakingManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMockOnly, setIsMockOnly] = useState(false);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all tests at once. Filtering will be handled locally by useMemo.
      const response = await adminSpeakingApi.getAllTests();
      const data = response.data || response || [];
      setTests(data);
    } catch (error) {
      console.error("Fetch speaking tests error:", error);
      message.error("Failed to load speaking test list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test? All related student submissions will also be removed.")) {
      return;
    }

    try {
      await adminSpeakingApi.deleteTest(id);
      message.success("Test deleted successfully!");
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Delete speaking test error:", error);
      const errorMsg = error.response?.data?.detail || "Error while deleting the test.";
      message.error(errorMsg);
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      // 1. Strict Tab Matching (Practice vs Mock)
      const matchTab = !!test.is_full_test_only === isMockOnly;
      
      // 2. Search Term Matching
      const matchSearch =
        searchTerm === '' ||
        test.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchTab && matchSearch;
    });
  }, [tests, searchTerm, isMockOnly]);

  // Calculate statistics for UI headers/dashboards
  const stats = useMemo(() => ({
    total: tests.length,
    publicCount: tests.filter(t => t.is_published).length,
    mockCount: tests.filter(t => t.is_full_test_only).length
  }), [tests]);

  return {
    loading,
    searchTerm,
    setSearchTerm,
    isMockOnly,
    setIsMockOnly,
    filteredTests,
    handleDelete,
    stats,
    fetchTests 
  };
};
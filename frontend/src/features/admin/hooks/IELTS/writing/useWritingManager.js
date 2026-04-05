import { useState, useEffect, useMemo, useCallback } from 'react';
import { message } from 'antd';
import { adminWritingApi } from '../../../api/IELTS/writing/adminWritingApi';

export const useWritingManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isMockOnly, setIsMockOnly] = useState(false);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminWritingApi.getAllTests();
      const data = response.data || response || [];
      setTests(data);
    } catch (error) {
      console.error("Fetch tests error:", error);
      message.error("Failed to load writing test list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleDelete = async (id) => {
    try {
      await adminWritingApi.deleteTest(id);
      message.success("Test deleted successfully!");
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Delete test error:", error);
      const errorMsg = error.response?.data?.detail || "Error while deleting the test.";
      message.error(errorMsg);
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchTab = !!test.is_full_test_only === isMockOnly;
      
      const matchSearch =
        searchTerm === '' ||
        test.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchTab && matchSearch;
    });
  }, [tests, searchTerm, isMockOnly]);

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
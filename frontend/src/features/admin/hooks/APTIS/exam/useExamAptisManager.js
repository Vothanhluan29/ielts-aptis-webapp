import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import examAptisAdminApi from '../../../api/APTIS/exam/examAptisAdminApi'; 


export const useExamAptisManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch test list
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examAptisAdminApi.getAllFullTests();
      // Accept both array format or paginated format { items: [...] }
      const data = res.data?.items || res.data || res || [];
      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch Error:", error);
      message.error("Unable to load Aptis test list!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // 2. Handle delete test
  const handleDelete = async (id) => {
    const hide = message.loading("Deleting test...", 0);
    try {
      await examAptisAdminApi.deleteFullTest(id);
      message.success("Test deleted successfully!");
      fetchTests(); 
    } catch (error) {
      console.error("Delete Error:", error);
      message.error("Unable to delete this test. Please try again!");
    } finally {
      hide();
    }
  };

  return {
    tests,
    loading,
    fetchTests,
    handleDelete
  };
};
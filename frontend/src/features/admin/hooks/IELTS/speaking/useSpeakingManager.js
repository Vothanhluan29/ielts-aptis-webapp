import { useState, useEffect, useMemo, useCallback } from "react";
import { message } from "antd";
import { adminSpeakingApi } from "../../../api/IELTS/speaking/adminSpeakingApi";

export const useSpeakingManager = (initialMockFilter = false) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMockOnly, setIsMockOnly] = useState(initialMockFilter);

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminSpeakingApi.getAllTests({
        is_mock_selector: isMockOnly,
      });
      setTests(res.data || res || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load speaking tests.");
    } finally {
      setLoading(false);
    }
  }, [isMockOnly]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this test? All related student submissions will also be removed."
      )
    )
      return;

    try {
      await adminSpeakingApi.deleteTest(id);
      message.success("Test deleted successfully.");
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.detail || "Error deleting the test.";
      message.error(errorMessage);
    }
  };

  const filteredTests = useMemo(
    () =>
      tests.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [tests, searchTerm]
  );

  return {
    tests,
    filteredTests,
    loading,
    searchTerm,
    setSearchTerm,
    isMockOnly,
    setIsMockOnly,
    handleDelete,
    refreshData: fetchTests,
  };
};
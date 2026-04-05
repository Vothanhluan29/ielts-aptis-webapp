import { useState, useEffect, useMemo, useCallback } from 'react';
import { message } from 'antd'; 
import { examAdminApi } from '../../../api/IELTS/exam/ExamAdminApi';

export const useExamManager = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Data
  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await examAdminApi.getAllTests();
      // Hỗ trợ an toàn cho cả format mảng [...] và object phân trang { items: [...] }
      const data = response?.data?.items || response?.data || response || [];
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch exams error:", error);
      message.error('Unable to load IELTS exam list!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // 2. Handle Delete
  const handleDelete = async (id) => {
    const hide = message.loading('Deleting exam...', 0);
    try {
      await examAdminApi.deleteTest(id);
      hide(); // Tắt popup loading
      message.success('Exam deleted successfully!');
      
      // Tối ưu hiệu năng: Xóa trực tiếp khỏi state thay vì gọi lại API fetchExams()
      setExams((prev) => prev.filter((exam) => exam.id !== id));
    } catch (error) {
      console.error("Delete exam error:", error);
      hide();
      message.error('Failed to delete the exam. Please try again!');
    }
  };

  // 3. Filter Logic (Client-side Search)
  const filteredExams = useMemo(() => {
    if (!searchTerm.trim()) return exams;

    return exams.filter((exam) => 
      exam.title?.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [exams, searchTerm]);

  return {
    exams,
    filteredTests: filteredExams,
    loading,
    searchTerm,
    setSearchTerm,
    handleDelete,
    refresh: fetchExams
  };
};
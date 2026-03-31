import { useState, useEffect, useMemo } from 'react';
import { speakingStudentApi } from '../../api/speakingStudentApi';

export const useSpeakingList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Quản lý 3 tab: 'ALL', 'NOT_STARTED', 'COMPLETED'
  const [filter, setFilter] = useState('ALL');

  // 2. Fetch Data
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true); // Reset loading khi gọi lại
      try {
        const res = await speakingStudentApi.getAllTests();
        // Đảm bảo lấy đúng mảng data
        const data = Array.isArray(res) ? res : (res.data || []);
        
        // Mặc dù backend đã lọc, ta vẫn filter is_published cho chắc chắn an toàn trên UI
        setTests(data.filter(t => t.is_published) || []);
      } catch (error) {
        console.error("Failed to load speaking tests", error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // 3. Filter Logic (Search + Tab) Memoized để tối ưu hiệu suất
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      // Logic search theo tiêu đề
      const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Logic phân loại theo Tab
      let matchesTab = true;
      if (filter === 'NOT_STARTED') {
        // Đang làm dở hoặc chưa đụng tới
        matchesTab = test.status === 'NOT_STARTED' || test.status === 'PENDING' || test.status === 'IN_PROGRESS';
      } else if (filter === 'COMPLETED') {
        // Đã nộp, đang chấm, chấm xong, hoặc lỗi AI
        matchesTab = test.status === 'GRADED' || test.status === 'ERROR' || test.status === 'GRADING' || test.status === 'SUBMITTED';
      }

      return matchesSearch && matchesTab;
    });
  }, [tests, searchTerm, filter]);

  // 4. Tính toán thống kê số lượng cho các Tabs
  const stats = useMemo(() => ({
    all: tests.length,
    notStarted: tests.filter(t => t.status === 'NOT_STARTED' || t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
    completed: tests.filter(t => t.status === 'GRADED' || t.status === 'ERROR' || t.status === 'GRADING' || t.status === 'SUBMITTED').length,
  }), [tests]);

  return {
    tests, // Có thể dùng nếu cần raw data
    filteredTests,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    stats
  };
};
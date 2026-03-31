import { useState, useEffect, useMemo } from 'react';
import { speakingStudentApi } from '../../../api/IELTS/speaking/speakingStudentApi';

export const useSpeakingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await speakingStudentApi.getMyHistory();
        // Xử lý an toàn cho cấu trúc response từ backend
        const data = Array.isArray(response) ? response : response.data || [];
        setHistory(data);
      } catch (error) {
        console.error("Failed to load speaking history", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  /* Tính toán thống kê (Chỉ tính các bài đã có điểm - GRADED) */
  const gradedList = useMemo(() => 
    history.filter(h => h.status === 'GRADED' && h.band_score !== null), 
  [history]);



  const best = useMemo(() => {
    if (gradedList.length === 0) return null;
    return Math.max(...gradedList.map((h) => h.band_score));
  }, [gradedList]);

  /* Logic Lọc và Tìm kiếm */
  const filtered = useMemo(() => {
    return history.filter((item) => {
      // ✅ Đồng bộ lấy title từ object test (giống Reading/Listening/Writing)
      const titleToSearch = item.test?.title || item.test_title || '';
      
      const matchSearch =
        titleToSearch.toLowerCase().includes(search.toLowerCase()) ||
        String(item.id).includes(search);

      // Bộ lọc trạng thái
      let matchFilter = filter === 'ALL' || item.status === filter;

      return matchSearch && matchFilter;
    });
  }, [history, search, filter]);

  return {
    history,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    filtered,
    best,
    gradedCount: gradedList.length
  };
};
import { useState, useEffect, useMemo } from 'react';
import { writingStudentApi } from '../../api/writingStudentApi';
import toast from 'react-hot-toast';

export const useWritingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await writingStudentApi.getMyHistory();
        // Backend trả về trực tiếp mảng hoặc bọc trong {data: []}
        const data = Array.isArray(response) ? response : response?.data || [];
        setHistory(data);
      } catch (error) {
        console.error("Failed to load writing history", error);
        toast.error("Không thể tải lịch sử làm bài. Vui lòng thử lại sau.");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  /* Tính toán thông số (Chỉ tính các bài ĐÃ CHẤM XONG) */
  const best = useMemo(() => {
    const graded = history.filter(h => h.status === 'GRADED' && h.band_score > 0);
    if (graded.length === 0) return 0;
    return Math.max(...graded.map((h) => h.band_score || 0));
  }, [history]);

  /* Lọc danh sách (Search + Filter theo Status) */
  const filtered = useMemo(() => {
    return history.filter((item) => {
      // Lấy title từ object test mới của backend
      const titleToSearch = item?.test?.title || item?.test_title || '';
      
      const matchSearch =
        titleToSearch.toLowerCase().includes(search.toLowerCase()) ||
        String(item.id).includes(search);

      const matchFilter = filter === 'ALL' || item.status === filter;

      return matchSearch && matchFilter;
    });
  }, [history, search, filter]);

  const gradedCount = history.filter(h => h.status === 'GRADED').length;

  return {
    history,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    filtered,
    best,
    gradedCount
  };
};
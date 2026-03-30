import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminWritingApi } from '../../api/IELTS/writing/adminWritingApi';

export const useWritingManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔥 THÊM STATE: Quản lý Tab hiển thị (Practice Tests vs Mock Exams)
  const [isMockOnly, setIsMockOnly] = useState(false);

  // 1. Fetch data
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminWritingApi.getAllTests();
      // Đảm bảo lấy đúng mảng data dù Axios có bọc thêm class hay không
      const data = response.data || response || [];
      setTests(data);
    } catch (error) {
      console.error("Fetch tests error:", error);
      toast.error("Failed to load writing test list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // 2. Handle delete
  const handleDelete = async (id) => {
    // Đã bỏ window.confirm ở đây vì giao diện UI đã dùng <Popconfirm> của Ant Design
    try {
      await adminWritingApi.deleteTest(id);
      toast.success("Test deleted successfully!");
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Delete test error:", error);
      // Moi thông báo lỗi chính xác từ Backend (ví dụ: lỗi kẹt Full Mock Test)
      const errorMsg = error.response?.data?.detail || "Error while deleting the test.";
      toast.error(errorMsg);
    }
  };

  // 3. Search & Tab filter (Gộp 2 bộ lọc làm 1)
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      // Điều kiện 1: Phải khớp với Tab đang chọn (Mock hoặc Practice)
      const matchTab = !!test.is_full_test_only === isMockOnly;
      
      // Điều kiện 2: Phải chứa từ khóa tìm kiếm (nếu có)
      const matchSearch = searchTerm === '' || test.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchTab && matchSearch;
    });
  }, [tests, searchTerm, isMockOnly]);

  // 4. Calculate Stats
  const stats = useMemo(() => ({
    total: tests.length,
    publicCount: tests.filter(t => t.is_published).length,
    mockCount: tests.filter(t => t.is_full_test_only).length
  }), [tests]);

  return {
    loading,
    searchTerm,
    setSearchTerm,
    isMockOnly,      // Trả về state quản lý Tab
    setIsMockOnly,   // Trả về hàm set state cho Tab
    filteredTests,
    handleDelete,
    stats,
    fetchTests 
  };
};
import { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import { listeningAdminApi } from '../../../api/IELTS/listening/listeningAdminApi'; // Sửa lại đường dẫn import api của bạn

export const useListeningManager = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Các state để kết nối với bộ lọc trên UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isMockOnly, setIsMockOnly] = useState(false); // 🔥 FIX 1: Thêm state cho Mock/Practice Tab

  // --- 1. FETCH DATA ---
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
      toast.error("Failed to load listening tests.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 FIX 4: Tự động gọi API khi vào trang
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // --- 2. DELETE ---
  // 🔥 FIX 3: Đổi tên thành handleDelete cho khớp với UI
  const handleDelete = async (id) => {
    try {
      await listeningAdminApi.deleteTest(id);
      toast.success("Test deleted successfully!");
      // Cập nhật lại state cục bộ thay vì gọi lại API cho nhẹ
      setTests(prev => prev.filter(test => test.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.detail || "Failed to delete test.");
    }
  };

  // --- 3. FILTER (Client-Side Search & Tab) ---
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      // 🔥 FIX 2: Lọc theo cả Text và trạng thái Mock/Practice
      const matchSearch = test.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          test.id.toString().includes(searchTerm);
      
      // So sánh boolean: isMockOnly là true/false, test.is_full_test_only cũng là true/false
      const matchType = Boolean(test.is_full_test_only) === isMockOnly; 

      return matchSearch && matchType;
    });
  }, [tests, searchTerm, isMockOnly]);

  // --- 4. STATS (Thống kê - dùng sau này nếu cần) ---
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
    isMockOnly,        // ✅ Trả về cho UI
    setIsMockOnly,     // ✅ Trả về cho UI
    fetchTests,
    handleDelete,      // ✅ Trả về cho UI
    filteredTests,
    stats
  };
};
import { useState, useEffect } from 'react';
import { readingStudentApi } from '../../api/readingStudentApi'; 

export const useReadingList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Tối giản chỉ còn 3 tab: 'ALL', 'NOT_STARTED', 'COMPLETED'
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true); 
      try {
        const res = await readingStudentApi.getAllTests();
        const data = Array.isArray(res) ? res : (res.data || []);
        setTests(data);
      } catch (error) {
        console.error("Lỗi tải danh sách Reading:", error);
        setTests([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // ✅ XỬ LÝ LỌC DỮ LIỆU
  const filteredTests = tests.filter(test => {
    if (filter === 'ALL') return true;
    
    // Gộp chung trạng thái Đang làm dở vào tab Chưa làm
    if (filter === 'NOT_STARTED') {
      return test.status === 'NOT_STARTED' || test.status === 'IN_PROGRESS';
    }
    
    // Tab Đã hoàn thành
    if (filter === 'COMPLETED') return test.status === 'GRADED'; 
    
    return true;
  });

  // ✅ TÍNH TOÁN THỐNG KÊ (Cũng gộp số lượng IN_PROGRESS vào NOT_STARTED)
  const stats = {
    all: tests.length,
    notStarted: tests.filter(t => t.status === 'NOT_STARTED' || t.status === 'IN_PROGRESS').length,
    completed: tests.filter(t => t.status === 'GRADED').length,
  };

  return { 
    tests,          
    filteredTests,  
    loading, 
    filter,         
    setFilter,      
    stats           
  };
};
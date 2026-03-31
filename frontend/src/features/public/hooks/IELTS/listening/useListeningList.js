import { useState, useEffect } from 'react';
import { listeningStudentApi } from '../../../api/IELTS/listening/listeningStudentApi'; 

export const useListeningList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quản lý 3 tab: 'ALL', 'NOT_STARTED', 'COMPLETED'
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const res = await listeningStudentApi.getAllTests();
        const data = Array.isArray(res) ? res : (res.data || []);
        // Vẫn giữ màng lọc is_published phòng hờ Backend trả dư
        setTests(data.filter(t => t.is_published)); 
      } catch (error) {
        console.error("Lỗi tải danh sách Listening:", error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // XỬ LÝ LỌC DỮ LIỆU
  const filteredTests = tests.filter(test => {
    if (filter === 'ALL') return true;
    
    // Gộp trạng thái Đang làm dở (IN_PROGRESS) vào tab Chưa làm
    if (filter === 'NOT_STARTED') {
      return test.status === 'NOT_STARTED' || test.status === 'IN_PROGRESS';
    }
    
    // Tab Đã hoàn thành
    if (filter === 'COMPLETED') return test.status === 'GRADED'; 
    
    return true;
  });

  // TÍNH TOÁN THỐNG KÊ 
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
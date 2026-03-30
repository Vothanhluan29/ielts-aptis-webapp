import { useState, useEffect } from 'react';
import { subscriptionApi } from '../../features/subscriptions/api/subscriptionApi';

const useUserUsage = () => {
  // 1. Khởi tạo state với đầy đủ các trường (Exam, Writing, Speaking)
  const [usage, setUsage] = useState({
    // Speaking
    speaking_used: 0, 
    speaking_limit: 3,
    // Writing
    writing_used: 0, 
    writing_limit: 3,
    // Exam (Mock Test) - Mới thêm vào
    exam_used: 0, 
    exam_limit: 1, 
    
    loading: true
  });

  // 2. Fetch dữ liệu khi component mount
  useEffect(() => {
    let isMounted = true; 

    const fetchUsage = async () => {
      try {
        const data = await subscriptionApi.getMyUsage();
        if (isMounted) {
          // Backend trả về JSON khớp key, ta chỉ cần spread vào
          setUsage({ ...data, loading: false });
        }
      } catch (error) {
        console.error("Failed to fetch usage:", error);
        if (isMounted) {
          setUsage(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchUsage();

    return () => { isMounted = false; };
  }, []); 

  // 3. Hàm refetch (Gọi lại sau khi nộp bài để cập nhật số lượt)
  const refetchUsage = async () => {
    try {
      const data = await subscriptionApi.getMyUsage();
      setUsage({ ...data, loading: false });
    } catch (error) {
      console.error("Refetch failed:", error);
    }
  };

  // 4. Tính toán nhanh trạng thái (Derived State)
  // Giúp UI không phải check a >= b thủ công nhiều lần
  const isExamFull = usage.exam_used >= usage.exam_limit;
  const isWritingFull = usage.writing_used >= usage.writing_limit;
  const isSpeakingFull = usage.speaking_used >= usage.speaking_limit;

  return { 
    usage, 
    refetchUsage, 
    // Trả về luôn các biến check tiện lợi
    isExamFull,
    isWritingFull,
    isSpeakingFull,
    loading: usage.loading 
  };
};

export default useUserUsage;
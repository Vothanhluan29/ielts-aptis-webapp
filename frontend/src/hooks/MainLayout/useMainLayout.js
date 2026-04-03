import { useState, useEffect } from 'react';
import { subscriptionApi } from '../../features/public/api/IELTS/subscriptions/subscriptionApi';

const useUserUsage = () => {
  // 1. Initialize state with all fields (Exam, Writing, Speaking)
  const [usage, setUsage] = useState({
    // Speaking
    speaking_used: 0,
    speaking_limit: 3,

    // Writing
    writing_used: 0,
    writing_limit: 3,

    // Exam (Mock Test)
    exam_used: 0,
    exam_limit: 1,

    loading: true
  });

  // 2. Fetch data when the component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchUsage = async () => {
      try {
        const data = await subscriptionApi.getMyUsage();
        if (isMounted) {
          // Backend returns JSON with matching keys, so we can spread directly
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

  // 3. Refetch function (called after submission to update usage count)
  const refetchUsage = async () => {
    try {
      const data = await subscriptionApi.getMyUsage();
      setUsage({ ...data, loading: false });
    } catch (error) {
      console.error("Refetch failed:", error);
    }
  };

  // 4. Derived state for quick status checks
  // Helps the UI avoid repeating conditions like a >= b
  const isExamFull = usage.exam_used >= usage.exam_limit;
  const isWritingFull = usage.writing_used >= usage.writing_limit;
  const isSpeakingFull = usage.speaking_used >= usage.speaking_limit;

  return {
    usage,
    refetchUsage,

    // Return convenient status flags
    isExamFull,
    isWritingFull,
    isSpeakingFull,

    loading: usage.loading
  };
};

export default useUserUsage;
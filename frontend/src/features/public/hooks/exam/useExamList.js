import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd'; 
import { examStudentApi } from '../../api/examStudentApi';

export const useExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  // 1. Fetch Data
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examStudentApi.getAllTests();
      
      const data = response?.data?.items || response?.data || response || [];
      setExams(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("Failed to load exams", error);
      message.error("Cannot load the exam list. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // 2. Handle Routing Logic
  const handleAction = useCallback((test) => {
    if (test.user_status === 'COMPLETED' && test.exam_submission_id) {
        navigate(`/exam/result/${test.exam_submission_id}`);
    } else if (test.user_status === 'IN_PROGRESS' && test.exam_submission_id) {
        message.success("Resuming your exam...");
        navigate(`/exam/taking/${test.exam_submission_id}`);
    } else {
        navigate(`/exam/lobby/${test.id}`);
    }
  }, [navigate]);

  // 3. Filter & Search Logic
  const filteredExams = useMemo(() => {
    return exams.filter(t => {
      const matchSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchStatus = filterStatus === 'ALL' || t.user_status === filterStatus;
      
      return matchSearch && matchStatus;
    });
  }, [exams, searchTerm, filterStatus]);

  return {
    exams: filteredExams,       
    allExams: exams,            
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,               
    setFilterStatus,            
    handleAction,
    // 🔥 ĐÃ XÓA: startingTestId
    refresh: fetchExams         
  };
};
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminSubmissionApi } from '../../../api/IELTS/submissions/adminSubmissionApi'; 

export const useAdminSubmissions = () => {
  const navigate = useNavigate();
  
  // --- States ---
  const [submissions, setSubmissions] = useState([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [activeSkill, setActiveSkill] = useState('exam'); 
  const [statusFilter, setStatusFilter] = useState(''); 
  
  // States phân trang (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- Data Fetching ---
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const params = {
        skip,
        limit: pageSize,
        ...(statusFilter ? { status: statusFilter } : {})
      };
      
      const res = await adminSubmissionApi.getAllSubmissions(activeSkill, params);
      
      const apiData = res.data || res; 
      
      // 🐛 DEBUG LOG: Kiểm tra xem backend có trả về 'status' không!
      console.log(`[DEBUG] Raw API Data for ${activeSkill}:`, apiData);
      
      let items = [];
      let total = 0;

      if (apiData && Array.isArray(apiData.items)) {
        items = apiData.items;
        total = apiData.total || 0;
      } 
      else if (Array.isArray(apiData)) {
        items = apiData;
        total = apiData.length;
      }

      setSubmissions(items);
      setTotalSubmissions(total);

    } catch (error) {
      console.error("Fetch submissions error:", error);
      toast.error(`Failed to load ${activeSkill === 'exam' ? 'Full Test' : activeSkill} submissions`);
      setSubmissions([]); 
      setTotalSubmissions(0);
    } finally {
      setLoading(false);
    }
  }, [activeSkill, statusFilter, currentPage, pageSize]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Reset page về 1 khi đổi tab hoặc bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSkill, statusFilter]);

  // --- Handlers ---
  const handleViewDetails = (submissionId) => {
    if (activeSkill === 'exam') {
      navigate(`/admin/full-tests/result/${submissionId}`);
    } else {
      navigate(`/admin/skills/${activeSkill}/result/${submissionId}`); 
    }
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return {
    submissions,
    totalSubmissions, 
    currentPage,      
    pageSize,         
    loading,
    activeSkill, 
    setActiveSkill,
    statusFilter, 
    setStatusFilter,
    handleViewDetails,
    handlePageChange, 
    refreshData: fetchSubmissions
  };
};
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAdminApi } from '../../api/IELTS/exam/ExamAdminApi';
import axiosClient from '../../../../services/axiosClient';
import toast from 'react-hot-toast';

export const useExamCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State lưu danh sách các bài test lẻ để chọn
  const [options, setOptions] = useState({
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  });

  // State Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 180, // Mặc định 3 tiếng
    listening_test_id: '',
    reading_test_id: '',
    writing_test_id: '',
    speaking_test_id: '',
  });

  // 1. Fetch Options (Skill Tests)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        // Gọi song song 4 API để lấy danh sách bài test của từng kỹ năng
        // Lưu ý: params: { is_mock_selector: true } để Backend lọc ra các bài test phù hợp
        const [lis, read, write, speak] = await Promise.all([
          axiosClient.get('/listening/admin/tests', { params: { is_mock_selector: true } }),
          axiosClient.get('/reading/admin/tests', { params: { is_mock_selector: true } }),
          axiosClient.get('/writing/admin/tests', { params: { is_mock_selector: true } }),
          axiosClient.get('/speaking/admin/tests', { params: { is_mock_selector: true } }),
        ]);

        setOptions({
          listening: lis || [],
          reading: read || [],
          writing: write || [],
          speaking: speak || [],
        });
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi tải danh sách các bài thi kỹ năng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // 2. Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.title) return toast.error("Vui lòng nhập tên đề thi");
    
    setSubmitting(true);
    try {
      await examAdminApi.createTest(formData);
      toast.success('Tạo Mock Exam thành công!');
      navigate('/admin/full-tests');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Tạo thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    formData,
    options,
    handleChange,
    handleSubmit,
    navigate
  };
};
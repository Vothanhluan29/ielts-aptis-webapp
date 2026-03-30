import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAdminApi } from '../../api/IELTS/exam/ExamAdminApi';
import axiosClient from '../../../../services/axiosClient';
import toast from 'react-hot-toast';

export const useExamEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State options cho dropdown
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
    time_limit: 180,
    is_published: false,
    listening_test_id: '',
    reading_test_id: '',
    writing_test_id: '',
    speaking_test_id: '',
  });

  // 1. Fetch Data (Detail + Options)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song 5 API: 1 lấy chi tiết Exam, 4 lấy list options
        const [exam, lis, read, write, speak] = await Promise.all([
          examAdminApi.getTestDetail(id),
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

        // Map data vào form
        setFormData({
          title: exam.title,
          description: exam.description || '',
          time_limit: exam.time_limit || 180,
          is_published: exam.is_published,
          // Lưu ý: Backend trả về object (reading_test: {...}), ta cần lấy ID
          listening_test_id: exam.listening_test_id || (exam.listening_test?.id) || '',
          reading_test_id: exam.reading_test_id || (exam.reading_test?.id) || '',
          writing_test_id: exam.writing_test_id || (exam.writing_test?.id) || '',
          speaking_test_id: exam.speaking_test_id || (exam.speaking_test?.id) || '',
        });
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi tải dữ liệu bài thi.');
        navigate('/admin/full-tests');
      } finally {
        setLoading(false);
      }
    };

    if(id) fetchData();
  }, [id, navigate]);

  // 2. Handle Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 3. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Vui lòng nhập tên đề thi");

    setSaving(true);
    try {
      await examAdminApi.updateTest(id, formData);
      toast.success('Cập nhật bài thi thành công!');
      navigate('/admin/full-tests'); // Hoặc giữ lại trang nếu muốn
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Cập nhật thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return {
    id,
    loading,
    saving,
    formData,
    options,
    handleChange,
    handleSubmit,
    navigate
  };
};
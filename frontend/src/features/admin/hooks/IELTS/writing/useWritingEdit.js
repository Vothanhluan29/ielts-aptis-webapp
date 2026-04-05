import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { adminWritingApi } from '../../../api/IELTS/writing/adminWritingApi';

export const useWritingEdit = (id) => {
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 60,
    is_published: false,
    is_full_test_only: false,
  });

  const [tasks, setTasks] = useState([
    { task_type: 'TASK_1', question_text: '', image_url: '' },
    { task_type: 'TASK_2', question_text: '' },
  ]);

  const fetchDetail = useCallback(async () => {
    if (!isEditMode) return;
    try {
      setLoading(true);
      const res = await adminWritingApi.getTestDetail(id);
      const data = res.data || res;

      setFormData({
        title: data.title || '',
        description: data.description || '',
        time_limit: data.time_limit || 60,
        is_published: data.is_published || false,
        is_full_test_only: data.is_full_test_only || false,
      });

      if (data.tasks && data.tasks.length > 0) {
        const t1 = data.tasks.find(t => t.task_type === 'TASK_1');
        const t2 = data.tasks.find(t => t.task_type === 'TASK_2');

        setTasks([
          t1
            ? { task_type: 'TASK_1', question_text: t1.question_text, image_url: t1.image_url || '' }
            : { task_type: 'TASK_1', question_text: '', image_url: '' },
          t2
            ? { task_type: 'TASK_2', question_text: t2.question_text }
            : { task_type: 'TASK_2', question_text: '' }
        ]);
      }
    } catch (error) {
      console.error("Fetch detail error:", error);
      message.error('Failed to load test details.');
      navigate('/admin/skills/writing');
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTaskChange = (index, field, value) => {
    setTasks(prev => {
      const newTasks = [...prev];
      newTasks[index] = { ...newTasks[index], [field]: value };
      return newTasks;
    });
  };

  const uploadFileAPI = async (file) => {
    if (!file) return;
    try {
      setUploadingImg(true);
      const res = await adminWritingApi.uploadImage(file);
      const imageUrl = res.data?.url || res.url;
      handleTaskChange(0, 'image_url', imageUrl);
      message.success('Image uploaded successfully!');
    } catch (error) {
      console.error("Upload error:", error);
      message.error('Image upload failed.');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFileAPI(file);
    }
    e.target.value = null;
  };

  const removeImage = () => {
    handleTaskChange(0, 'image_url', '');
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadFileAPI(file);
    } else {
      message.error('Please drop a valid image file (JPG, PNG).');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      return message.error('Please enter the test title.');
    }

    if (tasks.some(p => !p.question_text.trim())) {
      return message.error('Please enter questions for both Task 1 and Task 2.');
    }

    const payload = {
      ...formData,
      tasks: tasks
    };

    try {
      setLoading(true);
      if (isEditMode) {
        await adminWritingApi.updateTest(id, payload);
        message.success('Test updated successfully!');
        navigate('/admin/skills/writing');
      } else {
        const res = await adminWritingApi.createTest(payload);
        message.success('New test created successfully!');

        const newId = res.data?.id || res.id;
        if (newId) {
          navigate(`/admin/skills/writing/edit/${newId}`, { replace: true });
        } else {
          navigate('/admin/skills/writing');
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      message.error('An error occurred while saving the test.');
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditMode,
    loading,
    uploadingImg,
    isDragging,
    formData,
    tasks,
    handleFormChange,
    handleTaskChange,
    handleImageUpload,
    removeImage,
    onDragOver,
    onDragLeave,
    onDrop,
    handleSubmit
  };
};
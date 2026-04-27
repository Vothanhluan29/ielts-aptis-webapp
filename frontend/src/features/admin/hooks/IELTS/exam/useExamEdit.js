import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message } from 'antd'; 
import { examAdminApi } from '../../../api/IELTS/exam/ExamAdminApi';
import { listeningAdminApi } from '../../../api/IELTS/listening/listeningAdminApi';
import { readingAdminApi } from '../../../api/IELTS/reading/readingAdminApi';
import { adminWritingApi } from '../../../api/IELTS/writing/adminWritingApi';
import { adminSpeakingApi } from '../../../api/IELTS/speaking/adminSpeakingApi';

export const useExamEdit = (id) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const isEditMode = !!id;
  
  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // States lưu danh sách đề của 4 kỹ năng
  const [listeningTests, setListeningTests] = useState([]);
  const [readingTests, setReadingTests] = useState([]);
  const [writingTests, setWritingTests] = useState([]);
  const [speakingTests, setSpeakingTests] = useState([]);

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const filterParams = { is_full_test_only: true };

        const [listenRes, readRes, writeRes, speakRes] = await Promise.all([
          listeningAdminApi.getAllTests(filterParams),
          readingAdminApi.getAllTests(filterParams),
          adminWritingApi.getAllTests(filterParams),
          adminSpeakingApi.getAllTests(filterParams)
        ]);

        const extractAndFilter = (res) => {
          const rawData = res?.data?.items || res?.data || res || [];
          const dataArray = Array.isArray(rawData) ? rawData : [];
          return dataArray.filter(test => test.is_full_test_only === true);
        };

        setListeningTests(extractAndFilter(listenRes));
        setReadingTests(extractAndFilter(readRes));
        setWritingTests(extractAndFilter(writeRes));
        setSpeakingTests(extractAndFilter(speakRes));


        if (isEditMode) {
          const examRes = await examAdminApi.getTestDetail(id);
          const examData = examRes?.data || examRes;
          
          form.setFieldsValue({
            title: examData?.title,
            description: examData?.description,
            is_published: examData?.is_published,
            
            listening_test_id: examData?.listening_test?.id || examData?.listening_test_id,
            reading_test_id: examData?.reading_test?.id || examData?.reading_test_id,
            writing_test_id: examData?.writing_test?.id || examData?.writing_test_id,
            speaking_test_id: examData?.speaking_test?.id || examData?.speaking_test_id,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        message.error("Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await examAdminApi.updateTest(id, values);
        message.success('Exam updated successfully!');
      } else {
        await examAdminApi.createTest(values);
        message.success('Exam created successfully!');
      }
      navigate('/admin/full-tests');
    } catch (error) {
      console.error("Error saving exam:", error);
      message.error('Failed to save the exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    isEditMode,
    loading,
    submitting,
    onFinish,
    listeningTests,
    readingTests,
    writingTests,
    speakingTests,
    navigate
  };
};
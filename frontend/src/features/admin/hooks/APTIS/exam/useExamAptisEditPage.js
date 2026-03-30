import { useState, useEffect } from 'react';
import { message } from 'antd';
import examAptisAdminApi from '../../../api/APTIS/exam/examAptisAdminApi';
import axiosClient from '../../../../../services/axiosClient';

export const useExamAptisEditPage = (id, form, navigate) => {
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [initialData, setInitialData] = useState({
    is_published: false,
  });

  const [componentOptions, setComponentOptions] = useState({
    grammarVocab: [],
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  });

  useEffect(() => {
    const initPageData = async () => {
      setLoading(true);
      try {
        const fetchParams = {
          params: {
            is_mock_selector: true,
            limit: 100,
          },
        };

        const [gv, lis, read, write, speak] = await Promise.all([
          axiosClient.get('/aptis/grammar-vocab/admin/tests', fetchParams),
          axiosClient.get('/aptis/listening/admin/tests', fetchParams),
          axiosClient.get('/aptis/reading/admin/tests', fetchParams),
          axiosClient.get('/aptis/writing/admin/tests', fetchParams),
          axiosClient.get('/aptis/speaking/admin/tests', fetchParams),
        ]);

        const extractData = (res) =>
          res?.data?.items || res?.items || res?.data || res || [];

        setComponentOptions({
          grammarVocab: extractData(gv),
          listening: extractData(lis),
          reading: extractData(read),
          writing: extractData(write),
          speaking: extractData(speak),
        });

        if (isEditMode) {
          const detailRes = await examAptisAdminApi.getFullTestDetail(id);
          const data = detailRes.data || detailRes;

          const publishedStatus =
            data.is_published === true ||
            data.is_published === 1 ||
            data.is_published === '1';

          setInitialData({
            title: data.title,
            description: data.description,
            is_published: publishedStatus,
            grammar_vocab_test_id: data.grammar_vocab_test_id,
            listening_test_id: data.listening_test_id,
            reading_test_id: data.reading_test_id,
            writing_test_id: data.writing_test_id,
            speaking_test_id: data.speaking_test_id,
          });
        }
      } catch (error) {
        console.error('Initialization error:', error);
        message.error('Unable to load test structure data!');
      } finally {
        setLoading(false);
      }
    };

    initPageData();
  }, [id, isEditMode]);

  useEffect(() => {
    if (!loading) {
      form.setFieldsValue(initialData);
    }
  }, [loading, initialData, form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      if (isEditMode) {
        await examAptisAdminApi.updateFullTest(id, values);
        message.success('Test updated successfully!');
      } else {
        await examAptisAdminApi.createFullTest(values);
        message.success('New test created successfully!');
      }

      navigate('/admin/aptis/full-tests');
    } catch (error) {
      console.error('Save error:', error);
      message.error(
        error.response?.data?.detail ||
          'An error occurred while saving data. Please try again!'
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    isEditMode,
    loading,
    saving,
    initialData,
    componentOptions,
    onFinish,
  };
};
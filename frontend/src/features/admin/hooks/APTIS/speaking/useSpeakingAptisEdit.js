import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import speakingAptisApi from '../../../api/APTIS/speaking/speakingAptisAdminApi';
import { useAutoSaveDraft } from '../../../../../hooks/useAutoSaveDraft';

// Define the standard Aptis Speaking structure
export const PART_CONFIGS = [
  { type: "PART_1", title: "Part 1", qCount: 3, images: 0 },
  { type: "PART_2", title: "Part 2", qCount: 3, images: 1 },
  { type: "PART_3", title: "Part 3", qCount: 3, images: 2 },
  { type: "PART_4", title: "Part 4", qCount: 3, images: 1 },
];

export const useSpeakingAptisEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const isEditMode = Boolean(id);
  const storageKey = isEditMode ? `aptis-speaking-edit-${id}-draft` : `aptis-speaking-create-draft`;

  const {
    draftExists,
    lastSavedTime,
    handleFormChange,
    restoreDraft,
    clearDraft,
    enableAutoSave
  } = useAutoSaveDraft(storageKey, form);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. INITIALIZE DEFAULT STRUCTURE
  const initDefaultData = useCallback(() => {
    const defaultParts = PART_CONFIGS.map((config, pIndex) => {
      const isPart4 = config.type === "PART_4";
      // Keep default timing configuration in the data
      const defaultPrepTime = isPart4 ? 60 : 0; 
      const defaultResponseTime = isPart4 ? 120 : (config.type === "PART_1" ? 30 : 45);

      const questions = Array.from({ length: config.qCount }).map((_, qIndex) => ({
        order_number: qIndex + 1,
        question_text: "",
        audio_url: "", 
        prep_time: qIndex === 0 ? defaultPrepTime : 0, 
        response_time: isPart4 && qIndex > 0 ? 0 : defaultResponseTime 
      }));

      return {
        part_number: pIndex + 1,
        part_type: config.type,
        instruction: "",
        image_url: "", 
        image_url_2: "", 
        questions: questions
      };
    });

    form.setFieldsValue({ 
      title: "", 
      time_limit: 12, 
      description: "", 
      is_published: false, 
      is_full_test_only: false, 
      parts: defaultParts 
    });
    enableAutoSave();
  }, [form, enableAutoSave]);

  // 2. FETCH DATA & MERGE WITH DEFAULT STRUCTURE
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await speakingAptisApi.getTestDetail(id);
      const data = res.data || res;
      
      const fetchedParts = data.parts || [];
      
      const mergedParts = PART_CONFIGS.map((config, pIndex) => {
        const fetchedPart = fetchedParts.find(p => p.part_type === config.type) || {};
        
        const isPart4 = config.type === "PART_4";
        const defaultPrepTime = isPart4 ? 60 : 0; 
        const defaultResponseTime = isPart4 ? 120 : (config.type === "PART_1" ? 30 : 45);

        const mergedQuestions = Array.from({ length: config.qCount }).map((_, qIndex) => {
          const fetchedQ = (fetchedPart.questions || []).find(q => q.order_number === qIndex + 1) || {};
          
          return {
            order_number: qIndex + 1,
            question_text: fetchedQ.question_text || "",
            audio_url: fetchedQ.audio_url || "",
            prep_time: fetchedQ.prep_time !== undefined ? fetchedQ.prep_time : (qIndex === 0 ? defaultPrepTime : 0),
            response_time: fetchedQ.response_time !== undefined ? fetchedQ.response_time : (isPart4 && qIndex > 0 ? 0 : defaultResponseTime)
          };
        });

        return {
          part_number: pIndex + 1,
          part_type: config.type,
          instruction: fetchedPart.instruction || "",
          image_url: fetchedPart.image_url || "",
          image_url_2: fetchedPart.image_url_2 || "",
          questions: mergedQuestions
        };
      });

      form.setFieldsValue({
        ...data,
        parts: mergedParts
      });
      enableAutoSave();

    } catch (error) {
      message.error('Failed to load Speaking test data. Please try again!');
      navigate('/admin/aptis/speaking');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate, enableAutoSave]);

  useEffect(() => {
    if (isEditMode) {
      fetchDetail();
    } else {
      initDefaultData();
    }
  }, [isEditMode, initDefaultData, fetchDetail]);

  // 3. FILE UPLOAD HANDLER
  const handleUploadFile = async (options, fieldPath, apiCall) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await apiCall(file);
      const url = res.data?.url || res.url;
      form.setFieldValue(fieldPath, url);
      onSuccess("Ok");
      message.success('File uploaded successfully!');
    } catch (err) {
      onError({ err });
      message.error('File upload failed!');
    }
  };

  // 4. SUBMIT FORM
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await speakingAptisApi.updateTest(id, values);
        message.success('Test updated successfully!');
      } else {
        await speakingAptisApi.createTest(values);
        message.success('New test created successfully!');
      }
      clearDraft();
      navigate('/admin/aptis/speaking');
    } catch (error) {
      message.error(error.response?.data?.detail || 'Failed to save the test. Please try again!');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    id,
    form,
    isEditMode,
    loading,
    submitting,
    handleUploadFile,
    onFinish,
    navigate,
    draftExists,
    lastSavedTime,
    handleFormChange,
    restoreDraft,
    clearDraft,
  };
};
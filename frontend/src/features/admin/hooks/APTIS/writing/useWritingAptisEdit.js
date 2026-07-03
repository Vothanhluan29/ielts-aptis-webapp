import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import { 
  MessageOutlined, FormOutlined, FileTextOutlined, MailOutlined 
} from '@ant-design/icons';
import writingAptisAdminApi from '../../../api/APTIS/writing/writingAptisAdminApi';
import { useAutoSaveDraft } from '../../../../../hooks/useAutoSaveDraft';export const PART_CONFIGS = [
  { type: "PART_1", title: "Part 1",  qCount: 5 },
  { type: "PART_2", title: "Part 2",  qCount: 1 },
  { type: "PART_3", title: "Part 3",  qCount: 3 },
  { type: "PART_4", title: "Part 4",  qCount: 3 },
];

export const useWritingAptisEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isEditMode = Boolean(id);
  const storageKey = isEditMode ? `aptis-writing-edit-${id}-draft` : `aptis-writing-create-draft`;

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
  const initDefaultData = useCallback(() => {
    const defaultParts = PART_CONFIGS.map((config, pIndex) => {
      let questions = [];
      
      if (config.type === "PART_4") {
        questions = [
          { order_number: 1, sub_type: "scenario", question_text: "" },
          { order_number: 2, sub_type: "informal", question_text: "" },
          { order_number: 3, sub_type: "formal", question_text: "" }
        ];
      } else {
        questions = Array.from({ length: config.qCount }).map((_, qIndex) => ({
          order_number: qIndex + 1,
          sub_type: null,
          question_text: ""
        }));
      }

      return {
        part_number: pIndex + 1,
        part_type: config.type,
        instruction: "",
        image_url: "",
        image_description: "",
        questions: questions
      };
    });

    form.setFieldsValue({ 
      title: "", 
      time_limit: 50, 
      description: "",
      is_published: false, 
      is_full_test_only: false, 
      parts: defaultParts 
    });
    enableAutoSave();
  }, [form, enableAutoSave]);

  // ==========================================
  // 2. FETCH & MERGE DATA FROM DB
  // ==========================================
  useEffect(() => {
    if (isEditMode) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await writingAptisAdminApi.getTestDetail(id);
          const data = res.data || res;

          const mergedParts = PART_CONFIGS.map((config, pIndex) => {
            const existingPart = data.parts?.find(p => p.part_type === config.type);

            if (existingPart) {
              return {
                ...existingPart,
                image_url: existingPart.image_url || "",
                image_description: existingPart.image_description || ""
              };
            }

            let defaultQuestions = [];
            if (config.type === "PART_4") {
              defaultQuestions = [
                { order_number: 1, sub_type: "scenario", question_text: "" },
                { order_number: 2, sub_type: "informal", question_text: "" },
                { order_number: 3, sub_type: "formal", question_text: "" }
              ];
            } else {
              defaultQuestions = Array.from({ length: config.qCount }).map((_, qIndex) => ({
                order_number: qIndex + 1,
                sub_type: null,
                question_text: ""
              }));
            }

            return {
              part_number: pIndex + 1,
              part_type: config.type,
              instruction: "",
              image_url: "",
              image_description: "",
              questions: defaultQuestions
            };
          });

          form.setFieldsValue({
            ...data,
            parts: mergedParts
          });
          enableAutoSave();
        } catch (error) {
          message.error('Failed to load Writing test data. Please try again!');
          navigate('/admin/aptis/writing');
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else {
      initDefaultData();
    }
  }, [id, isEditMode, initDefaultData, navigate, form, enableAutoSave]);

  // ==========================================
  // 3. SUBMIT DATA
  // ==========================================
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      if (isEditMode) {
        await writingAptisAdminApi.updateTest(id, values);
        message.success('Test updated successfully!');
      } else {
        await writingAptisAdminApi.createTest(values);
        message.success('Test created successfully!');
      }
      clearDraft();
      navigate('/admin/aptis/writing');
    } catch (error) {
      message.error(error.response?.data?.detail || 'Failed to save the test. Please try again!');
      console.error(error);
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
    onFinish,
    navigate,
    draftExists,
    lastSavedTime,
    handleFormChange,
    restoreDraft,
    clearDraft,
  };
};
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, message } from 'antd';

import listeningAptisAdminApi from '../../../api/APTIS/listening/listeningAptisAdminApi';

export const useListeningAptisEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePartKeys, setActivePartKeys] = useState(['0']);

  // ==========================================
  // FETCH DATA VÀ FORMAT VÀO FORM
  // ==========================================
  const fetchTestDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listeningAptisAdminApi.getTestDetail(id);
      const data = response.data || response;
      
      const formattedParts = data.parts?.map(part => {
        // Gộp tất cả câu hỏi từ các groups lại
        const allQuestions = part.groups?.reduce((acc, group) => {
          const mappedQs = (group.questions || []).map(q => {
            let optionsArray = ['', '', '', '', '']; 
            let correctIndex = q.correct_answer; 

            if (q.question_type !== 'SHORT_ANSWER') {
              if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                // Xử lý Multiple Choice Object (A, B, C...)
                const keys = ["A", "B", "C", "D", "E"];
                optionsArray = keys.map(k => q.options[k] || '');
                const foundIndex = keys.findIndex(k => q.options[k] === q.correct_answer);
                if (foundIndex !== -1) correctIndex = foundIndex.toString();
              } else if (Array.isArray(q.options)) {
                // Xử lý Array cho Matching
                optionsArray = [...q.options];
                const foundIdx = optionsArray.findIndex(opt => opt === q.correct_answer);
                if(foundIdx !== -1) correctIndex = foundIdx.toString();
              }
            }

            return { 
              ...q,
              question_type: q.question_type || 'MULTIPLE_CHOICE',
              options: optionsArray, 
              correct_answer: correctIndex, 
              audio_url: q.audio_url || group.audio_url || '' 
            };
          });
          return [...acc, ...mappedQs];
        }, []) || [];

        return {
          ...part,
          title: part.title || `Part ${part.part_number}`,
          audio_url: part.groups?.[0]?.audio_url || '',
          questions: allQuestions
        };
      }) || [];

      form.setFieldsValue({
        title: data.title,
        description: data.description || '', 
        time_limit: data.time_limit,
        is_published: data.is_published,
        is_full_test_only: data.is_full_test_only,
        parts: formattedParts,
      });
      
      // Tự động mở tất cả Panel để Form Validation nhận diện được
      setActivePartKeys(formattedParts.map((_, idx) => idx.toString()));
    } catch (error) {
      message.error('Failed to load Listening test details!', error.response?.data?.message || error.message);
      navigate('/admin/aptis/listening');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  // Khởi tạo dữ liệu
  useEffect(() => {
    if (isEditMode) {
      fetchTestDetail();
    } else {
      form.setFieldsValue({
        time_limit: 40,
        is_published: false,
        is_full_test_only: false,
        description: '', 
        parts: [
          {
            part_number: 1,
            title: 'Part 1: Word Recognition',
            audio_url: '',
            questions: [{ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' }]
          }
        ]
      });
    }
  }, [isEditMode, fetchTestDetail, form]);

  // ==========================================
  // XỬ LÝ SUBMIT DATA
  // ==========================================
  const onFinishFailed = (errorInfo) => {
    console.error('Validation Failed:', errorInfo);
    message.error(' Update failed! Please complete all required fields.');
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      let globalQuestionNumber = 1;

      const payload = {
        title: values.title,
        description: values.description, 
        time_limit: Number(values.time_limit),
        is_published: Boolean(values.is_published),
        is_full_test_only: Boolean(values.is_full_test_only),
        
        parts: values.parts?.map((part, pIndex) => {
          const mappedQuestions = part.questions?.map((q) => {
            let finalOptions;
            let exactCorrectText = "";

            if (q.question_type === 'MATCHING') {
              finalOptions = (q.options || []).filter(opt => opt && opt.trim() !== '');
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";
            } 
            else if (q.question_type === 'SHORT_ANSWER') {
              finalOptions = {}; 
              exactCorrectText = q.correct_answer?.trim() || "";
            } 
            else {
              // MULTIPLE_CHOICE
              const optionsDict = {};
              const labels = ["A", "B", "C", "D", "E"]; 
              if (q.options && q.options.length > 0) {
                q.options.forEach((opt, i) => {
                  if (opt && opt.trim() !== '') optionsDict[labels[i]] = opt.trim();
                });
              }
              finalOptions = optionsDict;
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";
            }

            return {
              question_number: globalQuestionNumber++,
              question_text: q.question_text || "",
              question_type: q.question_type || "MULTIPLE_CHOICE",
              options: finalOptions, 
              correct_answer: exactCorrectText, 
              explanation: q.explanation || "",
              audio_url: q.audio_url || "" 
            };
          }) || [];

          return {
            part_number: pIndex + 1,
            title: part.title || `Part ${pIndex + 1}`,
            groups: [
              {
                instruction: part.title || `Part ${pIndex + 1}`,
                audio_url: part.audio_url || "", 
                order: 1,
                questions: mappedQuestions
              }
            ]
          };
        }) || []
      };

      if (isEditMode) {
        await listeningAptisAdminApi.updateTest(id, payload);
        message.success('Listening test updated successfully!');
      } else {
        await listeningAptisAdminApi.createTest(payload);
        message.success('New Listening test created successfully!');
      }
      navigate('/admin/aptis/listening');
    } catch (error) {
      console.error(error.response?.data);
      message.error('Failed to submit data! Please review and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // XỬ LÝ UPLOAD AUDIO
  // ==========================================
  const handleUploadAudio = async (options, partName, qName = null) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await listeningAptisAdminApi.uploadAudio(file);
      const audioUrl = res.data?.url || res.url; 
      
      if (qName !== null) {
        form.setFieldValue(['parts', partName, 'questions', qName, 'audio_url'], audioUrl);
      } else {
        form.setFieldValue(['parts', partName, 'audio_url'], audioUrl);
      }

      onSuccess("Ok");
      message.success(`${file.name} uploaded successfully!`);
    } catch (err) {
      onError({ err });
      message.error(`${file.name} upload failed.`);
    }
  };

  return {
    id,
    form,
    isEditMode,
    loading,
    submitting,
    activePartKeys,
    setActivePartKeys,
    onFinish,
    onFinishFailed,
    handleUploadAudio,
    navigate
  };
};
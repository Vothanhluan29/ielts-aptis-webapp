import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import readingAptisAdminApi from '../../../api/APTIS/reading/readingAptisAdminApi';

export const useReadingAptisEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePartKeys, setActivePartKeys] = useState(['0']);

  // ==========================================
  // FETCH DATA VÀ ĐỔ VÀO FORM
  // ==========================================
  const fetchTestDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await readingAptisAdminApi.getTestDetail(id);
      const data = response.data || response;
      
      const formattedParts = data.parts?.map(part => {
        const allQuestions = part.groups?.reduce((acc, group) => {
          const mappedQs = (group.questions || []).map(q => {
            let optionsArray = [];
            let correctIndex = q.correct_answer; 

            if (q.question_type === 'MULTIPLE_CHOICE') {
              if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                const labels = ["A", "B", "C", "D"];
                optionsArray = labels.map(l => q.options[l] || '');
                const foundIdx = optionsArray.findIndex(opt => opt === q.correct_answer);
                if (foundIdx !== -1) correctIndex = foundIdx.toString();
              }
            } else if (q.question_type === 'REORDER_SENTENCES') {
              optionsArray = Array.isArray(q.options) ? [...q.options] : [];
              if (typeof q.correct_answer === 'string' && /[A-Za-z]/.test(q.correct_answer)) {
                const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
                const parts = q.correct_answer.split(/[-,\s]+/).filter(Boolean);
                correctIndex = parts.map(l => letters.indexOf(l.toUpperCase()).toString());
              } 
              else if (typeof q.correct_answer === 'string' && q.correct_answer.includes(',')) {
                correctIndex = q.correct_answer.split(',');
              } 
              else {
                correctIndex = q.correct_answer;
              }
            }
            else if (q.question_type === 'MATCHING_OPINIONS' || q.question_type === 'MATCHING_HEADINGS') {
              optionsArray = Array.isArray(q.options) ? [...q.options] : [];
              const foundIdx = optionsArray.findIndex(opt => opt === q.correct_answer);
              if (foundIdx !== -1) correctIndex = foundIdx.toString();
            }

            return { 
              ...q,
              options: optionsArray, 
              correct_answer: correctIndex
            };
          });
          return [...acc, ...mappedQs];
        }, []) || [];

        return {
          ...part,
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
      // Mở hết Collapse
      setActivePartKeys(formattedParts.map((_, idx) => idx.toString()));
    } catch (error) {
      message.error('Failed to load test data!', error.message);
      navigate('/admin/aptis/reading');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  useEffect(() => {
    if (isEditMode) {
      fetchTestDetail();
    } else {
      form.setFieldsValue({
        time_limit: 35,
        is_published: false,
        is_full_test_only: false,
        description: '', 
        parts: [
          {
            part_number: 1,
            title: 'Part 1: Sentence Comprehension',
            content: '',
            questions: [{ question_type: 'FILL_IN_BLANKS', options: [], correct_answer: '' }]
          }
        ]
      });
    }
  }, [isEditMode, fetchTestDetail, form]);

  // ==========================================
  // XỬ LÝ SUBMIT LÊN SERVER
  // ==========================================
  const onFinishFailed = (errorInfo) => {
    console.error('Validation Failed:', errorInfo);
    message.error('❌ Please fill in all required fields (check closed Parts).');
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

            if (q.question_type === 'REORDER_SENTENCES') {
              finalOptions = (q.options || []).filter(opt => opt && opt.trim() !== '');
              let ans = q.correct_answer || "";
              if (Array.isArray(ans)) ans = ans.join(',');
              
              if (/^[0-9,\s]+$/.test(ans)) {
                const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
                exactCorrectText = ans.split(',').map(idx => letters[Number(idx.trim())]).join('-');
              } else {
                exactCorrectText = ans.toUpperCase().replace(/,/g, '-');
              }
            }
            else if (q.question_type === 'MATCHING_OPINIONS' || q.question_type === 'MATCHING_HEADINGS') {
              finalOptions = (q.options || []).filter(opt => opt && opt.trim() !== '');
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";
            } 
            else if (q.question_type === 'FILL_IN_BLANKS') {
              finalOptions = {}; 
              exactCorrectText = q.correct_answer?.trim() || "";
            } 
            else {
              // MULTIPLE CHOICE
              const optionsDict = {};
              const labels = ["A", "B", "C", "D"];
              if (Array.isArray(q.options)) {
                q.options.forEach((opt, i) => {
                  if (opt && opt.trim() !== '') optionsDict[labels[i]] = opt.trim();
                });
              }
              finalOptions = optionsDict;
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";
            }

            const currentQuestionNumber = globalQuestionNumber++;

            return {
              question_number: currentQuestionNumber,
              question_text: q.question_text || "",
              question_type: q.question_type,
              options: finalOptions,
              correct_answer: exactCorrectText,
              explanation: q.explanation || ""
            };
          }) || [];

          return {
            part_number: pIndex + 1,
            title: part.title || `Part ${pIndex + 1}`,
            content: part.content || "",
            groups: [{
              instruction: part.title,
              order: 1,
              questions: mappedQuestions
            }]
          };
        }) || []
      };

      if (isEditMode) {
        await readingAptisAdminApi.updateTest(id, payload);
        message.success('Test updated successfully!');
      } else {
        await readingAptisAdminApi.createTest(payload);
        message.success('Test created successfully!');
      }
      navigate('/admin/aptis/reading');
    } catch (error) {
      console.error("Payload error:", error);
      message.error('Save failed! Please check your input data.');
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
    activePartKeys,
    setActivePartKeys,
    onFinish,
    onFinishFailed,
    navigate
  };
};
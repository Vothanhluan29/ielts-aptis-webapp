import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import readingAptisAdminApi from '../../../api/APTIS/reading/readingAptisAdminApi';

const MAX_PARTS = 5;
const MAX_QUESTIONS = 30; // Đã nâng lên 35 để phù hợp cấu trúc Aptis thực tế

export const useReadingAptisEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePartKeys, setActivePartKeys] = useState(['0']);

  // ==========================================
  // 1. FETCH DỮ LIỆU ĐỀ THI (EDIT MODE)
  // ==========================================
  const fetchTestDetail = useCallback(async () => {
    setLoading(true);

    try {
      const response = await readingAptisAdminApi.getTestDetail(id);
      const data = response.data || response;

      const formattedParts = data.parts?.map((part) => {
        const allQuestions = part.groups?.reduce((acc, group) => {
          const mappedQs = (group.questions || []).map((q) => {
            let optionsArray = [];
            let correctIndex = q.correct_answer;

            // Xử lý Multiple Choice
            if (q.question_type === 'MULTIPLE_CHOICE') {
              if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                const keys = Object.keys(q.options).sort();
                optionsArray = keys.map((k) => q.options[k] || '');
                const foundIdx = optionsArray.findIndex((opt) => opt === q.correct_answer);
                if (foundIdx !== -1) correctIndex = foundIdx.toString();
              }
            } 
            // 🔥 TỐI ƯU XỬ LÝ REORDER_SENTENCES (Decode từ "A-B-C" -> ["0", "1", "2"])
            else if (q.question_type === 'REORDER_SENTENCES') {
              optionsArray = Array.isArray(q.options) ? [...q.options] : [];

              if (typeof q.correct_answer === 'string' && /[A-Za-z]/.test(q.correct_answer)) {
                const parts = q.correct_answer.split(/[-,\s]+/).filter(Boolean);
                // Dùng mã ASCII (A=65) thay vì mảng hardcode, tránh lỗi thiếu chữ cái
                correctIndex = parts.map((l) => (l.toUpperCase().charCodeAt(0) - 65).toString());
              } else if (typeof q.correct_answer === 'string' && q.correct_answer.includes(',')) {
                correctIndex = q.correct_answer.split(',').map(item => item.trim());
              } else {
                correctIndex = q.correct_answer;
              }
            } 
            // Xử lý Matching
            else if (q.question_type === 'MATCHING_OPINIONS' || q.question_type === 'MATCHING_HEADINGS') {
              optionsArray = Array.isArray(q.options) ? [...q.options] : [];
              const foundIdx = optionsArray.findIndex((opt) => opt === q.correct_answer);
              if (foundIdx !== -1) correctIndex = foundIdx.toString();
            }

            return {
              ...q,
              options: optionsArray,
              correct_answer: correctIndex,
            };
          });

          return [...acc, ...mappedQs];
        }, []) || [];

        return {
          ...part,
          questions: allQuestions,
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

      setActivePartKeys(formattedParts.map((_, idx) => idx.toString()));
    } catch (error) {
      message.error(`Failed to load test data! ${error?.message || ''}`);
      navigate('/admin/aptis/reading');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  // ==========================================
  // 2. INITIALIZE FORM
  // ==========================================
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
            questions: [
              {
                question_type: 'FILL_IN_BLANKS',
                options: [],
                correct_answer: '',
              },
            ],
          },
        ],
      });
    }
  }, [isEditMode, fetchTestDetail, form]);

  const onFinishFailed = (errorInfo) => {
    console.error('Validation Failed:', errorInfo);
    message.error('Please fill in all required fields (check closed parts).');
  };

  // ==========================================
  // 3. SUBMIT FORM (CREATE/UPDATE)
  // ==========================================
  const onFinish = async (values) => {
    const partsCount = values.parts?.length || 0;

    if (partsCount > MAX_PARTS) {
      message.error(`Limit exceeded: Reading test can contain a maximum of ${MAX_PARTS} parts.`);
      return;
    }

    const totalQuestions = values.parts?.reduce((total, part) => total + (part.questions?.length || 0), 0) || 0;

    // 🔥 TỐI ƯU: Cho phép lên tới 35 câu (Max thực tế)
    if (totalQuestions > MAX_QUESTIONS) {
      message.error(`Limit exceeded: Reading test can contain a maximum of ${MAX_QUESTIONS} questions (Current: ${totalQuestions}).`);
      return;
    }

    if (totalQuestions === 0) {
      message.warning('Please add at least one question before saving the test.');
      return;
    }

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
            let exactCorrectText = '';

            // 🔥 TỐI ƯU XỬ LÝ REORDER_SENTENCES (Encode ra dạng chuẩn "A-B-C")
            if (q.question_type === 'REORDER_SENTENCES') {
              finalOptions = (q.options || []).filter((opt) => opt && opt.trim() !== '');

              let ans = q.correct_answer || '';
              if (Array.isArray(ans)) ans = ans.join(',');

              if (/^[0-9,\s]+$/.test(ans)) {
                // Biến đổi index từ component ("0, 1, 2") thành "A-B-C"
                exactCorrectText = ans
                  .split(',')
                  .map((idx) => String.fromCharCode(65 + Number(idx.trim())))
                  .join('-');
              } else {
                // Xử lý Admin nhập tay ("A, B, C", "a b c"...) -> Ép kiểu về "A-B-C" sạch
                exactCorrectText = ans
                  .toUpperCase()
                  .replace(/[^A-Z]/g, '') // Càn quét mọi ký tự không phải chữ cái
                  .split('')
                  .join('-'); 
              }
            } 
            // Xử lý Matching Opinions / Headings
            else if (q.question_type === 'MATCHING_OPINIONS' || q.question_type === 'MATCHING_HEADINGS') {
              finalOptions = (q.options || []).filter((opt) => opt && opt.trim() !== '');
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || '';
            } 
            // Xử lý Fill in the blanks
            else if (q.question_type === 'FILL_IN_BLANKS') {
              finalOptions = {};
              exactCorrectText = q.correct_answer?.trim() || '';
            } 
            // Xử lý Multiple Choice
            else {
              const optionsDict = {};
              if (Array.isArray(q.options)) {
                q.options.forEach((opt, i) => {
                  if (opt && opt.trim() !== '') {
                    const letter = String.fromCharCode(65 + i);
                    optionsDict[letter] = opt.trim();
                  }
                });
              }
              finalOptions = optionsDict;
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || '';
            }

            return {
              question_number: globalQuestionNumber++,
              question_text: q.question_text || '',
              question_type: q.question_type,
              options: finalOptions,
              correct_answer: exactCorrectText,
              explanation: q.explanation || '',
            };
          }) || [];

          return {
            part_number: pIndex + 1,
            title: part.title || `Part ${pIndex + 1}`,
            content: part.content || '',
            groups: [
              {
                instruction: part.title,
                order: 1,
                questions: mappedQuestions,
              },
            ],
          };
        }) || [],
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
      console.error('Payload error:', error);
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
    navigate,
  };
};
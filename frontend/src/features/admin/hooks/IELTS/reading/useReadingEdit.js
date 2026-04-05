import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import { readingAdminApi } from '../../../api/IELTS/reading/readingAdminApi';

export const useReadingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!id;

  const fetchTestDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await readingAdminApi.getTestDetail(id);
      const data = res.data || res;
      form.setFieldsValue(data);
    } catch (error) {
      console.error("Fetch Test Detail Error:", error);
      message.error("Failed to load test data.");
      navigate('/admin/skills/reading');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  useEffect(() => {
    if (isEditMode) {
      fetchTestDetail();
    } else {
      form.setFieldsValue({
        time_limit: 60,
        is_published: false,
        is_full_test_only: false,
        passages: [
          {
            order: 1,
            title: '',
            content: '',
            groups: [
              {
                order: 1,
                instruction: '',
                questions: [
                  {
                    question_number: 1,
                    question_type: 'MULTIPLE_CHOICE',
                    question_text: '',
                    correct_answers: []
                  }
                ]
              }
            ]
          }
        ]
      });
    }
  }, [isEditMode, form, fetchTestDetail]);

  const handleSave = async (values) => {
    try {
      setLoading(true);

      let cleanPayload = { ...values };

      if (cleanPayload.passages) {
        cleanPayload.passages = cleanPayload.passages
          .filter((p) => p !== null && p !== undefined)
          .map((p) => {
            const cleanGroups = (p.groups || [])
              .filter((g) => g !== null && g !== undefined)
              .map((g) => {
                const cleanQuestions = (g.questions || [])
                  .filter((q) => q !== null && q !== undefined);
                return { ...g, questions: cleanQuestions };
              });
            return { ...p, groups: cleanGroups };
          });
      }

      if (isEditMode) {
        await readingAdminApi.updateTest(id, cleanPayload);
        message.success("Test updated successfully!");
      } else {
        await readingAdminApi.createTest(cleanPayload);
        message.success("New test created successfully!");
      }

      navigate('/admin/skills/reading');
    } catch (error) {
      console.error("Save Test Error:", error);
      const msg = error.response?.data?.detail || "An error occurred while saving the test.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getNextQuestionNumber = useCallback(() => {
    const passages = form.getFieldValue('passages') || [];
    let maxNumber = 0;

    passages.forEach(p => {
      if (p?.groups) {
        p.groups.forEach(g => {
          if (g?.questions) {
            g.questions.forEach(q => {
              const currentNum = parseInt(q?.question_number, 10);
              if (!isNaN(currentNum) && currentNum > maxNumber) {
                maxNumber = currentNum;
              }
            });
          }
        });
      }
    });

    return maxNumber + 1;
  }, [form]);

  const recalculateAllQuestionNumbers = useCallback(() => {
    const currentValues = form.getFieldsValue();
    let currentNumber = 1;

    if (currentValues.passages) {
      currentValues.passages.forEach(p => {
        if (p?.groups) {
          p.groups.forEach(g => {
            if (g?.questions) {
              g.questions.forEach(q => {
                if (q) {
                  q.question_number = currentNumber++;
                }
              });
            }
          });
        }
      });

      form.setFieldsValue(currentValues);
      message.success(`Question numbers have been reordered from 1 to ${currentNumber - 1}`);
    }
  }, [form]);

  return {
    form,
    loading,
    isEditMode,
    handleSave,
    navigate,
    getNextQuestionNumber,
    recalculateAllQuestionNumbers
  };
};
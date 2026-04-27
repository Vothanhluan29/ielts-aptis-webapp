import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import { listeningAdminApi } from '../../../api/IELTS/listening/listeningAdminApi';

export const useListeningEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    if (isEditMode) {
      const fetchTest = async () => {
        try {
          setLoading(true);
          const response = await listeningAdminApi.getTestById(id);
          const data = response.data || response;

          if (data.parts) {
            data.parts.forEach(part => {
              if (part.groups) {
                part.groups.forEach(group => {
                  if (group.questions) {
                    group.questions.forEach(q => {
                      if (typeof q.options === 'string') {
                        try {
                          q.options = JSON.parse(q.options);
                        } catch (e) {
                          q.options = {};
                          message.error('Failed to parse options for question:', q, e);
                        }
                      }
                      if (!q.options) q.options = {};
                      if (!q.correct_answers) q.correct_answers = [];
                    });
                  }
                });
              }
            });
          }

          form.setFieldsValue(data);
        } catch (error) {
          console.error('Failed to fetch test details:', error);
          message.error('Unable to load test data!');
          navigate('/admin/skills/listening');
        } finally {
          setLoading(false);
        }
      };

      fetchTest();
    } else {
      form.setFieldsValue({
        time_limit: 40,
        is_published: false,
        is_full_test_only: false,
        description: '',
        parts: [
          {
            part_number: 1,
            audio_url: '',
            transcript: '',
            groups: []
          }
        ]
      });
    }
  }, [id, form, navigate, isEditMode]);

  // --- 2. NUMBERING LOGIC (Type Casting Bug Fixed) ---
  const getNextQuestionNumber = useCallback(() => {
    const currentValues = form.getFieldsValue();
    let maxNum = 0;
    
    if (currentValues.parts) {
      currentValues.parts.forEach(p => {
        if (p?.groups) {
          p.groups.forEach(g => {
            if (g?.questions) {
              g.questions.forEach(q => {
                const currentNum = parseInt(q?.question_number, 10);
                if (!isNaN(currentNum) && currentNum > maxNum) {
                  maxNum = currentNum;
                }
              });
            }
          });
        }
      });
    }
    return maxNum + 1;
  }, [form]);

  // --- 3. RECALCULATE NUMBERS ---
  const recalculateAllQuestionNumbers = useCallback(() => {
    const currentValues = JSON.parse(JSON.stringify(form.getFieldsValue()));
    let counter = 1;
    
    if (currentValues.parts) {
      currentValues.parts.forEach(p => {
        if (p?.groups) {
          p.groups.forEach(g => {
            if (g?.questions) {
              g.questions.forEach(q => {
                if (q) {
                  q.question_number = counter++;
                }
              });
            }
          });
        }
      });
    }
    
    form.setFieldsValue(currentValues);
    message.success(`Question numbers have been recalculated from 1 to ${counter - 1}`);
  }, [form]);

  // --- 4. SUBMIT FUNCTION  ---
  const handleSave = async (values) => {
    setLoading(true);
    try {
      let cleanPayload = { ...values };

      if (cleanPayload.parts) {
        cleanPayload.parts = cleanPayload.parts
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
        await listeningAdminApi.updateTest(id, cleanPayload);
        message.success('Test updated successfully!');
      } else {
        await listeningAdminApi.createTest(cleanPayload);
        message.success('New test created successfully!');
      }
      navigate('/admin/skills/listening');
    } catch (error) {
      console.error('Error while saving the test:', error);
      const errDetail = error.response?.data?.detail;
      if (typeof errDetail === 'string') {
        message.error(errDetail);
      } else {
        message.error('Data error (422) - Please check for missing required fields!');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    isEditMode,
    navigate,
    getNextQuestionNumber,
    recalculateAllQuestionNumbers,
    handleSave,
  };
};
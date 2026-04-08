import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, message } from 'antd';
import GrammarVocabAdminApi from '../../../api/APTIS/grammar&vocab/grammar_vocabAdminApi';

export const useGramVocabEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeGrammarKeys, setActiveGrammarKeys] = useState(['0']);
  const [activeVocabKeys, setActiveVocabKeys] = useState(['0']);

  const fetchTestDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GrammarVocabAdminApi.getTestDetail(id);
      const data = response.data || response;

      const formattedQuestions =
        data.questions?.map((q) => {
          let optionsArray = [];
          let correctIndex = '0';

          if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
            const keys = Object.keys(q.options).sort();
            optionsArray = keys.map((k) => q.options[k] || '');

            const foundIndex = keys.findIndex((k) => q.options[k] === q.correct_answer);
            if (foundIndex !== -1) correctIndex = foundIndex.toString();
          } else if (Array.isArray(q.options)) {
            optionsArray = [...q.options];
            const foundIdx = optionsArray.findIndex((opt) => opt === q.correct_answer);
            if (foundIdx !== -1) correctIndex = foundIdx.toString();
          }

          return { ...q, options: optionsArray, correct_answer: correctIndex };
        }) || [];

      const grammarQuestions = formattedQuestions.filter((q) => q.part_type === 'GRAMMAR');
      const vocabQuestions = formattedQuestions.filter((q) => q.part_type !== 'GRAMMAR');

      setActiveGrammarKeys(grammarQuestions.map((_, idx) => idx.toString()));
      setActiveVocabKeys(vocabQuestions.map((_, idx) => idx.toString()));

      form.setFieldsValue({
        title: data.title,
        description: data.description || '',
        time_limit: data.time_limit,
        is_published: data.is_published,
        is_full_test_only: data.is_full_test_only,
        grammar_questions: grammarQuestions,
        vocab_questions: vocabQuestions,
      });
    } catch (error) {
      console.error(error);
      message.error('Unable to load test details!');
      navigate('/admin/aptis/grammar-vocab');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  useEffect(() => {
    if (isEditMode) {
      fetchTestDetail();
    } else {
      form.setFieldsValue({
        time_limit: 25,
        is_published: false,
        is_full_test_only: false,
        description: '',
        grammar_questions: [{ part_type: 'GRAMMAR', options: ['', '', ''], correct_answer: '0' }],
        vocab_questions: [
          { part_type: 'VOCAB_WORD_DEFINITION', options: ['', '', ''], correct_answer: '0' },
        ],
      });
    }
  }, [isEditMode, fetchTestDetail, form]);

  const onFinishFailed = (errorInfo) => {
    console.error('Validation Failed:', errorInfo);
    message.error('Please fill in all required fields.');
  };

  const onFinish = async (values) => {
    const gramCount = values.grammar_questions?.length || 0;
    const vocabCount = values.vocab_questions?.length || 0;

    if (gramCount > 25) {
      message.error(`Grammar section limit exceeded: max 25 questions (current: ${gramCount}).`);
      return;
    }

    if (vocabCount > 25) {
      message.error(`Vocabulary section limit exceeded: max 25 questions (current: ${vocabCount}).`);
      return;
    }

    if (gramCount === 0 && vocabCount === 0) {
      message.warning('Please add at least one question.');
      return;
    }

    setSubmitting(true);

    try {
      const allQuestions = [...(values.grammar_questions || []), ...(values.vocab_questions || [])];

      const payload = {
        title: values.title,
        description: values.description,
        time_limit: Number(values.time_limit),
        is_published: Boolean(values.is_published),
        is_full_test_only: Boolean(values.is_full_test_only),

        questions: allQuestions.map((q, index) => {
          const optionsDict = {};

          if (Array.isArray(q.options)) {
            q.options.forEach((opt, i) => {
              if (opt && opt.trim() !== '') {
                const letter = String.fromCharCode(65 + i);
                optionsDict[letter] = opt.trim();
              }
            });
          }

          const exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || '';

          return {
            part_type: q.part_type || 'GRAMMAR',
            question_number: index + 1,
            question_text: q.question_text || '',
            options: optionsDict,
            correct_answer: exactCorrectText,
            explanation: q.explanation || '',
          };
        }),
      };

      if (isEditMode) {
        await GrammarVocabAdminApi.updateTest(id, payload);
        message.success('Test updated successfully!');
      } else {
        await GrammarVocabAdminApi.createTest(payload);
        message.success('New test created successfully!');
      }

      navigate('/admin/aptis/grammar-vocab');
    } catch (error) {
      console.error(error);
      message.error('Failed to submit data! Please check your input.');
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
    activeGrammarKeys,
    setActiveGrammarKeys,
    activeVocabKeys,
    setActiveVocabKeys,
    onFinish,
    onFinishFailed,
    navigate,
  };
};
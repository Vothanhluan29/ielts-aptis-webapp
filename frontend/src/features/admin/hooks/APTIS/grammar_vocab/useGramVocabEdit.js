import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, message } from 'antd';
import GrammarVocabAdminApi from '../../../api/APTIS/grammar&vocab/grammar_vocabAdminApi';

export const MAX_QUESTIONS = 50;
export const MAX_GRAMMAR   = 25;
export const MAX_VOCAB     = 25;

// ─── Helper: format questions từ backend → form ──────────────────────────────
const formatQuestionsFromBackend = (questions = []) =>
  questions.map((q) => {
    let optionsArray = [];
    let correctIndex = '0';
    if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
      const keys = Object.keys(q.options).sort();
      optionsArray = keys.map((k) => q.options[k] || '');
      const found = keys.findIndex((k) => q.options[k] === q.correct_answer);
      if (found !== -1) correctIndex = found.toString();
    } else if (Array.isArray(q.options)) {
      optionsArray = [...q.options];
      const found = optionsArray.findIndex((o) => o === q.correct_answer);
      if (found !== -1) correctIndex = found.toString();
    }
    return { ...q, options: optionsArray, correct_answer: correctIndex };
  });

// ─── Helper: format questions từ form → payload backend ──────────────────────
const formatQuestionsToPayload = (questions = [], startIndex = 0) =>
  questions.map((q, idx) => {
    const optionsDict = {};
    if (Array.isArray(q.options)) {
      q.options.forEach((opt, i) => {
        if (opt && opt.trim()) optionsDict[String.fromCharCode(65 + i)] = opt.trim();
      });
    }
    const correctText = q.options?.[Number(q.correct_answer)]?.trim() || '';
    return {
      question_number: startIndex + idx + 1,
      question_text:   q.question_text || '',
      options:         optionsDict,
      correct_answer:  correctText,
      explanation:     q.explanation || '',
    };
  });

export const useGramVocabEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const isEditMode = Boolean(id);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeGrammarKeys, setActiveGrammarKeys] = useState(['0']);

  // ─── Realtime counter — cập nhật mỗi khi form thay đổi ──────────────────────
  const [grammarCount, setGrammarCount] = useState(0);
  const [vocabCount, setVocabCount]     = useState(0);
  const totalCount = grammarCount + vocabCount;

  // Gọi hàm này sau mỗi lần thêm/xóa câu hỏi để cập nhật counter
  const refreshCounts = useCallback(() => {
    const gram = form.getFieldValue('grammar_questions')?.length || 0;
    const vocab = (form.getFieldValue('vocab_groups') || [])
      .reduce((sum, g) => sum + (g?.questions?.length || 0), 0);
    setGrammarCount(gram);
    setVocabCount(vocab);
  }, [form]);

  // ─── Fetch chi tiết bài (Edit mode) ─────────────────────────────────────────
  const fetchTestDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GrammarVocabAdminApi.getTestDetail(id);
      const data     = response.data || response;

      const grammarGroup     = data.groups?.find((g) => g.part_type === 'GRAMMAR');
      const grammarQuestions = formatQuestionsFromBackend(grammarGroup?.questions || []);

      const vocabGroups = (data.groups || [])
        .filter((g) => g.part_type !== 'GRAMMAR')
        .map((g) => ({
          part_type:   g.part_type,
          instruction: g.instruction || '',
          questions:   formatQuestionsFromBackend(g.questions || []),
        }));

      setActiveGrammarKeys(grammarQuestions.map((_, i) => i.toString()));

      form.setFieldsValue({
        title:             data.title,
        description:       data.description || '',
        time_limit:        data.time_limit,
        is_published:      data.is_published,
        is_full_test_only: data.is_full_test_only,
        grammar_questions: grammarQuestions,
        vocab_groups:      vocabGroups,
      });

      // Cập nhật counter sau khi load xong
      setGrammarCount(grammarQuestions.length);
      setVocabCount(vocabGroups.reduce((sum, g) => sum + g.questions.length, 0));
    } catch (err) {
      console.error(err);
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
      const defaultGrammar = [{ options: ['', '', ''], correct_answer: '0' }];
      const defaultVocab   = [{
        part_type: 'VOCAB_WORD_DEFINITION', instruction: '',
        questions: [{ options: [], correct_answer: undefined }],
      }];
      form.setFieldsValue({
        time_limit: 25, is_published: false, is_full_test_only: false, description: '',
        grammar_questions: defaultGrammar,
        vocab_groups:      defaultVocab,
      });
      setGrammarCount(defaultGrammar.length);
      setVocabCount(defaultVocab[0].questions.length);
    }
  }, [isEditMode, fetchTestDetail, form]);

  // ─── Warning: group vocab < 5 câu ───────────────────────────────────────────
  const warnUnderfilledGroups = (vocabGroups = []) => {
    vocabGroups
      .filter((g) => (g.questions?.length || 0) < 5)
      .forEach((g) => {
        message.warning({
          content: `Group "${g.part_type}" has only ${g.questions?.length || 0} question(s). Recommended minimum is 5.`,
          duration: 4,
        });
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.error('Validation Failed:', errorInfo);
    message.error('Please fill in all required fields.');
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const onFinish = async (values) => {
    const gramCount   = values.grammar_questions?.length || 0;
    const vocabGroups = values.vocab_groups || [];
    const vCount      = vocabGroups.reduce((sum, g) => sum + (g.questions?.length || 0), 0);
    const total       = gramCount + vCount;

    if (total > MAX_QUESTIONS) {
      message.error(`Total questions exceed the limit of ${MAX_QUESTIONS} (current: ${total}).`);
      return;
    }

    if (gramCount === 0 && vCount === 0) {
      message.warning('Please add at least one question.');
      return;
    }

    warnUnderfilledGroups(vocabGroups);

    setSubmitting(true);
    try {
      const groups = [];

      if (gramCount > 0) {
        groups.push({
          part_type:   'GRAMMAR',
          instruction: '',
          questions:   formatQuestionsToPayload(values.grammar_questions, 0),
        });
      }

      let questionOffset = gramCount;
      vocabGroups.forEach((group) => {
        if ((group.questions?.length || 0) === 0) return;
        groups.push({
          part_type:   group.part_type,
          instruction: group.instruction || '',
          questions:   formatQuestionsToPayload(group.questions, questionOffset),
        });
        questionOffset += group.questions.length;
      });

      const payload = {
        title:             values.title,
        description:       values.description,
        time_limit:        Number(values.time_limit),
        is_published:      Boolean(values.is_published),
        is_full_test_only: Boolean(values.is_full_test_only),
        groups,
      };

      if (isEditMode) {
        await GrammarVocabAdminApi.updateTest(id, payload);
        message.success('Test updated successfully!');
      } else {
        await GrammarVocabAdminApi.createTest(payload);
        message.success('New test created successfully!');
      }

      navigate('/admin/aptis/grammar-vocab');
    } catch (err) {
      console.error(err);
      message.error('Failed to submit! Please check your input.');
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
    totalCount,
    refreshCounts,
    onFinish,
    onFinishFailed,
    navigate,
  };
};
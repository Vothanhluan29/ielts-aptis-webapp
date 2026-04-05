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
  
  // State quản lý Collapse (Đóng/Mở các thẻ câu hỏi)
  const [activeGrammarKeys, setActiveGrammarKeys] = useState(['0']);
  const [activeVocabKeys, setActiveVocabKeys] = useState(['0']);

  // Fetch Dữ liệu đề thi (Nếu ở chế độ Edit)
  const fetchTestDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GrammarVocabAdminApi.getTestDetail(id);
      const data = response.data || response;
      
      const formattedQuestions = data.questions?.map(q => {
        let optionsArray = ['', '', ''];
        let correctIndex = '0';

        if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
          optionsArray = [q.options["A"] || '', q.options["B"] || '', q.options["C"] || ''];
          if (q.correct_answer === q.options["A"]) correctIndex = '0';
          else if (q.correct_answer === q.options["B"]) correctIndex = '1';
          else if (q.correct_answer === q.options["C"]) correctIndex = '2';
        } else if (Array.isArray(q.options)) {
          optionsArray = q.options;
          const foundIdx = optionsArray.findIndex(opt => opt === q.correct_answer);
          if (foundIdx !== -1) correctIndex = foundIdx.toString();
        }
        return { ...q, options: optionsArray, correct_answer: correctIndex };
      }) || [];

      // Phân loại câu hỏi vào 2 mảng: Grammar và Vocab
      const grammarQuestions = formattedQuestions.filter(q => q.part_type === 'GRAMMAR');
      const vocabQuestions = formattedQuestions.filter(q => q.part_type !== 'GRAMMAR');

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

  // Khởi tạo dữ liệu
  useEffect(() => {
    if (isEditMode) {
      fetchTestDetail();
    } else {
      form.setFieldsValue({
        time_limit: 25,
        is_published: false,
        is_full_test_only: false,
        description: '', 
        // Dữ liệu mặc định cho 1 câu Grammar và 1 câu Vocab
        grammar_questions: [{ part_type: 'GRAMMAR', options: ['', '', ''], correct_answer: '0' }],
        vocab_questions: [{ part_type: 'VOCAB_WORD_DEFINITION', options: ['', '', ''], correct_answer: '0' }]
      });
    }
  }, [isEditMode, fetchTestDetail, form]);

  // Xử lý Gửi Dữ Liệu (Submit Form)
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      // Gộp 2 mảng lại thành 1 mảng phẳng cho Backend
      const allQuestions = [
        ...(values.grammar_questions || []), 
        ...(values.vocab_questions || [])
      ];

      const payload = {
        title: values.title,
        description: values.description, 
        time_limit: Number(values.time_limit),
        is_published: Boolean(values.is_published),
        is_full_test_only: Boolean(values.is_full_test_only),
        
        questions: allQuestions.map((q, index) => {
          const optionsDict = {};
          const labels = ["A", "B", "C"];

          // Xử lý loại bỏ rỗng và format Options
          q.options.forEach((opt, i) => {
            if (opt && opt.trim() !== '') optionsDict[labels[i]] = opt.trim();
          });

          // Lấy Text chính xác của câu trả lời đúng dựa vào Index ('0', '1', '2')
          const exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";

          return {
            part_type: q.part_type || 'GRAMMAR',
            question_number: index + 1, // Đánh số thứ tự từ 1 đến hết
            question_text: q.question_text,
            options: optionsDict,
            correct_answer: exactCorrectText,
            explanation: q.explanation || "",
          };
        })
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
      message.error('Failed to submit data! Please check the structure.');
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
    navigate
  };
};
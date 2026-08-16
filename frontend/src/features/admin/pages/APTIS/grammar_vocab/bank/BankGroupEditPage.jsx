import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Select, Spin, Collapse, Row, Col, message, Popconfirm
} from 'antd';
import { ArrowLeft, Save, Settings, Layers, Plus, Trash2, Copy } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import MultipleChoiceAdmin from '../../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../../components/APTIS/question-types/MatchingAdmin';
import { BlurInput, BlurTextArea } from '../../../../../../components/common/BlurInput';

import aptisGrammarVocabBankApi from '../../../../api/APTIS/grammar_vocab/aptisGrammarVocabBankApi';

const { Option } = Select;

const VOCAB_TYPES = {
  VOCAB_WORD_DEFINITION:   'Word Definition',
  VOCAB_WORD_PAIRS:        'Word Pairs',
  VOCAB_WORD_USAGE:        'Word Usage',
  VOCAB_WORD_COMBINATIONS: 'Word Combinations',
};

const BankGroupEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/grammar_vocab/bank' : '/admin/aptis/grammar_vocab/bank';

  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeQuestionKeys, setActiveQuestionKeys] = useState([]);

  const isCreateMode = !id || id === 'create';
  
  const currentCategory = Form.useWatch('category', form);
  const currentPartType = Form.useWatch('part_type', form);

  // Use watch to disable Add Question button when limit is reached
  const questionsWatch = Form.useWatch('questions', form) || [];
  const isLimitReached = questionsWatch.length >= 25;

  useEffect(() => {
    if (!isCreateMode) {
      fetchGroup();
    } else {
      setLoading(false);
      form.setFieldsValue({ 
        category: 'GRAMMAR',
        part_type: 'GRAMMAR', 
        difficulty_level: 'A1', 
        questions: [{ question_number: 1 }] 
      });
      setActiveQuestionKeys(['0']);
    }
  }, [id, isCreateMode]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await aptisGrammarVocabBankApi.getBankGroupById(id);
      
      const isGrammar = response.part_type === 'GRAMMAR';
      
      form.setFieldsValue({
        category: isGrammar ? 'GRAMMAR' : 'VOCAB',
        part_type: response.part_type,
        instruction: response.instruction,
        difficulty_level: response.difficulty_level,
        questions: response.questions?.map(q => ({
          ...q
        })) || []
      });
      // Expand all questions by default
      if (response.questions) {
        setActiveQuestionKeys(response.questions.map((_, i) => i.toString()));
      }
    } catch (error) {
      message.error('Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!values.questions || values.questions.length !== 25) {
        message.error(`A Bank Group must contain exactly 25 questions. Currently it has ${values.questions?.length || 0}.`);
        return;
      }

      setSubmitting(true);
      
      const payload = {
        ...values,
        part_type: values.category === 'GRAMMAR' ? 'GRAMMAR' : values.part_type,
        questions: values.questions?.map((q, idx) => ({
          ...q,
          question_number: idx + 1
        })) || []
      };

      if (isCreateMode) {
        await aptisGrammarVocabBankApi.createBankGroup(payload);
        message.success('Bank group created successfully!');
      } else {
        await aptisGrammarVocabBankApi.updateBankGroup(id, payload);
        message.success('Bank group updated successfully!');
      }
      navigate(basePath);
    } catch (errorInfo) {
      console.error('Validation failed:', errorInfo);
      message.error('Please check all required fields.');
      
      if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
        const questionErrors = errorInfo.errorFields.filter(f => f.name && f.name[0] === 'questions');
        if (questionErrors.length > 0) {
          const keysToExpand = questionErrors.map(f => f.name[1].toString());
          setActiveQuestionKeys(prev => {
            const newKeys = new Set([...prev, ...keysToExpand]);
            return Array.from(newKeys);
          });
        }
        
        setTimeout(() => {
          form.scrollToField(errorInfo.errorFields[0].name, {
            behavior: 'smooth',
            block: 'center',
          });
        }, 100);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Spin size="large" />
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-20 pt-6">
      {/* ================= STICKY HEADER ================= */}
      <div className="bg-zinc-50/90 backdrop-blur-md pb-4 mb-6 pt-2 -mx-4 px-4 border-b border-zinc-200/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(basePath)}
            className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight m-0">
              {isCreateMode ? 'Create Question Group' : 'Edit Question Group'}
            </h1>
            <p className="text-sm font-medium text-zinc-500 m-0">
              Configure grammar or vocabulary questions
            </p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#445A95] text-white font-bold rounded-xl hover:bg-[#3A4D81] hover:-translate-y-0.5 transition-all shadow-sm shadow-[#445A95]/20 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save size={18} />
          )}
          Save Changes
        </button>
      </div>

      <Form form={form} layout="vertical" requiredMark={false} autoComplete="off">
        {/* ================= GENERAL GROUP SETTINGS ================= */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center gap-2">
            <Settings size={18} className="text-[#445A95]" />
            <h2 className="text-base font-bold text-zinc-800 m-0">Group Information</h2>
          </div>
          
          <div className="p-6 md:p-8">
            <Row gutter={24}>
              <Col span={12} md={currentCategory === 'VOCAB' ? 8 : 12}>
                <Form.Item label={<span className="text-sm font-bold text-zinc-700">Category</span>} name="category" rules={[{ required: true }]}>
                  <Select 
                    size="large"
                    onChange={(val) => {
                      if (val === 'GRAMMAR') {
                        form.setFieldValue('part_type', 'GRAMMAR');
                      } else {
                        form.setFieldValue('part_type', 'VOCAB_WORD_DEFINITION');
                      }
                      form.setFieldValue('questions', [{ question_number: 1 }]);
                      setActiveQuestionKeys(['0']);
                    }}
                  >
                    <Option value="GRAMMAR">Grammar</Option>
                    <Option value="VOCAB">Vocabulary</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              {currentCategory === 'VOCAB' && (
                <Col span={12} md={8}>
                  <Form.Item label={<span className="text-sm font-bold text-zinc-700">Vocab Type</span>} name="part_type" rules={[{ required: true }]}>
                    <Select size="large">
                      {Object.entries(VOCAB_TYPES).map(([key, label]) => (
                        <Option key={key} value={key}>{label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              <Col span={12} md={currentCategory === 'VOCAB' ? 8 : 12}>
                <Form.Item name="difficulty_level" label={<span className="text-sm font-bold text-zinc-700">Difficulty Level</span>}>
                  <Select size="large">
                    <Option value="A1">A1</Option>
                    <Option value="A2">A2</Option>
                    <Option value="B1">B1</Option>
                    <Option value="B2">B2</Option>
                    <Option value="C">C</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="instruction" 
              label={<span className="text-sm font-bold text-zinc-700">Group Instruction (Optional)</span>}
              className="mb-0 mt-4"
            >
              <BlurTextArea rows={2} placeholder="E.g., Read the sentences and choose the correct answer." className="bg-white border-zinc-200 hover:border-[#445A95] focus:border-[#445A95] rounded-xl p-4 text-sm transition-all" />
            </Form.Item>
          </div>
        </div>

        {/* ================= QUESTIONS ================= */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#3A4D81]" />
              <h2 className="text-base font-bold text-zinc-800 m-0">Questions</h2>
            </div>
            <div className="text-xs font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-600 border border-zinc-200">
              {questionsWatch.length} / 25 Items
            </div>
          </div>

          <div className="p-6 md:p-8 bg-zinc-50/30">
            <Form.List name="questions">
              {(fields, { add, remove }) => (
                <div className="flex flex-col gap-4">
                  <Collapse 
                    activeKey={activeQuestionKeys} 
                    onChange={setActiveQuestionKeys}
                    className="bg-transparent border-0"
                    ghost
                  >
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Collapse.Panel
                        key={index.toString()}
                        forceRender
                        className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden mb-4 shadow-sm"
                        header={<span className="font-bold text-[#3A4D81]">Question {index + 1}</span>}
                        extra={
                          <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="p-1.5 text-zinc-400 hover:text-[#445A95] hover:bg-[#F8FAFC] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isLimitReached}
                              onClick={() => {
                                const qToCopy = form.getFieldValue(['questions', name]);
                                const newQ = { ...qToCopy };
                                if (currentCategory === 'GRAMMAR') {
                                  newQ.question_text = '';
                                  newQ.correct_answer = '0';
                                } else {
                                  newQ.question_text = '';
                                  newQ.correct_answer = undefined;
                                }
                                add(newQ, index + 1);
                                setActiveQuestionKeys([...activeQuestionKeys, (index + 1).toString()]);
                              }}
                            >
                              <Copy size={16} />
                            </button>
                            <Popconfirm title="Delete this question?" onConfirm={() => remove(name)}>
                              <button type="button" className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors focus:outline-none">
                                <Trash2 size={16} />
                              </button>
                            </Popconfirm>
                          </div>
                        }
                      >
                        {currentCategory === 'GRAMMAR' ? (
                          <>
                            <Form.Item label={<span className="text-sm font-bold text-zinc-700">Question Text</span>} required>
                              <div className="flex gap-2">
                                <Form.Item {...restField} name={[name, 'question_text']} rules={[{ required: true, message: 'Question text is required' }]} className="flex-1 mb-0">
                                  <BlurTextArea autoSize={{ minRows: 1, maxRows: 6 }} placeholder="He ___ to the store yesterday." className="bg-zinc-50 hover:bg-white focus:bg-white rounded-lg p-3 border-zinc-200 focus:border-[#445A95] transition-all" />
                                </Form.Item>
                                <button type="button" className="px-4 py-2 border border-dashed border-indigo-300 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg font-medium transition-colors" onClick={() => {
                                  const cur = form.getFieldValue(['questions', name, 'question_text']) || '';
                                  form.setFieldValue(['questions', name, 'question_text'], cur + ' ___ ');
                                }}>Insert ___</button>
                              </div>
                            </Form.Item>
                            <MultipleChoiceAdmin relativePath={[name]} absolutePath={['questions', name]} restField={restField} form={form} />
                          </>
                        ) : (
                          <>
                            <Form.Item {...restField} name={[name, 'question_text']} label={<span className="text-sm font-bold text-zinc-700">Definition / Meaning</span>} rules={[{ required: true, message: 'Definition is required' }]}>
                              <BlurTextArea autoSize={{ minRows: 1, maxRows: 6 }} placeholder="A large fruit with a green shell..." className="bg-zinc-50 hover:bg-white focus:bg-white rounded-lg p-3 border-zinc-200 focus:border-[#445A95] transition-all" />
                            </Form.Item>
                            <MatchingAdmin relativePath={[name]} absolutePath={['questions', name]} restField={restField} form={form} />
                          </>
                        )}

                        <Form.Item {...restField} name={[name, 'explanation']} label={<span className="text-sm font-bold text-zinc-700">Explanation (Optional)</span>} className="mt-4 mb-0">
                          <BlurTextArea rows={1} placeholder="Why is this answer correct?" className="bg-zinc-50 hover:bg-white focus:bg-white rounded-lg p-3 border-zinc-200 focus:border-[#445A95] transition-all" />
                        </Form.Item>
                      </Collapse.Panel>
                    ))}
                  </Collapse>
                  
                  <button 
                    type="button"
                    disabled={isLimitReached}
                    onClick={() => {
                      const newIndex = fields.length;
                      add({ question_number: newIndex + 1 });
                      setActiveQuestionKeys([...activeQuestionKeys, newIndex.toString()]);
                    }} 
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#445A95]/20 text-[#445A95] bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] hover:border-indigo-300 rounded-xl font-bold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:border-zinc-200"
                  >
                    <Plus size={18} />
                    {isLimitReached ? 'LIMIT REACHED (25/25 ITEMS)' : 'ADD QUESTION TO THIS GROUP'}
                  </button>
                </div>
              )}
            </Form.List>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default BankGroupEditPage;

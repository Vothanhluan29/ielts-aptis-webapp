import React, { useState, useEffect } from 'react';
import { 
  Form, Button, Select, Spin, Row, Col, Popconfirm, Collapse, message
} from 'antd';
import { ArrowLeft, Save, Settings, HelpCircle, Layers, Plus, Trash2, Copy, BookOpen } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import MultipleChoiceAdmin from '../../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../../components/APTIS/question-types/FillInBlankAdmin';
import ReorderSentencesAdmin from '../../../../components/APTIS/question-types/ReorderSentencesAdmin';
import { BlurInput, BlurTextArea } from '../../../../../../components/common/BlurInput';

import aptisReadingBankApi from '../../../../api/APTIS/reading/aptisReadingBankApi';

const { Option } = Select;

const BankGroupEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/reading/bank' : '/admin/aptis/reading/bank';

  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeQuestionKeys, setActiveQuestionKeys] = useState([]);

  const partNumber = Form.useWatch('part_number', form);
  const showPassage = partNumber === 4 || partNumber === 5;

  const isCreateMode = !id || id === 'create';
  const currentPartNumber = Form.useWatch('part_number', form);

  useEffect(() => {
    if (!isCreateMode) {
      fetchGroup();
    } else {
      setLoading(false);
      form.setFieldsValue({ part_number: 1, difficulty_level: 'A1', questions: [{ question_type: 'MULTIPLE_CHOICE' }] });
    }
  }, [id, isCreateMode]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await aptisReadingBankApi.getBankGroupById(id);
      form.setFieldsValue({
        part_number: response.part_number,
        instruction: response.instruction,
        content: response.content,
        difficulty_level: response.difficulty_level,
        questions: response.questions?.map(q => ({
          ...q,
          question_type: q.question_type || 'MULTIPLE_CHOICE',
        })) || []
      });
      // Expand all questions by default
      setActiveQuestionKeys((response.questions || []).map((_, idx) => idx.toString()));
    } catch (error) {
      message.error('Failed to load bank group details');
      navigate(basePath);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        questions: (values.questions || []).map((q, idx) => {
          let finalCorrectAnswer = q.correct_answer;
          if (Array.isArray(finalCorrectAnswer)) {
            finalCorrectAnswer = finalCorrectAnswer.join(',');
          }
          return {
            ...q,
            question_number: idx + 1,
            question_type: q.question_type || 'MULTIPLE_CHOICE',
            correct_answer: finalCorrectAnswer !== undefined ? String(finalCorrectAnswer) : null
          };
        })
      };

      if (isCreateMode) {
        await aptisReadingBankApi.createBankGroup(payload);
        message.success('Bank Group created successfully');
      } else {
        await aptisReadingBankApi.updateBankGroup(id, payload);
        message.success('Bank Group updated successfully');
      }
      
      navigate(basePath);
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const msg = Array.isArray(detail) ? JSON.stringify(detail) : (typeof detail === 'object' ? JSON.stringify(detail) : detail);
      message.error(msg || 'Failed to save group');
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
            onClick={() => navigate(basePath)}
            className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight m-0">
              {isCreateMode ? 'Create New Bank Group' : 'Edit Bank Group'}
            </h1>
            <p className="text-sm font-medium text-zinc-500 m-0">
              Configure group details and associated questions
            </p>
          </div>
        </div>
        
        <button
          onClick={() => form.submit()}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-indigo-600/20 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save size={18} />
          )}
          {isCreateMode ? 'Create Group' : 'Save Changes'}
        </button>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        autoComplete="off"
        requiredMark={false}
      >
        {/* ================= GENERAL GROUP SETTINGS ================= */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center gap-2">
            <Settings size={18} className="text-indigo-500" />
            <h2 className="text-base font-bold text-zinc-800 m-0">Group Information</h2>
          </div>
          
          <div className="p-6 md:p-8">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item 
                  name="part_number" 
                  label={<span className="text-sm font-bold text-zinc-700">Part Number</span>} 
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Option value={1}>Part 1</Option>
                    <Option value={2}>Part 2</Option>
                    <Option value={3}>Part 3</Option>
                    <Option value={4}>Part 4</Option>
                    <Option value={5}>Part 5</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="difficulty_level" 
                  label={<span className="text-sm font-bold text-zinc-700">Difficulty Level (CEFR)</span>}
                >
                  <Select size="large" placeholder="Select CEFR Level" allowClear>
                    <Option value="A1">A1</Option>
                    <Option value="A2">A2</Option>
                    <Option value="B1">B1</Option>
                    <Option value="B2">B2</Option>
                    <Option value="C">C</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              {showPassage && (
                <Col span={24}>
                  <div className="mt-2 mb-6 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <Form.Item 
                      name="content"
                      label={
                        <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
                          <BookOpen size={16} />
                          Reading Passage (Content)
                        </div>
                      }
                      style={{ marginBottom: 0 }}
                    >
                      <BlurTextArea 
                        rows={8} 
                        placeholder="Paste the reading text here..." 
                        className="bg-white border-zinc-200 hover:border-indigo-400 focus:border-indigo-500 rounded-lg p-4"
                      />
                    </Form.Item>
                  </div>
                </Col>
              )}
            </Row>

            <Form.Item 
              name="instruction" 
              label={<span className="text-sm font-bold text-zinc-700">Instruction</span>}
              className="m-0"
            >
              <BlurTextArea 
                rows={3} 
                placeholder="E.g., Read the text and answer the questions..." 
                className="bg-zinc-50/50 border-zinc-200 hover:border-indigo-400 focus:border-indigo-500 rounded-xl p-4"
              />
            </Form.Item>
          </div>
        </div>

        {/* ================= QUESTIONS ================= */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center gap-2">
            <Layers size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold text-zinc-800 m-0">Questions in this Group</h2>
          </div>
          
          <div className="p-6 md:p-8 bg-zinc-50/30">
            <Form.List name="questions">
              {(qFields, { add: addQ, remove: removeQ }) => {
                
                const collapseItems = qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => {
                  return {
                    key: qKey.toString(),
                    forceRender: true,
                    label: <span className="font-bold text-indigo-700 text-base">Question {qIndex + 1}</span>,
                    extra: (
                      <span onClick={e => e.stopPropagation()} className="flex gap-2">
                        <button
                          type="button"
                          className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentQuestion = form.getFieldValue(['questions', qName]);
                            addQ({ 
                              ...currentQuestion, 
                              question_text: '', 
                              correct_answer: currentQuestion?.question_type === 'MATCHING' ? undefined : '0' 
                            }, qIndex + 1);
                            setActiveQuestionKeys([...activeQuestionKeys, qFields.length.toString()]);
                          }}
                        >
                          <Copy size={16} />
                        </button>
                        <Popconfirm 
                          title="Delete question?" 
                          onConfirm={(e) => { e.stopPropagation(); removeQ(qName); }} 
                          okText="Yes" 
                          cancelText="No"
                        >
                          <button
                            type="button"
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Popconfirm>
                      </span>
                    ),
                    children: (
                      <div className="pt-4 pb-2">
                        <Row gutter={24}>
                          <Col span={24} md={6}>
                            <Form.Item 
                              {...restQField} 
                              name={[qName, 'question_type']} 
                              label={<span className="text-sm font-bold text-zinc-700">Question Type</span>} 
                              rules={[{ required: true }]}
                            >
                              <Select size="large">
                                <Option value="MULTIPLE_CHOICE">Multiple Choice</Option>
                                <Option value="MATCHING">Matching</Option>
                                <Option value="SHORT_ANSWER">Fill in the Blank</Option>
                                <Option value="REORDER_SENTENCES">Reorder Sentences</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={24} md={18}>
                            <Form.Item 
                              label={<span className="text-sm font-bold text-zinc-700">Question Content</span>} 
                              required 
                              style={{ marginBottom: 16 }}
                            >
                              <div className="flex gap-2">
                                <Form.Item 
                                  {...restQField} 
                                  name={[qName, 'question_text']} 
                                  rules={[{ required: true, message: 'Please enter question content!' }]} 
                                  style={{ flex: 1, marginBottom: 0 }}
                                >
                                  <BlurInput 
                                    placeholder="E.g: What is the main topic?" 
                                    className="bg-white border-zinc-200 hover:border-indigo-400 focus:border-indigo-500 rounded-lg px-4 py-2"
                                  />
                                </Form.Item>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const currentText = form.getFieldValue(['questions', qName, 'question_text']) || '';
                                    form.setFieldValue(['questions', qName, 'question_text'], currentText + ' ___ ');
                                  }}
                                  className="px-4 py-2 border border-dashed border-zinc-300 text-zinc-600 rounded-lg font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors bg-white"
                                >
                                  Insert "___"
                                </button>
                              </div>
                            </Form.Item>
                          </Col>
                        </Row>

                        <div className="my-4 p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                          <Form.Item 
                            shouldUpdate={(prevValues, currentValues) => {
                              const prevType = prevValues.questions?.[qName]?.question_type;
                              const currType = currentValues.questions?.[qName]?.question_type;
                              return prevType !== currType;
                            }} 
                            noStyle
                          >
                            {({ getFieldValue }) => {
                              const qType = getFieldValue(['questions', qName, 'question_type']) || 'MULTIPLE_CHOICE';
                              
                              if (qType === 'MATCHING') {
                                return <MatchingAdmin relativePath={[qName]} absolutePath={['questions', qName]} restField={restQField} form={form} />;
                              }

                              if (qType === 'REORDER_SENTENCES') {
                                return <ReorderSentencesAdmin relativePath={[qName]} absolutePath={['questions', qName]} restField={restQField} form={form} partNumber={form.getFieldValue('part_number')} />;
                              }

                              if (qType === 'SHORT_ANSWER') {
                                return <FillInBlankAdmin relativePath={[qName]} restField={restQField} />;
                              }
                              
                              return <MultipleChoiceAdmin relativePath={[qName]} absolutePath={['questions', qName]} restField={restQField} form={form} />;
                            }}
                          </Form.Item>
                        </div>

                        <Form.Item 
                          {...restQField} 
                          name={[qName, 'explanation']} 
                          label={<span className="text-sm font-bold text-zinc-700 flex items-center gap-1.5"><HelpCircle size={14}/> Explanation (Optional)</span>} 
                          style={{ marginBottom: 0 }}
                        >
                          <BlurTextArea 
                            rows={2} 
                            placeholder="Reason for selecting this answer..." 
                            className="bg-white border-zinc-200 hover:border-indigo-400 focus:border-indigo-500 rounded-lg p-3"
                          />
                        </Form.Item>
                      </div>
                    )
                  };
                });

                return (
                  <>
                    {qFields.length > 0 && (
                      <div className="custom-collapse-wrapper mb-6">
                        <Collapse 
                          size="large" 
                          activeKey={activeQuestionKeys} 
                          onChange={(keys) => setActiveQuestionKeys(keys)}
                          items={collapseItems} 
                          className="bg-white border-zinc-200 shadow-sm"
                          expandIconPosition="end"
                        />
                      </div>
                    )}

                    <button 
                      type="button"
                      onClick={() => {
                        addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0' });
                        setActiveQuestionKeys([...activeQuestionKeys, qFields.length.toString()]);
                      }} 
                      className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl font-bold transition-all focus:outline-none"
                    >
                      <Plus size={18} />
                      ADD QUESTION TO THIS GROUP
                    </button>
                  </>
                );
              }}
            </Form.List>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default BankGroupEditPage;

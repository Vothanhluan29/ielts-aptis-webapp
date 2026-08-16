import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Space, Select, 
  Spin, Typography, Popconfirm, Collapse, Row, Col, message
} from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, CopyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import MultipleChoiceAdmin from '../../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../../components/APTIS/question-types/MatchingAdmin';
import { BlurInput, BlurTextArea } from '../../../../../../components/common/BlurInput';

import aptisGrammarVocabBankApi from '../../../../api/APTIS/grammar_vocab/aptisGrammarVocabBankApi';

const { Title, Text } = Typography;
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
        // Find if any error is inside a question panel
        const questionErrors = errorInfo.errorFields.filter(f => f.name && f.name[0] === 'questions');
        if (questionErrors.length > 0) {
          const keysToExpand = questionErrors.map(f => f.name[1].toString());
          setActiveQuestionKeys(prev => {
            const newKeys = new Set([...prev, ...keysToExpand]);
            return Array.from(newKeys);
          });
        }
        
        // Wait for state to update and panels to expand before scrolling
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

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex items-center justify-between gap-6 mb-8 mt-4">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(basePath)}
            className="text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200"
          />
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight m-0">
              {isCreateMode ? 'Create Question Group' : 'Edit Question Group'}
            </h1>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave} 
          loading={submitting}
          className="bg-[#445A95] hover:bg-[#3A4D81] shadow-sm"
        >
          Save Changes
        </Button>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Card size="small" type="inner" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Category" name="category" rules={[{ required: true }]}>
                  <Select 
                    onChange={(val) => {
                      if (val === 'GRAMMAR') {
                        form.setFieldValue('part_type', 'GRAMMAR');
                      } else {
                        form.setFieldValue('part_type', 'VOCAB_WORD_DEFINITION');
                      }
                      // Reset questions when category changes to clear incompatible data
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
                <Col span={6}>
                  <Form.Item label="Vocab Type" name="part_type" rules={[{ required: true }]}>
                    <Select>
                      {Object.entries(VOCAB_TYPES).map(([key, label]) => (
                        <Option key={key} value={key}>{label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              <Col span={6}>
                <Form.Item name="difficulty_level" label="Difficulty Level">
                  <Select>
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
              label="Group Instruction (Optional)"
            >
              <BlurTextArea rows={2} placeholder="E.g., Read the sentences and choose the correct answer." />
            </Form.Item>
          </Card>

          <Card title="Questions" size="small" type="inner">
            <Form.List name="questions">
              {(fields, { add, remove }) => (
                <Collapse 
                  activeKey={activeQuestionKeys} 
                  onChange={setActiveQuestionKeys}
                  style={{ marginBottom: 16 }}
                >
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Collapse.Panel
                      key={index.toString()}
                      forceRender
                      header={<Text strong>Question {index + 1}</Text>}
                      extra={
                        <Space onClick={(e) => e.stopPropagation()}>
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<CopyOutlined />} 
                            onClick={() => {
                              const qToCopy = form.getFieldValue(['questions', name]);
                              const newQ = { ...qToCopy };
                              // Reset specific fields when copying depending on type
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
                          />
                          <Popconfirm title="Delete?" onConfirm={() => remove(name)}>
                            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Space>
                      }
                    >
                      {currentCategory === 'GRAMMAR' ? (
                        <>
                          <Form.Item label="Question Text" required>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Form.Item {...restField} name={[name, 'question_text']} rules={[{ required: true, message: 'Question text is required' }]} style={{ flex: 1, marginBottom: 0 }}>
                                <BlurTextArea autoSize={{ minRows: 1, maxRows: 6 }} placeholder="He ___ to the store yesterday." />
                              </Form.Item>
                              <Button type="dashed" onClick={() => {
                                const cur = form.getFieldValue(['questions', name, 'question_text']) || '';
                                form.setFieldValue(['questions', name, 'question_text'], cur + ' ___ ');
                              }}>Insert ___</Button>
                            </div>
                          </Form.Item>
                          <MultipleChoiceAdmin relativePath={[name]} absolutePath={['questions', name]} restField={restField} form={form} />
                        </>
                      ) : (
                        <>
                          <Form.Item {...restField} name={[name, 'question_text']} label="Definition / Meaning" rules={[{ required: true, message: 'Definition is required' }]}>
                            <BlurTextArea autoSize={{ minRows: 1, maxRows: 6 }} placeholder="A large fruit with a green shell..." />
                          </Form.Item>
                          <MatchingAdmin relativePath={[name]} absolutePath={['questions', name]} restField={restField} form={form} />
                        </>
                      )}

                      <Form.Item {...restField} name={[name, 'explanation']} label="Explanation (Optional)" style={{ marginTop: 8 }}>
                        <BlurTextArea rows={1} placeholder="Why is this answer correct?" />
                      </Form.Item>
                    </Collapse.Panel>
                  ))}
                  
                  <div style={{ marginTop: 16 }}>
                    <Button 
                      type="dashed" 
                      onClick={() => {
                        const newIndex = fields.length;
                        add({ question_number: newIndex + 1 });
                        setActiveQuestionKeys([...activeQuestionKeys, newIndex.toString()]);
                      }} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Add Question
                    </Button>
                  </div>
                </Collapse>
              )}
            </Form.List>
          </Card>
        </Form>
      </Spin>
    </div>
  );
};

export default BankGroupEditPage;

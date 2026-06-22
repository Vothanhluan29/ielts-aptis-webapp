import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Popconfirm, Select, Tabs, Tooltip, Collapse 
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, BookOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../components/APTIS/question-types/FillInBlankAdmin';
import ReorderSentencesAdmin from '../../../components/APTIS/question-types/ReorderSentencesAdmin';

// Import Custom Hook
import { useReadingAptisEdit } from '../../../hooks/APTIS/reading/useReadingAptisEdit';
import { BlurInput, BlurTextArea } from '../../../../../components/common/BlurInput';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ReadingAptisEditPage = () => {
  const {
    id,
    form,
    isEditMode,
    loading,
    submitting,
    onFinish,
    onFinishFailed,
    navigate
  } = useReadingAptisEdit();

  const [activeTabKey, setActiveTabKey] = useState('0');
  const [activeQuestionKeys, setActiveQuestionKeys] = useState([]);
  const [showPassageObj, setShowPassageObj] = useState({});

  // Lắng nghe sự thay đổi của Form
  const partsValues = Form.useWatch('parts', form) || [];
  const currentPartsCount = partsValues.length;
  const titleValue = Form.useWatch('title', form);
  
  const totalQuestionsCount = partsValues.reduce((total, part) => {
    const partQs = part?.questions || [];
    const partTotal = partQs.reduce((sum, q) => {
      if (q?.question_type === 'REORDER_SENTENCES') {
        const optCount = Array.isArray(q?.options) ? q.options.length : 0;
        return sum + (optCount > 0 ? optCount : 1); 
      }
      return sum + 1; 
    }, 0);
    return total + partTotal;
  }, 0);

  // Giới hạn hệ thống mới (29 câu)
  const MAX_PARTS = 5; 
  const MAX_QUESTIONS = 29; 

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/reading')}>
            Back
          </Button>
          <Title level={4} style={{ margin: 0, color: '#ea580c' }}>
            <BookOutlined /> {isEditMode ? `Edit: ${titleValue || 'Untitled'}` : 'Create Reading Test'}
          </Title>
        </Space>
        <Space>
          <span style={{
            padding: '6px 14px', borderRadius: 8,
            border: `1px solid ${totalQuestionsCount >= MAX_QUESTIONS ? '#fca5a5' : '#e2e8f0'}`,
            backgroundColor: totalQuestionsCount >= MAX_QUESTIONS ? '#fef2f2' : '#f8fafc',
            fontSize: 13, fontWeight: 600,
            color: totalQuestionsCount >= MAX_QUESTIONS ? '#dc2626' : '#334155',
          }}>
            {totalQuestionsCount >= MAX_QUESTIONS && <ExclamationCircleOutlined style={{ marginRight: 6 }} />}
            {totalQuestionsCount} / {MAX_QUESTIONS} questions
          </span>
          <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large" style={{ backgroundColor: '#ea580c' }}>
            {isEditMode ? 'Update Test' : 'Save Test'}
          </Button>
        </Space>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        onFinishFailed={onFinishFailed} 
        preserve={true}                 
      >
        {/* ================= GENERAL SETTINGS ================= */}
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label="Test Title" rules={[{ required: true }]}>
                <Input placeholder="e.g. Aptis Reading Practice Test 01" size="large" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label="Time Limit (minutes)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={5} max={120} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Test Description (Optional)">
            <TextArea 
              rows={3} 
              placeholder="Enter instructions, notes or a short description for this reading test..." 
              maxLength={500} 
              showCount 
            />
          </Form.Item>

          <Space size="large">
            <Form.Item name="is_published" valuePropName="checked" label="Status" style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
            <Form.Item name="is_full_test_only" valuePropName="checked" label="Test Mode" style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Mock Test" unCheckedChildren="Practice" />
            </Form.Item>
          </Space>
        </Card>

        {/* ================= PARTS & QUESTIONS CONTENT ================= */}
        <Card 
          size="small" 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>2. Test Content</span>
              <span style={{ color: currentPartsCount >= MAX_PARTS ? '#ef4444' : '#64748b', fontSize: 13, fontWeight: 'normal' }}>
                Parts: <b>{currentPartsCount}/{MAX_PARTS}</b>
              </span>
            </div>
          }
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <Form.List name="parts">
            {(partFields, { add: addPart, remove: removePart }) => {
              
              const tabItems = partFields.map(({ key: partKey, name: partName }, pIndex) => {
                const partTitle = form.getFieldValue(['parts', partName, 'title']) || `Part ${pIndex + 1}`;
                
                // Show passage if it has content (edit mode) or if user clicked "Add Reading Passage"
                const currentContent = form.getFieldValue(['parts', partName, 'content']);
                const showPassage = showPassageObj[partName] || !!currentContent;

                return {
                  key: partKey.toString(),
                  label: <span style={{ fontWeight: 'bold' }}>{partTitle}</span>,
                  children: (
                    <div style={{ padding: '8px 4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <Popconfirm
                          title="Delete this entire Part?"
                          description="This action cannot be undone and all questions will be lost."
                          onConfirm={() => {
                            removePart(partName);
                            if (activeTabKey === partKey.toString()) setActiveTabKey('0');
                          }}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger icon={<DeleteOutlined />}>Delete Part</Button>
                        </Popconfirm>
                      </div>

                      <Form.Item name={[partName, 'title']} label="Part Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Part 1 - Sentence Comprehension" />
                      </Form.Item>

                      {showPassage ? (
                        <div style={{ position: 'relative' }}>
                          <Form.Item name={[partName, 'content']} label={<Text strong style={{ color: '#ea580c' }}>Reading Passage (Optional)</Text>}>
                            <BlurTextArea 
                              rows={6} 
                              placeholder="Paste the main reading passage here..." 
                              style={{ backgroundColor: '#fff7ed', borderColor: '#fdba74' }}
                            />
                          </Form.Item>
                          <Button 
                            type="text" 
                            danger 
                            size="small"
                            style={{ position: 'absolute', top: 0, right: 0 }}
                            onClick={() => {
                              form.setFieldValue(['parts', partName, 'content'], '');
                              setShowPassageObj(prev => ({...prev, [partName]: false}));
                            }}
                          >
                            Remove Passage
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="dashed" 
                          icon={<BookOutlined />} 
                          onClick={() => setShowPassageObj(prev => ({...prev, [partName]: true}))}
                          style={{ marginBottom: 24, width: '100%', borderColor: '#fdba74', color: '#ea580c', backgroundColor: '#fff7ed' }}
                        >
                          Add Reading Passage
                        </Button>
                      )}

                      <div style={{ padding: '16px 20px', backgroundColor: '#fafaf9', border: '1px solid #e5e5e5', borderRadius: 8 }}>
                        <Text strong style={{ display: 'block', marginBottom: 16, color: '#444' }}>
                          Questions List
                        </Text>

                        <Form.List name={[partName, 'questions']}>
                          {(qFields, { add: addQ, remove: removeQ }) => {
                            
                            const collapseItems = qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => {
                                // Dynamic Question Number
                                let startQNum = 1;

                                // 1. From previous parts
                                for (let i = 0; i < pIndex; i++) {
                                  const prevPartQs = partsValues[i]?.questions || [];
                                  prevPartQs.forEach(q => {
                                    if (q?.question_type === 'REORDER_SENTENCES') {
                                      const optCount = Array.isArray(q?.options) ? q.options.length : 0;
                                      startQNum += (optCount > 0 ? optCount : 1);
                                    } else {
                                      startQNum += 1;
                                    }
                                  });
                                }

                                // 2. From previous questions in CURRENT part
                                const currentPartQs = partsValues[pIndex]?.questions || [];
                                for (let j = 0; j < qIndex; j++) {
                                  const q = currentPartQs[j];
                                  if (q?.question_type === 'REORDER_SENTENCES') {
                                    const optCount = Array.isArray(q?.options) ? q.options.length : 0;
                                    startQNum += (optCount > 0 ? optCount : 1);
                                  } else {
                                    startQNum += 1;
                                  }
                                }

                                // 3. Range
                                const currentQ = currentPartQs[qIndex];
                                let endQNum = startQNum;
                                let isMulti = false;

                                if (currentQ?.question_type === 'REORDER_SENTENCES') {
                                  const optCount = Array.isArray(currentQ?.options) ? currentQ.options.length : 0;
                                  if (optCount > 1) {
                                    endQNum = startQNum + optCount - 1;
                                    isMulti = true;
                                  }
                                }

                                const questionTitle = isMulti 
                                  ? `Questions ${startQNum} - ${endQNum}` 
                                  : `Question ${startQNum}`;

                                return {
                                  key: qKey.toString(),
                                  forceRender: true,
                                  label: <span style={{ fontWeight: 600, color: '#ea580c' }}>{questionTitle}</span>,
                                  extra: (
                                    <span onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 8 }}>
                                      <Popconfirm title="Delete question?" onConfirm={(e) => { e.stopPropagation(); removeQ(qName); }} okText="Yes" cancelText="No">
                                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                      </Popconfirm>
                                    </span>
                                  ),
                                  children: (
                                    <div style={{ paddingTop: 8 }}>
                                      <Form.Item shouldUpdate noStyle>
                                        {({ getFieldValue }) => {
                                          const qType = getFieldValue(['parts', partName, 'questions', qName, 'question_type']);
                                          const pathProps = {
                                            relativePath: [qName],
                                            absolutePath: ['parts', partName, 'questions', qName],
                                            restField: restQField,
                                            form: form
                                          };

                                          return (
                                            <>
                                              <Row gutter={16} style={{ marginBottom: 12 }}>
                                                <Col span={qType === 'REORDER_SENTENCES' ? 24 : 8}>
                                                  <Form.Item {...restQField} name={[qName, 'question_type']} label="Question Type" rules={[{ required: true }]}>
                                                    <Select>
                                                      <Option value="MULTIPLE_CHOICE">Multiple Choice</Option>
                                                      <Option value="FILL_IN_BLANKS">Fill in the Blanks</Option>
                                                      <Option value="MATCHING_OPINIONS">Matching Opinions (P3)</Option>
                                                      <Option value="MATCHING_HEADINGS">Matching Headings (P4)</Option>
                                                      <Option value="REORDER_SENTENCES">Reorder Sentences (P2)</Option>
                                                    </Select>
                                                  </Form.Item>
                                                </Col>
                                                {qType !== 'REORDER_SENTENCES' && (
                                                  <Col span={16}>
                                                    <Form.Item {...restQField} name={[qName, 'question_text']} label="Question / Prompt">
                                                      <BlurInput placeholder="Enter question text or prompt..." />
                                                    </Form.Item>
                                                  </Col>
                                                )}
                                              </Row>

                                              {qType === 'REORDER_SENTENCES' && <ReorderSentencesAdmin {...pathProps} />}
                                              {(qType === 'MATCHING_OPINIONS' || qType === 'MATCHING_HEADINGS') && <MatchingAdmin {...pathProps} />}
                                              {qType === 'FILL_IN_BLANKS' && <FillInBlankAdmin {...pathProps} />}
                                              {(!qType || qType === 'MULTIPLE_CHOICE') && <MultipleChoiceAdmin {...pathProps} />}
                                            </>
                                          );
                                        }}
                                      </Form.Item>
                                    </div>
                                  )
                                };
                            });

                            return (
                              <>
                                <Collapse 
                                  size="small" 
                                  activeKey={activeQuestionKeys} 
                                  onChange={(keys) => setActiveQuestionKeys(keys)}
                                  items={collapseItems} 
                                  style={{ marginBottom: 16, backgroundColor: '#fff' }}
                                />

                                <Tooltip title={totalQuestionsCount >= MAX_QUESTIONS ? `Maximum ${MAX_QUESTIONS} questions reached for this test` : ""}>
                                  <Button
                                    type="dashed"
                                    disabled={totalQuestionsCount >= MAX_QUESTIONS}
                                    onClick={() => {
                                      addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0' });
                                      setActiveQuestionKeys([...activeQuestionKeys, qFields.length.toString()]);
                                    }}
                                    block
                                    icon={<PlusOutlined />}
                                    style={{ borderColor: '#f97316', color: totalQuestionsCount >= MAX_QUESTIONS ? '#cbd5e1' : '#ea580c', height: 44, fontWeight: 500 }}
                                  >
                                    ADD QUESTION TO THIS PART
                                  </Button>
                                </Tooltip>
                              </>
                            );
                          }}
                        </Form.List>
                      </div>
                    </div>
                  )
                };
              });

              return (
                <>
                  {partFields.length > 0 ? (
                    <Tabs
                      type="card"
                      activeKey={activeTabKey}
                      onChange={setActiveTabKey}
                      items={tabItems}
                      style={{ marginBottom: 16 }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                      <ExclamationCircleOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      <p>No parts exist. Please add a part to start creating questions.</p>
                    </div>
                  )}

                  <Space style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 8 }}>
                    <Tooltip title={currentPartsCount >= MAX_PARTS ? "Maximum 5 parts reached" : ""}>
                      <Button
                        type="primary"
                        ghost
                        disabled={currentPartsCount >= MAX_PARTS}
                        onClick={() => {
                          const newKey = partFields.length.toString();
                          addPart({ title: `Part ${partFields.length + 1}`, content: '', questions: [] });
                          setActiveTabKey(newKey);
                        }}
                        block
                        icon={<PlusOutlined />}
                        style={{ fontWeight: 'bold', width: 250, height: 44, borderColor: currentPartsCount >= MAX_PARTS ? '#cbd5e1' : '#f97316', color: currentPartsCount >= MAX_PARTS ? '#cbd5e1' : '#f97316' }}
                      >
                        ADD NEW PART
                      </Button>
                    </Tooltip>
                  </Space>
                </>
              );
            }}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
};

export default ReadingAptisEditPage;
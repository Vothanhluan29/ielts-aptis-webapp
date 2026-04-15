import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Popconfirm, Select, Tabs, Tooltip
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

  // Lắng nghe sự thay đổi của Form
  const partsValues = Form.useWatch('parts', form) || [];
  const currentPartsCount = partsValues.length;
  
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

  // Giới hạn hệ thống (Đã đồng bộ với hook)
  const MAX_PARTS = 5; 
  const MAX_QUESTIONS = 30; 

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/reading')}>
            Back
          </Button>
          <Title level={4} style={{ margin: 0, color: '#c2410c' }}>
            <BookOutlined /> {isEditMode ? `Edit Reading Test #${id}` : 'Create Reading Test'}
          </Title>
        </Space>
        <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large" style={{ backgroundColor: '#f97316' }}>
          {isEditMode ? 'Update Test' : 'Save Test'}
        </Button>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        onFinishFailed={onFinishFailed} 
        preserve={true}                 
      >
        {/* ================= GENERAL SETTINGS ================= */}
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label="Test Title" rules={[{ required: true }]}>
                <Input placeholder="e.g. Aptis Reading Practice Test 01" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label="Time Limit (minutes)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
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
              <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 'normal' }}>
                <span style={{ color: currentPartsCount >= MAX_PARTS ? '#ef4444' : '#64748b' }}>
                  Parts: <b>{currentPartsCount}/{MAX_PARTS}</b>
                </span>
                <span style={{ color: totalQuestionsCount >= MAX_QUESTIONS ? '#ef4444' : '#64748b' }}>
                  Questions (Points): <b>{totalQuestionsCount}/{MAX_QUESTIONS}</b>
                </span>
              </div>
            </div>
          }
        >
          <Form.List name="parts">
            {(partFields, { add: addPart, remove: removePart }) => {
              
              const tabItems = partFields.map(({ key: partKey, name: partName }, pIndex) => {
                const partTitle = form.getFieldValue(['parts', partName, 'title']) || `Part ${pIndex + 1}`;
                const showPassage = pIndex === 3 || pIndex === 4;

                return {
                  key: partKey.toString(),
                  label: <span style={{ fontWeight: 'bold' }}>{partTitle}</span>,
                  children: (
                    <div style={{ padding: '0 4px' }}>
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

                      <Form.Item name={[partName, 'title']} label="Part Title">
                        <Input placeholder="e.g. Part 1 - Sentence Comprehension" />
                      </Form.Item>

                      {showPassage && (
                        <Form.Item name={[partName, 'content']} label={<Text strong style={{ color: '#ea580c' }}>Reading Passage</Text>}>
                          <TextArea 
                            rows={8} 
                            placeholder="Paste the main reading passage here..." 
                            style={{ backgroundColor: '#fff7ed', borderColor: '#fdba74' }}
                          />
                        </Form.Item>
                      )}

                      <div style={{ padding: 16, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                        <Text strong style={{ display: 'block', marginBottom: 16, color: '#475569' }}>
                          Questions List
                        </Text>

                        <Form.List name={[partName, 'questions']}>
                          {(qFields, { add: addQ, remove: removeQ }) => (
                            <>
                              {qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => {
                                // 🔥 TỐI ƯU: Logic tính toán số thứ tự câu hỏi ĐỘNG (Dynamic Question Number)
                                let startQNum = 1;

                                // 1. Cộng dồn số câu hỏi từ các Part trước
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

                                // 2. Cộng dồn từ các câu hỏi trước trong CÙNG 1 Part
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

                                // 3. Tính khoảng hiển thị (Ví dụ: Câu 6 hay Câu 6 - 10)
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

                                return (
                                  <Card
                                    size="small"
                                    type="inner"
                                    key={qKey}
                                    style={{ marginBottom: 16, borderColor: '#cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                    title={<strong style={{ color: '#ea580c' }}>{questionTitle}</strong>}
                                    extra={<Button danger type="text" size="small" onClick={() => removeQ(qName)}>Remove</Button>}
                                  >
                                    <Row gutter={16} style={{ marginBottom: 12 }}>
                                      <Col span={8}>
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
                                      <Col span={16}>
                                        <Form.Item {...restQField} name={[qName, 'question_text']} label="Question / Prompt">
                                          <Input placeholder="Enter question text or prompt..." />
                                        </Form.Item>
                                      </Col>
                                    </Row>

                                    <Form.Item shouldUpdate noStyle>
                                      {({ getFieldValue }) => {
                                        const qType = getFieldValue(['parts', partName, 'questions', qName, 'question_type']);
                                        const pathProps = {
                                          relativePath: [qName],
                                          absolutePath: ['parts', partName, 'questions', qName],
                                          restField: restQField,
                                          form: form
                                        };

                                        if (qType === 'REORDER_SENTENCES') return <ReorderSentencesAdmin {...pathProps} />;
                                        if (qType === 'MATCHING_OPINIONS' || qType === 'MATCHING_HEADINGS') return <MatchingAdmin {...pathProps} />;
                                        if (qType === 'FILL_IN_BLANKS') return <FillInBlankAdmin {...pathProps} />;
                                        return <MultipleChoiceAdmin {...pathProps} />;
                                      }}
                                    </Form.Item>
                                  </Card>
                                );
                              })}

                              <Tooltip title={totalQuestionsCount >= MAX_QUESTIONS ? "Maximum 35 points/questions reached for this test" : ""}>
                                <Button
                                  type="dashed"
                                  disabled={totalQuestionsCount >= MAX_QUESTIONS}
                                  onClick={() => addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0' })}
                                  block
                                  icon={<PlusOutlined />}
                                  style={{ borderColor: '#94a3b8', color: totalQuestionsCount >= MAX_QUESTIONS ? '#cbd5e1' : '#475569', height: 40 }}
                                >
                                  ADD QUESTION TO THIS PART
                                </Button>
                              </Tooltip>
                            </>
                          )}
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
                        style={{ fontWeight: 'bold', width: 250, borderColor: currentPartsCount >= MAX_PARTS ? '#cbd5e1' : '#f97316', color: currentPartsCount >= MAX_PARTS ? '#cbd5e1' : '#f97316' }}
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
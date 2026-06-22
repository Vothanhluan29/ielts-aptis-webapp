import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Popconfirm, Upload, Select, Tabs, Tooltip, Collapse
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, UploadOutlined, ExclamationCircleOutlined, SoundOutlined
} from '@ant-design/icons';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../components/APTIS/question-types/FillInBlankAdmin';
import { useListeningAptisEdit } from '../../../hooks/APTIS/listening/useListeningAptisEdit'; 
import { BlurInput, BlurTextArea } from '../../../../../components/common/BlurInput';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ListeningAptisEditPage = () => {
  const {
    id,
    form,
    isEditMode,
    loading,
    submitting,
    onFinish,
    onFinishFailed,
    handleUploadAudio,
    navigate
  } = useListeningAptisEdit();

  const [activeTabKey, setActiveTabKey] = useState('0');
  const [activeQuestionKeys, setActiveQuestionKeys] = useState([]);

  const partsValues = Form.useWatch('parts', form) || [];
  const currentPartsCount = partsValues.length;
  const titleValue = Form.useWatch('title', form);
  
  const totalQuestionsCount = partsValues.reduce((total, part) => {
    return total + (part?.questions?.length || 0);
  }, 0);

  const MAX_PARTS = 4;
  const MAX_QUESTIONS = 25;

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/listening')}>
            Back
          </Button>
          <Title level={4} style={{ margin: 0, color: '#312e81' }}>
            <SoundOutlined /> {isEditMode ? `Edit: ${titleValue || 'Untitled'}` : 'Create Listening Test'}
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
          <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large" style={{ backgroundColor: '#4f46e5' }}>
            {isEditMode ? 'Update Test' : 'Save Test'}
          </Button>
        </Space>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        onFinishFailed={onFinishFailed} 
        autoComplete="off" 
        preserve={true}
      >
        {/* ================= GENERAL SETTINGS ================= */}
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
           <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label="Test Title" rules={[{ required: true, message: 'Title is required!' }]}>
                <Input placeholder="E.g: Aptis Listening Practice 01" size="large" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label="Time Limit (minutes)" rules={[{ required: true }]}>
                <InputNumber min={5} max={120} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Test Description (Optional)">
            <TextArea 
              rows={3} 
              placeholder="Enter instructions, notes or a short description for this listening test..." 
              maxLength={500} 
              showCount 
            />
          </Form.Item>

          <Space size="large">
            <Form.Item name="is_published" valuePropName="checked" label="Status" style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
            <Form.Item name="is_full_test_only" valuePropName="checked" label="Test Mode" style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Mock Test Only" unCheckedChildren="Practice" />
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
                const isPart1 = pIndex === 0;

                return {
                  key: partKey.toString(),
                  label: <span style={{ fontWeight: 'bold' }}>{partTitle}</span>,
                  children: (
                    <div style={{ padding: '8px 4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <Popconfirm
                          title="Delete this entire Part?"
                          description="All questions in this part will be removed."
                          onConfirm={() => {
                            removePart(partName);
                            if (activeTabKey === partKey.toString()) {
                              setActiveTabKey('0');
                            }
                          }}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger icon={<DeleteOutlined />}>Delete Part</Button>
                        </Popconfirm>
                      </div>

                      <Row gutter={16}>
                        <Col span={isPart1 ? 24 : 8}>
                          <Form.Item name={[partName, 'title']} label="Part Title">
                            <Input placeholder="E.g: Part 1 - Word Recognition" />
                          </Form.Item>
                        </Col>
                        {!isPart1 && (
                          <Col span={16}>
                            <Form.Item label={<Text strong style={{ color: '#4f46e5' }}>Shared Audio (Required for Part {pIndex + 1})</Text>}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <Form.Item name={[partName, 'audio_url']} noStyle rules={[{ required: true, message: 'Shared audio is required' }]}>
                                  <BlurInput placeholder="Paste shared audio link for this entire Part..." style={{ flex: 1 }} />
                                </Form.Item>
                                <Upload 
                                  customRequest={(options) => handleUploadAudio(options, partName)} 
                                  showUploadList={false} accept="audio/*"
                                >
                                  <Button icon={<UploadOutlined />} type="primary" ghost>Upload MP3</Button>
                                </Upload>
                              </div>
                            </Form.Item>
                          </Col>
                        )}
                      </Row>

                      {/* --- QUESTIONS INSIDE PART --- */}
                      <div style={{ padding: '16px 20px', backgroundColor: '#fafaf9', border: '1px solid #e5e5e5', borderRadius: 8 }}>
                        <Text strong style={{ display: 'block', marginBottom: 16, color: '#444' }}>
                          Questions List
                        </Text>
                        
                        <Form.List name={[partName, 'questions']}>
                          {(qFields, { add: addQ, remove: removeQ }) => {
                            
                            const collapseItems = qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => {
                              let globalQNum = 0;
                              for (let i = 0; i < pIndex; i++) {
                                globalQNum += (partsValues[i]?.questions?.length || 0);
                              }
                              globalQNum += (qIndex + 1);

                              return {
                                key: qKey.toString(),
                                forceRender: true,
                                label: <span style={{ fontWeight: 600, color: '#4f46e5' }}>Question {globalQNum}</span>,
                                extra: (
                                  <span onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 8 }}>
                                    <Popconfirm title="Delete question?" onConfirm={(e) => { e.stopPropagation(); removeQ(qName); }} okText="Yes" cancelText="No">
                                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  </span>
                                ),
                                children: (
                                  <div style={{ paddingTop: 8 }}>
                                    {isPart1 && (
                                      <Form.Item label={<Text strong style={{ color: '#0ea5e9' }}>Individual Audio (Required for Part 1)</Text>} style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                          <Form.Item {...restQField} name={[qName, 'audio_url']} noStyle rules={[{ required: true, message: 'Audio is required for Part 1 questions' }]}>
                                            <BlurInput placeholder="Provide audio for this question..." style={{ flex: 1 }} />
                                          </Form.Item>
                                          <Upload 
                                            customRequest={(options) => handleUploadAudio(options, partName, qName)} 
                                            showUploadList={false} accept="audio/*"
                                          >
                                            <Button icon={<UploadOutlined />}>Upload MP3</Button>
                                          </Upload>
                                        </div>
                                      </Form.Item>
                                    )}

                                    <Row gutter={16}>
                                      <Col span={6}>
                                        <Form.Item 
                                          {...restQField} 
                                          name={[qName, 'question_type']} 
                                          label="Question Type" 
                                          rules={[{ required: true }]}
                                        >
                                          <Select>
                                            <Option value="MULTIPLE_CHOICE">Multiple Choice</Option>
                                            <Option value="MATCHING">Matching</Option>
                                            <Option value="SHORT_ANSWER">Fill in the Blank</Option>
                                          </Select>
                                        </Form.Item>
                                      </Col>
                                      <Col span={18}>
                                        <Form.Item label="Question Content" required style={{ marginBottom: 12 }}>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <Form.Item {...restQField} name={[qName, 'question_text']} rules={[{ required: true, message: 'Please enter question content!' }]} style={{ flex: 1, marginBottom: 0 }}>
                                              <BlurInput placeholder="E.g: What is the main topic?" />
                                            </Form.Item>
                                            <Button 
                                              type="dashed"
                                              onClick={() => {
                                                const currentText = form.getFieldValue(['parts', partName, 'questions', qName, 'question_text']) || '';
                                                form.setFieldValue(['parts', partName, 'questions', qName, 'question_text'], currentText + ' ___ ');
                                              }}
                                            >
                                              Insert "___"
                                            </Button>
                                          </div>
                                        </Form.Item>
                                      </Col>
                                    </Row>

                                    <Form.Item shouldUpdate={(prevValues, currentValues) => {
                                        const prevType = prevValues.parts?.[partName]?.questions?.[qName]?.question_type;
                                        const currType = currentValues.parts?.[partName]?.questions?.[qName]?.question_type;
                                        return prevType !== currType;
                                      }} 
                                      noStyle
                                    >
                                      {({ getFieldValue }) => {
                                        const qType = getFieldValue(['parts', partName, 'questions', qName, 'question_type']) || 'MULTIPLE_CHOICE';
                                        
                                        if (qType === 'MATCHING') {
                                          return <MatchingAdmin relativePath={[qName]} absolutePath={['parts', partName, 'questions', qName]} restField={restQField} form={form} />;
                                        }

                                        if (qType === 'SHORT_ANSWER') {
                                          return <FillInBlankAdmin relativePath={[qName]} restField={restQField} />;
                                        }
                                        
                                        return <MultipleChoiceAdmin relativePath={[qName]} absolutePath={['parts', partName, 'questions', qName]} restField={restQField} form={form} />;
                                      }}
                                    </Form.Item>

                                    <Form.Item {...restQField} name={[qName, 'explanation']} label="Explanation / Transcript (Optional)" style={{ marginBottom: 0 }}>
                                      <BlurTextArea rows={1} placeholder="Enter transcript or reason for selecting this answer..." />
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
                                      addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' });
                                      setActiveQuestionKeys([...activeQuestionKeys, qFields.length.toString()]);
                                    }} 
                                    block icon={<PlusOutlined />}
                                    style={{ borderColor: '#818cf8', color: totalQuestionsCount >= MAX_QUESTIONS ? '#cbd5e1' : '#4f46e5', height: 44, fontWeight: 500 }}
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
                    <Tooltip title={currentPartsCount >= MAX_PARTS ? `Maximum ${MAX_PARTS} parts reached` : ""}>
                      <Button 
                        type="primary" ghost
                        disabled={currentPartsCount >= MAX_PARTS}
                        onClick={() => {
                          const newKey = partFields.length.toString();
                          addPart({ 
                            title: `Part ${partFields.length + 1}`, 
                            audio_url: '', 
                            questions: [{ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' }] 
                          });
                          setActiveTabKey(newKey);
                        }} 
                        icon={<PlusOutlined />}
                        style={{ fontWeight: 'bold', width: 250, height: 44, borderColor: currentPartsCount >= MAX_PARTS ? '#cbd5e1' : '#4f46e5', color: currentPartsCount >= MAX_PARTS ? '#cbd5e1' : '#4f46e5' }}
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

export default ListeningAptisEditPage;
import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Popconfirm, Upload, Select, Tabs, Tooltip
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, UploadOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../components/APTIS/question-types/FillInBlankAdmin';
import { useListeningAptisEdit } from '../../../hooks/APTIS/listening/useListeningAptisEdit'; 

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ListeningAptisEditPage = () => {
  // Lấy data và hàm xử lý từ Hook
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

  // State quản lý Tab hiện tại
  const [activeTabKey, setActiveTabKey] = useState('0');

  // Lắng nghe sự thay đổi của Form để đếm số lượng câu hỏi/part real-time
  const partsValues = Form.useWatch('parts', form) || [];
  const currentPartsCount = partsValues.length;
  
  // Tính tổng số câu hỏi hiện có trong tất cả các Part
  const totalQuestionsCount = partsValues.reduce((total, part) => {
    return total + (part?.questions?.length || 0);
  }, 0);

  // Giới hạn hệ thống
  const MAX_PARTS = 4;
  const MAX_QUESTIONS = 25;

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/listening')}>Back</Button>
          <Title level={4} style={{ margin: 0, color: '#312e81' }}>
            {isEditMode ? `Edit Listening Test #${id}` : 'Create Aptis Listening Test'}
          </Title>
        </Space>
        <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large" style={{ backgroundColor: '#4f46e5' }}>
          {isEditMode ? 'Update Test' : 'Save Test'}
        </Button>
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
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16 }}>
           <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label="Test Title" rules={[{ required: true, message: 'Title is required!' }]}>
                <Input placeholder="E.g: Aptis Listening Practice 01" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label="Time Limit (minutes)" rules={[{ required: true }]}>
                <InputNumber min={5} max={120} style={{ width: '100%' }} />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_published" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch checkedChildren="Published" unCheckedChildren="Draft" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_full_test_only" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch checkedChildren="Mock Test Only" unCheckedChildren="Practice" />
              </Form.Item>
            </Col>
          </Row>
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
                  Questions: <b>{totalQuestionsCount}/{MAX_QUESTIONS}</b>
                </span>
              </div>
            </div>
          }
        >
          <Form.List name="parts">
            {(partFields, { add: addPart, remove: removePart }) => {
              
              // Cấu trúc danh sách các Tabs (Mỗi Tab đại diện cho 1 Part)
              const tabItems = partFields.map(({ key: partKey, name: partName }, pIndex) => {
                const partTitle = form.getFieldValue(['parts', partName, 'title']) || `Part ${pIndex + 1}`;
                
                return {
                  key: partKey.toString(),
                  label: (
                    <span style={{ fontWeight: 'bold' }}>
                      {partTitle}
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '0 4px' }}>
                      {/* --- PART HEADER CONTROLS --- */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <Popconfirm
                          title="Delete this entire Part?"
                          description="All questions in this part will be removed."
                          onConfirm={() => {
                            removePart(partName);
                            // Nếu đang xóa tab hiện tại, tự động chuyển về tab đầu tiên
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
                        <Col span={8}>
                          <Form.Item name={[partName, 'title']} label="Part Title">
                            <Input placeholder="E.g: Part 1 - Word Recognition" />
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item label="Shared Audio URL (For Parts 2, 3, 4)">
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Form.Item name={[partName, 'audio_url']} noStyle>
                                <Input placeholder="Paste shared audio link for this entire Part..." style={{ flex: 1 }} />
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
                      </Row>

                      {/* --- QUESTIONS INSIDE PART --- */}
                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                        <Text strong style={{ display: 'block', marginBottom: 16, color: '#475569' }}>
                          Questions List
                        </Text>
                        
                        <Form.List name={[partName, 'questions']}>
                          {(qFields, { add: addQ, remove: removeQ }) => (
                            <>
                              {qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => {
                                // Logic tính toán số thứ tự câu hỏi liên tục
                                let globalQNum = 0;
                                for (let i = 0; i < pIndex; i++) {
                                  globalQNum += (partsValues[i]?.questions?.length || 0);
                                }
                                globalQNum += (qIndex + 1);

                                return (
                                  <Card 
                                    size="small" 
                                    type="inner" 
                                    key={qKey} 
                                    style={{ marginBottom: 16, borderColor: '#cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                    title={<strong style={{ color: '#4f46e5' }}>Question {globalQNum}</strong>}
                                    extra={<Button danger type="text" size="small" onClick={() => removeQ(qName)}>Remove</Button>}
                                  >
                                    {/* INDIVIDUAL AUDIO FOR EACH QUESTION (FOR PART 1) */}
                                    <Form.Item label="Individual Audio URL (For Part 1 only)" style={{ marginBottom: 12 }}>
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <Form.Item {...restQField} name={[qName, 'audio_url']} noStyle>
                                          <Input placeholder="If filled, this question will have its own independent audio..." style={{ flex: 1 }} />
                                        </Form.Item>
                                        <Upload 
                                          customRequest={(options) => handleUploadAudio(options, partName, qName)} 
                                          showUploadList={false} accept="audio/*"
                                        >
                                          <Button icon={<UploadOutlined />}>Upload MP3</Button>
                                        </Upload>
                                      </div>
                                    </Form.Item>

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
                                              <Input placeholder="E.g: What is the main topic?" />
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
                                      <Input.TextArea rows={1} placeholder="Enter transcript or reason for selecting this answer..." />
                                    </Form.Item>
                                  </Card>
                                );
                              })}

                              {/* NÚT THÊM CÂU HỎI */}
                              <Tooltip title={totalQuestionsCount >= MAX_QUESTIONS ? "Maximum 25 questions reached for this test" : ""}>
                                <Button 
                                  type="dashed" 
                                  disabled={totalQuestionsCount >= MAX_QUESTIONS}
                                  onClick={() => addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' })} 
                                  block icon={<PlusOutlined />}
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

                  {/* NÚT THÊM PART */}
                  <Space style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 8 }}>
                    <Tooltip title={currentPartsCount >= MAX_PARTS ? "Maximum 4 parts reached" : ""}>
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
                          // Tự động chuyển sang Tab mới vừa tạo
                          setActiveTabKey(newKey);
                        }} 
                        icon={<PlusOutlined />}
                        style={{ fontWeight: 'bold', width: 250 }}
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
import React from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Collapse, Popconfirm, Upload, Select
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, UploadOutlined
} from '@ant-design/icons';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../components/APTIS/question-types/FillInBlankAdmin';
import { useListeningAptisEdit } from '../../../hooks/APTIS/listening/useListeningAptisEdit'; 

const { Title, Text } = Typography;
const { Panel } = Collapse;
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
    activePartKeys,
    setActivePartKeys,
    onFinish,
    onFinishFailed,
    handleUploadAudio,
    navigate
  } = useListeningAptisEdit();

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

        <Card size="small" title="2. Part Content">
          <Form.List name="parts">
            {(partFields, { add: addPart, remove: removePart }) => (
              <>
                <Collapse activeKey={activePartKeys} onChange={setActivePartKeys} style={{ marginBottom: 16, backgroundColor: '#f8fafc' }}>
                  {partFields.map(({ key: partKey, name: partName }, pIndex) => (
                    <Panel 
                      key={partKey.toString()} 
                      header={
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue }) => (
                            <strong style={{ color: '#4338ca', fontSize: 16 }}>
                              Part {pIndex + 1}: {getFieldValue(['parts', partName, 'title']) || 'No title'}
                            </strong>
                          )}
                        </Form.Item>
                      }
                      extra={
                        <Popconfirm
                          title="Delete this entire Part?"
                          onConfirm={(e) => { e.stopPropagation(); removePart(partName); }}
                          onCancel={(e) => e.stopPropagation()}
                        >
                          <DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} onClick={(e) => e.stopPropagation()} />
                        </Popconfirm>
                      }
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name={[partName, 'title']} label="Part Title">
                            <Input placeholder="E.g: Part 1 - Word Recognition" />
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item label="Audio URL (For Parts 2, 3, 4 — Shared Audio)">
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

                      <div style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                        <Text strong style={{ display: 'block', marginBottom: 12, color: '#475569' }}>Questions in this Part</Text>
                        
                        <Form.List name={[partName, 'questions']}>
                          {(qFields, { add: addQ, remove: removeQ }) => (
                            <>
                              {qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => (
                                <Card size="small" type="inner" key={qKey} style={{ marginBottom: 16, borderColor: '#cbd5e1' }}
                                  title={
                                    <Form.Item shouldUpdate noStyle>
                                      {() => {
                                        // Đếm tổng số câu hỏi của các Part trước đó
                                        const currentParts = form.getFieldValue('parts') || [];
                                        let prevQuestionsCount = 0;
                                        for (let i = 0; i < pIndex; i++) {
                                          prevQuestionsCount += (currentParts[i]?.questions?.length || 0);
                                        }
                                        return `Question ${prevQuestionsCount + qIndex + 1}`;
                                      }}
                                    </Form.Item>
                                  }
                                  extra={<Button danger type="text" size="small" onClick={() => removeQ(qName)}>Delete</Button>}
                                >
                                  {/* INDIVIDUAL AUDIO FOR EACH QUESTION (FOR PART 1) */}
                                  <Form.Item label="Individual Audio URL for this question (Part 1 only)" style={{ marginBottom: 12 }}>
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
                                          <Option value="MULTIPLE_CHOICE">Multiple Choice (A, B, C)</Option>
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
                                        return (
                                          <MatchingAdmin 
                                            relativePath={[qName]} 
                                            absolutePath={['parts', partName, 'questions', qName]} 
                                            restField={restQField} 
                                            form={form} 
                                          />
                                        );
                                      }

                                      if (qType === 'SHORT_ANSWER') {
                                        return (
                                          <FillInBlankAdmin 
                                            relativePath={[qName]} 
                                            restField={restQField} 
                                          />
                                        );
                                      }
                                      
                                      return (
                                        <MultipleChoiceAdmin 
                                          relativePath={[qName]} 
                                          absolutePath={['parts', partName, 'questions', qName]} 
                                          restField={restQField} 
                                          form={form} 
                                        />
                                      );
                                    }}
                                  </Form.Item>

                                  <Form.Item {...restQField} name={[qName, 'explanation']} label="Explanation / Transcript (Optional)" style={{ marginBottom: 0 }}>
                                    <Input.TextArea rows={1} placeholder="Enter transcript or reason for selecting this answer..." />
                                  </Form.Item>
                                </Card>
                              ))}

                              <Button 
                                type="dashed" 
                                onClick={() => addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' })} 
                                block icon={<PlusOutlined />}
                                style={{ borderColor: '#94a3b8', color: '#475569' }}
                              >
                                ADD QUESTION TO THIS PART
                              </Button>
                            </>
                          )}
                        </Form.List>
                      </div>
                    </Panel>
                  ))}
                </Collapse>

                <Space style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Button 
                    type="primary" ghost
                    onClick={() => {
                      addPart({ 
                        title: `Part ${partFields.length + 1}`, 
                        audio_url: '', 
                        questions: [{ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' }] 
                      });
                      setActivePartKeys([...activePartKeys, partFields.length.toString()]);
                    }} 
                    icon={<PlusOutlined />}
                    style={{ fontWeight: 'bold', width: 250 }}
                  >
                    ADD NEW PART
                  </Button>
                </Space>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
};

export default ListeningAptisEditPage;
import React from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Upload, Tag, Divider, Image, Tabs 
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, UploadOutlined, 
  AudioOutlined, PictureOutlined, SoundOutlined, EditOutlined 
} from '@ant-design/icons';

import speakingAptisApi from '../../../api/APTIS/speaking/speakingAptisAdminApi';
import { useSpeakingAptisEdit, PART_CONFIGS } from '../../../hooks/APTIS/speaking/useSpeakingAptisEdit';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SpeakingAptisEditPage = () => {
  const {
    id,
    form,
    isEditMode,
    loading,
    submitting,
    handleUploadFile,
    onFinish,
    navigate
  } = useSpeakingAptisEdit();

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/speaking')}>Back</Button>
          
          <Title level={3} style={{ margin: 0, color: '#2563eb' }}>
            <EditOutlined /> {isEditMode ? `Update Exam #${id}` : 'Create New Speaking Exam'}
          </Title>
        </Space>
        
        <Button 
          type="primary" size="large" onClick={() => form.submit()} 
          icon={<SaveOutlined />} loading={submitting} 
          style={{ backgroundColor: '#2563eb', borderRadius: 8, height: 45 }}
        >
          {isEditMode ? 'UPDATE EXAM' : 'SAVE EXAM'}
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        {/* 1. GENERAL INFORMATION */}
        <Card variant="borderless" title="1. General Information" style={{ marginBottom: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Row gutter={24}>
            <Col span={10}>
              <Form.Item name="title" label={<Text strong>Exam Title</Text>} rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Aptis Speaking Practice 01" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="time_limit" label={<Text strong>Time Limit (minutes)</Text>} rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_full_test_only" valuePropName="checked" label={<Text strong>Exam Mode</Text>}>
                <Switch checkedChildren="Mock Test" unCheckedChildren="Practice" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_published" valuePropName="checked" label={<Text strong>Status</Text>}>
                <Switch checkedChildren="Public" unCheckedChildren="Draft" />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Col span={24}>
              <Form.Item name="description" label={<Text strong>Exam Description</Text>}>
                <TextArea rows={2} placeholder="Brief description of this Speaking exam..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider titlePlacement="left"><Title level={4} style={{ margin: 0 }}>2. Content for 4 Speaking Parts</Title></Divider>

        {/* 2. PARTS LIST AS TABS */}
        <Form.List name="parts">
          {(fields) => {
            const tabItems = fields.map(({ name }, index) => {
              const config = PART_CONFIGS[index];
              const hasImage = config.images > 0;
              const hasTwoImages = config.images === 2; 

              return {
                key: String(index),
                label: (
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>
                    <AudioOutlined /> {config.title}
                  </span>
                ),
                children: (
                  <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '0 0 12px 12px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
                    <Row gutter={24}>
                      {/* Left Column: QUESTIONS & AUDIO */}
                      <Col span={hasImage ? 15 : 24}>
                        <Form.Item name={[name, 'instruction']} label={<Text strong>Pre-start Instruction</Text>}>
                          <TextArea rows={2} placeholder="e.g. You have 30 seconds to answer each question..." />
                        </Form.Item>
                        
                        <div style={{ marginTop: 16 }}>
                          <Text strong style={{ display: 'block', marginBottom: 12 }}>Questions & Audio List:</Text>
                          {Array.from({ length: config.qCount }).map((_, qIdx) => (
                            <Card size="small" key={`q-${qIdx}`} style={{ marginBottom: 12, background: '#fafafa' }}>
                              <Row gutter={16} align="middle">
                                <Col span={12}>
                                  <Form.Item 
                                    name={[name, 'questions', qIdx, 'question_text']} 
                                    label={<Space><Tag color="blue">Q{qIdx + 1}</Tag> Question Text (Optional display)</Space>}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <TextArea rows={2} placeholder="Transcript of the audio file..." />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item shouldUpdate noStyle>
                                    {({ getFieldValue }) => {
                                      const audioUrl = getFieldValue(['parts', name, 'questions', qIdx, 'audio_url']);
                                      return (
                                        <Space style={{ width: '100%', justifyContent: 'space-between', background: '#fff', padding: '6px 12px', border: '1px solid #d9d9d9', borderRadius: 6, marginTop: 28 }}>
                                          {audioUrl ? (
                                            <audio controls src={audioUrl} style={{ height: 30, width: 180 }} />
                                          ) : (
                                            <Text type="secondary"><SoundOutlined /> No Audio</Text>
                                          )}
                                          <Upload customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'questions', qIdx, 'audio_url'], speakingAptisApi.uploadAudio)} showUploadList={false}>
                                            <Button size="small" icon={<UploadOutlined />}>Upload</Button>
                                          </Upload>
                                        </Space>
                                      );
                                    }}
                                  </Form.Item>
                                  <Form.Item name={[name, 'questions', qIdx, 'audio_url']} hidden><Input /></Form.Item>
                                  <Form.Item name={[name, 'questions', qIdx, 'order_number']} hidden><Input /></Form.Item>
                                  <Form.Item name={[name, 'questions', qIdx, 'prep_time']} hidden><InputNumber /></Form.Item>
                                  <Form.Item name={[name, 'questions', qIdx, 'response_time']} hidden><InputNumber /></Form.Item>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                        </div>
                      </Col>

                      {/* Right Column: IMAGES (Only shown in Parts 2, 3, 4) */}
                      {hasImage && (
                        <Col span={9}>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}><PictureOutlined /> Illustration Images</Text>
                          
                          {/* Image 1 */}
                          <Card size="small" style={{ marginBottom: 16 }}>
                            <Upload customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'image_url'], speakingAptisApi.uploadImage)} showUploadList={false}>
                              <Button block icon={<UploadOutlined />}>Upload Image {hasTwoImages ? '1' : ''}</Button>
                            </Upload>
                            <Form.Item shouldUpdate noStyle>
                              {({ getFieldValue }) => {
                                const img1 = getFieldValue(['parts', name, 'image_url']);
                                return img1 ? (
                                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                                    <Image src={img1} style={{ maxHeight: 150, borderRadius: 6 }} />
                                  </div>
                                ) : null;
                              }}
                            </Form.Item>
                            <Form.Item name={[name, 'image_url']} hidden><Input /></Form.Item>
                          </Card>

                          {/* Image 2 (For Part 3 only) */}
                          {hasTwoImages && (
                            <Card size="small">
                              <Upload customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'image_url_2'], speakingAptisApi.uploadImage)} showUploadList={false}>
                                <Button block icon={<UploadOutlined />}>Upload Image 2</Button>
                              </Upload>
                              <Form.Item shouldUpdate noStyle>
                                {({ getFieldValue }) => {
                                  const img2 = getFieldValue(['parts', name, 'image_url_2']);
                                  return img2 ? (
                                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                                      <Image src={img2} style={{ maxHeight: 150, borderRadius: 6 }} />
                                    </div>
                                  ) : null;
                                }}
                              </Form.Item>
                              <Form.Item name={[name, 'image_url_2']} hidden><Input /></Form.Item>
                            </Card>
                          )}
                        </Col>
                      )}
                    </Row>
                    <Form.Item name={[name, 'part_type']} hidden><Input /></Form.Item>
                    <Form.Item name={[name, 'part_number']} hidden><InputNumber /></Form.Item>
                  </div>
                )
              };
            });

            return (
              <Tabs 
                type="card" 
                size="large"
                items={tabItems} 
                style={{ backgroundColor: '#fafafa', paddingTop: 12, borderRadius: 12 }}
              />
            );
          }}
        </Form.List>
      </Form>
    </div>
  );
};

export default SpeakingAptisEditPage;
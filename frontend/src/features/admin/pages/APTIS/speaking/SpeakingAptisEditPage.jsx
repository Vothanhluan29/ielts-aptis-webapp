import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Upload, Tag, Divider, Image, Collapse 
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, UploadOutlined, 
  AudioOutlined, PictureOutlined, SoundOutlined, EditOutlined, 
  CustomerServiceOutlined, UserOutlined, TeamOutlined, GlobalOutlined
} from '@ant-design/icons';

import speakingAptisApi from '../../../api/APTIS/speaking/speakingAptisAdminApi';
import { useSpeakingAptisEdit, PART_CONFIGS } from '../../../hooks/APTIS/speaking/useSpeakingAptisEdit';
import { BlurInput, BlurTextArea } from '../../../../../components/common/BlurInput';

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

  const [activePartKeys, setActivePartKeys] = useState(['0']);
  const titleValue = Form.useWatch('title', form);

  const getPartIcon = (partType) => {
    switch (partType) {
      case "PART_1": return <UserOutlined style={{ color: '#0ea5e9', fontSize: 18 }} />;
      case "PART_2": return <PictureOutlined style={{ color: '#10b981', fontSize: 18 }} />;
      case "PART_3": return <TeamOutlined style={{ color: '#f59e0b', fontSize: 18 }} />;
      case "PART_4": return <GlobalOutlined style={{ color: '#ec4899', fontSize: 18 }} />;
      default: return <AudioOutlined style={{ color: '#3b82f6', fontSize: 18 }} />;
    }
  };

  const getPartColor = (partType) => {
    switch (partType) {
      case "PART_1": return '#0ea5e9';
      case "PART_2": return '#10b981';
      case "PART_3": return '#f59e0b';
      case "PART_4": return '#ec4899';
      default: return '#3b82f6';
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/speaking')}>
            Back
          </Button>
          <Title level={4} style={{ margin: 0, color: '#2563eb' }}>
            <CustomerServiceOutlined /> {isEditMode ? `Edit: ${titleValue || 'Untitled'}` : 'Create Speaking Test'}
          </Title>
        </Space>
        <Space>
          <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large" style={{ backgroundColor: '#2563eb' }}>
            {isEditMode ? 'Update Test' : 'Save Test'}
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        {/* ================= GENERAL SETTINGS ================= */}
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label={<Text strong>Exam Title</Text>} rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Aptis Speaking Practice 01" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label={<Text strong>Time Limit (minutes)</Text>} rules={[{ required: true }]}>
                <InputNumber min={1} max={120} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label={<Text strong>Exam Description (Optional)</Text>}>
            <TextArea rows={3} placeholder="Brief description of this Speaking exam..." showCount maxLength={500} />
          </Form.Item>

          <Space size="large">
            <Form.Item name="is_published" valuePropName="checked" label={<Text strong>Status</Text>} style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
            <Form.Item name="is_full_test_only" valuePropName="checked" label={<Text strong>Exam Mode</Text>} style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Mock Test" unCheckedChildren="Practice" />
            </Form.Item>
          </Space>
        </Card>

        {/* ================= PARTS CONTENT ================= */}
        <Card 
          size="small" 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>2. Test Content (4 Parts)</span>
            </div>
          }
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <Form.List name="parts">
            {(fields) => {
              const collapseItems = fields.map(({ name }, index) => {
                const config = PART_CONFIGS[index];
                if (!config) return null;
                
                const hasImage = config.images > 0;
                const hasTwoImages = config.images === 2; 

                return {
                  key: index.toString(),
                  forceRender: true,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        width: 36, height: 36, borderRadius: '8px', 
                        backgroundColor: `${getPartColor(config.type)}15` 
                      }}>
                        {getPartIcon(config.type)}
                      </div>
                      <span style={{ fontWeight: 'bold', fontSize: 16, color: '#334155' }}>
                        {config.title}
                      </span>
                      <Tag color="blue" style={{ marginLeft: 'auto' }}>Part {index + 1}</Tag>
                    </div>
                  ),
                  children: (
                    <div style={{ padding: '8px 4px' }}>
                      <Row gutter={32}>
                        {/* Left Column: QUESTIONS & AUDIO */}
                        <Col span={hasImage ? 15 : 24}>
                          <Form.Item name={[name, 'instruction']} label={<Text strong>Pre-start Instruction / Context</Text>}>
                            <BlurTextArea rows={2} placeholder="e.g. You have 30 seconds to answer each question..." />
                          </Form.Item>
                          
                          <div style={{ marginTop: 20 }}>
                            <Text strong style={{ display: 'block', marginBottom: 16, color: '#444' }}>Questions & Audio List</Text>
                            {Array.from({ length: config.qCount }).map((_, qIdx) => (
                              <div key={`q-${qIdx}`} style={{ marginBottom: 16, backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <Row gutter={16}>
                                  <Col span={13}>
                                    <Form.Item 
                                      name={[name, 'questions', qIdx, 'question_text']} 
                                      label={<span style={{ fontWeight: 600, color: '#3b82f6' }}>Question {qIdx + 1} Text</span>}
                                      style={{ marginBottom: 0 }}
                                    >
                                      <BlurTextArea rows={3} placeholder="Transcript or question content..." />
                                    </Form.Item>
                                  </Col>
                                  <Col span={11}>
                                    <Form.Item label={<span style={{ fontWeight: 600, color: '#475569' }}>Audio</span>} shouldUpdate noStyle>
                                      {({ getFieldValue }) => {
                                        const audioUrl = getFieldValue(['parts', name, 'questions', qIdx, 'audio_url']);
                                        return (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 30 }}>
                                            <Upload 
                                              customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'questions', qIdx, 'audio_url'], speakingAptisApi.uploadAudio)} 
                                              showUploadList={false}
                                            >
                                              <Button block icon={<UploadOutlined />}>{audioUrl ? 'Replace Audio' : 'Upload MP3'}</Button>
                                            </Upload>
                                            {audioUrl ? (
                                              <audio controls src={audioUrl} style={{ height: 32, width: '100%' }} />
                                            ) : (
                                              <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}><SoundOutlined /> No audio</Text>
                                            )}
                                          </div>
                                        );
                                      }}
                                    </Form.Item>
                                    <Form.Item name={[name, 'questions', qIdx, 'audio_url']} hidden><Input /></Form.Item>
                                    <Form.Item name={[name, 'questions', qIdx, 'order_number']} hidden><Input /></Form.Item>
                                    <Form.Item name={[name, 'questions', qIdx, 'prep_time']} hidden><InputNumber /></Form.Item>
                                    <Form.Item name={[name, 'questions', qIdx, 'response_time']} hidden><InputNumber /></Form.Item>
                                  </Col>
                                </Row>
                              </div>
                            ))}
                          </div>
                        </Col>

                        {/* Right Column: IMAGES (Only shown in Parts 2, 3, 4) */}
                        {hasImage && (
                          <Col span={9}>
                            <div style={{ backgroundColor: '#fff7ed', padding: 16, borderRadius: 8, border: '1px solid #fed7aa', height: '100%' }}>
                              <Text strong style={{ display: 'block', marginBottom: 16, color: '#c2410c' }}>
                                <PictureOutlined /> Illustration Images
                              </Text>
                              
                              {/* Image 1 */}
                              <div style={{ marginBottom: 24 }}>
                                <Upload customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'image_url'], speakingAptisApi.uploadImage)} showUploadList={false}>
                                  <Button type="dashed" block icon={<UploadOutlined />} style={{ borderColor: '#f97316', color: '#f97316' }}>
                                    Upload Image {hasTwoImages ? '1' : ''}
                                  </Button>
                                </Upload>
                                <Form.Item shouldUpdate noStyle>
                                  {({ getFieldValue }) => {
                                    const img1 = getFieldValue(['parts', name, 'image_url']);
                                    return img1 ? (
                                      <div style={{ marginTop: 12, textAlign: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}>
                                        <Image src={img1} style={{ maxHeight: 180, borderRadius: 4, objectFit: 'contain' }} />
                                      </div>
                                    ) : null;
                                  }}
                                </Form.Item>
                                <Form.Item name={[name, 'image_url']} hidden><Input /></Form.Item>
                              </div>

                              {/* Image 2 (For Part 3 only) */}
                              {hasTwoImages && (
                                <div>
                                  <Upload customRequest={(opt) => handleUploadFile(opt, ['parts', name, 'image_url_2'], speakingAptisApi.uploadImage)} showUploadList={false}>
                                    <Button type="dashed" block icon={<UploadOutlined />} style={{ borderColor: '#f97316', color: '#f97316' }}>
                                      Upload Image 2
                                    </Button>
                                  </Upload>
                                  <Form.Item shouldUpdate noStyle>
                                    {({ getFieldValue }) => {
                                      const img2 = getFieldValue(['parts', name, 'image_url_2']);
                                      return img2 ? (
                                        <div style={{ marginTop: 12, textAlign: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}>
                                          <Image src={img2} style={{ maxHeight: 180, borderRadius: 4, objectFit: 'contain' }} />
                                        </div>
                                      ) : null;
                                    }}
                                  </Form.Item>
                                  <Form.Item name={[name, 'image_url_2']} hidden><Input /></Form.Item>
                                </div>
                              )}
                            </div>
                          </Col>
                        )}
                      </Row>
                      
                      <Form.Item name={[name, 'part_type']} hidden><Input /></Form.Item>
                      <Form.Item name={[name, 'part_number']} hidden><InputNumber /></Form.Item>
                    </div>
                  )
                };
              }).filter(Boolean);

              return (
                <Collapse 
                  size="large" 
                  activeKey={activePartKeys} 
                  onChange={setActivePartKeys}
                  items={collapseItems} 
                  style={{ backgroundColor: '#fff' }}
                />
              );
            }}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
};

export default SpeakingAptisEditPage;
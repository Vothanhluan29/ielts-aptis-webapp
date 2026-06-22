import React, { useState } from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Tag, Divider, Collapse
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, EditOutlined,
  MessageOutlined, FormOutlined, FileTextOutlined, MailOutlined, FormOutlined as PenOutlined
} from '@ant-design/icons';

// Import Custom Hook và cấu hình
import { useWritingAptisEdit, PART_CONFIGS } from '../../../hooks/APTIS/writing/useWritingAptisEdit';
import { BlurInput, BlurTextArea } from '../../../../../components/common/BlurInput';

const { Title, Text } = Typography;
const { TextArea } = Input;

const WritingAptisEditPage = () => {
  const {
    id,
    form,
    isEditMode,
    loading,
    submitting,
    onFinish,
    navigate
  } = useWritingAptisEdit();

  const [activePartKeys, setActivePartKeys] = useState(['0']);
  const titleValue = Form.useWatch('title', form);

  const getPartIcon = (partType) => {
    switch (partType) {
      case "PART_1": return <MessageOutlined style={{ color: '#8b5cf6', fontSize: 18 }} />;
      case "PART_2": return <FormOutlined style={{ color: '#10b981', fontSize: 18 }} />;
      case "PART_3": return <FileTextOutlined style={{ color: '#f59e0b', fontSize: 18 }} />;
      case "PART_4": return <MailOutlined style={{ color: '#ec4899', fontSize: 18 }} />;
      default: return null;
    }
  };

  const getPartColor = (partType) => {
    switch (partType) {
      case "PART_1": return '#8b5cf6';
      case "PART_2": return '#10b981';
      case "PART_3": return '#f59e0b';
      case "PART_4": return '#ec4899';
      default: return '#7c3aed';
    }
  };

  const renderQuestions = (partType, partName) => {
    if (partType === "PART_4") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card size="small" type="inner" title={<Text strong style={{ color: '#0369a1' }}>Scenario / Received Email</Text>} style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
            <Form.Item name={[partName, 'questions', 0, 'question_text']} rules={[{ required: true, message: 'Please enter the scenario email!' }]} style={{ marginBottom: 0 }}>
              <BlurTextArea rows={4} placeholder="e.g. Dear Members, we are writing to inform you that the club meeting has been cancelled due to..." />
            </Form.Item>
            <Form.Item name={[partName, 'questions', 0, 'order_number']} hidden><Input /></Form.Item>
            <Form.Item name={[partName, 'questions', 0, 'sub_type']} hidden><Input /></Form.Item>
          </Card>

          <Row gutter={20}>
            <Col span={12}>
              <Card size="small" type="inner" title={<Text strong style={{ color: '#15803d' }}>Task 1: Informal Email Prompt</Text>} style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <Form.Item name={[partName, 'questions', 1, 'question_text']} rules={[{ required: true, message: 'Please enter the prompt!' }]} style={{ marginBottom: 0 }}>
                  <BlurTextArea rows={6} placeholder="e.g. Write to your friend, Sam. Explain your feelings about the cancellation..." />
                </Form.Item>
                <Form.Item name={[partName, 'questions', 1, 'order_number']} hidden><Input /></Form.Item>
                <Form.Item name={[partName, 'questions', 1, 'sub_type']} hidden><Input /></Form.Item>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" type="inner" title={<Text strong style={{ color: '#c2410c' }}>Task 2: Formal Email Prompt</Text>} style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                <Form.Item name={[partName, 'questions', 2, 'question_text']} rules={[{ required: true, message: 'Please enter the prompt!' }]} style={{ marginBottom: 0 }}>
                  <BlurTextArea rows={6} placeholder="e.g. Write to the Club President. Express your feelings and suggest alternatives..." />
                </Form.Item>
                <Form.Item name={[partName, 'questions', 2, 'order_number']} hidden><Input /></Form.Item>
                <Form.Item name={[partName, 'questions', 2, 'sub_type']} hidden><Input /></Form.Item>
              </Card>
            </Col>
          </Row>
        </div>
      );
    }

    const qCount = PART_CONFIGS.find(p => p.type === partType).qCount;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Array.from({ length: qCount }).map((_, idx) => (
          <div key={`q-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              marginTop: (partType === "PART_2" || partType === "PART_3") ? 8 : 4,
              backgroundColor: '#f3f4f6', 
              padding: '6px 14px', 
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#4b5563',
              border: '1px solid #e5e7eb'
            }}>
              Q{idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item 
                name={[partName, 'questions', idx, 'question_text']} 
                rules={[{ required: true, message: 'Required!' }]}
                style={{ marginBottom: 0 }}
              >
                {partType === "PART_2" || partType === "PART_3" ? (
                  <BlurTextArea rows={4} placeholder="e.g. Please tell us about your hobbies..." />
                ) : (
                  <BlurInput size="large" placeholder={`Enter question ${idx + 1}...`} />
                )}
              </Form.Item>
              <Form.Item name={[partName, 'questions', idx, 'order_number']} hidden><Input /></Form.Item>
              <Form.Item name={[partName, 'questions', idx, 'sub_type']} hidden><Input /></Form.Item>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/writing')}>
            Back
          </Button>
          <Title level={4} style={{ margin: 0, color: '#7c3aed' }}>
            <PenOutlined /> {isEditMode ? `Edit: ${titleValue || 'Untitled'}` : 'Create Writing Test'}
          </Title>
        </Space>
        <Space>
          <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large" style={{ backgroundColor: '#7c3aed' }}>
            {isEditMode ? 'Update Test' : 'Save Test'}
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        {/* ================= GENERAL SETTINGS ================= */}
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label={<Text strong>Test Title</Text>} rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Aptis Writing Practice Test 01" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label={<Text strong>Time Limit (minutes)</Text>} rules={[{ required: true }]}>
                <InputNumber min={1} max={120} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label={<Text strong>Test Description (Optional)</Text>}>
            <TextArea rows={3} placeholder="e.g. This is a full Aptis Writing Practice Test. Please write carefully." showCount maxLength={500} />
          </Form.Item>

          <Space size="large">
            <Form.Item name="is_published" valuePropName="checked" label={<Text strong>Status</Text>} style={{ marginBottom: 0 }}>
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
            <Form.Item name="is_full_test_only" valuePropName="checked" label={<Text strong>Test Mode</Text>} style={{ marginBottom: 0 }}>
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
              const collapseItems = fields.map(({ key, name }, index) => {
                const config = PART_CONFIGS[index];
                if (!config) return null; 

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
                      <Tag color="purple" style={{ marginLeft: 'auto' }}>Part {index + 1}</Tag>
                    </div>
                  ),
                  children: (
                    <div style={{ padding: '8px 4px' }}>
                      <Row gutter={24}>
                        <Col span={24}>
                          <Form.Item name={[name, 'instruction']} label={<Text strong>Part Instructions / Context</Text>} rules={[{ required: true }]}>
                            <BlurTextArea rows={2} placeholder="e.g. You are a member of a gardening club. You are talking to three other members in the club chat room..." />
                          </Form.Item>
                          
                          <div style={{ marginTop: 24, padding: '20px', backgroundColor: '#fafaf9', border: '1px solid #e5e5e5', borderRadius: 8 }}>
                            <Text strong style={{ display: 'block', marginBottom: 16, color: '#444' }}>Questions / Prompts</Text>
                            {renderQuestions(config.type, name)}
                          </div>
                        </Col>
                      </Row>

                      {/* Hidden Fields for Backend */}
                      <Form.Item name={[name, 'part_type']} hidden><Input /></Form.Item>
                      <Form.Item name={[name, 'part_number']} hidden><InputNumber /></Form.Item>
                      <Form.Item name={[name, 'image_url']} hidden><Input /></Form.Item>
                      <Form.Item name={[name, 'image_description']} hidden><Input /></Form.Item>
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

export default WritingAptisEditPage;
import React from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Tag, Divider 
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, EditOutlined,
  MessageOutlined, FormOutlined, FileTextOutlined, MailOutlined 
} from '@ant-design/icons';

// Import Custom Hook và cấu hình
import { useWritingAptisEdit, PART_CONFIGS } from '../../../hooks/APTIS/writing/useWritingAptisEdit';

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

  // 🔥 HÀM LẤY ICON CHUẨN ĐƯỢC CHUYỂN SANG ĐÂY
  const getPartIcon = (partType) => {
    switch (partType) {
      case "PART_1": return <MessageOutlined />;
      case "PART_2": return <FormOutlined />;
      case "PART_3": return <FileTextOutlined />;
      case "PART_4": return <MailOutlined />;
      default: return null;
    }
  };

  const renderQuestions = (partType, partName) => {
    if (partType === "PART_4") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card size="small" title={<Tag color="blue">Scenario / Received Email</Tag>} style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}>
            <Form.Item name={[partName, 'questions', 0, 'question_text']} rules={[{ required: true, message: 'Please enter the scenario email!' }]} style={{ marginBottom: 0 }}>
              <TextArea rows={4} placeholder="e.g. Dear Members, we are writing to inform you that the club meeting has been cancelled due to..." />
            </Form.Item>
            <Form.Item name={[partName, 'questions', 0, 'order_number']} hidden><Input /></Form.Item>
            <Form.Item name={[partName, 'questions', 0, 'sub_type']} hidden><Input /></Form.Item>
          </Card>

          <Row gutter={20}>
            <Col span={12}>
              <Card size="small" title={<Tag color="green">Task 1: Informal Email Prompt</Tag>} style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
                <Form.Item name={[partName, 'questions', 1, 'question_text']} rules={[{ required: true, message: 'Please enter the prompt!' }]} style={{ marginBottom: 0 }}>
                  <TextArea rows={6} placeholder="e.g. Write to your friend, Sam. Explain your feelings about the cancellation..." />
                </Form.Item>
                <Form.Item name={[partName, 'questions', 1, 'order_number']} hidden><Input /></Form.Item>
                <Form.Item name={[partName, 'questions', 1, 'sub_type']} hidden><Input /></Form.Item>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" title={<Tag color="orange">Task 2: Formal Email Prompt</Tag>} style={{ background: '#fff7e6', borderColor: '#ffd591' }}>
                <Form.Item name={[partName, 'questions', 2, 'question_text']} rules={[{ required: true, message: 'Please enter the prompt!' }]} style={{ marginBottom: 0 }}>
                  <TextArea rows={6} placeholder="e.g. Write to the Club President. Express your feelings and suggest alternatives..." />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: qCount }).map((_, idx) => (
          <div key={`q-${idx}`}>
            <Form.Item 
              name={[partName, 'questions', idx, 'question_text']} 
              rules={[{ required: true, message: 'Required!' }]}
              style={{ marginBottom: 0 }}
            >
              {partType === "PART_2" ? (
                <TextArea rows={4} placeholder="e.g. Please tell us about your hobbies..." />
              ) : (
                <Input size="large" placeholder={`Enter question ${idx + 1}...`} prefix={<Tag color="blue">Q{idx + 1}</Tag>} />
              )}
            </Form.Item>
            <Form.Item name={[partName, 'questions', idx, 'order_number']} hidden><Input /></Form.Item>
            <Form.Item name={[partName, 'questions', idx, 'sub_type']} hidden><Input /></Form.Item>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/writing')}>Back</Button>
          <Title level={3} style={{ margin: 0, color: '#7c3aed' }}><EditOutlined /> {isEditMode ? `Edit Setup #${id}` : 'Writing Test Setup'}</Title>
        </Space>
        <Button 
          type="primary" size="large" onClick={() => form.submit()} 
          icon={<SaveOutlined />} loading={submitting} 
          style={{ backgroundColor: '#7c3aed', borderRadius: 8, height: 45 }}
        >
          {isEditMode ? 'UPDATE TEST' : 'SAVE TEST'}
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Card variant="borderless" title="1. General Information" style={{ marginBottom: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Row gutter={24}>
            <Col span={10}>
              <Form.Item name="title" label={<Text strong>Test Title</Text>} rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Aptis Writing Practice Test 01" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="time_limit" label={<Text strong>Time Limit (minutes)</Text>} rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_full_test_only" valuePropName="checked" label={<Text strong>Test Mode</Text>}>
                <Switch checkedChildren="Mock Test" unCheckedChildren="Practice Mode" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_published" valuePropName="checked" label={<Text strong>Status</Text>}>
                <Switch checkedChildren="Published" unCheckedChildren="Draft" />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Form.Item name="description" label={<Text strong>Test Description</Text>}>
                <TextArea rows={4} placeholder="e.g. This is a full Aptis Writing Practice Test. Please write carefully." style={{ fontSize: 13 }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider titlePlacement="left"><Title level={4} style={{ margin: 0 }}>Content of 4 Test Parts</Title></Divider>

        <Form.List name="parts">
          {(fields) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {fields.map(({ key, name }, index) => {
                const config = PART_CONFIGS[index];
                if (!config) return null; 

                return (
                  <Card 
                    key={key} size="small"
                    // 🔥 GỌI HÀM LẤY ICON ĐÃ TẠO Ở TRÊN
                    title={<Space>{getPartIcon(config.type)} <Text strong>{config.title}</Text></Space>}
                    extra={<Tag color="purple">Part {index + 1}</Tag>}
                    style={{ borderLeft: '6px solid #7c3aed', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
                  >
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item name={[name, 'instruction']} label={<Text strong>Part Instructions</Text>}>
                          <TextArea rows={2} placeholder="e.g. You are a member of a gardening club..." />
                        </Form.Item>
                        
                        <div style={{ marginTop: 16 }}>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>Questions / Prompts:</Text>
                          {renderQuestions(config.type, name)}
                        </div>
                      </Col>
                    </Row>

                    <Form.Item name={[name, 'part_type']} hidden><Input /></Form.Item>
                    <Form.Item name={[name, 'part_number']} hidden><InputNumber /></Form.Item>
                    <Form.Item name={[name, 'image_url']} hidden><Input /></Form.Item>
                    <Form.Item name={[name, 'image_description']} hidden><Input /></Form.Item>
                  </Card>
                );
              })}
            </div>
          )}
        </Form.List>
      </Form>
    </div>
  );
};

export default WritingAptisEditPage;
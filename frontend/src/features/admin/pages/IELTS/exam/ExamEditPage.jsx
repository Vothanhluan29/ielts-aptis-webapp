import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Spin,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  AppstoreAddOutlined,
  ReadOutlined,
  EditOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';

// Nhúng Custom Hook
import { useExamEdit } from '../../../hooks/IELTS/exam/useExamEdit'; // Đổi đường dẫn cho phù hợp với dự án của bạn

const { Title, Text } = Typography;
const { Option } = Select;

const ExamEditPage = () => {
  const { id } = useParams();
  
  const {
    form,
    isEditMode,
    loading,
    submitting,
    onFinish,
    listeningTests,
    readingTests,
    writingTests,
    speakingTests,
    navigate
  } = useExamEdit(id);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spin size="large" tip="Loading test structure..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* ACTION BAR */}
      <div className="bg-white px-8 py-5 rounded-3xl shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100 gap-4 sm:gap-0">
        <Space size="large">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/full-tests')}
            shape="circle"
            className="border-gray-200 hover:text-indigo-600 shadow-sm"
          />
          <div>
            <Title level={4} className="m-0 text-indigo-900 font-bold">
              {isEditMode ? `Edit IELTS Full Test #${id}` : 'Create New IELTS Full Test'}
            </Title>
            <Text type="secondary" className="text-xs italic">
              Manage the combination of 4 IELTS skill components
            </Text>
          </div>
        </Space>

        <Space size="middle">
          <Button
            type="primary"
            size="large"
            icon={<CloudUploadOutlined />}
            loading={submitting}
            onClick={() => form.submit()}
            className="bg-indigo-600 rounded-xl px-10 border-0 shadow-md font-semibold hover:bg-indigo-700"
          >
            Save Changes
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ is_published: false }}
      >
        <Row gutter={[32, 32]}>
          
          {/* LEFT COLUMN: Test Information */}
          <Col xs={24} lg={10}>
            <Card
              className="rounded-3xl border-0 shadow-sm overflow-hidden h-full"
              title={
                <Space>
                  <InfoCircleOutlined className="text-indigo-500" />
                  <Text strong>Test Information</Text>
                </Space>
              }
            >
              <Form.Item
                name="title"
                label={<Text strong>Test Title</Text>}
                rules={[{ required: true, message: 'Please enter the test title!' }]}
              >
                <Input
                  placeholder="Example: Cambridge IELTS 18 - Test 1"
                  size="large"
                  className="rounded-xl bg-gray-50 border-gray-100 focus:bg-white"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<Text strong>Description or Instructions</Text>}
              >
                <Input.TextArea
                  placeholder="Add additional notes about this test..."
                  rows={4}
                  className="rounded-xl bg-gray-50 border-gray-100 focus:bg-white"
                />
              </Form.Item>

              <Divider className="my-6" />

              <Form.Item
                shouldUpdate={(prev, curr) => prev.is_published !== curr.is_published}
                noStyle
              >
                {() => {
                  const isPub = form.getFieldValue('is_published');
                  return (
                    <div
                      className={`flex justify-between items-center p-5 rounded-2xl border transition-all duration-300 ${
                        isPub
                          ? 'bg-emerald-50 border-emerald-200 shadow-inner'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <Text
                          strong
                          className={isPub ? 'text-emerald-900' : 'text-gray-900'}
                        >
                          {isPub ? ' PUBLIC MODE' : 'DRAFT MODE'}
                        </Text>
                        <Text
                          type="secondary"
                          className="text-[11px] block mt-1"
                        >
                          {isPub
                            ? 'Students can access this test.'
                            : 'Only administrators can access this test.'}
                        </Text>
                      </div>

                      <Form.Item
                        name="is_published"
                        valuePropName="checked"
                        noStyle
                      >
                        <Switch
                          checkedChildren="PUBLIC"
                          unCheckedChildren="DRAFT"
                          className={isPub ? 'bg-emerald-500' : ''}
                        />
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.Item>
            </Card>
          </Col>

          {/* RIGHT COLUMN: Component Structure */}
          <Col xs={24} lg={14}>
            <Card
              className="rounded-3xl border-0 shadow-sm h-full"
              title={
                <Space>
                  <AppstoreAddOutlined className="text-indigo-500" />
                  <Text strong>Skill Structure (Components)</Text>
                </Space>
              }
            >
              <Row gutter={[20, 20]}>
                {/* 1. LISTENING */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="listening_test_id"
                    label={
                      <Space>
                        <CustomerServiceOutlined className="text-blue-600" />
                        <Text strong>1. Listening Test</Text>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Select Listening Test..."
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      className="rounded-xl"
                    >
                      {listeningTests.map((t) => (
                        <Option key={t.id} value={t.id}>
                          <span className="text-blue-600 font-bold mr-2">ID: {t.id}</span>
                          {t.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* 2. READING */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="reading_test_id"
                    label={
                      <Space>
                        <ReadOutlined className="text-purple-600" />
                        <Text strong>2. Reading Test</Text>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Select Reading Test..."
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {readingTests.map((t) => (
                        <Option key={t.id} value={t.id}>
                          <span className="text-purple-600 font-bold mr-2">ID: {t.id}</span>
                          {t.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* 3. WRITING */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="writing_test_id"
                    label={
                      <Space>
                        <EditOutlined className="text-orange-600" />
                        <Text strong>3. Writing Test</Text>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Select Writing Test..."
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {writingTests.map((t) => (
                        <Option key={t.id} value={t.id}>
                          <span className="text-orange-600 font-bold mr-2">ID: {t.id}</span>
                          {t.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* 4. SPEAKING */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="speaking_test_id"
                    label={
                      <Space>
                        <MessageOutlined className="text-rose-600" />
                        <Text strong>4. Speaking Test</Text>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Select Speaking Test..."
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {speakingTests.map((t) => (
                        <Option key={t.id} value={t.id}>
                          <span className="text-rose-600 font-bold mr-2">ID: {t.id}</span>
                          {t.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <div className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <InfoCircleOutlined className="text-indigo-500 mt-1" />
                <Text type="secondary" className="text-sm">
                  The system automatically links these 4 individual skills into a unified Full Mock Test. Students will complete the test sequentially from skill 1 to skill 4 according to standard IELTS format.
                </Text>
              </div>
            </Card>
          </Col>

        </Row>
      </Form>
    </div>
  );
};

export default ExamEditPage;
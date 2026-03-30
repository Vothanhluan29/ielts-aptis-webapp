import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FontColorsOutlined,
  AudioOutlined,
  ReadOutlined,
  EditOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';

import { useExamAptisEditPage } from '../../../hooks/APTIS/exam/useExamAptisEditPage';

const { Title, Text } = Typography;
const { Option } = Select;

const ExamAptisEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const {
    isEditMode,
    loading,
    saving,
    initialData,
    componentOptions,
    onFinish,
  } = useExamAptisEditPage(id, form, navigate);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spin size="large" description="Loading test structure..." />
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* ACTION BAR */}
      <div className="bg-white px-8 py-5 rounded-3xl shadow-sm mb-8 flex justify-between items-center border border-gray-100">
        <Space size="large">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            shape="circle"
            className="border-gray-200 hover:text-indigo-600 shadow-sm"
          />

          <div>
            <Title level={4} className="!m-0 !text-indigo-900 font-bold">
              {isEditMode
                ? 'Edit Aptis Full Test'
                : 'Create New Aptis Full Test'}
            </Title>
            <Text type="secondary" className="text-xs italic">
              Manage the combination of 5 skill components
            </Text>
          </div>
        </Space>

        <Space size="middle">
          <Button
            type="primary"
            size="large"
            icon={<CloudUploadOutlined />}
            loading={saving}
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
        initialValues={initialData}
      >
        <Row gutter={[32, 32]}>
          {/* LEFT COLUMN */}
          <Col xs={24} lg={10}>
            <Card
              className="rounded-3xl border-0 shadow-sm overflow-hidden"
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
                  placeholder="Example: Aptis General Mock Test 01"
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
                shouldUpdate={(prev, curr) =>
                  prev.is_published !== curr.is_published
                }
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
                          className={
                            isPub ? 'text-emerald-900' : 'text-gray-900'
                          }
                        >
                          {isPub
                            ? ' PUBLIC MODE'
                            : 'DRAFT MODE'}
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

          {/* RIGHT COLUMN */}
          <Col xs={24} lg={14}>
            <Card
              className="rounded-3xl border-0 shadow-sm"
              title={
                <Space>
                  <AppstoreAddOutlined className="text-indigo-500" />
                  <Text strong>Skill Structure (Components)</Text>
                </Space>
              }
            >
              <Form.Item
                name="grammar_vocab_test_id"
                label={
                  <Space>
                    <FontColorsOutlined className="text-blue-600" />
                    <Text strong>
                      1. Grammar & Vocabulary (Core)
                    </Text>
                  </Space>
                }
              >
                <Select
                  placeholder="Select Core test..."
                  size="large"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {componentOptions.grammarVocab.map((t) => (
                    <Option key={t.id} value={t.id}>
                      <span className="text-blue-600 font-bold mr-2">
                        ID: {t.id}
                      </span>
                      {t.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={20}>
                <Col span={12}>
                  <Form.Item
                    name="listening_test_id"
                    label={
                      <Space>
                        <AudioOutlined className="text-green-600" />
                        <Text strong>2. Listening</Text>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Select test..."
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {componentOptions.listening.map((t) => (
                        <Option key={t.id} value={t.id}>
                          <span className="text-green-600 font-bold mr-2">
                            ID: {t.id}
                          </span>
                          {t.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="reading_test_id"
                    label={
                      <Space>
                        <ReadOutlined className="text-orange-600" />
                        <Text strong>3. Reading</Text>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Select test..."
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {componentOptions.reading.map((t) => (
                        <Option key={t.id} value={t.id}>
                          <span className="text-orange-600 font-bold mr-2">
                            ID: {t.id}
                          </span>
                          {t.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="writing_test_id"
                    label={
                      <Space>
                        <EditOutlined className="text-purple-600" />
                        <Text strong>4. Writing</Text>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Select test..."
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {componentOptions.writing.map((t) => (
                        <Option key={t.id} value={t.id}>
                          <span className="text-purple-600 font-bold mr-2">
                            ID: {t.id}
                          </span>
                          {t.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="speaking_test_id"
                    label={
                      <Space>
                        <MessageOutlined className="text-rose-600" />
                        <Text strong>5. Speaking</Text>
                      </Space>
                    }
                  >
                    <Select
                      placeholder="Select test..."
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {componentOptions.speaking.map((t) => (
                        <Option key={t.id} value={t.id}>
                          <span className="text-rose-600 font-bold mr-2">
                            ID: {t.id}
                          </span>
                          {t.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <InfoCircleOutlined className="text-blue-500 mt-1" />
                <Text type="secondary" className="text-xs">
                  The system automatically links individual tests into this Full Test. Students will complete the test sequentially from skill 1 to skill 5.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ExamAptisEditPage;
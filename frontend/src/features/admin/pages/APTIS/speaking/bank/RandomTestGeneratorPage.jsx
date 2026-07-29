import React, { useState } from 'react';
import { Form, Input, Button, Spin, message, Switch, Select, InputNumber } from 'antd';
import { ArrowLeftOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, CheckCircle2, Clock } from 'lucide-react';

import aptisSpeakingBankApi from '../../../../api/APTIS/speaking/aptisSpeakingBankApi';

const { Option } = Select;

const RandomTestGeneratorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/speaking' : '/admin/aptis/speaking';
  const bankPath = `${basePath}/bank`;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      const config = {
        title: values.title,
        description: values.description,
        time_limit: values.time_limit || 12,
        is_published: values.is_published || false,
        is_full_test_only: values.is_full_test_only || false,
        difficulty_level: values.difficulty_level || null,
        part_difficulties: {
          PART_1: values.difficulty_part_1 || null,
          PART_2: values.difficulty_part_2 || null,
          PART_3: values.difficulty_part_3 || null,
          PART_4: values.difficulty_part_4 || null,
        }
      };

      const response = await aptisSpeakingBankApi.generateRandomTest(config);
      message.success('Random Test generated successfully!');
      navigate(`${basePath}/edit/${response.id}`);
    } catch (error) {
      if (error.response?.data?.detail) {
        message.error(`Generation failed: ${error.response.data.detail}`);
      } else {
        message.error('Failed to generate test. Make sure you have at least 1 group for each Part (1, 2, 3, and 4) in the bank.');
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex items-center justify-between gap-6 mb-8 mt-4">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(bankPath)}
            className="text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 w-10 h-10 flex items-center justify-center rounded-xl"
          />
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight m-0 bg-clip-text text-transparent bg-gradient-to-r from-zinc-800 to-zinc-500">Generate Random Test</h1>
          </div>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<ThunderboltOutlined />} 
          onClick={() => form.submit()} 
          loading={submitting}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 border-0 shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold px-6"
        >
          Generate Test
        </Button>
      </div>

      <Spin spinning={submitting} tip="Generating Random Test from Bank...">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleGenerate}
          initialValues={{ time_limit: 12, is_published: false, is_full_test_only: false }}
        >
          {/* General Config */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100 mb-6 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Settings size={20} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-800 m-0">General Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6">
              <div className="md:col-span-5">
                <Form.Item 
                  name="title" 
                  label={<span className="text-sm font-bold text-zinc-700">Test Title</span>} 
                  rules={[{ required: true, message: 'Please enter a test title' }]}
                >
                  <Input 
                    placeholder="e.g., Random Speaking Practice Test 1" 
                    className="px-4 py-3 bg-zinc-50/50 border-zinc-200 hover:border-indigo-400 focus:border-indigo-500 rounded-xl text-base"
                  />
                </Form.Item>
              </div>
              <div className="md:col-span-3">
                <Form.Item 
                  name="difficulty_level" 
                  label={<span className="text-sm font-bold text-zinc-700">Test Difficulty</span>}
                >
                  <Select 
                    allowClear 
                    placeholder="Any" 
                    size="large"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    <Option value="A1">A1</Option>
                    <Option value="A2">A2</Option>
                    <Option value="B1">B1</Option>
                    <Option value="B2">B2</Option>
                    <Option value="C">C</Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="md:col-span-4">
                <Form.Item 
                  name="time_limit" 
                  label={<span className="text-sm font-bold text-zinc-700">Duration (mins)</span>}
                >
                  <InputNumber 
                    min={1} 
                    className="w-full"
                    controls={false}
                    addonBefore={<Clock size={16} className="text-zinc-400" />}
                    size="large"
                    style={{ borderRadius: '0.75rem' }}
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item 
              name="description" 
              label={<span className="text-sm font-bold text-zinc-700">Description (Optional)</span>}
              className="mb-6"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Add some notes about this speaking test..." 
                className="px-4 py-3 bg-zinc-50/50 border-zinc-200 hover:border-indigo-400 focus:border-indigo-500 rounded-xl"
              />
            </Form.Item>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div>
                <div className="text-sm font-bold text-zinc-800 flex items-center gap-1.5">
                  Full Test Mode
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  If enabled, this test is meant to be part of a 4-skill Full Mock Test and won't appear as a standalone practice test.
                </div>
              </div>
              <Form.Item name="is_full_test_only" valuePropName="checked" className="m-0">
                <Switch />
              </Form.Item>
            </div>
          </div>

          {/* Part Specific Config */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100 transition-all hover:shadow-md">
            <div className="p-6 md:p-8 bg-indigo-50/30">
              <div className="flex items-center gap-2 mb-2 text-zinc-800 font-bold">
                <CheckCircle2 size={18} className="text-indigo-500" />
                Part Difficulty Settings (Optional)
              </div>
              <p className="text-sm text-zinc-500 mb-6">
                Select a specific difficulty for each part. Leave blank to choose completely at random.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((part) => (
                  <Form.Item 
                    key={part}
                    name={`difficulty_part_${part}`} 
                    label={<span className="text-xs font-bold text-zinc-600">Part {part}</span>}
                    className="mb-0"
                  >
                    <Select 
                      allowClear 
                      placeholder="Any" 
                      className="w-full" 
                      size="large"
                      style={{ borderRadius: '0.5rem' }}
                    >
                      <Option value="A1">A1</Option>
                      <Option value="A2">A2</Option>
                      <Option value="B1">B1</Option>
                      <Option value="B2">B2</Option>
                      <Option value="C">C</Option>
                    </Select>
                  </Form.Item>
                ))}
              </div>
            </div>
          </div>
        </Form>
      </Spin>
    </div>
  );
};

export default RandomTestGeneratorPage;

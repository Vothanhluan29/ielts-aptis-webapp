import React, { useEffect } from 'react';
import { useSpeakingEdit } from '../../../hooks/IELTS/speaking/useSpeakingEdit'; 
import { 
  ArrowLeftOutlined, SaveOutlined, AudioOutlined, 
  InfoCircleOutlined, LayoutOutlined, AimOutlined,
  GlobalOutlined, BookOutlined
} from '@ant-design/icons';
import { 
  Button, Form, Input, InputNumber, Switch, 
  Card, Space, Typography, Tooltip, Row, Col, Spin, Tag 
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SpeakingEditPage = () => {
  const {
    isEditMode, loading, formData, handleFormChange,
    parts, handlePartChange, handleSubmit, navigate
  } = useSpeakingEdit();

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      title: formData.title,
      description: formData.description,
      time_limit: formData.time_limit,
      is_published: formData.is_published,
      is_full_test_only: formData.is_full_test_only,
    });
  }, [formData, form]);

  if (loading && isEditMode && !formData.title) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Spin size="large" />
        <Text className="text-indigo-600 font-semibold text-lg">Loading test details...</Text>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        {/* Sticky Header Action Bar */}
        <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 mb-8 shadow-sm">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/skills/speaking')}
                className="font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center w-10 h-10 rounded-full"
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
                  <AudioOutlined />
                </div>
                <Title level={3} className="m-0 text-slate-800">
                  {isEditMode ? "Edit Speaking Test" : "Create New Speaking Test"}
                </Title>
              </div>
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />} 
              loading={loading}
              size="large"
              className="bg-indigo-600 hover:bg-indigo-500 shadow-md font-bold rounded-xl px-8 w-full md:w-auto h-11"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 flex flex-col gap-8">
          
          {/* --- SECTION 1: GENERAL INFO --- */}
          <Card 
            className="rounded-3xl shadow-sm border border-slate-200" 
            styles={{ header: { borderBottom: 'none', paddingBottom: 0, paddingTop: '24px' }, body: { paddingTop: 0 } }}
            title={
              <Space className="font-bold text-slate-800 text-lg">
                <InfoCircleOutlined className="text-indigo-500" /> 
                General Information
              </Space>
            }
          >
            <div className="mt-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Row gutter={32}>
                <Col xs={24} md={16}>
                  <Form.Item 
                    label={<span className="font-semibold text-slate-700">Test Title</span>} 
                    name="title"
                    rules={[{ required: true, message: 'Please enter the test title' }]}
                  >
                    <Input 
                      placeholder="e.g. Cambridge 18 - Speaking Test 1" 
                      size="large"
                      className="rounded-xl border-slate-200 hover:border-indigo-400 focus:border-indigo-500 py-2"
                      onChange={e => handleFormChange('title', e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item 
                    label={<span className="font-semibold text-slate-700">Description / Notes</span>} 
                    name="description"
                    className="mb-0 md:mb-6"
                  >
                    <TextArea 
                      rows={3} 
                      placeholder="Optional notes for students..." 
                      className="rounded-xl border-slate-200 hover:border-indigo-400 focus:border-indigo-500"
                      onChange={e => handleFormChange('description', e.target.value)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <div className="flex flex-col gap-6">
                    <Form.Item 
                      label={<span className="font-semibold text-slate-700">Time Limit (mins)</span>} 
                      name="time_limit"
                      className="mb-0"
                    >
                      <InputNumber 
                        min={1} 
                        className="w-full rounded-xl border-slate-200 py-1" 
                        size="large"
                        onChange={val => handleFormChange('time_limit', val)}
                      />
                    </Form.Item>

                    <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <Form.Item name="is_published" valuePropName="checked" noStyle>
                        <div className="flex items-center justify-between">
                          <Space>
                            <GlobalOutlined className="text-slate-400" />
                            <span className="font-medium text-slate-700">Published</span>
                          </Space>
                          <Switch 
                            checked={formData.is_published}
                            onChange={val => handleFormChange('is_published', val)}
                            className="bg-slate-300 checked:bg-green-500"
                          />
                        </div>
                      </Form.Item>
                      
                      <div className="h-px bg-slate-100 w-full" />

                      <Form.Item name="is_full_test_only" valuePropName="checked" noStyle>
                        <div className="flex items-center justify-between">
                          <Space>
                            <BookOutlined className="text-slate-400" />
                            <span className="font-medium text-slate-700">Mock Exam Only</span>
                            <Tooltip title="Hidden from practice list. Only accessible in Full Tests.">
                              <InfoCircleOutlined className="text-slate-400 cursor-help" />
                            </Tooltip>
                          </Space>
                          <Switch 
                            checked={formData.is_full_test_only}
                            onChange={val => handleFormChange('is_full_test_only', val)}
                            className="bg-slate-300 checked:bg-purple-500"
                          />
                        </div>
                      </Form.Item>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          {/* --- SECTION 2: PARTS --- */}
          {parts.map((part, index) => (
            <Card 
              key={part.part_number} 
              className="rounded-3xl shadow-sm border-slate-200 overflow-hidden relative transition-all hover:border-indigo-200 hover:shadow-md"
              styles={{ body: { padding: '32px' } }}
            >
              {/* Part Badge */}
              <div className="absolute top-0 left-0 bg-indigo-500 text-white text-xs font-black px-6 py-2 rounded-br-2xl tracking-wider shadow-sm">
                PART {part.part_number}
              </div>

              <div className="mt-6 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                  <LayoutOutlined className="text-lg" />
                </div>
                <div>
                  <Title level={4} className="m-0 text-slate-800">
                    {part.part_number === 1 ? 'Introduction & Interview' 
                    : part.part_number === 2 ? 'Long Turn (Cue Card)' 
                    : 'Two-Way Discussion'}
                  </Title>
                  <Text className="text-slate-500 text-sm">
                    {part.part_number === 1 ? 'General questions about familiar topics' 
                    : part.part_number === 2 ? 'Speak for 1-2 minutes on a given topic' 
                    : 'In-depth discussion related to Part 2'}
                  </Text>
                </div>
              </div>

              <Row gutter={32}>
                {/* Cột trái: Lời dẫn & Cue Card */}
                <Col xs={24} md={10}>
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Instruction (Optional)
                      </label>
                      <TextArea 
                        rows={3} 
                        placeholder="e.g. Let's talk about your hometown..." 
                        className="rounded-xl bg-slate-50 border-slate-200 hover:border-indigo-400 focus:border-indigo-500"
                        value={part.instruction}
                        onChange={e => handlePartChange(index, 'instruction', e.target.value)}
                      />
                    </div>

                    {part.part_number === 2 && (
                      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-inner">
                        <label className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-3">
                          <AimOutlined className="text-amber-500 text-lg" /> Cue Card Content
                        </label>
                        <TextArea 
                          rows={6} 
                          placeholder="Describe a place... You should say: where it is, how you go there..." 
                          className="rounded-xl border-amber-200 focus:border-amber-500 focus:ring-amber-500 bg-white shadow-sm"
                          value={part.cue_card}
                          onChange={e => handlePartChange(index, 'cue_card', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </Col>

                {/* Cột phải: Câu hỏi */}
                <Col xs={24} md={14}>
                  <div className="mt-6 md:mt-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-full flex flex-col">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex justify-between items-center">
                      <span>Questions <span className="text-red-500">*</span></span>
                      <Tag color="blue" className="rounded-full border-none m-0">Required</Tag>
                    </label>
                    <TextArea 
                      rows={part.part_number === 2 ? 10 : 8} 
                      required
                      placeholder={part.part_number === 2 ? "Please talk about this topic for 1 to 2 minutes..." : "Enter each question on a new line..."}
                      className="rounded-xl font-medium text-slate-700 flex-grow border-slate-200 hover:border-indigo-400 focus:border-indigo-500 resize-none"
                      value={part.question_text}
                      onChange={e => handlePartChange(index, 'question_text', e.target.value)}
                    />
                    <div className="mt-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex gap-2 items-start">
                      <span className="text-xl">💡</span>
                      <Paragraph className="text-xs font-medium text-blue-800 m-0 leading-relaxed">
                        Tip: Each line break (Enter) creates a separate question. AI will grade each question individually during the test.
                      </Paragraph>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          ))}

        </div>
      </Form>
    </div>
  );
};

export default SpeakingEditPage;
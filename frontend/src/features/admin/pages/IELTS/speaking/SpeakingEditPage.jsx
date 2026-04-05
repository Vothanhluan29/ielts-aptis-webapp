import React, { useEffect } from 'react';
import { useSpeakingEdit } from '../../hooks/IELTS/speaking/useSpeakingEdit'; 
import { 
  ArrowLeftOutlined, SaveOutlined, AudioOutlined, 
  InfoCircleOutlined, LayoutOutlined, AimOutlined
} from '@ant-design/icons';
import { 
  Button, Form, Input, InputNumber, Switch, 
  Card, Space, Typography, Tooltip, Row, Col, Spin 
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SpeakingEditPage = () => {
  const {
    isEditMode, loading, formData, handleFormChange,
    parts, handlePartChange, handleSubmit, navigate
  } = useSpeakingEdit();

  const [form] = Form.useForm();

  // Đồng bộ state formData từ hook vào Ant Design Form
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
        <Text className="text-indigo-600 font-semibold">Loading test details...</Text>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Nav Back */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/skills/speaking')}
          className="mb-6 font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 -ml-4"
        >
          Back to list
        </Button>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          {/* Header Action */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Title level={2} className="m-0 flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <AudioOutlined />
              </div>
              {isEditMode ? "Edit Speaking Test" : "Create New Speaking Test"}
            </Title>

            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />} 
              loading={loading}
              size="large"
              className="bg-indigo-600 hover:bg-indigo-500 shadow-md font-bold rounded-xl px-6 w-full md:w-auto"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            
            {/* --- SECTION 1: GENERAL INFO --- */}
            <Card 
              className="rounded-2xl shadow-sm border-slate-200" 
              title={
                <Space className="font-bold text-slate-700">
                  <InfoCircleOutlined className="text-indigo-500" /> 
                  General Information
                </Space>
              }
            >
              <Row gutter={24}>
                <Col xs={24}>
                  <Form.Item 
                    label={<span className="font-bold text-slate-700">Test Title</span>} 
                    name="title"
                    rules={[{ required: true, message: 'Please enter the test title' }]}
                  >
                    <Input 
                      placeholder="e.g. Cambridge 18 - Speaking Test 1" 
                      size="large"
                      className="rounded-lg"
                      onChange={e => handleFormChange('title', e.target.value)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item 
                    label={<span className="font-bold text-slate-700">Time Limit (mins)</span>} 
                    name="time_limit"
                  >
                    <InputNumber 
                      min={1} 
                      className="w-full rounded-lg" 
                      size="large"
                      onChange={val => handleFormChange('time_limit', val)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={16}>
                  <Form.Item label={<span className="font-bold text-slate-700">Test Status & Type</span>}>
                    <Space size="large" className="mt-2">
                      <Form.Item name="is_published" valuePropName="checked" noStyle>
                        <Switch 
                          checkedChildren="Public" 
                          unCheckedChildren="Draft" 
                          onChange={val => handleFormChange('is_published', val)}
                        />
                      </Form.Item>

                      <Form.Item name="is_full_test_only" valuePropName="checked" noStyle>
                        <Switch 
                          checkedChildren="Mock Exam" 
                          unCheckedChildren="Practice" 
                          className="bg-slate-300"
                          onChange={val => handleFormChange('is_full_test_only', val)}
                        />
                      </Form.Item>
                      
                      <Tooltip title="Mock Exams are hidden from the practice list and only accessible inside Full Tests.">
                        <InfoCircleOutlined className="text-slate-400" />
                      </Tooltip>
                    </Space>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item 
                    label={<span className="font-bold text-slate-700">Description / Notes</span>} 
                    name="description"
                    className="mb-0"
                  >
                    <TextArea 
                      rows={2} 
                      placeholder="Optional notes for students..." 
                      className="rounded-lg"
                      onChange={e => handleFormChange('description', e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* --- SECTION 2: PARTS --- */}
            {parts.map((part, index) => (
              <Card 
                key={part.part_number} 
                className="rounded-2xl shadow-sm border-slate-200 overflow-hidden relative transition-all hover:border-indigo-200 hover:shadow-md"
                styles={{ body: { padding: '24px' } }}
              >
                {/* Part Badge */}
                <div className="absolute top-0 left-0 bg-indigo-100 text-indigo-700 text-xs font-black px-4 py-1.5 rounded-br-xl tracking-wider">
                  PART {part.part_number}
                </div>

                <div className="mt-4 mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded">
                    <LayoutOutlined />
                  </div>
                  <Title level={4} className="m-0 text-slate-800">
                    {part.part_number === 1 ? 'Introduction & Interview' 
                    : part.part_number === 2 ? 'Long Turn (Cue Card)' 
                    : 'Two-Way Discussion'}
                  </Title>
                </div>

                <Row gutter={24}>
                  {/* Cột trái: Lời dẫn & Cue Card */}
                  <Col xs={24} md={8}>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Instruction (Optional)
                        </label>
                        <TextArea 
                          rows={2} 
                          placeholder="e.g. Let's talk about your hometown..." 
                          className="rounded-lg bg-slate-50"
                          value={part.instruction}
                          onChange={e => handlePartChange(index, 'instruction', e.target.value)}
                        />
                      </div>

                      {part.part_number === 2 && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5 items-center gap-1">
                            <AimOutlined className="text-orange-500" /> Cue Card Content
                          </label>
                          <TextArea 
                            rows={4} 
                            placeholder="Describe a place... You should say: where it is, how you go there..." 
                            className="rounded-lg border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                            value={part.cue_card}
                            onChange={e => handlePartChange(index, 'cue_card', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Cột phải: Câu hỏi */}
                  <Col xs={24} md={16}>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 mt-4 md:mt-0">
                      Questions <span className="text-red-500">*</span>
                    </label>
                    <TextArea 
                      rows={part.part_number === 2 ? 7 : 5} 
                      required
                      placeholder={part.part_number === 2 ? "Please talk about this topic for 1 to 2 minutes..." : "Enter each question on a new line..."}
                      className="rounded-lg font-medium text-slate-700"
                      value={part.question_text}
                      onChange={e => handlePartChange(index, 'question_text', e.target.value)}
                    />
                    <Paragraph className="text-xs text-slate-400 mt-2 italic">
                      💡 Tip: Each line break (Enter) will create a separate question. AI will grade each question individually.
                    </Paragraph>
                  </Col>
                </Row>
              </Card>
            ))}

          </div>
        </Form>
      </div>
    </div>
  );
};

export default SpeakingEditPage;
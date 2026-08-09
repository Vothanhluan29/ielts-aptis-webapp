import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Space, Select, 
  Spin, Typography, Row, Col, message
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, FormOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { BlurInput, BlurTextArea } from '../../../../../../components/common/BlurInput';
import aptisWritingBankApi from '../../../../api/APTIS/writing/aptisWritingBankApi';
import { PART_CONFIGS } from '../../../../hooks/APTIS/writing/useWritingAptisEdit';

const { Title, Text } = Typography;
const { Option } = Select;

const BankGroupEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/writing/bank' : '/admin/aptis/writing/bank';

  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isCreateMode = !id || id === 'create';
  
  const currentPartType = Form.useWatch('part_type', form);

  const getDefaultQuestions = (partType) => {
    if (partType === "PART_4") {
      return [
        { order_number: 1, sub_type: 'scenario' },
        { order_number: 2, sub_type: 'informal' },
        { order_number: 3, sub_type: 'formal' }
      ];
    } else {
      const qCount = PART_CONFIGS.find(p => p.type === partType)?.qCount || 1;
      return Array.from({ length: qCount }).map((_, i) => ({ order_number: i + 1 }));
    }
  };

  useEffect(() => {
    if (!isCreateMode) {
      fetchGroup();
    } else {
      setLoading(false);
      form.setFieldsValue({ 
        part_type: 'PART_1', 
        difficulty_level: 'A1', 
        groups: [{ 
          instruction: '',
          questions: getDefaultQuestions('PART_1') 
        }] 
      });
    }
  }, [id, isCreateMode]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await aptisWritingBankApi.getBankGroupById(id);
      
      form.setFieldsValue({
        part_type: response.part_type,
        difficulty_level: response.difficulty_level,
        groups: [{
          instruction: response.instruction,
          image_url: response.image_url,
          questions: response.questions?.map(q => ({
            ...q
          })) || []
        }]
      });
    } catch (error) {
      message.error('Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      if (isCreateMode) {
        const promises = values.groups.map(group => {
          const payload = {
            part_type: values.part_type,
            difficulty_level: values.difficulty_level,
            instruction: group.instruction,
            image_url: group.image_url,
            questions: group.questions?.map((q, idx) => ({
              ...q,
              order_number: idx + 1
            })) || []
          };
          return aptisWritingBankApi.createBankGroup(payload);
        });

        await Promise.all(promises);
        message.success(`${values.groups.length} Bank group(s) created successfully!`);
      } else {
        const group = values.groups[0];
        const payload = {
          part_type: values.part_type,
          difficulty_level: values.difficulty_level,
          instruction: group.instruction,
          image_url: group.image_url,
          questions: group.questions?.map((q, idx) => ({
            ...q,
            order_number: idx + 1
          })) || []
        };
        await aptisWritingBankApi.updateBankGroup(id, payload);
        message.success('Bank group updated successfully!');
      }
      navigate(basePath);
    } catch (error) {
      console.error(error);
      message.error('Please check all required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePartTypeChange = (value) => {
    const groups = form.getFieldValue('groups') || [];
    const defaultQuestions = getDefaultQuestions(value);
    form.setFieldValue('groups', groups.map(g => ({ ...g, questions: defaultQuestions })));
  };

  const renderQuestions = (partType, groupName) => {
    if (partType === "PART_4") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card size="small" type="inner" title={<Text strong style={{ color: '#0369a1' }}>Scenario / Received Email</Text>} style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
            <Form.Item name={[groupName, 'questions', 0, 'question_text']} rules={[{ required: true, message: 'Please enter the scenario email!' }]} style={{ marginBottom: 0 }}>
              <BlurTextArea rows={4} placeholder="e.g. Dear Members, we are writing to inform you that the club meeting has been cancelled due to..." />
            </Form.Item>
            <Form.Item name={[groupName, 'questions', 0, 'order_number']} hidden><Input /></Form.Item>
            <Form.Item name={[groupName, 'questions', 0, 'sub_type']} initialValue="scenario" hidden><Input /></Form.Item>
          </Card>

          <Row gutter={20}>
            <Col span={12}>
              <Card size="small" type="inner" title={<Text strong style={{ color: '#15803d' }}>Task 1: Informal Email Prompt</Text>} style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <Form.Item name={[groupName, 'questions', 1, 'question_text']} rules={[{ required: true, message: 'Please enter the prompt!' }]} style={{ marginBottom: 0 }}>
                  <BlurTextArea rows={6} placeholder="e.g. Write to your friend, Sam. Explain your feelings about the cancellation..." />
                </Form.Item>
                <Form.Item name={[groupName, 'questions', 1, 'order_number']} hidden><Input /></Form.Item>
                <Form.Item name={[groupName, 'questions', 1, 'sub_type']} initialValue="informal" hidden><Input /></Form.Item>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" type="inner" title={<Text strong style={{ color: '#c2410c' }}>Task 2: Formal Email Prompt</Text>} style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                <Form.Item name={[groupName, 'questions', 2, 'question_text']} rules={[{ required: true, message: 'Please enter the prompt!' }]} style={{ marginBottom: 0 }}>
                  <BlurTextArea rows={6} placeholder="e.g. Write to the Club President. Express your feelings and suggest alternatives..." />
                </Form.Item>
                <Form.Item name={[groupName, 'questions', 2, 'order_number']} hidden><Input /></Form.Item>
                <Form.Item name={[groupName, 'questions', 2, 'sub_type']} initialValue="formal" hidden><Input /></Form.Item>
              </Card>
            </Col>
          </Row>
        </div>
      );
    }

    const qCount = PART_CONFIGS.find(p => p.type === partType)?.qCount || 1;
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
                name={[groupName, 'questions', idx, 'question_text']} 
                rules={[{ required: true, message: 'Required!' }]}
                style={{ marginBottom: 0 }}
              >
                {partType === "PART_2" || partType === "PART_3" ? (
                  <BlurTextArea rows={4} placeholder="e.g. Please tell us about your hobbies..." />
                ) : (
                  <BlurInput size="large" placeholder={`Enter question ${idx + 1}...`} />
                )}
              </Form.Item>
              <Form.Item name={[groupName, 'questions', idx, 'order_number']} hidden><Input /></Form.Item>
              <Form.Item name={[groupName, 'questions', idx, 'sub_type']} hidden><Input /></Form.Item>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex items-center justify-between gap-6 mb-8 mt-4">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(basePath)}
            className="text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200"
          />
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight m-0">
              {isCreateMode ? 'Create Question Group(s)' : 'Edit Question Group'}
            </h1>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave} 
          loading={submitting}
          className="bg-[#445A95] hover:bg-[#3A4D81] shadow-sm"
        >
          Save Changes
        </Button>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Card size="small" type="inner" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Part Type" name="part_type" rules={[{ required: true }]}>
                  <Select onChange={handlePartTypeChange}>
                    <Option value="PART_1">Part 1 (Word-level responses)</Option>
                    <Option value="PART_2">Part 2 (Short text)</Option>
                    <Option value="PART_3">Part 3 (Three written parts)</Option>
                    <Option value="PART_4">Part 4 (Informal & Formal Email)</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={6}>
                <Form.Item name="difficulty_level" label="Difficulty Level">
                  <Select>
                    <Option value="A1">A1</Option>
                    <Option value="A2">A2</Option>
                    <Option value="B1">B1</Option>
                    <Option value="B2">B2</Option>
                    <Option value="C">C</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.List name="groups">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card 
                    key={key}
                    title={
                      <div className="flex items-center gap-2 text-[#3A4D81]">
                        <FormOutlined /> 
                        <span>Group {index + 1} Questions for {currentPartType?.replace('_', ' ')}</span>
                      </div>
                    } 
                    size="small" 
                    type="inner"
                    style={{ border: '1px solid #e0e7ff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                    extra={
                      isCreateMode && fields.length > 1 ? (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>
                          Remove
                        </Button>
                      ) : null
                    }
                  >
                    <Form.Item 
                      {...restField}
                      name={[name, 'instruction']}
                      label="Group Instruction (Optional)"
                    >
                      <BlurTextArea rows={2} placeholder="E.g., You have joined a club. Answer the following questions." />
                    </Form.Item>
                    
                    {currentPartType && renderQuestions(currentPartType, name)}
                  </Card>
                ))}
                
                {isCreateMode && (
                  <Button 
                    type="dashed" 
                    onClick={() => add({ instruction: '', questions: getDefaultQuestions(currentPartType) })} 
                    block 
                    icon={<PlusOutlined />}
                    className="border-indigo-300 text-[#445A95] bg-[#F8FAFC]/50 hover:bg-[#F8FAFC]"
                  >
                    Add Another Group
                  </Button>
                )}
              </div>
            )}
          </Form.List>

        </Form>
      </Spin>
    </div>
  );
};

export default BankGroupEditPage;

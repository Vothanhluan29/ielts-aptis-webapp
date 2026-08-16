import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Select, Spin, Row, Col, message
} from 'antd';
import { ArrowLeft, Save, Settings, Layers, Plus, Trash2, BookOpen, PenTool } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { BlurInput, BlurTextArea } from '../../../../../../components/common/BlurInput';
import aptisWritingBankApi from '../../../../api/APTIS/writing/aptisWritingBankApi';
import { PART_CONFIGS } from '../../../../hooks/APTIS/writing/useWritingAptisEdit';

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
        <div className="flex flex-col gap-6 mt-4">
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-[#0369a1] mb-3 flex items-center gap-2"><BookOpen size={16}/> Scenario / Received Email</h3>
            <Form.Item name={[groupName, 'questions', 0, 'question_text']} rules={[{ required: true, message: 'Please enter the scenario email!' }]} style={{ marginBottom: 0 }}>
              <BlurTextArea rows={4} placeholder="e.g. Dear Members, we are writing to inform you that the club meeting has been cancelled due to..." className="bg-white/80 border-blue-200 focus:border-blue-400 rounded-lg p-3" />
            </Form.Item>
            <Form.Item name={[groupName, 'questions', 0, 'order_number']} hidden><Input /></Form.Item>
            <Form.Item name={[groupName, 'questions', 0, 'sub_type']} initialValue="scenario" hidden><Input /></Form.Item>
          </div>

          <Row gutter={24}>
            <Col span={24} md={12}>
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 shadow-sm h-full">
                <h3 className="text-[14px] font-bold text-[#15803d] mb-3 flex items-center gap-2"><PenTool size={16}/> Task 1: Informal Email Prompt</h3>
                <Form.Item name={[groupName, 'questions', 1, 'question_text']} rules={[{ required: true, message: 'Please enter the prompt!' }]} style={{ marginBottom: 0 }}>
                  <BlurTextArea rows={6} placeholder="e.g. Write to your friend, Sam. Explain your feelings about the cancellation..." className="bg-white/80 border-green-200 focus:border-green-400 rounded-lg p-3" />
                </Form.Item>
                <Form.Item name={[groupName, 'questions', 1, 'order_number']} hidden><Input /></Form.Item>
                <Form.Item name={[groupName, 'questions', 1, 'sub_type']} initialValue="informal" hidden><Input /></Form.Item>
              </div>
            </Col>
            
            <Col span={24} md={12}>
              <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-xl p-5 shadow-sm h-full mt-6 md:mt-0">
                <h3 className="text-[14px] font-bold text-[#c2410c] mb-3 flex items-center gap-2"><PenTool size={16}/> Task 2: Formal Email Prompt</h3>
                <Form.Item name={[groupName, 'questions', 2, 'question_text']} rules={[{ required: true, message: 'Please enter the prompt!' }]} style={{ marginBottom: 0 }}>
                  <BlurTextArea rows={6} placeholder="e.g. Write to the Club President. Express your feelings and suggest alternatives..." className="bg-white/80 border-orange-200 focus:border-orange-400 rounded-lg p-3" />
                </Form.Item>
                <Form.Item name={[groupName, 'questions', 2, 'order_number']} hidden><Input /></Form.Item>
                <Form.Item name={[groupName, 'questions', 2, 'sub_type']} initialValue="formal" hidden><Input /></Form.Item>
              </div>
            </Col>
          </Row>
        </div>
      );
    }

    const qCount = PART_CONFIGS.find(p => p.type === partType)?.qCount || 1;
    return (
      <div className="flex flex-col gap-4 mt-2">
        {Array.from({ length: qCount }).map((_, idx) => (
          <div key={`q-${idx}`} className="flex items-start gap-3 p-4 bg-zinc-50/30 border border-zinc-100 rounded-xl shadow-sm">
            <div className="mt-1 bg-zinc-100 text-zinc-500 font-bold px-3 py-1 rounded-lg text-sm border border-zinc-200">
              Q{idx + 1}
            </div>
            <div className="flex-1">
              <Form.Item 
                name={[groupName, 'questions', idx, 'question_text']} 
                rules={[{ required: true, message: 'Required!' }]}
                style={{ marginBottom: 0 }}
              >
                {partType === "PART_2" || partType === "PART_3" ? (
                  <BlurTextArea rows={4} placeholder="e.g. Please tell us about your hobbies..." className="bg-white hover:border-[#445A95] focus:border-[#445A95] rounded-xl p-4 text-sm border-zinc-200 transition-all" />
                ) : (
                  <BlurInput size="large" placeholder={`Enter question ${idx + 1}...`} className="bg-white hover:border-[#445A95] focus:border-[#445A95] rounded-xl px-4 py-2 border-zinc-200 transition-all" />
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Spin size="large" />
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-20 pt-6">
      
      {/* ================= STICKY HEADER ================= */}
      <div className="bg-zinc-50/90 backdrop-blur-md pb-4 mb-6 pt-2 -mx-4 px-4 border-b border-zinc-200/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(basePath)}
            className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight m-0">
              {isCreateMode ? 'Create Question Group(s)' : 'Edit Question Group'}
            </h1>
            <p className="text-sm font-medium text-zinc-500 m-0">
              Configure writing tasks and associated prompts
            </p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#445A95] text-white font-bold rounded-xl hover:bg-[#3A4D81] hover:-translate-y-0.5 transition-all shadow-sm shadow-[#445A95]/20 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save size={18} />
          )}
          {isCreateMode ? 'Create Group(s)' : 'Save Changes'}
        </button>
      </div>

      <Form form={form} layout="vertical" requiredMark={false} autoComplete="off">
        {/* ================= GENERAL GROUP SETTINGS ================= */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center gap-2">
            <Settings size={18} className="text-[#445A95]" />
            <h2 className="text-base font-bold text-zinc-800 m-0">Group Information</h2>
          </div>
          
          <div className="p-6 md:p-8">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={<span className="text-sm font-bold text-zinc-700">Part Type</span>} name="part_type" rules={[{ required: true }]}>
                  <Select size="large" onChange={handlePartTypeChange}>
                    <Option value="PART_1">Part 1 (Word-level responses)</Option>
                    <Option value="PART_2">Part 2 (Short text)</Option>
                    <Option value="PART_3">Part 3 (Three written parts)</Option>
                    <Option value="PART_4">Part 4 (Informal & Formal Email)</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item name="difficulty_level" label={<span className="text-sm font-bold text-zinc-700">Difficulty Level (CEFR)</span>}>
                  <Select size="large" placeholder="Select CEFR Level">
                    <Option value="A1">A1</Option>
                    <Option value="A2">A2</Option>
                    <Option value="B1">B1</Option>
                    <Option value="B2">B2</Option>
                    <Option value="C">C</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>

        {/* ================= QUESTION GROUPS ================= */}
        <Form.List name="groups">
          {(fields, { add, remove }) => (
            <div className="flex flex-col gap-6">
              {fields.map(({ key, name, ...restField }, index) => (
                <div key={key} className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Layers size={18} className="text-emerald-500" />
                      <h2 className="text-base font-bold text-zinc-800 m-0">Group {index + 1} Questions for {currentPartType?.replace('_', ' ')}</h2>
                    </div>
                    {isCreateMode && fields.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => remove(name)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors focus:outline-none"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="p-6 md:p-8 bg-zinc-50/30">
                    <Form.Item 
                      {...restField}
                      name={[name, 'instruction']}
                      label={<span className="text-sm font-bold text-zinc-700">Group Instruction (Optional)</span>}
                      className={currentPartType === "PART_4" ? "mb-0" : ""}
                    >
                      <BlurTextArea rows={2} placeholder="E.g., You have joined a club. Answer the following questions." className="bg-white border-zinc-200 hover:border-[#445A95] focus:border-[#445A95] rounded-xl p-4 text-sm transition-all" />
                    </Form.Item>
                    
                    {currentPartType && renderQuestions(currentPartType, name)}
                  </div>
                </div>
              ))}
              
              {isCreateMode && (
                <button 
                  type="button"
                  onClick={() => add({ instruction: '', questions: getDefaultQuestions(currentPartType) })} 
                  className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#445A95]/20 text-[#445A95] bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] hover:border-indigo-300 rounded-xl font-bold transition-all focus:outline-none mt-2"
                >
                  <Plus size={18} />
                  ADD ANOTHER GROUP
                </button>
              )}
            </div>
          )}
        </Form.List>

      </Form>
    </div>
  );
};

export default BankGroupEditPage;

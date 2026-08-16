import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Select, Spin, Row, Col, message, Upload, Image, InputNumber
} from 'antd';
import { ArrowLeft, Save, Settings, Layers, Plus, Trash2, Upload as UploadIcon, Image as ImageIcon, Volume2, Mic } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { BlurTextArea } from '../../../../../../components/common/BlurInput';
import aptisSpeakingBankApi from '../../../../api/APTIS/speaking/aptisSpeakingBankApi';
import speakingAptisApi from '../../../../api/APTIS/speaking/speakingAptisAdminApi';
import { PART_CONFIGS } from '../../../../hooks/APTIS/speaking/useSpeakingAptisEdit';

const { Option } = Select;

const BankGroupEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/speaking/bank' : '/admin/aptis/speaking/bank';
  const isCreateMode = !id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPartType, setSelectedPartType] = useState('PART_1');

  useEffect(() => {
    if (!isCreateMode) {
      fetchData();
    } else {
      initializeForm('PART_1');
    }
  }, [id, isCreateMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await aptisSpeakingBankApi.getBankGroupById(id);
      setSelectedPartType(response.part_type);
      
      const config = PART_CONFIGS.find(p => p.type === response.part_type) || PART_CONFIGS[0];
      const questionsData = Array.from({ length: config.qCount }).map((_, idx) => {
        const q = response.questions?.find(q => q.order_number === idx + 1) || {};
        return {
          order_number: idx + 1,
          question_text: q.question_text || '',
          audio_url: q.audio_url || '',
          prep_time: q.prep_time || config.prepTime,
          response_time: q.response_time || config.resTime,
        };
      });

      form.setFieldsValue({
        part_type: response.part_type,
        difficulty_level: response.difficulty_level || 'A2',
        groups: [{
          instruction: response.instruction || '',
          image_url: response.image_url || '',
          image_url_2: response.image_url_2 || '',
          questions: questionsData
        }]
      });
    } catch (error) {
      message.error('Failed to load bank group data');
      navigate(basePath);
    } finally {
      setLoading(false);
    }
  };

  const initializeForm = (partType) => {
    const config = PART_CONFIGS.find(p => p.type === partType) || PART_CONFIGS[0];
    
    form.setFieldsValue({
      part_type: partType,
      difficulty_level: 'A2',
      groups: [{
        instruction: '',
        image_url: '',
        image_url_2: '',
        questions: Array.from({ length: config.qCount }).map((_, idx) => ({
          order_number: idx + 1,
          question_text: '',
          audio_url: '',
          prep_time: config.prepTime,
          response_time: config.resTime
        }))
      }]
    });
  };

  const handlePartTypeChange = (value) => {
    setSelectedPartType(value);
    const config = PART_CONFIGS.find(p => p.type === value) || PART_CONFIGS[0];
    const groups = form.getFieldValue('groups') || [];
    
    const defaultQuestions = Array.from({ length: config.qCount }).map((_, idx) => ({
      order_number: idx + 1,
      question_text: '',
      audio_url: '',
      prep_time: config.prepTime,
      response_time: config.resTime
    }));
    
    form.setFieldsValue({
      part_type: value,
      groups: groups.map(g => ({
        ...g,
        questions: defaultQuestions
      }))
    });
  };

  const handleUploadFile = async (options, fieldPath, apiCall) => {
    const { file, onSuccess, onError } = options;
    try {
      const { url } = await apiCall(file);
      form.setFieldValue(fieldPath, url);
      onSuccess("Ok");
      message.success("File uploaded successfully");
    } catch (error) {
      onError({ error });
      message.error("Failed to upload file");
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
            instruction: group.instruction || '',
            image_url: group.image_url || null,
            image_url_2: group.image_url_2 || null,
            tags: {},
            questions: (group.questions || []).map(q => ({
              ...q,
              question_text: q.question_text || '',
              audio_url: q.audio_url || null
            }))
          };
          return aptisSpeakingBankApi.createBankGroup(payload);
        });

        await Promise.all(promises);
        message.success(`${values.groups.length} Bank group(s) created successfully!`);
      } else {
        const group = values.groups[0];
        const payload = {
          part_type: values.part_type,
          difficulty_level: values.difficulty_level,
          instruction: group.instruction || '',
          image_url: group.image_url || null,
          image_url_2: group.image_url_2 || null,
          tags: {},
          questions: (group.questions || []).map(q => ({
            ...q,
            question_text: q.question_text || '',
            audio_url: q.audio_url || null
          }))
        };
        await aptisSpeakingBankApi.updateBankGroup(id, payload);
        message.success('Bank group updated successfully');
      }

      navigate(basePath);
    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill in all required fields');
        if (error.errorFields.length > 0) {
          setTimeout(() => {
            form.scrollToField(error.errorFields[0].name, {
              behavior: 'smooth',
              block: 'center',
            });
          }, 100);
        }
      } else {
        message.error('An error occurred while saving');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = (groupName) => {
    const config = PART_CONFIGS.find(p => p.type === selectedPartType);
    if (!config) return null;

    const hasImage = config.images > 0;
    const hasTwoImages = config.images === 2; 

    return (
      <div className="pt-2">
        <Row gutter={32}>
          <Col span={24} md={hasImage ? 15 : 24}>
            <Form.Item name={[groupName, 'instruction']} label={<span className="text-sm font-bold text-zinc-700">Pre-start Instruction / Context (Optional)</span>}>
              <BlurTextArea rows={2} placeholder="e.g. You have 30 seconds to answer each question..." className="bg-white hover:border-[#445A95] focus:border-[#445A95] rounded-xl p-4 text-sm transition-all" />
            </Form.Item>
            
            <div className="mt-6">
              <span className="text-sm font-bold text-zinc-700 block mb-4">Questions & Audio List</span>
              {Array.from({ length: config.qCount }).map((_, qIdx) => (
                <div key={`q-${qIdx}`} className="mb-4 bg-zinc-50/50 p-5 rounded-xl border border-zinc-200 shadow-sm">
                  <Form.Item 
                    name={[groupName, 'questions', qIdx, 'question_text']} 
                    rules={[{ required: true, message: 'Please enter question text!' }]}
                    label={
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Q{qIdx + 1}</span>
                        <span className="font-semibold text-zinc-700">Question Text / Transcript</span>
                      </div>
                    }
                    className="mb-3"
                  >
                    <BlurTextArea rows={3} placeholder="Transcript or question content..." className="bg-white hover:border-[#445A95] focus:border-[#445A95] rounded-xl p-3 transition-all" />
                  </Form.Item>
                  
                  <div className="bg-white p-3 rounded-lg border border-zinc-100 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Mic size={16} className="text-zinc-400" />
                      <span className="text-sm font-semibold text-zinc-600">Audio File:</span>
                    </div>
                    <div className="flex-1 w-full">
                      <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                          const audioUrl = getFieldValue(['groups', groupName, 'questions', qIdx, 'audio_url']);
                          return (
                            <div className="flex items-center gap-4 w-full">
                              <Upload 
                                customRequest={(opt) => handleUploadFile(opt, ['groups', groupName, 'questions', qIdx, 'audio_url'], speakingAptisApi.uploadAudio)} 
                                showUploadList={false}
                              >
                                <button type="button" className="px-4 py-2 border border-zinc-200 hover:border-[#445A95] text-zinc-600 hover:text-[#445A95] bg-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm text-sm whitespace-nowrap">
                                  <UploadIcon size={14} />
                                  {audioUrl ? 'Replace Audio' : 'Upload MP3'}
                                </button>
                              </Upload>
                              {audioUrl ? (
                                <audio controls src={audioUrl} className="h-9 flex-1" />
                              ) : (
                                <span className="text-xs text-zinc-400 italic flex items-center gap-1"><Volume2 size={14} /> No audio uploaded</span>
                              )}
                            </div>
                          );
                        }}
                      </Form.Item>
                      <Form.Item name={[groupName, 'questions', qIdx, 'audio_url']} hidden><Input /></Form.Item>
                      <Form.Item name={[groupName, 'questions', qIdx, 'order_number']} hidden><Input /></Form.Item>
                      <Form.Item name={[groupName, 'questions', qIdx, 'prep_time']} hidden><InputNumber /></Form.Item>
                      <Form.Item name={[groupName, 'questions', qIdx, 'response_time']} hidden><InputNumber /></Form.Item>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Col>

          {hasImage && (
            <Col span={24} md={9}>
              <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-200 h-full mt-6 md:mt-0">
                <span className="text-sm font-bold text-orange-700 block mb-4 flex items-center gap-2">
                  <ImageIcon size={18} /> Illustration Images
                </span>
                
                <div className="mb-6">
                  <Upload customRequest={(opt) => handleUploadFile(opt, ['groups', groupName, 'image_url'], speakingAptisApi.uploadImage)} showUploadList={false}>
                    <button type="button" className="w-full py-3 border-2 border-dashed border-orange-300 hover:border-orange-500 text-orange-600 hover:text-orange-700 bg-white/50 hover:bg-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2">
                      <UploadIcon size={16} />
                      Upload Image {hasTwoImages ? '1' : ''}
                    </button>
                  </Upload>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const img1 = getFieldValue(['groups', groupName, 'image_url']);
                      return img1 ? (
                        <div className="mt-3 bg-white p-2 rounded-xl border border-orange-200 flex justify-center shadow-sm">
                          <Image src={img1} className="max-h-[180px] rounded-lg object-contain" />
                        </div>
                      ) : null;
                    }}
                  </Form.Item>
                  <Form.Item name={[groupName, 'image_url']} hidden><Input /></Form.Item>
                </div>

                {hasTwoImages && (
                  <div>
                    <Upload customRequest={(opt) => handleUploadFile(opt, ['groups', groupName, 'image_url_2'], speakingAptisApi.uploadImage)} showUploadList={false}>
                      <button type="button" className="w-full py-3 border-2 border-dashed border-orange-300 hover:border-orange-500 text-orange-600 hover:text-orange-700 bg-white/50 hover:bg-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2">
                        <UploadIcon size={16} />
                        Upload Image 2
                      </button>
                    </Upload>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const img2 = getFieldValue(['groups', groupName, 'image_url_2']);
                        return img2 ? (
                          <div className="mt-3 bg-white p-2 rounded-xl border border-orange-200 flex justify-center shadow-sm">
                            <Image src={img2} className="max-h-[180px] rounded-lg object-contain" />
                          </div>
                        ) : null;
                      }}
                    </Form.Item>
                    <Form.Item name={[groupName, 'image_url_2']} hidden><Input /></Form.Item>
                  </div>
                )}
              </div>
            </Col>
          )}
        </Row>
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
              {isCreateMode ? 'Create Question Group' : 'Edit Question Group'}
            </h1>
            <p className="text-sm font-medium text-zinc-500 m-0">
              Configure speaking tasks, audio prompts and images
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
          Save Changes
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
                  <Select size="large" onChange={handlePartTypeChange} disabled={!isCreateMode}>
                    <Option value="PART_1">Part 1 (Personal Info - 3 Qs)</Option>
                    <Option value="PART_2">Part 2 (Describe & Express - 1 Img, 3 Qs)</Option>
                    <Option value="PART_3">Part 3 (Describe & Compare - 2 Imgs, 3 Qs)</Option>
                    <Option value="PART_4">Part 4 (Experience & Opinion - 1 Img, 3 Qs)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<span className="text-sm font-bold text-zinc-700">Difficulty Level</span>} name="difficulty_level" rules={[{ required: true }]}>
                  <Select size="large">
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
                      <Layers size={18} className="text-[#3A4D81]" />
                      <h2 className="text-base font-bold text-zinc-800 m-0">Group {index + 1} for {selectedPartType?.replace('_', ' ')}</h2>
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
                    {renderContent(name)}
                  </div>
                </div>
              ))}
              
              {isCreateMode && (
                <button 
                  type="button"
                  onClick={() => {
                    const config = PART_CONFIGS.find(p => p.type === selectedPartType) || PART_CONFIGS[0];
                    add({
                      instruction: '',
                      image_url: '',
                      image_url_2: '',
                      questions: Array.from({ length: config.qCount }).map((_, idx) => ({
                        order_number: idx + 1,
                        question_text: '',
                        audio_url: '',
                        prep_time: config.prepTime,
                        response_time: config.resTime
                      }))
                    });
                  }}
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

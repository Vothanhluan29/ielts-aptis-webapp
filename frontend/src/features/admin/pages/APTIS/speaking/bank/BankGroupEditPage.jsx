import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, Card, Space, Select, 
  Spin, Typography, Row, Col, message, Upload, Image, InputNumber
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined, PictureOutlined, SoundOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { BlurTextArea } from '../../../../../../components/common/BlurInput';
import aptisSpeakingBankApi from '../../../../api/APTIS/speaking/aptisSpeakingBankApi';
import speakingAptisApi from '../../../../api/APTIS/speaking/speakingAptisAdminApi';
import { PART_CONFIGS } from '../../../../hooks/APTIS/speaking/useSpeakingAptisEdit';

const { Title, Text } = Typography;
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
      <div style={{ padding: '8px 4px' }}>
        <Row gutter={32}>
          <Col span={hasImage ? 15 : 24}>
            <Form.Item name={[groupName, 'instruction']} label={<Text strong>Pre-start Instruction / Context</Text>}>
              <BlurTextArea rows={2} placeholder="e.g. You have 30 seconds to answer each question..." />
            </Form.Item>
            
            <div style={{ marginTop: 20 }}>
              <Text strong style={{ display: 'block', marginBottom: 16, color: '#444' }}>Questions & Audio List</Text>
              {Array.from({ length: config.qCount }).map((_, qIdx) => (
                <div key={`q-${qIdx}`} style={{ marginBottom: 16, backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <Row gutter={16}>
                    <Col span={13}>
                      <Form.Item 
                        name={[groupName, 'questions', qIdx, 'question_text']} 
                        label={<span style={{ fontWeight: 600, color: '#3b82f6' }}>Question {qIdx + 1} Text</span>}
                        style={{ marginBottom: 0 }}
                      >
                        <BlurTextArea rows={3} placeholder="Transcript or question content..." />
                      </Form.Item>
                    </Col>
                    <Col span={11}>
                      <Form.Item label={<span style={{ fontWeight: 600, color: '#475569' }}>Audio</span>} shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                          const audioUrl = getFieldValue(['groups', groupName, 'questions', qIdx, 'audio_url']);
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <Upload 
                                customRequest={(opt) => handleUploadFile(opt, ['groups', groupName, 'questions', qIdx, 'audio_url'], speakingAptisApi.uploadAudio)} 
                                showUploadList={false}
                              >
                                <Button block icon={<UploadOutlined />}>{audioUrl ? 'Replace Audio' : 'Upload MP3'}</Button>
                              </Upload>
                              {audioUrl ? (
                                <audio controls src={audioUrl} style={{ height: 32, width: '100%' }} />
                              ) : (
                                <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}><SoundOutlined /> No audio</Text>
                              )}
                            </div>
                          );
                        }}
                      </Form.Item>
                      <Form.Item name={[groupName, 'questions', qIdx, 'audio_url']} hidden><Input /></Form.Item>
                      <Form.Item name={[groupName, 'questions', qIdx, 'order_number']} hidden><Input /></Form.Item>
                      
                      <Form.Item name={[groupName, 'questions', qIdx, 'prep_time']} hidden><InputNumber /></Form.Item>
                      <Form.Item name={[groupName, 'questions', qIdx, 'response_time']} hidden><InputNumber /></Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </Col>

          {hasImage && (
            <Col span={9}>
              <div style={{ backgroundColor: '#fff7ed', padding: 16, borderRadius: 8, border: '1px solid #fed7aa', height: '100%' }}>
                <Text strong style={{ display: 'block', marginBottom: 16, color: '#c2410c' }}>
                  <PictureOutlined /> Illustration Images
                </Text>
                
                <div style={{ marginBottom: 24 }}>
                  <Upload customRequest={(opt) => handleUploadFile(opt, ['groups', groupName, 'image_url'], speakingAptisApi.uploadImage)} showUploadList={false}>
                    <Button type="dashed" block icon={<UploadOutlined />} style={{ borderColor: '#f97316', color: '#f97316' }}>
                      Upload Image {hasTwoImages ? '1' : ''}
                    </Button>
                  </Upload>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const img1 = getFieldValue(['groups', groupName, 'image_url']);
                      return img1 ? (
                        <div style={{ marginTop: 12, textAlign: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}>
                          <Image src={img1} style={{ maxHeight: 180, borderRadius: 4, objectFit: 'contain' }} />
                        </div>
                      ) : null;
                    }}
                  </Form.Item>
                  <Form.Item name={[groupName, 'image_url']} hidden><Input /></Form.Item>
                </div>

                {hasTwoImages && (
                  <div>
                    <Upload customRequest={(opt) => handleUploadFile(opt, ['groups', groupName, 'image_url_2'], speakingAptisApi.uploadImage)} showUploadList={false}>
                      <Button type="dashed" block icon={<UploadOutlined />} style={{ borderColor: '#f97316', color: '#f97316' }}>
                        Upload Image 2
                      </Button>
                    </Upload>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const img2 = getFieldValue(['groups', groupName, 'image_url_2']);
                        return img2 ? (
                          <div style={{ marginTop: 12, textAlign: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 8, border: '1px solid #fdba74' }}>
                            <Image src={img2} style={{ maxHeight: 180, borderRadius: 4, objectFit: 'contain' }} />
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
              {isCreateMode ? 'Create Question Group' : 'Edit Question Group'}
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
              <Col span={12}>
                <Form.Item label="Part Type" name="part_type" rules={[{ required: true }]}>
                  <Select onChange={handlePartTypeChange} disabled={!isCreateMode}>
                    <Option value="PART_1">Part 1 (Personal Info - 3 Qs)</Option>
                    <Option value="PART_2">Part 2 (Describe & Express - 1 Img, 3 Qs)</Option>
                    <Option value="PART_3">Part 3 (Describe & Compare - 2 Imgs, 3 Qs)</Option>
                    <Option value="PART_4">Part 4 (Experience & Opinion - 1 Img, 3 Qs)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Difficulty Level" name="difficulty_level" rules={[{ required: true }]}>
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
                    size="small" 
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#4338ca' }}>Group {index + 1}</span>
                        {isCreateMode && fields.length > 1 && (
                          <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)}>Remove</Button>
                        )}
                      </div>
                    }
                    style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  >
                    {renderContent(name)}
                  </Card>
                ))}
                
                {isCreateMode && (
                  <Button 
                    type="dashed" 
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
                    block 
                    icon={<PlusOutlined />}
                    style={{ height: 48, borderRadius: 8, borderColor: '#[#445A95]', color: '#4f46e5' }}
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

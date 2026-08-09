import React, { useState, useEffect } from 'react';
import { 
  Form, Button, Select, Spin, Row, Col, Popconfirm, Upload, Collapse, message
} from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, CopyOutlined, UploadOutlined } from '@ant-design/icons';
import { ArrowLeft, Save, FileAudio, Settings, HelpCircle, Layers, Plus, Trash2, Copy } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import MultipleChoiceAdmin from '../../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../../components/APTIS/question-types/FillInBlankAdmin';
import { BlurInput, BlurTextArea } from '../../../../../../components/common/BlurInput';

import aptisListeningBankApi from '../../../../api/APTIS/listening/aptisListeningBankApi';
import listeningAptisAdminApi from '../../../../api/APTIS/listening/listeningAptisAdminApi';

const { Option } = Select;

const BankGroupEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/listening/bank' : '/admin/aptis/listening/bank';

  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeQuestionKeys, setActiveQuestionKeys] = useState([]);

  const isCreateMode = !id || id === 'create';
  const currentPartNumber = Form.useWatch('part_number', form);
  const isPart1 = currentPartNumber === 1;

  useEffect(() => {
    if (!isCreateMode) {
      fetchGroup();
    } else {
      setLoading(false);
      form.setFieldsValue({ part_number: 1, difficulty_level: 'A1' });
    }
  }, [id, isCreateMode]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await aptisListeningBankApi.getBankGroupById(id);
      form.setFieldsValue({
        part_number: response.part_number,
        instruction: response.instruction,
        audio_url: response.audio_url,
        transcript: response.transcript,
        difficulty_level: response.difficulty_level,
        questions: response.questions?.map(q => ({
          ...q,
          question_type: q.question_type || 'MULTIPLE_CHOICE',
        })) || []
      });
      // Expand all questions by default
      setActiveQuestionKeys((response.questions || []).map((_, idx) => idx.toString()));
    } catch (error) {
      message.error('Failed to load bank group details');
      navigate(basePath);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      // Ensure questions have valid order/numbering
      const payload = {
        ...values,
        questions: (values.questions || []).map((q, idx) => ({
        ...q,
        question_number: idx + 1,
        question_type: q.question_type || 'MULTIPLE_CHOICE',
      }))
    };

    if (isCreateMode) {
      await aptisListeningBankApi.createBankGroup(payload);
      message.success('Bank Group created successfully');
    } else {
      await aptisListeningBankApi.updateBankGroup(id, payload);
      message.success('Bank Group updated successfully');
    }
    
    navigate(basePath);
  } catch (error) {
    message.error(error?.response?.data?.detail || 'Failed to save group');
  } finally {
    setSubmitting(false);
  }
};

  const handleUploadAudio = async (options, isGroupLevel = false, qName = null) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await listeningAptisAdminApi.uploadAudio(file);
      message.success('Audio uploaded successfully');
      
      if (isGroupLevel) {
        form.setFieldValue('audio_url', res.url);
      } else if (qName !== null) {
        form.setFieldValue(['questions', qName, 'audio_url'], res.url);
      }
      onSuccess('ok');
    } catch (error) {
      message.error('Upload failed');
      onError(error);
    }
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
            onClick={() => navigate(basePath)}
            className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-zinc-900 tracking-tight m-0">
              {isCreateMode ? 'Create New Bank Group' : 'Edit Bank Group'}
            </h1>
            <p className="text-sm font-medium text-zinc-500 m-0">
              Configure group details and associated questions
            </p>
          </div>
        </div>
        
        <button
          onClick={() => form.submit()}
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#445A95] text-white font-bold rounded-xl hover:bg-[#3A4D81] hover:-translate-y-0.5 transition-all shadow-sm shadow-[#445A95]/20 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save size={18} />
          )}
          {isCreateMode ? 'Create Group' : 'Save Changes'}
        </button>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        autoComplete="off"
        requiredMark={false}
      >
        {/* ================= GENERAL GROUP SETTINGS ================= */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center gap-2">
            <Settings size={18} className="text-[#445A95]" />
            <h2 className="text-base font-bold text-zinc-800 m-0">Group Information</h2>
          </div>
          
          <div className="p-6 md:p-8">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item 
                  name="part_number" 
                  label={<span className="text-sm font-bold text-zinc-700">Part Number</span>} 
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Option value={1}>Part 1</Option>
                    <Option value={2}>Part 2</Option>
                    <Option value={3}>Part 3</Option>
                    <Option value={4}>Part 4</Option>
                    <Option value={5}>Part 5</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="difficulty_level" 
                  label={<span className="text-sm font-bold text-zinc-700">Difficulty Level (CEFR)</span>}
                >
                  <Select size="large" placeholder="Select CEFR Level" allowClear>
                    <Option value="A1">A1</Option>
                    <Option value="A2">A2</Option>
                    <Option value="B1">B1</Option>
                    <Option value="B2">B2</Option>
                    <Option value="C">C</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              {!isPart1 && (
                <Col span={24}>
                  <div className="mt-2 mb-6 p-5 bg-[#F8FAFC]/50 rounded-xl border border-[#445A95]/10/50">
                    <Form.Item 
                      label={
                        <div className="flex items-center gap-2 text-[#3A4D81] font-bold mb-1">
                          <FileAudio size={16} />
                          Shared Group Audio <span className="text-xs font-normal opacity-80">(Required for Part {currentPartNumber})</span>
                        </div>
                      }
                      style={{ marginBottom: 0 }}
                    >
                      <div className="flex gap-3">
                        <Form.Item 
                          name="audio_url" 
                          noStyle 
                          rules={[{ required: true, message: 'Shared audio is required' }]}
                        >
                          <BlurInput 
                            placeholder="Paste shared audio link..." 
                            className="flex-1 bg-white border-zinc-200 hover:border-indigo-400 focus:border-[#445A95] rounded-lg px-4 py-2.5" 
                          />
                        </Form.Item>
                        <Upload 
                          customRequest={(options) => handleUploadAudio(options, true)} 
                          showUploadList={false} 
                          accept="audio/*"
                        >
                          <Button 
                            icon={<UploadOutlined />} 
                            size="large"
                            className="bg-white text-[#445A95] border-[#445A95]/20 hover:border-indigo-400 hover:text-[#3A4D81] font-semibold rounded-lg"
                          >
                            Upload MP3
                          </Button>
                        </Upload>
                      </div>
                    </Form.Item>
                  </div>
                </Col>
              )}
            </Row>

            <Form.Item 
              name="instruction" 
              label={<span className="text-sm font-bold text-zinc-700">Instruction</span>}
              className="m-0"
            >
              <BlurTextArea 
                rows={3} 
                placeholder="E.g., Listen to the recording and answer the questions..." 
                className="bg-zinc-50/50 border-zinc-200 hover:border-indigo-400 focus:border-[#445A95] rounded-xl p-4"
              />
            </Form.Item>
          </div>
        </div>

        {/* ================= QUESTIONS ================= */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center gap-2">
            <Layers size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold text-zinc-800 m-0">Questions in this Group</h2>
          </div>
          
          <div className="p-6 md:p-8 bg-zinc-50/30">
            <Form.List name="questions">
              {(qFields, { add: addQ, remove: removeQ }) => {
                
                const collapseItems = qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => {
                  return {
                    key: qKey.toString(),
                    forceRender: true,
                    label: <span className="font-bold text-[#3A4D81] text-base">Question {qIndex + 1}</span>,
                    extra: (
                      <span onClick={e => e.stopPropagation()} className="flex gap-2">
                        <button
                          type="button"
                          className="p-1.5 text-zinc-400 hover:text-[#445A95] hover:bg-[#F8FAFC] rounded-md transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentQuestion = form.getFieldValue(['questions', qName]);
                            addQ({ 
                              ...currentQuestion, 
                              question_text: '', 
                              correct_answer: currentQuestion?.question_type === 'MATCHING' ? undefined : '0' 
                            }, qIndex + 1);
                            setActiveQuestionKeys([...activeQuestionKeys, qFields.length.toString()]);
                          }}
                        >
                          <Copy size={16} />
                        </button>
                        <Popconfirm 
                          title="Delete question?" 
                          onConfirm={(e) => { e.stopPropagation(); removeQ(qName); }} 
                          okText="Yes" 
                          cancelText="No"
                        >
                          <button
                            type="button"
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Popconfirm>
                      </span>
                    ),
                    children: (
                      <div className="pt-4 pb-2">
                        {isPart1 && (
                          <div className="mb-6 p-4 bg-sky-50/50 rounded-xl border border-sky-100">
                            <Form.Item 
                              label={
                                <div className="flex items-center gap-2 text-sky-700 font-bold mb-1">
                                  <FileAudio size={16} />
                                  Individual Audio <span className="text-xs font-normal opacity-80">(Required for Part 1)</span>
                                </div>
                              } 
                              style={{ marginBottom: 0 }}
                            >
                              <div className="flex gap-3">
                                <Form.Item 
                                  {...restQField} 
                                  name={[qName, 'audio_url']} 
                                  noStyle 
                                  rules={[{ required: true, message: 'Audio is required for Part 1 questions' }]}
                                >
                                  <BlurInput 
                                    placeholder="Provide audio URL..." 
                                    className="flex-1 bg-white border-zinc-200 hover:border-sky-400 focus:border-sky-500 rounded-lg px-4 py-2" 
                                  />
                                </Form.Item>
                                <Upload 
                                  customRequest={(options) => handleUploadAudio(options, false, qName)} 
                                  showUploadList={false} 
                                  accept="audio/*"
                                >
                                  <Button icon={<UploadOutlined />} className="bg-white font-medium rounded-lg">Upload MP3</Button>
                                </Upload>
                              </div>
                            </Form.Item>
                          </div>
                        )}

                        <Row gutter={24}>
                          <Col span={24} md={6}>
                            <Form.Item 
                              {...restQField} 
                              name={[qName, 'question_type']} 
                              label={<span className="text-sm font-bold text-zinc-700">Question Type</span>} 
                              rules={[{ required: true }]}
                            >
                              <Select size="large">
                                <Option value="MULTIPLE_CHOICE">Multiple Choice</Option>
                                <Option value="MATCHING">Matching</Option>
                                <Option value="SHORT_ANSWER">Fill in the Blank</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={24} md={18}>
                            <Form.Item 
                              label={<span className="text-sm font-bold text-zinc-700">Question Content</span>} 
                              required 
                              style={{ marginBottom: 16 }}
                            >
                              <div className="flex gap-2">
                                <Form.Item 
                                  {...restQField} 
                                  name={[qName, 'question_text']} 
                                  rules={[{ required: true, message: 'Please enter question content!' }]} 
                                  style={{ flex: 1, marginBottom: 0 }}
                                >
                                  <BlurInput 
                                    placeholder="E.g: What is the main topic?" 
                                    className="bg-white border-zinc-200 hover:border-indigo-400 focus:border-[#445A95] rounded-lg px-4 py-2"
                                  />
                                </Form.Item>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const currentText = form.getFieldValue(['questions', qName, 'question_text']) || '';
                                    form.setFieldValue(['questions', qName, 'question_text'], currentText + ' ___ ');
                                  }}
                                  className="px-4 py-2 border border-dashed border-zinc-300 text-zinc-600 rounded-lg font-medium hover:border-indigo-400 hover:text-[#445A95] transition-colors bg-white"
                                >
                                  Insert "___"
                                </button>
                              </div>
                            </Form.Item>
                          </Col>
                        </Row>

                        <div className="my-4 p-5 bg-zinc-50 rounded-xl border border-zinc-100">
                          <Form.Item 
                            shouldUpdate={(prevValues, currentValues) => {
                              const prevType = prevValues.questions?.[qName]?.question_type;
                              const currType = currentValues.questions?.[qName]?.question_type;
                              return prevType !== currType;
                            }} 
                            noStyle
                          >
                            {({ getFieldValue }) => {
                              const qType = getFieldValue(['questions', qName, 'question_type']) || 'MULTIPLE_CHOICE';
                              
                              if (qType === 'MATCHING') {
                                return <MatchingAdmin relativePath={[qName]} absolutePath={['questions', qName]} restField={restQField} form={form} />;
                              }

                              if (qType === 'SHORT_ANSWER') {
                                return <FillInBlankAdmin relativePath={[qName]} restField={restQField} />;
                              }
                              
                              return <MultipleChoiceAdmin relativePath={[qName]} absolutePath={['questions', qName]} restField={restQField} form={form} />;
                            }}
                          </Form.Item>
                        </div>

                        <Form.Item 
                          {...restQField} 
                          name={[qName, 'explanation']} 
                          label={<span className="text-sm font-bold text-zinc-700 flex items-center gap-1.5"><HelpCircle size={14}/> Explanation (Optional)</span>} 
                          style={{ marginBottom: 0 }}
                        >
                          <BlurTextArea 
                            rows={2} 
                            placeholder="Reason for selecting this answer..." 
                            className="bg-white border-zinc-200 hover:border-indigo-400 focus:border-[#445A95] rounded-lg p-3"
                          />
                        </Form.Item>
                      </div>
                    )
                  };
                });

                return (
                  <>
                    {qFields.length > 0 && (
                      <div className="custom-collapse-wrapper mb-6">
                        {/* We use Antd Collapse but it will take some styles from global or local */}
                        <Collapse 
                          size="large" 
                          activeKey={activeQuestionKeys} 
                          onChange={(keys) => setActiveQuestionKeys(keys)}
                          items={collapseItems} 
                          className="bg-white border-zinc-200 shadow-sm"
                          expandIconPosition="end"
                        />
                      </div>
                    )}

                    <button 
                      type="button"
                      onClick={() => {
                        addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' });
                        setActiveQuestionKeys([...activeQuestionKeys, qFields.length.toString()]);
                      }} 
                      className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#445A95]/20 text-[#445A95] bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] hover:border-indigo-300 rounded-xl font-bold transition-all focus:outline-none"
                    >
                      <Plus size={18} />
                      ADD QUESTION TO THIS GROUP
                    </button>
                  </>
                );
              }}
            </Form.List>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default BankGroupEditPage;

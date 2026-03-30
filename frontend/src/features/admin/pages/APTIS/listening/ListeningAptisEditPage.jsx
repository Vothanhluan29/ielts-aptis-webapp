import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  message, Spin, Row, Col, Typography, Collapse, Popconfirm, Upload, Select
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, UploadOutlined
} from '@ant-design/icons';

import listeningAptisAdminApi from '../../../api/APTIS/listening/listeningAptisAdminApi';

// 🔥 IMPORT SHARED COMPONENTS HERE
import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../components/APTIS/question-types/FillInBlankAdmin';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input; // 🔥 Đảm bảo đã lấy TextArea từ Input

const ListeningAptisEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePartKeys, setActivePartKeys] = useState(['0']);

  // ==========================================
  // 1. INITIALIZE & FETCH DATA
  // ==========================================
  useEffect(() => {
    if (isEditMode) {
      fetchTestDetail();
    } else {
      form.setFieldsValue({
        time_limit: 40,
        is_published: false,
        is_full_test_only: false,
        description: '', // 🔥 ĐÃ THÊM: Khởi tạo giá trị rỗng cho description
        parts: [
          {
            part_number: 1,
            title: 'Part 1: Word Recognition',
            audio_url: '',
            questions: [{ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' }]
          }
        ]
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTestDetail = async () => {
    setLoading(true);
    try {
      const response = await listeningAptisAdminApi.getTestDetail(id);
      const data = response.data || response;
      
      const formattedParts = data.parts?.map(part => {
        // Gộp tất cả câu hỏi từ các groups lại
        const allQuestions = part.groups?.reduce((acc, group) => {
          const mappedQs = (group.questions || []).map(q => {
            let optionsArray = ['', '', '', '', '']; 
            let correctIndex = q.correct_answer; 

            if (q.question_type !== 'SHORT_ANSWER') {
              if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
                // Xử lý Multiple Choice Object (A, B, C...)
                const keys = ["A", "B", "C", "D", "E"];
                optionsArray = keys.map(k => q.options[k] || '');
                const foundIndex = keys.findIndex(k => q.options[k] === q.correct_answer);
                if (foundIndex !== -1) correctIndex = foundIndex.toString();
              } else if (Array.isArray(q.options)) {
                // Xử lý Array cho Matching (Không ép lên 5 phần tử nữa)
                optionsArray = [...q.options];
                const foundIdx = optionsArray.findIndex(opt => opt === q.correct_answer);
                if(foundIdx !== -1) correctIndex = foundIdx.toString();
              }
            }

            return { 
              ...q,
              question_type: q.question_type || 'MULTIPLE_CHOICE',
              options: optionsArray, 
              correct_answer: correctIndex, 
              audio_url: q.audio_url || group.audio_url || '' 
            };
          });
          return [...acc, ...mappedQs];
        }, []) || [];

        return {
          ...part,
          title: part.title || `Part ${part.part_number}`,
          audio_url: part.groups?.[0]?.audio_url || '',
          questions: allQuestions
        };
      }) || [];

      form.setFieldsValue({
        title: data.title,
        description: data.description || '', // 🔥 ĐÃ THÊM: Đổ dữ liệu description từ API vào Form
        time_limit: data.time_limit,
        is_published: data.is_published,
        is_full_test_only: data.is_full_test_only,
        parts: formattedParts,
      });
      
      // Tự động mở tất cả Panel để Form Validation nhận diện được
      setActivePartKeys(formattedParts.map((_, idx) => idx.toString()));
    } catch (error) {
      message.error('Failed to load Listening test details!', error.response?.data?.message || error.message);
      navigate('/admin/aptis/listening');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. SUBMIT DATA & VALIDATION
  // ==========================================
  const onFinishFailed = (errorInfo) => {
    console.error('Validation Failed:', errorInfo);
    message.error('❌ Cập nhật thất bại! Vui lòng điền đầy đủ thông tin vào các ô bắt buộc (kiểm tra cả các Part đang đóng).');
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      // Biến đếm thứ tự câu hỏi toàn cục
      let globalQuestionNumber = 1;

      const payload = {
        title: values.title,
        description: values.description, // 🔥 ĐÃ THÊM: Gửi description lên Backend
        time_limit: Number(values.time_limit),
        is_published: Boolean(values.is_published),
        is_full_test_only: Boolean(values.is_full_test_only),
        
        parts: values.parts?.map((part, pIndex) => {
          
          const mappedQuestions = part.questions?.map((q) => {
            let finalOptions;
            let exactCorrectText = "";

            if (q.question_type === 'MATCHING') {
              finalOptions = (q.options || []).filter(opt => opt && opt.trim() !== '');
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";
            } 
            else if (q.question_type === 'SHORT_ANSWER') {
              finalOptions = {}; 
              exactCorrectText = q.correct_answer?.trim() || "";
            } 
            else {
              // MULTIPLE_CHOICE
              const optionsDict = {};
              const labels = ["A", "B", "C", "D", "E"]; 
              if (q.options && q.options.length > 0) {
                q.options.forEach((opt, i) => {
                  if (opt && opt.trim() !== '') optionsDict[labels[i]] = opt.trim();
                });
              }
              finalOptions = optionsDict;
              exactCorrectText = q.options[Number(q.correct_answer)]?.trim() || "";
            }

            // Gán số thứ tự liên tục
            const currentQuestionNumber = globalQuestionNumber++;

            return {
              question_number: currentQuestionNumber,
              question_text: q.question_text || "",
              question_type: q.question_type || "MULTIPLE_CHOICE",
              options: finalOptions, 
              correct_answer: exactCorrectText, 
              explanation: q.explanation || "",
              audio_url: q.audio_url || "" 
            };
          }) || [];

          return {
            part_number: pIndex + 1,
            title: part.title || `Part ${pIndex + 1}`,
            groups: [
              {
                instruction: part.title || `Part ${pIndex + 1}`,
                audio_url: part.audio_url || "", 
                order: 1,
                questions: mappedQuestions
              }
            ]
          };
        }) || []
      };

      if (isEditMode) {
        await listeningAptisAdminApi.updateTest(id, payload);
        message.success('Listening test updated successfully!');
      } else {
        await listeningAptisAdminApi.createTest(payload);
        message.success('New Listening test created successfully!');
      }
      navigate('/admin/aptis/listening');
    } catch (error) {
      console.error(error.response?.data);
      message.error('Failed to submit data! Please review and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // 3. AUDIO UPLOAD HANDLER
  // ==========================================
  const handleUploadAudio = async (options, partName, qName = null) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await listeningAptisAdminApi.uploadAudio(file);
      const audioUrl = res.data?.url || res.url; 
      
      if (qName !== null) {
        form.setFieldValue(['parts', partName, 'questions', qName, 'audio_url'], audioUrl);
      } else {
        form.setFieldValue(['parts', partName, 'audio_url'], audioUrl);
      }

      onSuccess("Ok");
      message.success(`${file.name} uploaded successfully!`);
    } catch (err) {
      onError({ err });
      message.error(`${file.name} upload failed.`);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/listening')}>Back</Button>
          <Title level={4} style={{ margin: 0, color: '#312e81' }}>
            {isEditMode ? `Edit Listening Test #${id}` : 'Create Aptis Listening Test'}
          </Title>
        </Space>
        <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large" style={{ backgroundColor: '#4f46e5' }}>
          {isEditMode ? 'Update Test' : 'Save Test'}
        </Button>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        onFinishFailed={onFinishFailed} 
        autoComplete="off" 
        preserve={true}
      >
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16 }}>
           <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label="Test Title" rules={[{ required: true, message: 'Title is required!' }]}>
                <Input placeholder="E.g: Aptis Listening Practice 01" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label="Time Limit (minutes)" rules={[{ required: true }]}>
                <InputNumber min={5} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* 🔥 ĐÃ THÊM: Ô NHẬP LƯU DESCRIPTION */}
          <Form.Item name="description" label="Test Description (Optional)">
            <TextArea 
              rows={3} 
              placeholder="Enter instructions, notes or a short description for this listening test..." 
              maxLength={500} 
              showCount 
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_published" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch checkedChildren="Published" unCheckedChildren="Draft" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_full_test_only" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch checkedChildren="Mock Test Only" unCheckedChildren="Practice" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="2. Part Content">
          <Form.List name="parts">
            {(partFields, { add: addPart, remove: removePart }) => (
              <>
                <Collapse activeKey={activePartKeys} onChange={setActivePartKeys} style={{ marginBottom: 16, backgroundColor: '#f8fafc' }}>
                  {partFields.map(({ key: partKey, name: partName }, pIndex) => (
                    <Panel 
                      key={partKey.toString()} 
                      header={
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue }) => (
                            <strong style={{ color: '#4338ca', fontSize: 16 }}>
                              Part {pIndex + 1}: {getFieldValue(['parts', partName, 'title']) || 'No title'}
                            </strong>
                          )}
                        </Form.Item>
                      }
                      extra={
                        <Popconfirm
                          title="Delete this entire Part?"
                          onConfirm={(e) => { e.stopPropagation(); removePart(partName); }}
                          onCancel={(e) => e.stopPropagation()}
                        >
                          <DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} onClick={(e) => e.stopPropagation()} />
                        </Popconfirm>
                      }
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name={[partName, 'title']} label="Part Title">
                            <Input placeholder="E.g: Part 1 - Word Recognition" />
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item label="Audio URL (For Parts 2, 3, 4 — Shared Audio)">
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Form.Item name={[partName, 'audio_url']} noStyle>
                                <Input placeholder="Paste shared audio link for this entire Part..." style={{ flex: 1 }} />
                              </Form.Item>
                              <Upload 
                                customRequest={(options) => handleUploadAudio(options, partName)} 
                                showUploadList={false} accept="audio/*"
                              >
                                <Button icon={<UploadOutlined />} type="primary" ghost>Upload MP3</Button>
                              </Upload>
                            </div>
                          </Form.Item>
                        </Col>
                      </Row>

                      <div style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                        <Text strong style={{ display: 'block', marginBottom: 12, color: '#475569' }}>Questions in this Part</Text>
                        
                        <Form.List name={[partName, 'questions']}>
                          {(qFields, { add: addQ, remove: removeQ }) => (
                            <>
                              {qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => (
                                <Card size="small" type="inner" key={qKey} style={{ marginBottom: 16, borderColor: '#cbd5e1' }}
                                  title={
                                    <Form.Item shouldUpdate noStyle>
                                      {() => {
                                        // Đếm tổng số câu hỏi của các Part trước đó
                                        const currentParts = form.getFieldValue('parts') || [];
                                        let prevQuestionsCount = 0;
                                        for (let i = 0; i < pIndex; i++) {
                                          prevQuestionsCount += (currentParts[i]?.questions?.length || 0);
                                        }
                                        // Cộng dồn vào qIndex hiện tại
                                        return `Question ${prevQuestionsCount + qIndex + 1}`;
                                      }}
                                    </Form.Item>
                                  }
                                  extra={<Button danger type="text" size="small" onClick={() => removeQ(qName)}>Delete</Button>}
                                >
                                  {/* INDIVIDUAL AUDIO FOR EACH QUESTION (FOR PART 1) */}
                                  <Form.Item label="Individual Audio URL for this question (Part 1 only)" style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                      <Form.Item {...restQField} name={[qName, 'audio_url']} noStyle>
                                        <Input placeholder="If filled, this question will have its own independent audio..." style={{ flex: 1 }} />
                                      </Form.Item>
                                      <Upload 
                                        customRequest={(options) => handleUploadAudio(options, partName, qName)} 
                                        showUploadList={false} accept="audio/*"
                                      >
                                        <Button icon={<UploadOutlined />}>Upload MP3</Button>
                                      </Upload>
                                    </div>
                                  </Form.Item>

                                  <Row gutter={16}>
                                    <Col span={6}>
                                      <Form.Item 
                                        {...restQField} 
                                        name={[qName, 'question_type']} 
                                        label="Question Type" 
                                        rules={[{ required: true }]}
                                      >
                                        <Select>
                                          <Option value="MULTIPLE_CHOICE">Multiple Choice (A, B, C)</Option>
                                          <Option value="MATCHING">Matching</Option>
                                          <Option value="SHORT_ANSWER">Fill in the Blank</Option>
                                        </Select>
                                      </Form.Item>
                                    </Col>
                                    <Col span={18}>
                                      <Form.Item label="Question Content" required style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <Form.Item {...restQField} name={[qName, 'question_text']} rules={[{ required: true, message: 'Please enter question content!' }]} style={{ flex: 1, marginBottom: 0 }}>
                                            <Input placeholder="E.g: What is the main topic?" />
                                          </Form.Item>
                                          <Button 
                                            type="dashed"
                                            onClick={() => {
                                              const currentText = form.getFieldValue(['parts', partName, 'questions', qName, 'question_text']) || '';
                                              form.setFieldValue(['parts', partName, 'questions', qName, 'question_text'], currentText + ' ___ ');
                                            }}
                                          >
                                            Insert "___"
                                          </Button>
                                        </div>
                                      </Form.Item>
                                    </Col>
                                  </Row>

                                  <Form.Item shouldUpdate={(prevValues, currentValues) => {
                                      const prevType = prevValues.parts?.[partName]?.questions?.[qName]?.question_type;
                                      const currType = currentValues.parts?.[partName]?.questions?.[qName]?.question_type;
                                      return prevType !== currType;
                                    }} 
                                    noStyle
                                  >
                                    {({ getFieldValue }) => {
                                      const qType = getFieldValue(['parts', partName, 'questions', qName, 'question_type']) || 'MULTIPLE_CHOICE';
                                      
                                      if (qType === 'MATCHING') {
                                        return (
                                          <MatchingAdmin 
                                            relativePath={[qName]} 
                                            absolutePath={['parts', partName, 'questions', qName]} 
                                            restField={restQField} 
                                            form={form} 
                                          />
                                        );
                                      }

                                      if (qType === 'SHORT_ANSWER') {
                                        return (
                                          <FillInBlankAdmin 
                                            relativePath={[qName]} 
                                            restField={restQField} 
                                          />
                                        );
                                      }
                                      
                                      return (
                                        <MultipleChoiceAdmin 
                                          relativePath={[qName]} 
                                          absolutePath={['parts', partName, 'questions', qName]} 
                                          restField={restQField} 
                                          form={form} 
                                        />
                                      );
                                    }}
                                  </Form.Item>

                                  <Form.Item {...restQField} name={[qName, 'explanation']} label="Explanation / Transcript (Optional)" style={{ marginBottom: 0 }}>
                                    <Input.TextArea rows={1} placeholder="Enter transcript or reason for selecting this answer..." />
                                  </Form.Item>
                                </Card>
                              ))}

                              <Button 
                                type="dashed" 
                                onClick={() => addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' })} 
                                block icon={<PlusOutlined />}
                                style={{ borderColor: '#94a3b8', color: '#475569' }}
                              >
                                ADD QUESTION TO THIS PART
                              </Button>
                            </>
                          )}
                        </Form.List>
                      </div>
                    </Panel>
                  ))}
                </Collapse>

                <Space style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Button 
                    type="primary" ghost
                    onClick={() => {
                      addPart({ 
                        title: `Part ${partFields.length + 1}`, 
                        audio_url: '', 
                        questions: [{ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0', audio_url: '' }] 
                      });
                      setActivePartKeys([...activePartKeys, partFields.length.toString()]);
                    }} 
                    icon={<PlusOutlined />}
                    style={{ fontWeight: 'bold', width: 250 }}
                  >
                    ADD NEW PART
                  </Button>
                </Space>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
};

export default ListeningAptisEditPage;
import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, InputNumber, Switch, Divider, Tabs, message, Tooltip, Upload } from 'antd'; 
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, 
  SortAscendingOutlined, AudioOutlined, CloudUploadOutlined, FileTextOutlined, PictureOutlined
} from '@ant-design/icons';

import { useListeningEdit } from '../../hooks/IELTS/listening/useListeningEdit';
import QuestionCard from '../../components/IELTS/QuestionForms/QuestionCard';
import { listeningAdminApi } from '../../api/IELTS/listening/listeningAdminApi'; 

const { Title, Text } = Typography;
const { TextArea } = Input;

const ListeningEditPage = () => {
  const { 
    form, loading, isEditMode, handleSave, navigate, 
    getNextQuestionNumber, recalculateAllQuestionNumbers 
  } = useListeningEdit();
  
  const [activeTabKey, setActiveTabKey] = useState(null);

  // THEO DÕI REALTIME SỐ LƯỢNG CÂU HỎI
  const watchedParts = Form.useWatch('parts', form) || [];
  
  const totalQuestions = watchedParts.reduce((sum, part) => {
    return sum + (part?.groups || []).reduce((groupSum, group) => {
      return groupSum + (group?.questions?.length || 0);
    }, 0);
  }, 0);

  const isMaxQuestions = totalQuestions >= 40;

  const onFinish = (values) => {
    const payload = JSON.parse(JSON.stringify(values));

    if (payload.parts) {
      payload.parts.forEach(p => {
        if (p?.groups) {
          p.groups.forEach(g => {
            if (g?.questions) {
              g.questions.forEach(q => {
                if (q.question_text === undefined || q.question_text === null) {
                  q.question_text = "";
                }
                
                if (!q.options) {
                  q.options = {};
                } else if (Array.isArray(q.options)) {
                  const dict = {};
                  const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
                  q.options.forEach((opt, i) => {
                    if (opt && opt.trim() !== '') dict[labels[i]] = opt.trim();
                  });
                  q.options = dict;
                }
              });
            }
          });
        }
      });
    }
    
    handleSave(payload);
  };

  const onFinishFailed = () => {
    message.error("Please fill in all required fields (marked in red) before saving!");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans pb-24">
      
      {/* ================= HEADER ================= */}
      <Space className="mb-6 w-full justify-between items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/skills/listening')} className="rounded-lg shadow-sm font-medium">
            Back
          </Button>
          <Title level={3} className="m-0! text-slate-800">
            {isEditMode ? 'Edit Listening Test' : 'Create New Listening Test'}
          </Title>
        </div>
        
        <Space>
          <div className={`px-4 py-2 rounded-lg font-bold text-sm border-2 mr-2 transition-colors ${isMaxQuestions ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
            Questions: {totalQuestions} / 40
          </div>

          <Button 
            onClick={recalculateAllQuestionNumbers} 
            icon={<SortAscendingOutlined />}
            size="large"
            className="font-semibold text-slate-600 border-slate-300 shadow-sm rounded-lg hover:text-blue-600 hover:border-blue-400"
          >
            Recalculate Numbers
          </Button>

          <Button 
            type="primary" 
            size="large" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()} 
            loading={loading} 
            className="bg-blue-600 font-bold rounded-lg shadow-md px-8 hover:bg-blue-500"
          >
            {isEditMode ? 'Update Test' : 'Save Test'}
          </Button>
        </Space>
      </Space>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish} 
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        preserve={true} 
      >
        
        {/* ================= TEST INFO ================= */}
        <Card className="mb-6 shadow-sm rounded-xl border-slate-200" styles={{ body: { padding: '20px 24px' } }}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            <Form.Item
              name="title"
              label={<Text strong>Test Title</Text>}
              rules={[{ required: true, message: 'Please enter a test title' }]}
              className="md:col-span-5 mb-0"
            >
              <Input size="large" placeholder="E.g: Cambridge 18 Test 1 - Listening" className="bg-slate-50 focus:bg-white" />
            </Form.Item>

            <Form.Item
              name="time_limit"
              label={<Text strong>Time Limit (minutes)</Text>}
              rules={[{ required: true, message: 'Please enter a time limit' }]}
              className="md:col-span-2 mb-0"
            >
              <InputNumber size="large" className="w-full bg-slate-50 focus:bg-white" min={1} />
            </Form.Item>

            <Form.Item
              name="is_published"
              label={<Text strong>Status</Text>}
              valuePropName="checked"
              className="md:col-span-2 mb-0"
            >
              <Switch checkedChildren="PUBLIC" unCheckedChildren="DRAFT" />
            </Form.Item>

            <Form.Item
              name="is_full_test_only"
              label={<Text strong>Mock Mode</Text>}
              valuePropName="checked"
              className="md:col-span-3 mb-0"
              tooltip="Only available in Full Mock Tests (Listening + Reading + Writing + Speaking)."
            >
              <Switch checkedChildren="MOCK ONLY" unCheckedChildren="PRACTICE" />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text strong>Test Description</Text>}
              className="md:col-span-12 mb-0"
            >
              <TextArea
                placeholder="E.g: Practice test based on Cambridge IELTS 18. Topics include a hotel booking, a museum tour..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                className="bg-slate-50 focus:bg-white"
              />
            </Form.Item>

          </div>
        </Card>

        {/* ================= PARTS ================= */}
        <Form.List name="parts">
          {(partFields, { add: addPart, remove: removePart }) => {

            const onEditTab = (targetKey, action) => {
              if (action === 'add') {
                if (isMaxQuestions) {
                  message.warning('You have reached the maximum limit of 40 questions!');
                  return;
                }

                const nextNum = getNextQuestionNumber();

                addPart({
                  part_number: partFields.length + 1,
                  audio_url: '',
                  transcript: '',
                  groups: [{
                    order: 1,
                    instruction: '',
                    questions: [{
                      question_number: nextNum,
                      question_type: 'MULTIPLE_CHOICE',
                      question_text: '',
                      correct_answers: []
                    }]
                  }]
                });

                setTimeout(() => {
                  const newKeys = form.getFieldValue('parts');
                  if (newKeys && newKeys.length > 0) {
                    setActiveTabKey((newKeys.length - 1).toString());
                  }
                }, 50);

              } else if (action === 'remove') {
                const idx = partFields.findIndex(f => f.key.toString() === targetKey);
                if (idx !== -1) {
                  removePart(partFields[idx].name);
                  if (targetKey === activeTabKey) setActiveTabKey("0");
                }
              }
            };

            const currentActiveKey = activeTabKey || (partFields.length > 0 ? partFields[0].key.toString() : undefined);

            const tabItems = partFields.map((pField, pIndex) => ({
              key: pField.key.toString(),
              label: <Text strong className="text-base px-4 py-1">Part {pIndex + 1}</Text>,
              closable: true,
              forceRender: true, 
              children: (
                <div className="pt-4 animate-fade-in">

                  <Form.Item name={[pField.name, 'part_number']} initialValue={pIndex + 1} hidden>
                    <Input />
                  </Form.Item>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LỆFT COLUMN: AUDIO & TRANSCRIPT AREA */}
                    <div className="lg:col-span-5 sticky top-4">
                      <Card
                        className="shadow-sm rounded-xl border-indigo-200"
                        styles={{ body: { padding: '16px 20px' } }}
                        title={
                          <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
                            <AudioOutlined /> Audio & Transcript
                          </div>
                        }
                      >
                        
                        <Form.Item
                          name={[pField.name, 'audio_url']}
                          label={<Text strong>Audio URL (MP3/WAV)</Text>}
                          rules={[{ required: true, message: 'Audio URL is required!' }]}
                          className="mb-4"
                        >
                          <Input 
                            placeholder="https://your-domain.com/audio/part1.mp3" 
                            size="large"
                            className="bg-slate-50"
                            addonAfter={
                              <Upload
                                accept="audio/*"
                                showUploadList={false}
                                customRequest={async ({ file, onSuccess, onError }) => {
                                  const hideLoading = message.loading('Uploading audio file...', 0);
                                  try {
                                    const res = await listeningAdminApi.uploadAudio(file);
                                    const uploadedUrl = res.data?.url || res.url;
                                    
                                    const currentParts = form.getFieldValue('parts');
                                    currentParts[pField.name].audio_url = uploadedUrl;
                                    form.setFieldsValue({ parts: currentParts });
                                    
                                    hideLoading();
                                    message.success('Audio uploaded successfully!');
                                    onSuccess("ok");
                                  } catch (error) {
                                    hideLoading();
                                    console.error("Upload error:", error);
                                    message.error('Failed to upload audio. Please check your server.');
                                    onError(error);
                                  }
                                }}
                              >
                                <Tooltip title="Upload Audio File">
                                  <Button type="text" icon={<CloudUploadOutlined className="text-indigo-600" />} size="small" />
                                </Tooltip>
                              </Upload>
                            }
                          />
                        </Form.Item>

                        {/* Transcript Input */}
                        <Form.Item
                          name={[pField.name, 'transcript']}
                          label={
                            <div className="flex items-center gap-2">
                              <Text strong>Tapescript / Transcript</Text>
                              <Tooltip title="Lời thoại của bài nghe sẽ được hiển thị cho học viên sau khi nộp bài để dò lại lỗi sai.">
                                <FileTextOutlined className="text-slate-400" />
                              </Tooltip>
                            </div>
                          }
                          className="mb-0"
                        >
                          <TextArea
                            placeholder="Type or paste the audio transcript here..."
                            className="font-serif text-[15px] leading-[1.8] custom-scrollbar bg-slate-50 focus:bg-white"
                            autoSize={{ minRows: 12 }}
                          />
                        </Form.Item>

                      </Card>
                    </div>

                    {/* RIGHT COLUMN: QUESTIONS */}
                    <div className="lg:col-span-7 space-y-6 pb-20">

                      <Form.List name={[pField.name, 'groups']}>
                        {(groupFields, { add: addGroup, remove: removeGroup }) => (
                          <div className="space-y-6">

                            {groupFields.map((gField, gIndex) => (
                              <Card
                                key={gField.key}
                                className="bg-white shadow-sm border-slate-200 rounded-xl relative"
                                styles={{ header: { backgroundColor: '#f8fafc' } }}
                                title={<Text strong className="text-indigo-700 uppercase tracking-widest text-xs">Question Group {gIndex + 1}</Text>}
                                extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeGroup(gField.name)} />}
                              >

                                <Form.Item name={[gField.name, 'order']} initialValue={gIndex + 1} hidden>
                                  <Input />
                                </Form.Item>

                                <Form.Item
                                  name={[gField.name, 'instruction']}
                                  label={<Text strong className="text-slate-600">Instruction</Text>}
                                >
                                  <TextArea rows={2} placeholder="E.g: Questions 1-5. Write NO MORE THAN TWO WORDS AND/OR A NUMBER." className="bg-slate-50" />
                                </Form.Item>

                                {/* 🔥 ĐÃ CẬP NHẬT: Thêm nút Upload cho Image URL */}
                                <Form.Item
                                  name={[gField.name, 'image_url']}
                                  label={<Text strong className="text-slate-600">Image URL (For Map/Diagram Labeling)</Text>}
                                >
                                  <Input 
                                    placeholder="https://your-domain.com/images/map.png" 
                                    className="bg-slate-50"
                                    addonAfter={
                                      <Upload
                                        accept="image/*"
                                        showUploadList={false}
                                        customRequest={async ({ file, onSuccess, onError }) => {
                                          const hideLoading = message.loading('Uploading image...', 0);
                                          try {
                                            const res = await listeningAdminApi.uploadImage(file);
                                            const uploadedUrl = res.data?.url || res.url;
                                            
                                            // Cập nhật giá trị vào form
                                            const currentParts = form.getFieldValue('parts');
                                            currentParts[pField.name].groups[gField.name].image_url = uploadedUrl;
                                            form.setFieldsValue({ parts: currentParts });
                                            
                                            hideLoading();
                                            message.success('Image uploaded successfully!');
                                            onSuccess("ok");
                                          } catch (error) {
                                            hideLoading();
                                            console.error("Upload error:", error);
                                            message.error('Failed to upload image. Please check your server.');
                                            onError(error);
                                          }
                                        }}
                                      >
                                        <Tooltip title="Upload Map/Diagram Image">
                                          <Button type="text" icon={<PictureOutlined className="text-indigo-600" />} size="small" />
                                        </Tooltip>
                                      </Upload>
                                    }
                                  />
                                </Form.Item>

                                <Divider className="my-4 border-slate-100" />

                                <Form.List name={[gField.name, 'questions']}>
                                  {(qFields, { add: addQuestion, remove: removeQuestion }) => (
                                    <div className="mt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">

                                      {qFields.map((qField) => (
                                        <QuestionCard
                                          key={qField.key}
                                          field={qField}
                                          remove={removeQuestion}
                                          namePath={['parts', pField.name, 'groups', gField.name, 'questions']}
                                          module="listening"
                                        />
                                      ))}

                                      <Button
                                        type="dashed"
                                        disabled={isMaxQuestions}
                                        onClick={() => {
                                          if (isMaxQuestions) return;
                                          const nextNum = getNextQuestionNumber();
                                          addQuestion({
                                            question_number: nextNum,
                                            question_type: 'MULTIPLE_CHOICE',
                                            question_text: '',
                                            correct_answers: []
                                          });
                                        }}
                                        block
                                        icon={<PlusOutlined />}
                                        className={`h-12 rounded-xl mt-2 font-semibold shadow-sm ${isMaxQuestions ? 'bg-slate-100 text-slate-400 border-slate-200' : 'text-indigo-600 bg-white border-indigo-200 hover:border-indigo-500'}`}
                                      >
                                        {isMaxQuestions ? 'Maximum 40 Questions Reached' : 'Add New Question'}
                                      </Button>

                                    </div>
                                  )}
                                </Form.List>

                              </Card>
                            ))}

                            <Button
                              type="dashed"
                              disabled={isMaxQuestions}
                              onClick={() => {
                                if (isMaxQuestions) return;
                                const nextNum = getNextQuestionNumber();
                                addGroup({
                                  order: groupFields.length + 1,
                                  instruction: '',
                                  questions: [{
                                    question_number: nextNum,
                                    question_type: 'MULTIPLE_CHOICE',
                                    correct_answers: []
                                  }]
                                });
                              }}
                              block
                              icon={<PlusOutlined />}
                              className={`h-14 rounded-xl font-semibold shadow-sm text-base ${isMaxQuestions ? 'bg-slate-100 text-slate-400 border-slate-200' : 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:border-indigo-400'}`}
                            >
                              {isMaxQuestions ? 'Limit Reached (Cannot add more groups)' : '+ Add New Question Group'}
                            </Button>

                          </div>
                        )}
                      </Form.List>

                    </div>

                  </div>
                </div>
              )
            }));

            return (
              <Tabs
                type="editable-card"
                onChange={(key) => setActiveTabKey(key)}
                activeKey={currentActiveKey}
                onEdit={onEditTab}
                items={tabItems}
                className="custom-admin-tabs"
                size="large"
                hideAdd={isMaxQuestions} 
              />
            );
          }}
        </Form.List>

      </Form>
    </div>
  );
};

export default ListeningEditPage;
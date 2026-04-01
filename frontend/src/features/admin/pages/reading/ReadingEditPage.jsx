import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, InputNumber, Switch, Divider, Tabs, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { useReadingEdit } from '../../hooks/reading/useReadingEdit';
import QuestionCard from '../../components/QuestionForms/QuestionCard';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ReadingEditPage = () => {
  const { 
    form, loading, isEditMode, handleSave, navigate, 
    getNextQuestionNumber, recalculateAllQuestionNumbers 
  } = useReadingEdit();
  
  const [activeTabKey, setActiveTabKey] = useState(null);

  const onFinish = (values) => {
    // Clone payload để không làm thay đổi trực tiếp State của Form
    const payload = JSON.parse(JSON.stringify(values));

    if (payload.passages) {
      payload.passages.forEach(p => {
        if (p?.groups) {
          p.groups.forEach(g => {
            if (g?.questions) {
              g.questions.forEach(q => {
                if (q.question_text === undefined || q.question_text === null) {
                  q.question_text = "";
                }
                
                // 🔥 ĐÃ FIX LỖI 422 FASTAPI: Đảm bảo options LUÔN LUÔN là Object {}
                if (!q.options) {
                  q.options = {};
                } else if (Array.isArray(q.options)) {
                  // Nếu xui rủi component con trả ra Array, ép nó về Dict {} ngay lập tức
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
    
    // console.log("🚀 PAYLOAD TO BACKEND:", payload);
    handleSave(payload);
  };

  const onFinishFailed = () => {
    message.error("Please fill in all required fields (marked in red) before saving!");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen font-sans pb-24">
      {/* 🔥 ĐÃ FIX: Đưa dòng comment này vào bên TRONG thẻ div để tránh lỗi sập React */}
      
      {/* ================= HEADER ================= */}
      <Space className="mb-6 w-full justify-between items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/skills/reading')} className="rounded-lg shadow-sm font-medium">
            Back
          </Button>
          <Title level={3} className="m-0! text-slate-800">
            {isEditMode ? 'Edit Reading Test' : 'Create New Reading Test'}
          </Title>
        </div>
        
        <Space>
          <Button 
            onClick={recalculateAllQuestionNumbers} 
            icon={<SortAscendingOutlined />}
            size="large"
            className="font-semibold text-slate-600 border-slate-300 shadow-sm rounded-lg hover:text-blue-600 hover:border-blue-400"
          >
            Recalculate Question Numbers
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
              <Input size="large" placeholder="E.g: Cambridge 18 Test 1 - Reading" className="bg-slate-50 focus:bg-white" />
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
                placeholder="E.g: Practice test based on Cambridge IELTS 18. Passage topics include urban farming, climate change..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                className="bg-slate-50 focus:bg-white"
              />
            </Form.Item>

          </div>
        </Card>

        {/* ================= PASSAGES ================= */}
        <Form.List name="passages">
          {(passageFields, { add: addPassage, remove: removePassage }) => {

            const onEditTab = (targetKey, action) => {
              if (action === 'add') {
                const nextNum = getNextQuestionNumber();

                addPassage({
                  order: passageFields.length + 1,
                  title: '',
                  content: '',
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

              } else if (action === 'remove') {
                const idx = passageFields.findIndex(f => f.key.toString() === targetKey);
                if (idx !== -1) removePassage(passageFields[idx].name);
              }
            };

            const currentActiveKey = activeTabKey || (passageFields.length > 0 ? passageFields[0].key.toString() : undefined);

            const tabItems = passageFields.map((pField, pIndex) => ({
              key: pField.key.toString(),
              label: <Text strong className="text-base px-4 py-1">Passage {pIndex + 1}</Text>,
              closable: true,
              children: (
                <div className="pt-4 animate-fade-in">

                  <Form.Item name={[pField.name, 'order']} initialValue={pIndex + 1} hidden>
                    <Input />
                  </Form.Item>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* PASSAGE AREA */}
                    <div className="lg:col-span-5 sticky top-4">
                      <Card
                        className="shadow-sm rounded-xl border-blue-200"
                        styles={{ body: { padding: '16px 20px' } }}
                        title={<Text className="text-blue-700 font-bold text-lg">Passage Area</Text>}
                      >

                        <Form.Item
                          name={[pField.name, 'title']}
                          label={<Text strong>Passage Title</Text>}
                          className="mb-4"
                        >
                          <Input placeholder="E.g: The History of Urban Farming" size="large" />
                        </Form.Item>

                        <Form.Item
                          name={[pField.name, 'content']}
                          label={<Text strong>Content (HTML/Text)</Text>}
                          rules={[{ required: true, message: 'Passage content cannot be empty!' }]}
                          className="mb-0"
                        >
                          <TextArea
                            placeholder="Type or paste the passage content here..."
                            className="font-serif text-[16px] leading-[1.8] custom-scrollbar bg-slate-50 focus:bg-white"
                            autoSize={{ minRows: 10 }}
                          />
                        </Form.Item>

                      </Card>
                    </div>

                    {/* QUESTIONS */}
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
                                  <TextArea rows={2} placeholder="E.g: Questions 1-5. Choose the correct letter A, B, C or D." className="bg-slate-50" />
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
                                          namePath={['passages', pField.name, 'groups', gField.name, 'questions']}
                                        />
                                      ))}

                                      <Button
                                        type="dashed"
                                        onClick={() => {
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
                                        className="h-12 rounded-xl text-blue-600 font-semibold bg-white border-blue-200 hover:border-blue-500 shadow-sm mt-2"
                                      >
                                        Add New Question
                                      </Button>

                                    </div>
                                  )}
                                </Form.List>

                              </Card>
                            ))}

                            <Button
                              type="dashed"
                              onClick={() => {
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
                              className="h-14 rounded-xl text-indigo-600 font-semibold bg-indigo-50 border-indigo-200 hover:border-indigo-400 shadow-sm text-base"
                            >
                              + Add New Question Group
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
              />
            );
          }}
        </Form.List>

      </Form>
    </div>
  );
};

export default ReadingEditPage;
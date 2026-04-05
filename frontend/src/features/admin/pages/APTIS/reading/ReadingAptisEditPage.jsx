import React from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Spin, Row, Col, Typography, Collapse, Popconfirm, Select
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, BookOutlined
} from '@ant-design/icons';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import FillInBlankAdmin from '../../../components/APTIS/question-types/FillInBlankAdmin';
import ReorderSentencesAdmin from '../../../components/APTIS/question-types/ReorderSentencesAdmin';

// Import Custom Hook
import { useReadingAptisEdit } from '../../../hooks/APTIS/reading/useReadingAptisEdit'; // Đổi đường dẫn theo dự án

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ReadingAptisEditPage = () => {
  const {
    id,
    form,
    isEditMode,
    loading,
    submitting,
    activePartKeys,
    setActivePartKeys,
    onFinish,
    onFinishFailed,
    navigate
  } = useReadingAptisEdit();

  // 🔥 TÁCH RIÊNG LOGIC HIỂN THỊ ĐỂ CÓ THỂ ĐẾM SỐ CÂU HỎI LIÊN TỤC
  const renderPartItems = (partFields, removePart) => {
    return partFields.map(({ key, name: partName }, pIndex) => ({
      key: key.toString(),
      label: (
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => (
            <strong style={{ color: '#4338ca', fontSize: 16 }}>
              Part {pIndex + 1}: {getFieldValue(['parts', partName, 'title']) || 'Untitled'}
            </strong>
          )}
        </Form.Item>
      ),
      extra: (
        <Popconfirm
          title="Delete this part?"
          description="This action cannot be undone."
          onConfirm={() => removePart(partName)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} />
        </Popconfirm>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Form.Item name={[partName, 'title']} label="Part Title">
            <Input placeholder="e.g. Part 1 - Sentence Comprehension" />
          </Form.Item>

          <Form.Item name={[partName, 'content']} label={<Text strong>Reading Passage</Text>}>
            <TextArea rows={6} placeholder="Paste the reading passage here..." />
          </Form.Item>

          <div style={{ padding: 16, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <Form.List name={[partName, 'questions']}>
              {(qFields, { add: addQ, remove: removeQ }) => (
                <>
                  {qFields.map(({ key: qKey, name: qName, ...restQField }, qIndex) => (
                    <Card
                      size="small"
                      type="inner"
                      key={qKey}
                      style={{ marginBottom: 16 }}
                      title={
                        <Form.Item shouldUpdate noStyle>
                          {() => {
                            const currentParts = form.getFieldValue('parts') || [];
                            let prevQuestionsCount = 0;
                            for (let i = 0; i < pIndex; i++) {
                              prevQuestionsCount += (currentParts[i]?.questions?.length || 0);
                            }
                            return `Question ${prevQuestionsCount + qIndex + 1}`;
                          }}
                        </Form.Item>
                      }
                      extra={
                        <Button danger type="text" size="small" onClick={() => removeQ(qName)}>
                          Remove
                        </Button>
                      }
                    >
                      <Row gutter={16} style={{ marginBottom: 12 }}>
                        <Col span={8}>
                          <Form.Item {...restQField} name={[qName, 'question_type']} label="Question Type" rules={[{ required: true }]}>
                            <Select>
                              <Option value="MULTIPLE_CHOICE">Multiple Choice</Option>
                              <Option value="FILL_IN_BLANKS">Fill in the Blanks</Option>
                              <Option value="MATCHING_OPINIONS">Matching Opinions (P3)</Option>
                              <Option value="MATCHING_HEADINGS">Matching Headings (P4)</Option>
                              <Option value="REORDER_SENTENCES">Reorder Sentences (P2)</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item {...restQField} name={[qName, 'question_text']} label="Question / Prompt">
                            <Input placeholder="Enter question text or prompt..." />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                          const qType = getFieldValue(['parts', partName, 'questions', qName, 'question_type']);
                          const pathProps = {
                            relativePath: [qName],
                            absolutePath: ['parts', partName, 'questions', qName],
                            restField: restQField,
                            form: form
                          };

                          if (qType === 'REORDER_SENTENCES') return <ReorderSentencesAdmin {...pathProps} />;
                          if (qType === 'MATCHING_OPINIONS' || qType === 'MATCHING_HEADINGS') return <MatchingAdmin {...pathProps} />;
                          if (qType === 'FILL_IN_BLANKS') return <FillInBlankAdmin {...pathProps} />;
                          return <MultipleChoiceAdmin {...pathProps} />;
                        }}
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => addQ({ question_type: 'MULTIPLE_CHOICE', options: ['', '', ''], correct_answer: '0' })}
                    block
                    icon={<PlusOutlined />}
                  >
                    ADD QUESTION
                  </Button>
                </>
              )}
            </Form.List>
          </div>
        </div>
      )
    }));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/reading')}>
            Back
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            <BookOutlined /> {isEditMode ? `Edit Reading Test #${id}` : 'Create Reading Test'}
          </Title>
        </Space>
        <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} size="large">
          Save Test
        </Button>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        onFinishFailed={onFinishFailed} 
        preserve={true}                 
      >
        <Card size="small" title="1. General Settings" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item name="title" label="Test Title" rules={[{ required: true }]}>
                <Input placeholder="e.g. Aptis Reading Practice Test 01" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="time_limit" label="Time Limit (minutes)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Test Description (Optional)">
            <TextArea 
              rows={3} 
              placeholder="Enter instructions, notes or a short description for this reading test..." 
              maxLength={500} 
              showCount 
            />
          </Form.Item>

          <Space size="large">
            <Form.Item name="is_published" valuePropName="checked" label="Status">
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
            <Form.Item name="is_full_test_only" valuePropName="checked" label="Test Mode">
              <Switch checkedChildren="Mock Test" unCheckedChildren="Practice" />
            </Form.Item>
          </Space>
        </Card>

        <Card size="small" title="2. Part Content">
          <Form.List name="parts">
            {(partFields, { add: addPart, remove: removePart }) => (
              <>
                <Collapse
                  activeKey={activePartKeys}
                  onChange={setActivePartKeys}
                  items={renderPartItems(partFields, removePart)}
                  style={{ marginBottom: 16 }}
                />
                <Button
                  type="primary"
                  ghost
                  onClick={() => {
                    addPart({ title: `Part ${partFields.length + 1}`, content: '', questions: [] });
                    setActivePartKeys([...activePartKeys, partFields.length.toString()]);
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  ADD NEW PART
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
};

export default ReadingAptisEditPage;
import React from 'react';
import { 
  Form, Input, Button, Card, Space, Switch, InputNumber, 
  Select, Spin, Row, Col, Typography, Collapse, Popconfirm, Tabs
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined,
  FontSizeOutlined, BookOutlined
} from '@ant-design/icons';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';

// Import Custom Hook
import { useGramVocabEdit } from '../../../hooks/APTIS/grammar_vocab/useGramVocabEdit';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const GramVocabEditPage = () => {
  // Rút trích mọi state và function từ Hook
  const {
    id,
    form,
    isEditMode,
    loading,
    submitting,
    activeGrammarKeys,
    setActiveGrammarKeys,
    activeVocabKeys,
    setActiveVocabKeys,
    onFinish,
    navigate
  } = useGramVocabEdit();

  // Helper render danh sách câu hỏi trong Collapse (Tái sử dụng cho cả 2 Tabs)
  const getCollapseItems = (fields, remove, listName, isVocab) => {
    return fields.map(({ key, name, ...restField }, index) => ({
      key: key.toString(),
      label: (
        <strong style={{ color: '#4f46e5' }}>
          Question {index + 1}
          <span style={{ color: '#64748b', fontWeight: 'normal', marginLeft: 10 }}>
            {form.getFieldValue([listName, name, 'question_text']) 
              ? `- ${form.getFieldValue([listName, name, 'question_text']).substring(0, 50)}...` 
              : '- No content yet'}
          </span>
        </strong>
      ),
      extra: (
        <Popconfirm
          title="Delete this question?"
          onConfirm={(e) => { e.stopPropagation(); remove(name); }}
          onCancel={(e) => e.stopPropagation()}
          okText="Delete"
          cancelText="Cancel"
        >
          <DeleteOutlined style={{ color: '#ef4444', fontSize: 16 }} onClick={(e) => e.stopPropagation()} />
        </Popconfirm>
      ),
      children: (
        <>
          <Row gutter={16}>
            {/* Tab Vocab: Hiện select loại câu hỏi. Tab Grammar: Ẩn đi và set cứng GRAMMAR */}
            {isVocab ? (
              <Col span={7}>
                <Form.Item {...restField} name={[name, 'part_type']} label="Vocabulary Type" rules={[{ required: true }]}>
                  <Select>
                    <Option value="VOCAB_WORD_DEFINITION">Word Definition</Option>
                    <Option value="VOCAB_WORD_PAIRS">Word Pairs</Option>
                    <Option value="VOCAB_WORD_USAGE">Word Usage</Option>
                    <Option value="VOCAB_WORD_COMBINATIONS">Word Combinations</Option>
                  </Select>
                </Form.Item>
              </Col>
            ) : (
              <Form.Item {...restField} name={[name, 'part_type']} initialValue="GRAMMAR" hidden><Input /></Form.Item>
            )}

            <Col span={isVocab ? 17 : 24}>
              <Form.Item label="Question Text" required style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Form.Item {...restField} name={[name, 'question_text']} rules={[{ required: true, message: 'Please enter question text!' }]} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder={isVocab ? "Example: What is the synonym of 'happy'?" : "Example: He ___ to the store yesterday."} />
                  </Form.Item>

                  <Button 
                    type="dashed"
                    onClick={() => {
                      const currentText = form.getFieldValue([listName, name, 'question_text']) || '';
                      form.setFieldValue([listName, name, 'question_text'], currentText + ' ___ ');
                    }}
                  >
                    Insert Blank (___)
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <MultipleChoiceAdmin 
            relativePath={[name]} 
            absolutePath={[listName, name]} 
            restField={restField} 
            form={form} 
          />

          <Form.Item {...restField} name={[name, 'explanation']} label="Explanation (Optional)" style={{ marginTop: 12 }}>
            <Input.TextArea rows={1} placeholder="Explain why this option is correct..." />
          </Form.Item>
        </>
      )
    }));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  // Cấu hình Tabs
  const tabItems = [
    {
      key: 'grammar',
      label: <span style={{ fontSize: 15, fontWeight: 500 }}><FontSizeOutlined /> Part 1: Grammar</span>,
      children: (
        <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '0 0 12px 12px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
          <Form.List name="grammar_questions">
            {(fields, { add, remove }) => (
              <>
                <Collapse activeKey={activeGrammarKeys} onChange={setActiveGrammarKeys} items={getCollapseItems(fields, remove, 'grammar_questions', false)} />
                <Button 
                  type="dashed" block size="large" icon={<PlusOutlined />} style={{ marginTop: 16, borderColor: '#4f46e5', color: '#4f46e5' }}
                  onClick={() => {
                    add({ part_type: 'GRAMMAR', options: ['', '', ''], correct_answer: '0' });
                    setActiveGrammarKeys([...activeGrammarKeys, fields.length.toString()]);
                  }}
                >
                  ADD NEW GRAMMAR QUESTION
                </Button>
              </>
            )}
          </Form.List>
        </div>
      )
    },
    {
      key: 'vocab',
      label: <span style={{ fontSize: 15, fontWeight: 500 }}><BookOutlined /> Part 2: Vocabulary</span>,
      children: (
        <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '0 0 12px 12px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
          <Form.List name="vocab_questions">
            {(fields, { add, remove }) => (
              <>
                <Collapse activeKey={activeVocabKeys} onChange={setActiveVocabKeys} items={getCollapseItems(fields, remove, 'vocab_questions', true)} />
                <Button 
                  type="dashed" block size="large" icon={<PlusOutlined />} style={{ marginTop: 16, borderColor: '#059669', color: '#059669' }}
                  onClick={() => {
                    add({ part_type: 'VOCAB_WORD_DEFINITION', options: ['', '', ''], correct_answer: '0' });
                    setActiveVocabKeys([...activeVocabKeys, fields.length.toString()]);
                  }}
                >
                  ADD NEW VOCABULARY QUESTION
                </Button>
              </>
            )}
          </Form.List>
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/grammar-vocab')}>Back</Button>
          <Title level={3} style={{ margin: 0, color: '#4f46e5' }}>
            {isEditMode ? `Edit Setup #${id}` : 'Create Grammar & Vocabulary Test'}
          </Title>
        </Space>
        <Button type="primary" size="large" onClick={() => form.submit()} icon={<SaveOutlined />} loading={submitting} style={{ backgroundColor: '#4f46e5', borderRadius: 8 }}>
          {isEditMode ? 'UPDATE TEST' : 'SAVE TEST'}
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" preserve={true}>
        {/* 1. GENERAL SETTINGS */}
        <Card variant="borderless" title="1. General Settings" style={{ marginBottom: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Row gutter={24}>
            <Col span={10}>
              <Form.Item name="title" label={<Text strong>Test Title</Text>} rules={[{ required: true }]}>
                <Input size="large" placeholder="Example: Aptis Core Practice 01" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="time_limit" label={<Text strong>Duration (mins)</Text>} rules={[{ required: true }]}>
                <InputNumber min={5} max={120} size="large" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_full_test_only" valuePropName="checked" label={<Text strong>Test Mode</Text>}>
                <Switch checkedChildren="Mock Test" unCheckedChildren="Practice" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_published" valuePropName="checked" label={<Text strong>Status</Text>}>
                <Switch checkedChildren="Published" unCheckedChildren="Draft" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label={<Text strong>Test Description (Optional)</Text>} style={{ marginTop: 12, marginBottom: 0 }}>
            <TextArea 
              rows={3} 
              placeholder="Enter instructions, notes or a short description for this Grammar & Vocab test..." 
              maxLength={500} 
              showCount 
            />
          </Form.Item>
        </Card>

        {/* 2. QUESTION CONTENT (TABS) */}
        <Typography.Title level={4} style={{ marginBottom: 16 }}>2. Question Content</Typography.Title>
        <Tabs type="card" size="large" items={tabItems} style={{ backgroundColor: '#fafafa', paddingTop: 12, borderRadius: 12 }} />
      </Form>
    </div>
  );
};

export default GramVocabEditPage;
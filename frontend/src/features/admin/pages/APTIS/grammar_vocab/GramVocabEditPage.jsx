import React from 'react';
import {
  Form, Input, Button, Card, Space, Switch, InputNumber,
  Select, Spin, Row, Col, Typography, Collapse, Popconfirm, Tabs
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined,
  FontSizeOutlined, BookOutlined, CopyOutlined, InfoCircleOutlined
} from '@ant-design/icons';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import { useGramVocabEdit } from '../../../hooks/APTIS/grammar_vocab/useGramVocabEdit';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Label hiển thị đẹp cho từng Vocab part_type ───────────────────────────
const VOCAB_TYPE_LABELS = {
  VOCAB_WORD_DEFINITION:   'Word Definition',
  VOCAB_WORD_PAIRS:        'Word Pairs',
  VOCAB_WORD_USAGE:        'Word Usage',
  VOCAB_WORD_COMBINATIONS: 'Word Combinations',
};

// ─── Màu accent theo part_type ──────────────────────────────────────────────
const VOCAB_TYPE_COLORS = {
  VOCAB_WORD_DEFINITION:   '#0ea5e9',
  VOCAB_WORD_PAIRS:        '#8b5cf6',
  VOCAB_WORD_USAGE:        '#f59e0b',
  VOCAB_WORD_COMBINATIONS: '#10b981',
};

const GramVocabEditPage = () => {
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
    onFinishFailed,
    navigate,
  } = useGramVocabEdit();

  // ─── Render collapse items cho Grammar (MultipleChoice, không có instruction per-question) ──
  const getGrammarCollapseItems = (fields, add, remove) =>
    fields.map(({ key, name, ...restField }, index) => ({
      key: key.toString(),
      forceRender: true,
      label: (
        <strong style={{ color: '#4f46e5' }}>
          Question {index + 1}
          <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 10, fontSize: 13 }}>
            {form.getFieldValue(['grammar_questions', name, 'question_text'])
              ? `— ${form.getFieldValue(['grammar_questions', name, 'question_text']).substring(0, 55)}...`
              : '— No content yet'}
          </span>
        </strong>
      ),
      extra: (
        <Space size="middle" onClick={(e) => e.stopPropagation()}>
          <Button
            type="text" size="small"
            icon={<CopyOutlined style={{ color: '#10b981', fontSize: 15 }} />}
            onClick={() => {
              const cur = form.getFieldValue(['grammar_questions', name]);
              add({ ...cur, question_text: '', correct_answer: '0' }, index + 1);
              setActiveGrammarKeys([...activeGrammarKeys, fields.length.toString()]);
            }}
          />
          <Popconfirm
            title="Delete this question?"
            onConfirm={() => remove(name)}
            okText="Delete" cancelText="Cancel"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 15 }} />} />
          </Popconfirm>
        </Space>
      ),
      children: (
        <>
          {/* Hidden part_type field */}
          <Form.Item {...restField} name={[name, 'part_type']} initialValue="GRAMMAR" hidden>
            <Input />
          </Form.Item>

          {/* Question text + Insert blank button */}
          <Form.Item label={<Text strong>Question Text</Text>} required style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Form.Item
                {...restField}
                name={[name, 'question_text']}
                rules={[{ required: true, message: 'Please enter question text!' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="Example: He ___ to the store yesterday." />
              </Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  const cur = form.getFieldValue(['grammar_questions', name, 'question_text']) || '';
                  form.setFieldValue(['grammar_questions', name, 'question_text'], cur + ' ___ ');
                }}
              >
                Insert Blank (___)
              </Button>
            </div>
          </Form.Item>

          <MultipleChoiceAdmin
            relativePath={[name]}
            absolutePath={['grammar_questions', name]}
            restField={restField}
            form={form}
          />

          <Form.Item
            {...restField} name={[name, 'explanation']}
            label="Explanation (Optional)" style={{ marginTop: 12 }}
          >
            <Input.TextArea rows={1} placeholder="Explain why this option is correct..." />
          </Form.Item>
        </>
      ),
    }));

  // ─── Render collapse items cho Vocab (MatchingAdmin + instruction per-question) ──
  const getVocabCollapseItems = (fields, add, remove) =>
    fields.map(({ key, name, ...restField }, index) => {
      const partType = form.getFieldValue(['vocab_questions', name, 'part_type']) || 'VOCAB_WORD_DEFINITION';
      const accentColor = VOCAB_TYPE_COLORS[partType] || '#059669';

      return {
        key: key.toString(),
        forceRender: true,
        label: (
          <strong style={{ color: accentColor }}>
            Question {index + 1}
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 500,
              background: `${accentColor}18`, color: accentColor,
              padding: '1px 8px', borderRadius: 20, border: `1px solid ${accentColor}40`
            }}>
              {VOCAB_TYPE_LABELS[partType] || partType}
            </span>
            <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 10, fontSize: 13 }}>
              {form.getFieldValue(['vocab_questions', name, 'question_text'])
                ? `— ${form.getFieldValue(['vocab_questions', name, 'question_text']).substring(0, 45)}...`
                : '— No content yet'}
            </span>
          </strong>
        ),
        extra: (
          <Space size="middle" onClick={(e) => e.stopPropagation()}>
            <Button
              type="text" size="small"
              icon={<CopyOutlined style={{ color: '#10b981', fontSize: 15 }} />}
              onClick={() => {
                const cur = form.getFieldValue(['vocab_questions', name]);
                // Duplicate giữ nguyên options (từ vựng), làm trống text và answer
                add({ ...cur, question_text: '', correct_answer: undefined }, index + 1);
                setActiveVocabKeys([...activeVocabKeys, fields.length.toString()]);
              }}
            />
            <Popconfirm
              title="Delete this question?"
              onConfirm={() => remove(name)}
              okText="Delete" cancelText="Cancel"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 15 }} />} />
            </Popconfirm>
          </Space>
        ),
        children: (
          <>
            <Row gutter={16}>
              {/* Vocab type selector */}
              <Col span={7}>
                <Form.Item
                  {...restField} name={[name, 'part_type']}
                  label="Vocabulary Type"
                  rules={[{ required: true, message: 'Please select type!' }]}
                >
                  <Select>
                    <Option value="VOCAB_WORD_DEFINITION">Word Definition</Option>
                    <Option value="VOCAB_WORD_PAIRS">Word Pairs</Option>
                    <Option value="VOCAB_WORD_USAGE">Word Usage</Option>
                    <Option value="VOCAB_WORD_COMBINATIONS">Word Combinations</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Question text (Definition / Meaning) */}
              <Col span={17}>
                <Form.Item
                  {...restField} name={[name, 'question_text']}
                  label="Definition / Meaning"
                  rules={[{ required: true, message: 'Please enter question text!' }]}
                >
                  <Input placeholder="Example: A large fruit with a green shell and red flesh..." />
                </Form.Item>
              </Col>
            </Row>

            {/* ✅ Instruction riêng cho từng vocab question (map đến group instruction) */}
            <Form.Item
              {...restField} name={[name, 'instruction']}
              label={
                <Space size={4}>
                  <InfoCircleOutlined style={{ color: accentColor }} />
                  <Text strong>Group Instruction</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>(shown to student above this question group)</Text>
                </Space>
              }
            >
              <Input.TextArea
                rows={2}
                placeholder="Example: Choose the word that best matches the definition..."
                style={{ borderColor: `${accentColor}60` }}
              />
            </Form.Item>

            {/* MatchingAdmin cho tất cả Vocab types */}
            <MatchingAdmin
              relativePath={[name]}
              absolutePath={['vocab_questions', name]}
              restField={restField}
              form={form}
            />

            <Form.Item
              {...restField} name={[name, 'explanation']}
              label="Explanation (Optional)" style={{ marginTop: 12 }}
            >
              <Input.TextArea rows={1} placeholder="Explain why this option is correct..." />
            </Form.Item>
          </>
        ),
      };
    });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'grammar',
      forceRender: true,
      label: (
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          <FontSizeOutlined /> Part 1: Grammar
        </span>
      ),
      children: (
        <div style={{
          padding: '24px',
          backgroundColor: '#fff',
          borderRadius: '0 0 12px 12px',
          border: '1px solid #f0f0f0',
          borderTop: 'none',
        }}>
          {/* ✅ Grammar KHÔNG có instruction field (theo yêu cầu) */}
          <Form.List name="grammar_questions">
            {(fields, { add, remove }) => (
              <>
                {fields.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '32px',
                    color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: 12,
                    marginBottom: 16,
                  }}>
                    No grammar questions yet. Click below to add one.
                  </div>
                )}
                <Collapse
                  activeKey={activeGrammarKeys}
                  onChange={setActiveGrammarKeys}
                  items={getGrammarCollapseItems(fields, add, remove)}
                />
                <Button
                  type="dashed" block size="large" icon={<PlusOutlined />}
                  style={{ marginTop: 16, borderColor: '#4f46e5', color: '#4f46e5' }}
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
      ),
    },
    {
      key: 'vocab',
      forceRender: true,
      label: (
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          <BookOutlined /> Part 2: Vocabulary
        </span>
      ),
      children: (
        <div style={{
          padding: '24px',
          backgroundColor: '#fff',
          borderRadius: '0 0 12px 12px',
          border: '1px solid #f0f0f0',
          borderTop: 'none',
        }}>
          {/* ✅ Mỗi vocab question có instruction riêng (per part_type group) */}
          <div style={{
            marginBottom: 16, padding: '10px 14px',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <InfoCircleOutlined style={{ color: '#059669', marginTop: 2 }} />
            <Text style={{ fontSize: 13, color: '#065f46' }}>
              Each question carries its own <strong>Group Instruction</strong> — questions with the same
              Vocabulary Type and Instruction will be automatically merged into one group when saving.
            </Text>
          </div>

          <Form.List name="vocab_questions">
            {(fields, { add, remove }) => (
              <>
                {fields.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '32px',
                    color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: 12,
                    marginBottom: 16,
                  }}>
                    No vocabulary questions yet. Click below to add one.
                  </div>
                )}
                <Collapse
                  activeKey={activeVocabKeys}
                  onChange={setActiveVocabKeys}
                  items={getVocabCollapseItems(fields, add, remove)}
                />
                <Button
                  type="dashed" block size="large" icon={<PlusOutlined />}
                  style={{ marginTop: 16, borderColor: '#059669', color: '#059669' }}
                  onClick={() => {
                    add({
                      part_type: 'VOCAB_WORD_DEFINITION',
                      instruction: '',
                      options: [],
                      correct_answer: undefined,
                    });
                    setActiveVocabKeys([...activeVocabKeys, fields.length.toString()]);
                  }}
                >
                  ADD NEW VOCABULARY QUESTION
                </Button>
              </>
            )}
          </Form.List>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
      }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/grammar-vocab')}>
            Back
          </Button>
          <Title level={3} style={{ margin: 0, color: '#4f46e5' }}>
            {isEditMode ? `Edit Test #${id}` : 'Create Grammar & Vocabulary Test'}
          </Title>
        </Space>
        <Button
          type="primary" size="large"
          onClick={() => form.submit()}
          icon={<SaveOutlined />}
          loading={submitting}
          style={{ backgroundColor: '#4f46e5', borderRadius: 8 }}
        >
          {isEditMode ? 'UPDATE TEST' : 'SAVE TEST'}
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
        {/* ── 1. General Settings ── */}
        <Card
          variant="borderless"
          title="1. General Settings"
          style={{ marginBottom: 24, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
          <Row gutter={24}>
            <Col span={10}>
              <Form.Item
                name="title" label={<Text strong>Test Title</Text>}
                rules={[{ required: true, message: 'Please enter test title!' }]}
              >
                <Input size="large" placeholder="Example: Aptis Core Practice 01" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="time_limit" label={<Text strong>Duration (mins)</Text>}
                rules={[{ required: true }]}
              >
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
          <Form.Item
            name="description"
            label={<Text strong>Test Description (Optional)</Text>}
            style={{ marginTop: 12, marginBottom: 0 }}
          >
            <TextArea
              rows={3}
              placeholder="Enter instructions, notes or a short description for this Grammar & Vocab test..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Card>

        {/* ── 2. Question Content ── */}
        <Typography.Title level={4} style={{ marginBottom: 16 }}>2. Question Content</Typography.Title>
        <Tabs
          type="card" size="large" items={tabItems}
          style={{ backgroundColor: '#fafafa', paddingTop: 12, borderRadius: 12 }}
        />
      </Form>
    </div>
  );
};

export default GramVocabEditPage;
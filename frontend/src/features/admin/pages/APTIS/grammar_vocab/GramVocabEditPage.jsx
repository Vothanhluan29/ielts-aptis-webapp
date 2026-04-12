import React from 'react';
import {
  Form, Input, Button, Card, Switch, InputNumber,
  Select, Spin, Row, Col, Typography, Collapse, Popconfirm, Tabs,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined,
  FontSizeOutlined, BookOutlined, CopyOutlined, InfoCircleOutlined,
  PlusCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';

import MultipleChoiceAdmin from '../../../components/APTIS/question-types/MultipleChoiceAdmin';
import MatchingAdmin from '../../../components/APTIS/question-types/MatchingAdmin';
import { useGramVocabEdit, MAX_QUESTIONS } from '../../../hooks/APTIS/grammar_vocab/useGramVocabEdit';

const { Title } = Typography;
const { Option } = Select;

const VOCAB_TYPES = {
  VOCAB_WORD_DEFINITION:   'Word Definition',
  VOCAB_WORD_PAIRS:        'Word Pairs',
  VOCAB_WORD_USAGE:        'Word Usage',
  VOCAB_WORD_COMBINATIONS: 'Word Combinations',
};

// ─── Grammar collapse items ──────────────────────────────────────────────────
const buildGrammarItems = (fields, add, remove, form, activeKeys, setActiveKeys, refreshCounts, isMaxed) =>
  fields.map(({ key, name, ...rf }, index) => ({
    key: key.toString(),
    forceRender: true,
    label: <span style={{ fontWeight: 600 }}>Question {index + 1}</span>,
    extra: (
      <span onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 8 }}>
        <Button type="text" size="small" icon={<CopyOutlined />}
          disabled={isMaxed}
          onClick={() => {
            add({ ...form.getFieldValue(['grammar_questions', name]), question_text: '', correct_answer: '0' }, index + 1);
            setActiveKeys([...activeKeys, fields.length.toString()]);
            refreshCounts();
          }}
        />
        <Popconfirm title="Delete question?" onConfirm={() => { remove(name); refreshCounts(); }} okText="Yes" cancelText="No">
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </span>
    ),
    children: (
      <>
        <Form.Item {...rf} name={[name, 'part_type']} initialValue="GRAMMAR" hidden><Input /></Form.Item>
        <Form.Item label="Question Text" required>
          <div style={{ display: 'flex', gap: 8 }}>
            <Form.Item {...rf} name={[name, 'question_text']} rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="He ___ to the store yesterday." />
            </Form.Item>
            <Button type="dashed" onClick={() => {
              const cur = form.getFieldValue(['grammar_questions', name, 'question_text']) || '';
              form.setFieldValue(['grammar_questions', name, 'question_text'], cur + ' ___ ');
            }}>Insert ___</Button>
          </div>
        </Form.Item>
        <MultipleChoiceAdmin relativePath={[name]} absolutePath={['grammar_questions', name]} restField={rf} form={form} />
        <Form.Item {...rf} name={[name, 'explanation']} label="Explanation (Optional)" style={{ marginTop: 8 }}>
          <Input.TextArea rows={1} placeholder="Why is this answer correct?" />
        </Form.Item>
      </>
    ),
  }));

// ─── Vocab question items bên trong group ────────────────────────────────────
const buildVocabQItems = (fields, add, remove, form, gName, refreshCounts, isMaxed) =>
  fields.map(({ key, name, ...rf }, index) => ({
    key: key.toString(),
    forceRender: true,
    label: <span style={{ fontWeight: 600 }}>Question {index + 1}</span>,
    extra: (
      <span onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 8 }}>
        <Button type="text" size="small" icon={<CopyOutlined />}
          disabled={isMaxed}
          onClick={() => {
            add({ ...form.getFieldValue(['vocab_groups', gName, 'questions', name]), question_text: '', correct_answer: undefined }, index + 1);
            refreshCounts();
          }}
        />
        <Popconfirm title="Delete question?" onConfirm={() => { remove(name); refreshCounts(); }} okText="Yes" cancelText="No">
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </span>
    ),
    children: (
      <>
        <Form.Item {...rf} name={[name, 'question_text']} label="Definition / Meaning" rules={[{ required: true }]}>
          <Input placeholder="A large fruit with a green shell..." />
        </Form.Item>
        <MatchingAdmin relativePath={[name]} absolutePath={['vocab_groups', gName, 'questions', name]} restField={rf} form={form} />
        <Form.Item {...rf} name={[name, 'explanation']} label="Explanation (Optional)" style={{ marginTop: 8 }}>
          <Input.TextArea rows={1} placeholder="Why is this answer correct?" />
        </Form.Item>
      </>
    ),
  }));

// ─── Vocab Group Card ─────────────────────────────────────────────────────────
const VocabGroupCard = ({ gKey, gName, removeGroup, form, totalCount, refreshCounts }) => {
  const isMaxed  = totalCount >= MAX_QUESTIONS;
  const partType = form.getFieldValue(['vocab_groups', gName, 'part_type']) || 'VOCAB_WORD_DEFINITION';
  const qCount   = form.getFieldValue(['vocab_groups', gName, 'questions'])?.length || 0;

  return (
    <Card key={gKey} size="small" style={{ borderRadius: 12 }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>
            Group {gName + 1} — {VOCAB_TYPES[partType] || partType}
            {qCount > 0 && qCount < 5 && (
              <span style={{ marginLeft: 10, color: '#f59e0b', fontSize: 12 }}>
                <ExclamationCircleOutlined /> {qCount}/5 recommended
              </span>
            )}
          </span>
          <Popconfirm title="Delete this group and all its questions?" onConfirm={() => { removeGroup(gName); refreshCounts(); }} okButtonProps={{ danger: true }}>
            <Button type="text" danger size="small" icon={<DeleteOutlined />}>Remove</Button>
          </Popconfirm>
        </div>
      }
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name={[gName, 'part_type']} label="Type" rules={[{ required: true }]}>
            <Select onChange={refreshCounts}>
              {Object.entries(VOCAB_TYPES).map(([val, lbl]) => <Option key={val} value={val}>{lbl}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item name={[gName, 'instruction']}
            label={<><InfoCircleOutlined /> Instruction (shown to students)</>}
            rules={[{ required: true, message: 'Please enter instruction!' }]}>
            <Input.TextArea rows={2} placeholder="Choose the word that best matches the definition..." />
          </Form.Item>
        </Col>
      </Row>
      <Form.List name={[gName, 'questions']}>
        {(qFields, { add: addQ, remove: removeQ }) => (
          <>
            <Collapse size="small"
              items={buildVocabQItems(qFields, addQ, removeQ, form, gName, refreshCounts, isMaxed)} />
            <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 10 }}
              disabled={isMaxed}
              onClick={() => { addQ({ options: [], correct_answer: undefined }); refreshCounts(); }}
            >
              {isMaxed ? `Question limit reached (${MAX_QUESTIONS})` : 'Add Question'}
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const GramVocabEditPage = () => {
  const {
    id, form, isEditMode, loading, submitting,
    activeGrammarKeys, setActiveGrammarKeys,
    totalCount, refreshCounts,
    onFinish, onFinishFailed, navigate,
  } = useGramVocabEdit();

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const isMaxed = totalCount >= MAX_QUESTIONS;

  const tabItems = [
    {
      key: 'grammar',
      forceRender: true,
      label: <span><FontSizeOutlined /> Grammar</span>,
      children: (
        <div style={{ padding: 20 }}>
          <Form.List name="grammar_questions">
            {(fields, { add, remove }) => (
              <>
                <Collapse activeKey={activeGrammarKeys} onChange={setActiveGrammarKeys}
                  items={buildGrammarItems(fields, add, remove, form, activeGrammarKeys, setActiveGrammarKeys, refreshCounts, isMaxed)} />
                <Button type="dashed" block icon={<PlusOutlined />} style={{ marginTop: 12 }}
                  disabled={isMaxed}
                  onClick={() => {
                    add({ part_type: 'GRAMMAR', options: ['', '', ''], correct_answer: '0' });
                    setActiveGrammarKeys([...activeGrammarKeys, fields.length.toString()]);
                    refreshCounts();
                  }}
                >
                  {isMaxed ? `Question limit reached (${MAX_QUESTIONS})` : 'Add Grammar Question'}
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
      label: <span><BookOutlined /> Vocabulary</span>,
      children: (
        <div style={{ padding: 20 }}>
          <Form.List name="vocab_groups">
            {(groupFields, { add: addGroup, remove: removeGroup }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {groupFields.map(({ key: gKey, name: gName }) => (
                  <VocabGroupCard key={gKey} gKey={gKey} gName={gName}
                    removeGroup={removeGroup} form={form}
                    totalCount={totalCount} refreshCounts={refreshCounts}
                  />
                ))}
                <Button type="dashed" block size="large" icon={<PlusCircleOutlined />}
                  onClick={() => { addGroup({ part_type: 'VOCAB_WORD_DEFINITION', instruction: '', questions: [] }); refreshCounts(); }}
                >
                  Add Vocabulary Group
                </Button>
              </div>
            )}
          </Form.List>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', padding: '24px 16px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/aptis/grammar-vocab')}>Back</Button>
          <Title level={4} style={{ margin: 0 }}>
            {isEditMode ? `Edit Test #${id}` : 'Create Grammar & Vocab Test'}
          </Title>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* ✅ Chỉ hiện 1 counter tổng */}
          <span style={{
            padding: '6px 14px', borderRadius: 8,
            border: `1px solid ${isMaxed ? '#fca5a5' : '#e2e8f0'}`,
            backgroundColor: isMaxed ? '#fef2f2' : '#f8fafc',
            fontSize: 13, fontWeight: 600,
            color: isMaxed ? '#dc2626' : '#334155',
          }}>
            {isMaxed && <ExclamationCircleOutlined style={{ marginRight: 6 }} />}
            {totalCount} / {MAX_QUESTIONS} questions
          </span>
          <Button type="primary" size="large" icon={<SaveOutlined />} loading={submitting}
            style={{ backgroundColor: '#4f46e5' }} onClick={() => form.submit()}>
            {isEditMode ? 'Update' : 'Save'}
          </Button>
        </span>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} preserve autoComplete="off">
        <Card size="small" title="General Settings" style={{ marginBottom: 16, borderRadius: 12 }}>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input placeholder="Aptis Core Practice 01" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="time_limit" label="Duration (mins)" rules={[{ required: true }]}>
                <InputNumber min={5} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_full_test_only" valuePropName="checked" label="Test Mode">
                <Switch checkedChildren="Mock" unCheckedChildren="Practice" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="is_published" valuePropName="checked" label="Status">
                <Switch checkedChildren="Published" unCheckedChildren="Draft" />
              </Form.Item>
            </Col>
            <Col span={24}>
            </Col>
          </Row>
        </Card>

        <Tabs type="card" items={tabItems} style={{ backgroundColor: '#fafafa', paddingTop: 8, borderRadius: 12 }} />
      </Form>
    </div>
  );
};

export default GramVocabEditPage;
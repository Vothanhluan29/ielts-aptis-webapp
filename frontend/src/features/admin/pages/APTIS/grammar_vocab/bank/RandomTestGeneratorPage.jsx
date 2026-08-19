import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Spin, message, Switch, Select, InputNumber } from 'antd';
import { ArrowLeftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, Clock, BookOpen, Zap, Shuffle, ArrowLeft } from 'lucide-react';

import aptisGrammarVocabBankApi from '../../../../api/APTIS/grammar_vocab/aptisGrammarVocabBankApi';

const { Option } = Select;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C'];

const RandomTestGeneratorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const testBasePath = isTeacher ? '/teacher/grammar-vocab' : '/admin/aptis/grammar-vocab';
  const bankBasePath = isTeacher ? '/teacher/grammar_vocab' : '/admin/aptis/grammar_vocab';
  const bankPath = `${bankBasePath}/bank`;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [bankStats, setBankStats] = useState([]);

  useEffect(() => {
    aptisGrammarVocabBankApi.getBankStats().then(setBankStats).catch(console.error);
  }, []);

  const getOptionLabel = (part, level) => {
    const stat = bankStats.find(s => s.part === part && s.difficulty_level === level);
    const count = stat ? stat.count : 0;
    return `${level} (${count})`;
  };

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const config = {
        title: values.title,
        description: values.description,
        time_limit: values.time_limit || 25,
        is_published: values.is_published || false,
        is_full_test_only: values.is_full_test_only || false,
        difficulty_level: values.difficulty_level || null,
        part_difficulties: {
          GRAMMAR: values.difficulty_grammar || null,
          VOCAB_WORD_PAIRS: values.difficulty_vocab_word_pairs || null,
          VOCAB_WORD_DEFINITION: values.difficulty_vocab_word_definition || null,
          VOCAB_WORD_MATCH: values.difficulty_vocab_word_match || null,
          VOCAB_WORD_USAGE: values.difficulty_vocab_word_usage || null,
          VOCAB_COLLOCATIONS: values.difficulty_vocab_collocations || null,
        }
      };
      const response = await aptisGrammarVocabBankApi.generateRandomTest(config);
      message.success('Random Test generated successfully!');
      navigate(`${testBasePath}/edit/${response.id}`);
    } catch (error) {
      if (error.response?.data?.detail) {
        message.error(`Generation failed: ${error.response.data.detail}`);
      } else if (!error?.errorFields) {
        message.error('Failed to generate test. Make sure you have enough questions in the bank.');
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 16px 40px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(bankPath)} style={{ padding: '7px 10px', background: '#f4f4f5', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#71717a' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Shuffle size={17} className="text-[#445A95]" />
            <h1 className="m-0 text-2xl font-black text-zinc-800 tracking-tight">Generate Random Test</h1>
          </div>
          <p className="m-0 text-xs text-zinc-400 mt-0.5">Grammar &amp; Vocabulary · Auto-pick from question bank</p>
        </div>
      </div>

      <Spin spinning={submitting} tip="Generating...">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
          initialValues={{ time_limit: 25, is_published: false, is_full_test_only: false }}
        >
          {/* Single compact card */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4e4e7', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

            {/* Section 1 - Basic Info */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f4f4f5' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#445A95]/10 flex items-center justify-center">
                  <Settings size={14} className="text-[#445A95]" />
                </div>
                <span className="text-base font-bold text-zinc-700">Basic Information</span>
              </div>
              <div className="grid grid-cols-12 gap-x-4">
                <div className="col-span-12 md:col-span-6">
                  <Form.Item
                    name="title"
                    label={<span className="text-sm font-semibold text-zinc-600">Test Title</span>}
                    rules={[{ required: true, message: 'Please enter a title' }]}
                    className="mb-3"
                  >
                    <Input placeholder="e.g. Random G&V Practice Test 01" size="large" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <Form.Item name="time_limit" label={<span className="text-sm font-semibold text-zinc-600">Duration (mins)</span>} className="mb-3">
                    <InputNumber min={1} max={120} className="!w-full" size="large" style={{ borderRadius: 8 }} prefix={<Clock size={13} className="text-zinc-400 mr-1" />} />
                  </Form.Item>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <Form.Item name="difficulty_level" label={<span className="text-sm font-semibold text-zinc-600">Overall Level</span>} className="mb-3">
                    <Select allowClear placeholder="Any" size="large" style={{ width: '100%' }}>
                      {LEVELS.map(l => <Option key={l} value={l}>{l}</Option>)}
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-span-12">
                  <Form.Item name="description" label={<span className="text-sm font-semibold text-zinc-600">Description <span className="text-zinc-400 font-normal">(optional)</span></span>} className="mb-0">
                    <Input.TextArea rows={2} placeholder="Short notes about this test..." style={{ borderRadius: 8, resize: 'none' }} />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Section 2 - Part Difficulty */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <BookOpen size={14} className="text-violet-600" />
                </div>
                <span className="text-base font-bold text-zinc-700">Difficulty per Part <span className="font-normal text-zinc-400 text-xs">(optional — leave blank to pick randomly)</span></span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center"><Zap size={11} className="text-white" /></div>
                    <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Grammar</span>
                  </div>
                  <Form.Item name="difficulty_grammar" className="mb-0">
                    <Select allowClear placeholder="Any Level" size="large" style={{ width: '100%' }}>
                      {LEVELS.map(l => <Option key={l} value={l}>{getOptionLabel('GRAMMAR', l)}</Option>)}
                    </Select>
                  </Form.Item>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center"><BookOpen size={11} className="text-white" /></div>
                    <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Word Pairs</span>
                  </div>
                  <Form.Item name="difficulty_vocab_word_pairs" className="mb-0">
                    <Select allowClear placeholder="Any Level" size="large" style={{ width: '100%' }}>
                      {LEVELS.map(l => <Option key={l} value={l}>{getOptionLabel('VOCAB_WORD_PAIRS', l)}</Option>)}
                    </Select>
                  </Form.Item>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center"><BookOpen size={11} className="text-white" /></div>
                    <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Word Definition</span>
                  </div>
                  <Form.Item name="difficulty_vocab_word_definition" className="mb-0">
                    <Select allowClear placeholder="Any Level" size="large" style={{ width: '100%' }}>
                      {LEVELS.map(l => <Option key={l} value={l}>{getOptionLabel('VOCAB_WORD_DEFINITION', l)}</Option>)}
                    </Select>
                  </Form.Item>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center"><BookOpen size={11} className="text-white" /></div>
                    <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Word Match</span>
                  </div>
                  <Form.Item name="difficulty_vocab_word_match" className="mb-0">
                    <Select allowClear placeholder="Any Level" size="large" style={{ width: '100%' }}>
                      {LEVELS.map(l => <Option key={l} value={l}>{getOptionLabel('VOCAB_WORD_MATCH', l)}</Option>)}
                    </Select>
                  </Form.Item>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center"><BookOpen size={11} className="text-white" /></div>
                    <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Word Usage</span>
                  </div>
                  <Form.Item name="difficulty_vocab_word_usage" className="mb-0">
                    <Select allowClear placeholder="Any Level" size="large" style={{ width: '100%' }}>
                      {LEVELS.map(l => <Option key={l} value={l}>{getOptionLabel('VOCAB_WORD_USAGE', l)}</Option>)}
                    </Select>
                  </Form.Item>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center"><BookOpen size={11} className="text-white" /></div>
                    <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Collocations</span>
                  </div>
                  <Form.Item name="difficulty_vocab_collocations" className="mb-0">
                    <Select allowClear placeholder="Any Level" size="large" style={{ width: '100%' }}>
                      {LEVELS.map(l => <Option key={l} value={l}>{getOptionLabel('VOCAB_COLLOCATIONS', l)}</Option>)}
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Section 3 - Options + Generate */}
            <div style={{ padding: '16px 28px' }}>
              <div className="flex items-center gap-6 flex-wrap">

                <div className="flex-1 hidden md:block" />
                <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                  Generate Test
                </button>
              </div>
            </div>
          </div>

        </Form>
      </Spin>
    </div>
  );
};

export default RandomTestGeneratorPage;



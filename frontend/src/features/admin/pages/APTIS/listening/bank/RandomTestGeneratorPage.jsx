import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Select, message, Spin } from 'antd';
import { ArrowLeft, Settings2, Clock, CheckCircle2, Headphones, Wand2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThunderboltOutlined } from '@ant-design/icons';
import aptisListeningBankApi from '../../../../api/APTIS/listening/aptisListeningBankApi';

const { Option } = Select;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C'];
const PARTS = [1, 2, 3, 4, 5];

const RandomTestGeneratorPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [bankGroups, setBankGroups] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/listening' : '/admin/aptis/listening';

  useEffect(() => {
    aptisListeningBankApi.getBankGroups().then(setBankGroups).catch(console.error);
  }, []);

  const handleDifficultyChange = (part, value) => {
    if (!value) return;
    const hasGroup = bankGroups.some(g => g.part_number === part && g.difficulty_level === value);
    if (!hasGroup) message.warning(`No questions found for Part ${part} with difficulty ${value}.`);
  };

  const handleGenerateTest = async (values) => {
    setLoading(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        time_limit: values.time_limit,
        is_full_test_only: values.is_full_test_only,
        difficulty_level: values.difficulty_level || null,
        parts_config: PARTS.map(p => ({ part_number: p, num_questions: [13,4,4,2,2][p-1], difficulty: values[`difficulty_part_${p}`] }))
      };
      const response = await aptisListeningBankApi.generateTest(payload);
      message.success('Random Test Generated Successfully!');
      navigate(`${basePath}/edit/${response.id}`);
    } catch (error) {
      message.error(error?.response?.data?.detail || 'Failed to generate test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 16px 40px' }}>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(`${basePath}/bank`)} style={{ padding: '7px 10px', background: '#f4f4f5', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#71717a' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Headphones size={17} className="text-[#445A95]" />
            <h1 className="m-0 text-2xl font-black text-zinc-800 tracking-tight">Generate Random Test</h1>
          </div>
          <p className="m-0 text-xs text-zinc-400 mt-0.5">Listening · Auto-pick from question bank</p>
        </div>
      </div>

      <Spin spinning={loading} tip="Generating...">
        <Form form={form} layout="vertical" onFinish={handleGenerateTest} initialValues={{ time_limit: 40, is_full_test_only: false }} requiredMark={false}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4e4e7', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f4f4f5' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#445A95]/10 flex items-center justify-center"><Settings2 size={14} className="text-[#445A95]" /></div>
                <span className="text-base font-bold text-zinc-700">Basic Information</span>
              </div>
              <div className="grid grid-cols-12 gap-x-4">
                <div className="col-span-12 md:col-span-6">
                  <Form.Item name="title" label={<span className="text-sm font-semibold text-zinc-600">Test Title</span>} rules={[{ required: true, message: 'Please enter a title' }]} className="mb-3">
                    <Input placeholder="e.g. Spring Listening Test 01" size="large" style={{ borderRadius: 8 }} />
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

            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><CheckCircle2 size={14} className="text-violet-600" /></div>
                <span className="text-base font-bold text-zinc-700">Difficulty per Part <span className="font-normal text-zinc-400 text-xs">(optional — leave blank to pick randomly)</span></span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {PARTS.map(part => (
                  <div key={part}>
                    <div className="text-sm font-semibold text-zinc-500 mb-2 uppercase tracking-wide">Part {part}</div>
                    <Form.Item name={`difficulty_part_${part}`} className="mb-0">
                      <Select allowClear placeholder="Any" size="large" style={{ width: '100%' }} onChange={(v) => handleDifficultyChange(part, v)}>
                        {LEVELS.map(l => <Option key={l} value={l}>{l}</Option>)}
                      </Select>
                    </Form.Item>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 28px' }}>
              <div className="flex items-center gap-6 flex-wrap">
                <Form.Item name="is_full_test_only" valuePropName="checked" className="m-0" style={{ display: 'flex' }}>
                  <div className="flex items-center gap-2.5">
                    <Switch size="small" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-700 leading-none">Full Test Only</div>
                      <div className="text-sm text-zinc-400 mt-0.5">Part of 4-skill mock test</div>
                    </div>
                  </div>
                </Form.Item>
                <div className="flex-1 hidden md:block" />
                <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <Wand2 size={15} />}
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




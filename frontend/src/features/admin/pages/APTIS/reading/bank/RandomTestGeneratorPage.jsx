import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Select, message } from 'antd';
import { ArrowLeft, Settings2, Clock, CheckCircle2, Wand2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import aptisReadingBankApi from '../../../../api/APTIS/reading/aptisReadingBankApi';

const { Option } = Select;

const RandomTestGeneratorPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [bankGroups, setBankGroups] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/reading' : '/admin/aptis/reading';

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await aptisReadingBankApi.getBankGroups();
        setBankGroups(data);
      } catch (err) {
        console.error('Failed to fetch bank groups for validation:', err);
      }
    };
    fetchGroups();
  }, []);

  const handleDifficultyChange = (part, value) => {
    if (!value) return;
    const hasGroup = bankGroups.some(g => g.part_number === part && g.difficulty_level === value);
    if (!hasGroup) {
      message.warning(`No questions found in the bank for Part ${part} with difficulty ${value}.`);
    }
  };

  const handleGenerateTest = async (values) => {
    setLoading(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        time_limit: values.time_limit,
        is_full_test_only: values.is_full_test_only,
        parts_config: [
          { part_number: 1, num_questions: 5, difficulty: values.difficulty_part_1 },
          { part_number: 2, num_questions: 1, difficulty: values.difficulty_part_2 },
          { part_number: 3, num_questions: 1, difficulty: values.difficulty_part_3 },
          { part_number: 4, num_questions: 7, difficulty: values.difficulty_part_4 },
          { part_number: 5, num_questions: 7, difficulty: values.difficulty_part_5 }
        ]
      };
      
      const response = await aptisReadingBankApi.generateTest(payload);
      message.success('Random Test Generated Successfully!');
      navigate(`${basePath}/edit/${response.id}`);
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.detail || 'Failed to generate test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12 pt-6">
      
      {/* ── HEADER ── */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(`${basePath}/bank`)}
          className="p-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm focus:outline-none"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight m-0">Generate Random Test</h1>
          </div>
          <p className="text-zinc-500 font-medium text-[15px] mt-1">
            Let our algorithm compose a full reading test from your question bank.
          </p>
        </div>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleGenerateTest}
        initialValues={{
          time_limit: 40,
          is_full_test_only: false
        }}
        requiredMark={false}
      >
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* General Config */}
          <div className="p-6 md:p-8 border-b border-zinc-100">
            <div className="flex items-center gap-2 mb-6 text-zinc-800 font-bold">
              <Settings2 size={18} className="text-indigo-500" />
              General Configuration
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6">
              <div className="md:col-span-8">
                <Form.Item 
                  name="title" 
                  label={<span className="text-sm font-bold text-zinc-700">Test Title</span>}
                  rules={[{ required: true, message: 'Please enter a test title' }]}
                >
                  <Input 
                    placeholder="e.g., Random Practice Test 1" 
                    className="px-4 py-3 bg-zinc-50/50 border-zinc-200 hover:border-indigo-400 focus:border-indigo-500 rounded-xl text-base"
                  />
                </Form.Item>
              </div>
              <div className="md:col-span-4">
                <Form.Item 
                  name="time_limit" 
                  label={<span className="text-sm font-bold text-zinc-700">Duration (mins)</span>}
                >
                  <InputNumber 
                    min={1} 
                    className="w-full"
                    controls={false}
                    addonBefore={<Clock size={16} className="text-zinc-400" />}
                    size="large"
                    style={{ borderRadius: '0.75rem' }}
                  />
                </Form.Item>
              </div>
            </div>

            <Form.Item 
              name="description" 
              label={<span className="text-sm font-bold text-zinc-700">Description (Optional)</span>}
              className="mb-6"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Add some notes about this test..." 
                className="px-4 py-3 bg-zinc-50/50 border-zinc-200 hover:border-indigo-400 focus:border-indigo-500 rounded-xl"
              />
            </Form.Item>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div>
                <div className="text-sm font-bold text-zinc-800 flex items-center gap-1.5">
                  Full Test Mode
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  If enabled, this test is meant to be part of a 4-skill Full Mock Test and won't appear as a standalone practice test.
                </div>
              </div>
              <Form.Item name="is_full_test_only" valuePropName="checked" className="m-0">
                <Switch />
              </Form.Item>
            </div>
          </div>

          {/* Part Specific Config */}
          <div className="p-6 md:p-8 bg-indigo-50/30">
            <div className="flex items-center gap-2 mb-2 text-zinc-800 font-bold">
              <CheckCircle2 size={18} className="text-indigo-500" />
              Part Difficulty Settings (Optional)
            </div>
            <p className="text-sm text-zinc-500 mb-6">
              Select a specific difficulty for each part. Leave blank to choose completely at random.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((part) => (
                <Form.Item 
                  key={part}
                  name={`difficulty_part_${part}`} 
                  label={<span className="text-xs font-bold text-zinc-600">Part {part}</span>}
                  className="mb-0"
                >
                  <Select 
                    allowClear 
                    placeholder="Any" 
                    onChange={(val) => handleDifficultyChange(part, val)}
                    className="w-full"
                    size="large"
                  >
                    <Option value="A1">A1</Option>
                    <Option value="A2">A2</Option>
                    <Option value="B1">B1</Option>
                    <Option value="B2">B2</Option>
                    <Option value="C">C</Option>
                  </Select>
                </Form.Item>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold text-lg rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-md shadow-indigo-600/30 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Wand2 size={20} />
            )}
            Generate Random Test
          </button>
        </div>
      </Form>
    </div>
  );
};

export default RandomTestGeneratorPage;

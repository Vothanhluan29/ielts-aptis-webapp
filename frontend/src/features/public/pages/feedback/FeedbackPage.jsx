import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Typography } from 'antd';
import { MessageSquarePlus, LifeBuoy, Lightbulb, Clock, CheckCircle, Send } from 'lucide-react';
import axiosClient from '../../../../services/axiosClient';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/feedbacks/my');
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch feedbacks', error);
      message.error('Failed to load feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleCreateFeedback = async (values) => {
    setSubmitting(true);
    try {
      await axiosClient.post('/feedbacks/', values);
      message.success('Submitted successfully!');
      setIsModalVisible(false);
      form.resetFields();
      fetchFeedbacks();
    } catch (error) {
      console.error('Failed to submit', error);
      message.error('Failed to submit your request.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'TYPE',
      dataIndex: 'feedback_type',
      key: 'feedback_type',
      render: (type) => (
        type === 'help' ? (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <LifeBuoy size={16} />
            </div>
            <span className="font-semibold text-blue-700 tracking-wide text-xs uppercase">Help</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <Lightbulb size={16} />
            </div>
            <span className="font-semibold text-emerald-700 tracking-wide text-xs uppercase">Feedback</span>
          </div>
        )
      ),
      width: 140,
    },
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="font-bold text-slate-700">{title}</span>,
      width: 250,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        status === 'resolved' ? (
          <Tag color="success" icon={<CheckCircle size={14} className="mr-1" />} className="px-3 py-1 rounded-full font-bold border-0 shadow-sm">
            RESOLVED
          </Tag>
        ) : (
          <Tag color="warning" icon={<Clock size={14} className="mr-1" />} className="px-3 py-1 rounded-full font-bold border-0 shadow-sm">
            PENDING
          </Tag>
        )
      ),
      width: 130,
    },
    {
      title: 'ADMIN RESPONSE',
      dataIndex: 'admin_response',
      key: 'admin_response',
      render: (response) => response ? (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 relative overflow-hidden shadow-inner">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
          {response}
        </div>
      ) : (
        <span className="text-slate-400 italic text-sm font-medium">Waiting for response...</span>
      ),
    },
    {
      title: 'SUBMITTED AT',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => <span className="text-sm font-medium text-slate-500">{new Date(date).toLocaleString()}</span>,
      width: 180,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-teal-50/30 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-indigo-500/5 border border-white/80">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
              Feedback & Help
            </h1>
            <p className="text-slate-500 mt-2 font-medium text-base">
              Submit your feedback or request help from our support team.
            </p>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<MessageSquarePlus size={18} />} 
            onClick={() => setIsModalVisible(true)}
            className="flex items-center gap-2 px-6 h-12 rounded-full font-bold bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg shadow-blue-500/30 hover:scale-105 hover:shadow-blue-500/50 transition-all duration-300"
          >
            New Request
          </Button>
        </div>

        {/* Table Container */}
        <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-indigo-500/5 border border-white/80 rounded-[2rem] overflow-hidden p-2 md:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
          <Table 
            columns={columns} 
            dataSource={feedbacks} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10, className: 'px-4' }}
            rowClassName="hover:bg-slate-50/50 transition-colors"
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-5 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl border border-indigo-100/50 my-2 mx-4 shadow-inner">
                  <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <MessageSquarePlus size={16} /> 
                    Your Description
                  </h4>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{record.description}</p>
                </div>
              ),
            }}
          />
        </div>

        {/* Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 text-xl font-black text-slate-800">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                <Send size={20} />
              </div>
              Submit Request
            </div>
          }
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          destroyOnHidden
          centered
          styles={{
            content: { borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.8)' }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateFeedback}
            initialValues={{ feedback_type: 'help' }}
            className="mt-6"
            requiredMark={false}
          >
            <Form.Item
              name="feedback_type"
              label={<Text strong className="text-slate-600">Request Type</Text>}
              rules={[{ required: true, message: 'Please select a type' }]}
            >
              <Select size="large" className="rounded-xl">
                <Option value="help">
                  <div className="flex items-center gap-2 font-medium"><LifeBuoy size={16} className="text-blue-500" /> Need Help / Support</div>
                </Option>
                <Option value="feedback">
                  <div className="flex items-center gap-2 font-medium"><Lightbulb size={16} className="text-emerald-500" /> System Feedback / Suggestion</div>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label={<Text strong className="text-slate-600">Title</Text>}
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input size="large" placeholder="Brief summary of your request" className="rounded-xl px-4" />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text strong className="text-slate-600">Description</Text>}
              rules={[{ required: true, message: 'Please describe in detail' }]}
            >
              <TextArea rows={5} placeholder="Detailed explanation..." className="rounded-xl p-4" />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-8">
              <Button 
                size="large"
                onClick={() => setIsModalVisible(false)}
                className="rounded-full px-6 font-semibold border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                size="large"
                htmlType="submit" 
                loading={submitting} 
                className="rounded-full px-8 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Submit Now
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default FeedbackPage;

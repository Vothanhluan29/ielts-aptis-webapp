import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Typography } from 'antd';
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
          <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: '1px solid #BFDBFE' }}>
            HELP
          </span>
        ) : (
          <span style={{ background: '#D1FAE5', color: '#047857', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: '1px solid #A7F3D0' }}>
            FEEDBACK
          </span>
        )
      ),
      width: 120,
    },
    {
      title: 'TITLE',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span style={{ fontWeight: 700, color: '#111827' }}>{title}</span>,
      width: 250,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        status === 'resolved' ? (
          <span style={{ background: '#F0FDF4', color: '#15803D', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: '1px solid #BBF7D0' }}>
            RESOLVED
          </span>
        ) : (
          <span style={{ background: '#FFFBEB', color: '#B45309', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, border: '1px solid #FDE68A' }}>
            PENDING
          </span>
        )
      ),
      width: 120,
    },
    {
      title: 'ADMIN RESPONSE',
      dataIndex: 'admin_response',
      key: 'admin_response',
      render: (response) => response ? (
        <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: 8, border: '1px solid #E5E7EB', borderLeft: '3px solid #1E3A8A', fontSize: 13, color: '#4B5563' }}>
          {response}
        </div>
      ) : (
        <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 13 }}>Waiting for response...</span>
      ),
    },
    {
      title: 'SUBMITTED AT',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{new Date(date).toLocaleString()}</span>,
      width: 180,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-blue-50/30 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* ── HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          marginBottom: 32,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
              Feedback & Help
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              Submit your feedback or request help from our support team
            </p>
          </div>

          <Button 
            type="primary" 
            onClick={() => setIsModalVisible(true)}
            style={{
              background: '#1E3A8A', color: '#fff',
              border: 'none', fontWeight: 700, height: 40, borderRadius: 8,
              boxShadow: '0 2px 8px rgba(30,58,138,0.18)', padding: '0 20px'
            }}
          >
            New Request
          </Button>
        </div>

        {/* ── TABLE CONTAINER ── */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
          padding: '24px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflowX: 'auto'
        }}>
          <Table 
            columns={columns} 
            dataSource={feedbacks} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', margin: '8px 16px' }}>
                  <h4 style={{ fontWeight: 700, color: '#1E3A8A', margin: '0 0 8px', fontSize: 13 }}>
                    Your Description
                  </h4>
                  <p style={{ color: '#475569', whiteSpace: 'pre-wrap', margin: 0, fontSize: 13, lineHeight: 1.6 }}>{record.description}</p>
                </div>
              ),
            }}
          />
        </div>

        {/* ── MODAL ── */}
        <Modal
          title={
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
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
            content: { borderRadius: 16, padding: 32, border: '1px solid #E5E7EB' }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateFeedback}
            initialValues={{ feedback_type: 'help' }}
            style={{ marginTop: 24 }}
            requiredMark={false}
          >
            <Form.Item
              name="feedback_type"
              label={<Text strong style={{ color: '#4B5563' }}>Request Type</Text>}
              rules={[{ required: true, message: 'Please select a type' }]}
            >
              <Select size="large">
                <Option value="help">Need Help / Support</Option>
                <Option value="feedback">System Feedback / Suggestion</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label={<Text strong style={{ color: '#4B5563' }}>Title</Text>}
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input size="large" placeholder="Brief summary of your request" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text strong style={{ color: '#4B5563' }}>Description</Text>}
              rules={[{ required: true, message: 'Please describe in detail' }]}
            >
              <TextArea rows={5} placeholder="Detailed explanation..." style={{ borderRadius: 8 }} />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
              <Button 
                size="large"
                onClick={() => setIsModalVisible(false)}
                style={{ borderRadius: 8, fontWeight: 600, color: '#4B5563', border: '1px solid #E5E7EB' }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                size="large"
                htmlType="submit" 
                loading={submitting} 
                style={{ borderRadius: 8, fontWeight: 700, background: '#1E3A8A', border: 'none', boxShadow: '0 2px 8px rgba(30,58,138,0.18)' }}
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

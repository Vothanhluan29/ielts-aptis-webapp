import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message } from 'antd';
import { MessageSquarePlus } from 'lucide-react';
import axiosClient from '../../../../services/axiosClient';

const { Option } = Select;
const { TextArea } = Input;

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
      title: 'Type',
      dataIndex: 'feedback_type',
      key: 'feedback_type',
      render: (type) => (
        <Tag color={type === 'help' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'resolved' ? 'success' : 'warning'}>
          {status.toUpperCase()}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Admin Response',
      dataIndex: 'admin_response',
      key: 'admin_response',
      render: (response) => response ? <span className="text-gray-700">{response}</span> : <span className="text-gray-400 italic">No response yet</span>,
    },
    {
      title: 'Submitted At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
      width: 180,
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Feedback & Help</h1>
          <p className="text-gray-500 mt-1">Submit your feedback or request help from our support team.</p>
        </div>
        <Button 
          type="primary" 
          icon={<MessageSquarePlus size={16} />} 
          onClick={() => setIsModalVisible(true)}
          className="flex items-center gap-2 h-10 px-4 bg-blue-600"
        >
          New Request
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={feedbacks} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">Description:</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{record.description}</p>
              </div>
            ),
          }}
        />
      </div>

      <Modal
        title="Submit Feedback or Help Request"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateFeedback}
          initialValues={{ feedback_type: 'help' }}
          className="mt-4"
        >
          <Form.Item
            name="feedback_type"
            label="Type"
            rules={[{ required: true, message: 'Please select a type' }]}
          >
            <Select>
              <Option value="help">Need Help / Support</Option>
              <Option value="feedback">System Feedback / Suggestion</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Brief summary of your request" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please describe in detail' }]}
          >
            <TextArea rows={4} placeholder="Detailed explanation..." />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="bg-blue-600">
              Submit
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FeedbackPage;

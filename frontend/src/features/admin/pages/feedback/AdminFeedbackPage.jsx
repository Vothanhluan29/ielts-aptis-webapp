import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message } from 'antd';
import { MessageSquare, CheckCircle } from 'lucide-react';
import axiosClient from '../../../../services/axiosClient';
import { useFeedbackCount } from '../../../../contexts/FeedbackCountContext';

const { Option } = Select;
const { TextArea } = Input;

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);

  // Badge count context
  const { refreshCount } = useFeedbackCount();

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let url = '/feedbacks/';
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const data = await axiosClient.get(url);
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
  }, [filterStatus]);

  const handleRespond = (record) => {
    setCurrentFeedback(record);
    form.setFieldsValue({
      status: record.status,
      admin_response: record.admin_response || ''
    });
    setIsModalVisible(true);
  };

  const handleSubmitResponse = async (values) => {
    setSubmitting(true);
    try {
      await axiosClient.put(`/feedbacks/${currentFeedback.id}`, values);
      message.success('Feedback updated successfully!');
      setIsModalVisible(false);
      setCurrentFeedback(null);
      form.resetFields();
      fetchFeedbacks();
      // Cap nhat badge ngay lap tuc khi resolve/unresolve
      refreshCount();
    } catch (error) {
      console.error('Failed to update feedback', error);
      message.error('Failed to update feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'User Name',
      dataIndex: 'user',
      key: 'user_name',
      render: (user) => user ? (user.full_name || user.email) : 'Unknown User',
      width: 150,
    },
    {
      title: 'Role',
      dataIndex: 'user',
      key: 'role',
      render: (user) => {
        const role = user?.role || 'student';
        const color = role === 'admin' ? 'red' : role === 'teacher' ? 'cyan' : 'default';
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
      width: 100,
    },
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
      title: 'Submitted At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
      width: 180,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          ghost
          icon={<MessageSquare size={14} />} 
          onClick={() => handleRespond(record)}
          className="flex items-center gap-1"
        >
          Respond
        </Button>
      ),
      width: 120,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Feedbacks & Help Requests</h1>
          <p className="text-gray-500 mt-1">View and respond to user feedbacks and support requests.</p>
        </div>
        <div>
          <Select
            placeholder="Filter by Status"
            style={{ width: 150 }}
            allowClear
            onChange={(val) => setFilterStatus(val)}
          >
            <Option value="pending">Pending</Option>
            <Option value="resolved">Resolved</Option>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={feedbacks} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 15 }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4 bg-gray-50 flex gap-6 border border-gray-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-700 mb-2">User Description:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap bg-white p-3 border rounded shadow-sm">{record.description}</p>
                </div>
                {record.admin_response && (
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700 mb-2">Admin Response:</h4>
                    <p className="text-gray-600 whitespace-pre-wrap bg-blue-50 p-3 border border-blue-100 rounded shadow-sm">{record.admin_response}</p>
                  </div>
                )}
              </div>
            ),
          }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" />
            <span>Respond to Request #{currentFeedback?.id}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentFeedback(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
        width={600}
      >
        {currentFeedback && (
          <div className="mb-6 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-800 text-lg mb-1">{currentFeedback.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <Tag color={currentFeedback.feedback_type === 'help' ? 'blue' : 'green'}>{currentFeedback.feedback_type.toUpperCase()}</Tag>
              <span className="text-xs text-gray-500">Submitted at {new Date(currentFeedback.created_at).toLocaleString()}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{currentFeedback.description}</p>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitResponse}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="admin_response"
            label="Admin Response"
          >
            <TextArea rows={5} placeholder="Write a response to the user..." />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="bg-blue-600 flex items-center gap-2">
              <CheckCircle size={16} /> Save & Respond
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminFeedbackPage;

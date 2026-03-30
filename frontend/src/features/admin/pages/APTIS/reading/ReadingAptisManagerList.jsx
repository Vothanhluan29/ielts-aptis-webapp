import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Typography, Card, Tooltip, Badge, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, BookOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import readingAptisAdminApi from '../../../api/APTIS/reading/readingAptisAdminApi';

const { Title, Text } = Typography;

const ROUTES = {
  CREATE: '/admin/aptis/reading/create',
  EDIT: (id) => `/admin/aptis/reading/edit/${id}`,
  SUBMISSIONS: (id) => `/admin/aptis/reading/submissions?test_id=${id}`,
};

const ReadingAptisManagerList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isMockFilter, setIsMockFilter] = useState(false);

  const fetchTests = useCallback(async (page, pageSize, isMock = false) => {
    setLoading(true);
    try {
      const response = await readingAptisAdminApi.getAllTests({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        is_mock_selector: isMock,
      });
      const dataList = response.data || response;
      setTests(dataList);
      setPagination(prev => ({ ...prev, current: page, pageSize, total: dataList.length > 0 ? 100 : 0 }));
    } catch (error) {
      message.error('Failed to load Reading tests!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests(1, pagination.pageSize, isMockFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMockFilter]);

  const handleDelete = async (id) => {
    try {
      await readingAptisAdminApi.deleteTest(id);
      message.success('Test deleted successfully!');
      fetchTests(pagination.current, pagination.pageSize, isMockFilter);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        message.error(error.response.data.detail || 'Unable to delete this test as it is currently in use.');
      } else {
        message.error('Failed to delete test!');
      }
    }
  };

  const columns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      align: 'center',
      render: (id) => (
        <Text type="secondary" style={{ fontSize: 12 }}>#{id}</Text>
      ),
    },
    {
      title: 'Test Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: '#2563eb' }} />
          <Text strong style={{ color: '#1e40af', fontSize: '15px' }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'time_limit',
      key: 'time_limit',
      width: 120,
      align: 'center',
      render: (time) => (
        <Tag color="blue" style={{ borderRadius: 20, fontWeight: 500 }}>
          {time} min
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'is_full_test_only',
      key: 'is_full_test_only',
      width: 150,
      align: 'center',
      render: (isMock) => (
        <Tag color={isMock ? 'purple' : 'cyan'} bordered={false} style={{ borderRadius: 20, fontWeight: 500 }}>
          {isMock ? 'Full Mock Test' : 'Practice'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'is_published',
      width: 130,
      align: 'center',
      // Read-only: reflects is_published set in ReadingAptisEditPage.
      // To change status, edit the test directly.
      render: (_, record) => (
        <Tooltip title="Edit the test to change its status">
          <Badge
            status={record.is_published ? 'success' : 'default'}
            text={
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: record.is_published ? '#16a34a' : '#6b7280',
                }}
              >
                {record.is_published ? 'Published' : 'Draft'}
              </Text>
            }
          />
        </Tooltip>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      align: 'center',
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {dayjs(date).format('MMM DD, YYYY')}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="Edit test">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(ROUTES.EDIT(record.id))}
              style={{ color: '#2563eb' }}
            />
          </Tooltip>

          <Tooltip title="View submissions">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(ROUTES.SUBMISSIONS(record.id))}
              style={{ color: '#10b981' }}
            />
          </Tooltip>

          <Popconfirm
            title="Delete this test?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ], [navigate]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Card
        variant="borderless"
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 32,
        }}>
          <Space size="large">
            <div style={{
              padding: '12px', backgroundColor: '#e0e7ff',
              borderRadius: '14px', color: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOutlined style={{ fontSize: 32 }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: '#1a1a2e' }}>
                Reading Test Bank
              </Title>
              <Text type="secondary">
                Manage Aptis Reading test content and student submissions
              </Text>
            </div>
          </Space>

          <Space size="middle">
            {/* Mock filter toggle */}
            <Space size="small">
              <Text style={{ fontWeight: 500, color: '#6b7280' }}>Mock only</Text>
              <Switch
                size="small"
                checked={isMockFilter}
                onChange={(checked) => setIsMockFilter(checked)}
              />
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate(ROUTES.CREATE)}
              style={{
                backgroundColor: '#2563eb', borderColor: '#2563eb',
                height: '45px', borderRadius: '10px', fontWeight: '600',
              }}
            >
              New Test
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={tests}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} tests`,
            onChange: (page, pageSize) => fetchTests(page, pageSize, isMockFilter),
          }}
          rowClassName={() => 'reading-test-row'}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
};

export default ReadingAptisManagerList;
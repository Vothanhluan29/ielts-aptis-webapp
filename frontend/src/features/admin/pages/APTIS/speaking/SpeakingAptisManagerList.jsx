import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Typography, Card, Switch, Tooltip, Badge } from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, 
  AudioOutlined, EyeOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import speakingAptisApi from '../../../api/APTIS/speaking/speakingAptisAdminApi';

const { Title, Text } = Typography;

const ROUTES = {
  CREATE: '/admin/aptis/speaking/create',
  EDIT: (id) => `/admin/aptis/speaking/edit/${id}`,
  SUBMISSIONS: (id) => `/admin/aptis/speaking/submissions?test_id=${id}`,
};

const SpeakingAptisManagerList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isMockFilter, setIsMockFilter] = useState(false);

  const fetchTests = useCallback(async (page, pageSize, isMock = false) => {
    setLoading(true);
    try {
      const res = await speakingAptisApi.getAllTestsForAdmin({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        is_mock_selector: isMock,
      });

      const data = res.items || res.data || res;
      const total = res.total || (Array.isArray(data) ? data.length : 0);

      setTests(Array.isArray(data) ? data : []);
      setPagination(prev => ({ ...prev, current: page, pageSize, total }));
    } catch (error) {
      message.error('Failed to load Speaking tests!');
      console.error('Fetch Tests Error:', error);
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
      await speakingAptisApi.deleteTest(id);
      message.success('Test deleted successfully!');
      fetchTests(pagination.current, pagination.pageSize, isMockFilter);
    } catch (error) {
      message.error(error.response?.data?.detail || 'Unable to delete this test.');
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
          <AudioOutlined style={{ color: '#ec4899' }} />
          <Text strong style={{ color: '#9d174d', fontSize: '15px' }}>{text}</Text>
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
        <Tag color="pink" style={{ borderRadius: 20, fontWeight: 500 }}>
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
        <Tag color={isMock ? 'magenta' : 'purple'} bordered={false} style={{ borderRadius: 20, fontWeight: 500 }}>
          {isMock ? 'Full Mock Test' : 'Practice'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'is_published',
      width: 130,
      align: 'center',
      // Read-only: reflects is_published set in SpeakingAptisEditPage.
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
          {date ? dayjs(date).format('MMM DD, YYYY') : '—'}
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
              style={{ color: '#ec4899' }}
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
              padding: '12px', backgroundColor: '#fdf2f8',
              borderRadius: '14px', color: '#ec4899',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AudioOutlined style={{ fontSize: 32 }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: '#1a1a2e' }}>
                Speaking Test Bank
              </Title>
              <Text type="secondary">
                Manage Aptis Speaking test content and student submissions
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
                backgroundColor: '#ec4899', borderColor: '#ec4899',
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
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} tests`,
          }}
          onChange={(pag) => fetchTests(pag.current, pag.pageSize, isMockFilter)}
          rowClassName={() => 'speaking-test-row'}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
};

export default SpeakingAptisManagerList;
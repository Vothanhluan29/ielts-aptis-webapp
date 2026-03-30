import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Popconfirm, message, Tag, Space, Card, Switch, Tooltip, Typography, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, BookFilled
} from '@ant-design/icons';
import GrammarVocabAdminApi from '../../../api/APTIS/grammar&vocab/grammar_vocabAdminApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ROUTES = {
  CREATE: '/admin/aptis/grammar-vocab/create',
  EDIT: (id) => `/admin/aptis/grammar-vocab/edit/${id}`,
  SUBMISSIONS: (id) => `/admin/aptis/grammar-vocab/submissions?test_id=${id}`,
};

const GramVocabManagePage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isMockFilter, setIsMockFilter] = useState(false);

  const fetchTests = useCallback(async (page, pageSize, isMock) => {
    setLoading(true);
    try {
      const response = await GrammarVocabAdminApi.getTests({
        skip: (page - 1) * pageSize,
        limit: pageSize,
        is_mock_selector: isMock,
      });
      const data = response.data || response;
      setTests(data);
      setPagination(prev => ({ ...prev, current: page, pageSize }));
    } catch (error) {
      console.error('Error loading tests:', error);
      message.error('Failed to load test list!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests(1, pagination.pageSize, isMockFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMockFilter]);

  const handleTableChange = (newPagination) => {
    fetchTests(newPagination.current, newPagination.pageSize, isMockFilter);
  };

  const handleDelete = async (testId) => {
    try {
      await GrammarVocabAdminApi.deleteTest(testId);
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
          <BookFilled style={{ color: '#0891b2' }} />
          <Text strong style={{ color: '#164e63', fontSize: '15px' }}>{text}</Text>
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
        <Tag color="cyan" style={{ borderRadius: 20, fontWeight: 500 }}>
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
        <Tag color={isMock ? 'purple' : 'blue'} variant={false} style={{ borderRadius: 20, fontWeight: 500 }}>
          {isMock ? 'Full Mock Test' : 'Practice'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_published',
      key: 'is_published',
      width: 130,
      align: 'center',
      // Read-only: reflects is_published set in the edit page.
      // To change status, edit the test directly.
      render: (isPublished) => (
        <Tooltip title="Edit the test to change its status">
          <Badge
            status={isPublished ? 'success' : 'default'}
            text={
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: isPublished ? '#16a34a' : '#6b7280',
                }}
              >
                {isPublished ? 'Published' : 'Draft'}
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
              style={{ color: '#0891b2' }}
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
              padding: '12px', backgroundColor: '#ecfeff',
              borderRadius: '14px', color: '#0891b2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookFilled style={{ fontSize: 32 }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: '#1a1a2e' }}>
                Grammar & Vocabulary Test Bank
              </Title>
              <Text type="secondary">
                Manage Aptis Grammar & Vocabulary test content and student submissions
              </Text>
            </div>
          </Space>

          <Space size="middle">
            {/* Mock filter toggle — preserved from original logic */}
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
                backgroundColor: '#0891b2', borderColor: '#0891b2',
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
          }}
          onChange={handleTableChange}
          rowClassName={() => 'gramvocab-test-row'}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
};

export default GramVocabManagePage;
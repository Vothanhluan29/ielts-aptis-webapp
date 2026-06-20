import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Popconfirm,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useWritingManager } from "../../../hooks/IELTS/writing/useWritingManager";

const { Title, Text } = Typography;

const WritingManagerPage = () => {
  const navigate = useNavigate();

  const {
    filteredTests,
    loading,
    isMockOnly,
    setIsMockOnly,
    handleDelete,
  } = useWritingManager();

  const columns = [
    {
      title: "Test Title",
      key: "title",
      render: (_, record) => (
        <Space>
          <FormOutlined style={{ color: '#0891b2' }} />
          <Text strong style={{ color: '#164e63', fontSize: '15px' }}>{record.title}</Text>
        </Space>
      ),
    },
    {
      title: "Time Limit",
      dataIndex: "time_limit",
      key: "time_limit",
      width: 120,
      align: "center",
      render: (time) => (
        <Tag color="cyan" style={{ borderRadius: 20, fontWeight: 500 }}>
          {time} min
        </Tag>
      ),
    },
    {
      title: "Type",
      dataIndex: "is_mock",
      key: "is_mock",
      width: 150,
      align: "center",
      render: (isMock, record) => {
        const isMockTest = isMock || record.is_full_test_only; 
        return (
          <Tag color={isMockTest ? 'purple' : 'blue'} bordered={false} style={{ borderRadius: 20, fontWeight: 500 }}>
            {isMockTest ? 'Full Mock Test' : 'Practice'}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_published",
      key: "is_published",
      width: 130,
      align: "center",
      render: (isPublished) =>
        isPublished ? (
          <Text style={{ fontSize: 13, fontWeight: 500, color: '#16a34a' }}>Published</Text>
        ) : (
          <Text style={{ fontSize: 13, fontWeight: 500, color: '#6b7280' }}>Draft</Text>
        ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 130,
      align: "center",
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="Edit Test">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/skills/writing/edit/${record.id}`)}
              style={{ color: '#0891b2' }}
            />
          </Tooltip>

          <Tooltip title="Delete Test">
            <Popconfirm
              title="Are you sure you want to delete this test?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Card
        variant="borderless"
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
      >
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
              <FormOutlined style={{ fontSize: 32 }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: '#1a1a2e' }}>
                Writing Test Bank
              </Title>
              <Text type="secondary">
                Manage IELTS Writing test content
              </Text>
            </div>
          </Space>

          <Space size="middle">
            <Space size="small">
              <Text style={{ fontWeight: 500, color: '#6b7280' }}>Mock only</Text>
              <Switch
                size="small"
                checked={isMockOnly}
                onChange={(checked) => setIsMockOnly(checked)}
              />
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate("/admin/skills/writing/create")}
              style={{
                backgroundColor: '#0891b2', borderColor: '#0891b2',
                height: '45px', borderRadius: '10px', fontWeight: '600',
              }}
            >
              New Test
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} tests`,
          }}
        />
      </Card>
    </div>
  );
};

export default WritingManagerPage;
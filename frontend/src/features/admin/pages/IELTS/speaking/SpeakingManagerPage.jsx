import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Popconfirm,
  Tooltip,
  Segmented,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AudioOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  FileProtectOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useSpeakingManager } from "../../../hooks/IELTS/speaking/useSpeakingManager";

const { Title, Text } = Typography;

const SpeakingManagerPage = () => {
  const navigate = useNavigate();

  const {
    filteredTests,
    loading,
    searchTerm,
    setSearchTerm,
    isMockOnly,
    setIsMockOnly,
    handleDelete,
  } = useSpeakingManager();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      render: (text) => (
        <Text type="secondary" className="font-mono">
          #{text}
        </Text>
      ),
    },
    {
      title: "Test Title",
      key: "title",
      render: (_, record) => (
        <div>
          <div className="font-bold text-slate-800 text-base">
            {record.title}
          </div>
          <div
            className="text-slate-500 text-xs truncate max-w-sm"
            title={record.description}
          >
            {record.description || "No description provided"}
          </div>
        </div>
      ),
    },
    {
      title: "Time Limit",
      dataIndex: "time_limit",
      key: "time_limit",
      width: 120,
      align: "center",
      render: (time) => <Tag color="blue">{time} Mins</Tag>,
    },
    {
      title: "Status",
      dataIndex: "is_published",
      key: "is_published",
      width: 120,
      align: "center",
      render: (isPublished) =>
        isPublished ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            PUBLIC
          </Tag>
        ) : (
          <Tag color="default" icon={<MinusCircleOutlined />}>
            DRAFT
          </Tag>
        ),
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) =>
        new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Test">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() =>
                navigate(`/admin/skills/speaking/edit/${record.id}`)
              }
              className="bg-blue-50 hover:bg-blue-100 border-none"
            />
          </Tooltip>

          <Tooltip title="Delete Test">
            <Popconfirm
              title="Are you sure you want to delete this test?"
              description="This action cannot be undone. All related student submissions will be lost."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="bg-red-50 hover:bg-red-100 border-none"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Title
              level={2}
              className="m-0 flex items-center gap-3 text-slate-800"
            >
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <AudioOutlined />
              </div>
              Speaking Manager
            </Title>

            <Text className="text-slate-500 mt-1 block">
              Manage your IELTS Speaking tests and mock exams.
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/skills/speaking/create")}
            className="bg-indigo-600 hover:bg-indigo-500 shadow-md font-semibold rounded-xl"
          >
            Create New Test
          </Button>
        </div>

        <Card
          className="rounded-2xl shadow-sm border-slate-200"
          styles={{ body: { padding: 16 } }}
        >
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
            <Input
              placeholder="Search by test title..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
              size="large"
              allowClear
            />

            <Segmented
              options={[
                {
                  label: "Practice Tests",
                  value: false,
                  icon: <FileTextOutlined />,
                },
                {
                  label: "Mock Exams",
                  value: true,
                  icon: <FileProtectOutlined />,
                },
              ]}
              value={isMockOnly}
              onChange={setIsMockOnly}
              size="large"
              className="p-1 font-medium bg-slate-100 border border-slate-200"
            />
          </div>
        </Card>

        <Card
          className="rounded-2xl shadow-sm border-slate-200 overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={filteredTests}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} tests`,
              placement: ["bottomCenter"],
            }}
            className="custom-table"
          />
        </Card>
      </div>
    </div>
  );
};

export default SpeakingManagerPage;
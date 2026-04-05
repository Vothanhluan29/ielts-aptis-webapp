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
  FormOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  FileProtectOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useWritingManager } from "../../../hooks/IELTS/writing/useWritingManager";

const { Title, Text } = Typography;

const WritingManagerPage = () => {
  const navigate = useNavigate();

  // 🔥 ĐÃ BỔ SUNG: Gọi đầy đủ các state và hàm từ Hook ra
  const {
    filteredTests, // Mảng này đã được Hook tự động lọc theo cả Search và Tab
    loading,
    searchTerm,
    setSearchTerm,
    isMockOnly,
    setIsMockOnly,
    handleDelete,
  } = useWritingManager();

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
            className="text-slate-500 text-xs truncate max-w-sm mt-0.5"
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
                navigate(`/admin/skills/writing/edit/${record.id}`)
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
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Title
              level={2}
              className="m-0 flex items-center gap-3 text-slate-800"
            >
              <div className="p-2 bg-pink-600 text-white rounded-lg shadow-sm shadow-pink-200">
                <FormOutlined />
              </div>
              Writing Manager
            </Title>

            <Text className="text-slate-500 mt-1 block">
              Manage your IELTS Writing tests and mock exams.
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/skills/writing/create")}
            className="bg-pink-600 hover:bg-pink-500 shadow-md font-semibold rounded-xl border-none"
          >
            Create New Test
          </Button>
        </div>

        {/* ================= CONTROLS ================= */}
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

        {/* ================= TABLE ================= */}
        <Card
          className="rounded-2xl shadow-sm border-slate-200 overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={filteredTests} // 🔥 ĐÃ SỬA: Đẩy thẳng filteredTests từ Hook vào đây
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

export default WritingManagerPage;
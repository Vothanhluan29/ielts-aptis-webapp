import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Popconfirm,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AudioOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useSpeakingManager } from "../../../hooks/IELTS/speaking/useSpeakingManager";

const { Title, Text } = Typography;

const SpeakingManagerPage = () => {
  const navigate = useNavigate();

  const {
    filteredTests,
    loading,
    isMockOnly,
    setIsMockOnly,
    handleDelete,
  } = useSpeakingManager();

  const columns = [
    {
      title: "Test Title",
      key: "title",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
            <AudioOutlined />
          </div>
          <Text strong className="text-slate-700 text-base">{record.title}</Text>
        </div>
      ),
    },
    {
      title: "Time Limit",
      dataIndex: "time_limit",
      key: "time_limit",
      width: 120,
      align: "center",
      render: (time) => (
        <Tag className="rounded-full px-3 py-1 bg-slate-100 text-slate-600 border-none font-medium">
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
          <Tag 
            className={`rounded-full px-3 py-1 border-none font-medium ${
              isMockTest 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            }`}
          >
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
      render: (isPublished) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isPublished 
            ? 'bg-green-50 text-green-600' 
            : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-500' : 'bg-slate-400'}`}></span>
          {isPublished ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 130,
      align: "center",
      render: (date) => (
        <Text className="text-slate-500 text-sm">
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
        <Space size="small">
          <Tooltip title="Edit Test">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/skills/speaking/edit/${record.id}`)}
              className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
            />
          </Tooltip>

          <Tooltip title="Delete Test">
            <Popconfirm
              title="Delete this test?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, className: 'rounded-lg' }}
              cancelButtonProps={{ className: 'rounded-lg' }}
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                className="hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 text-2xl">
              <AudioOutlined />
            </div>
            <div>
              <Title level={2} className="m-0 text-slate-800 font-bold">
                Speaking Test Bank
              </Title>
              <Text className="text-slate-500">
                Manage and create IELTS Speaking tests
              </Text>
            </div>
          </div>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate("/admin/skills/speaking/create")}
            className="bg-indigo-600 hover:bg-indigo-500 shadow-md font-semibold rounded-xl px-6 h-12"
          >
            Create New Test
          </Button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Toolbar / Filters */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <FilterOutlined />
              <span>Filters</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-sm font-medium text-slate-600">Mock Exams Only</span>
              <Switch
                checked={isMockOnly}
                onChange={(checked) => setIsMockOnly(checked)}
                className="bg-slate-300 checked:bg-indigo-600"
              />
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredTests}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} tests`,
              className: "px-6 pb-4",
            }}
            className="[&_.ant-table-thead_th]:bg-slate-50 [&_.ant-table-thead_th]:text-slate-500 [&_.ant-table-thead_th]:font-semibold [&_.ant-table-row:hover>td]:bg-slate-50/50"
          />
        </div>

      </div>
    </div>
  );
};

export default SpeakingManagerPage;
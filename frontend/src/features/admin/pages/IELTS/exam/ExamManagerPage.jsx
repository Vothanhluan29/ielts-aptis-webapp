import React from 'react';
import { Table, Tag, Button, Space, Card, Typography, Popconfirm, Tooltip, Empty, Input } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  AppstoreOutlined, EyeOutlined, EyeInvisibleOutlined,
  ReloadOutlined, SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { useExamManager } from '../../../hooks/IELTS/exam/useExamManager';

const { Title, Text } = Typography;

const ExamManagerPage = () => {
  const navigate = useNavigate();
  
  const { 
    filteredTests, loading, searchTerm, setSearchTerm, handleDelete, refresh 
  } = useExamManager();

  const renderComponentTag = (testId, label, colorClass) => {
    if (!testId) return (
      <Tag className="bg-gray-50 text-gray-400 border-dashed border-gray-200 rounded-md m-0">
        No {label}
      </Tag>
    );
    
    return (
      <Tooltip title={`Linked Test ID: #${testId}`}>
        <Tag className={`${colorClass} border-0 font-medium px-2 py-0.5 rounded-md shadow-sm cursor-help m-0`}>
          {label}
        </Tag>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: 'Full Test Title',
      dataIndex: 'title',
      key: 'title',
      width: '35%',
      render: (text, record) => (
        <div className="py-1">
          <Text strong className="text-indigo-900 text-base block leading-tight">{text}</Text>
          <Text type="secondary" className="text-xs italic truncate block max-w-md mt-1">
            {record.description || 'No detailed description provided'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Skill Structure (4 Skills)',
      key: 'components',
      render: (_, record) => (
        <Space size={[6, 6]} wrap>
          {renderComponentTag(record.listening_test_id, 'Listen', 'bg-blue-100 text-blue-700')}
          {renderComponentTag(record.reading_test_id, 'Read', 'bg-purple-100 text-purple-700')}
          {renderComponentTag(record.writing_test_id, 'Write', 'bg-orange-100 text-orange-700')}
          {renderComponentTag(record.speaking_test_id, 'Speak', 'bg-rose-100 text-rose-700')}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_published',
      align: 'center',
      width: 140,
      render: (isPublished) => (
        <Tag 
          icon={isPublished ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
          className={`rounded-full px-3 py-1 border-0 font-bold ${
            isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isPublished ? 'PUBLISHED' : 'DRAFT'}
        </Tag>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'created_at',
      width: 120,
      render: (date) => <Text className="text-gray-400 text-sm">{dayjs(date).format('DD/MM/YYYY')}</Text>,
    },
    {
      title: 'Actions',
      align: 'right',
      width: 110,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit IELTS Test">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              className="text-indigo-600 hover:bg-indigo-50 rounded-full"
              onClick={(e) => {
                e.stopPropagation(); 
                navigate(`/admin/full-tests/edit/${record.id}`);
              }}
            />
          </Tooltip>
          <Popconfirm 
            title="Delete this Full Test?" 
            description="Warning: This action cannot be undone."
            onConfirm={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }} 
            onCancel={(e) => e.stopPropagation()}
            okText="Delete" 
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: 'small' }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              className="hover:bg-red-50 rounded-full" 
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto animate-fade-in space-y-6">
      
      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden rounded-[32px] p-8 md:p-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10">
          <Title level={2} className="!text-white !mb-2 !font-extrabold tracking-tight drop-shadow-md flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 text-white">
              <AppstoreOutlined />
            </div>
            IELTS Full Test Management
          </Title>
          <Text className="!text-white/80 text-lg font-medium tracking-wide block">
            Manage combination of 4 IELTS skills (Listening, Reading, Writing, Speaking)
          </Text>
        </div>

        <Space className="relative z-10">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refresh} 
            loading={loading}
            className="bg-white/20 text-white hover:bg-white/30 hover:text-white border-white/30 shadow-lg font-semibold rounded-xl h-12 px-6 backdrop-blur-sm transition-all duration-300"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/full-tests/create")}
            className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-105 border-none shadow-lg font-bold rounded-xl h-12 px-6 transition-all duration-300"
          >
            Create New Test
          </Button>
        </Space>

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white opacity-5 blur-2xl mix-blend-overlay" />
      </div>

      <Card
        className="rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 bg-white"
        styles={{ body: { padding: 16 } }}
      >
        <div className="flex justify-between items-center w-full">
          <Input
            placeholder="Search by exam title..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md rounded-xl py-2 shadow-sm border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>
      </Card>

      <Card 
        className="rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 bg-white overflow-hidden" 
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={filteredTests}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: <Empty description="No exams found matching your criteria." /> }}
          pagination={{ 
            pageSize: 10, 
            showTotal: (total) => <span className="text-gray-400 font-medium">Total: {total} exams</span>,
            className: "px-6 py-4 mb-0",
            position: ['bottomCenter']
          }}
          onRow={(record) => ({
            onDoubleClick: () => navigate(`/admin/full-tests/edit/${record.id}`),
            className: "cursor-pointer hover:bg-indigo-50/50 transition-colors"
          })}
        />
      </Card>
    </div>
  );
};

export default ExamManagerPage;
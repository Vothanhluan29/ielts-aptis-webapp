import React from 'react';
import { Table, Tag, Button, Space, Card, Typography, Popconfirm, Tooltip, Empty } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  AppstoreOutlined, EyeOutlined, EyeInvisibleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// Import Custom Hook
import { useExamAptisManager } from '../../../hooks/APTIS/exam/useExamAptisManager';

const { Title, Text } = Typography;

const ExamAptisManagerPage = () => {
  const navigate = useNavigate();
  
  const { tests, loading, fetchTests, handleDelete } = useExamAptisManager();

  // Helper function: Render component skill tag
  const renderComponentTag = (testObj, label, colorClass) => {
    if (!testObj) return (
      <Tag className="bg-gray-50 text-gray-400 border-dashed border-gray-200 rounded-md">
        No {label[0]}
      </Tag>
    );
    
    return (
      <Tooltip title={`ID: ${testObj.id} - ${testObj.title}`}>
        <Tag className={`${colorClass} border-0 font-medium px-2 py-0.5 rounded-md shadow-sm cursor-help`}>
          {label}
        </Tag>
      </Tooltip>
    );
  };

  // Table columns definition
  const columns = [
    {
      title: 'Full Test Title',
      dataIndex: 'title',
      key: 'title',
      width: '35%',
      render: (text, record) => (
        <div className="py-1">
          <Text strong className="text-indigo-900 text-base block">{text}</Text>
          <Text type="secondary" className="text-xs italic truncate block max-w-md">
            {record.description || 'No detailed description'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Skill Structure',
      key: 'components',
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {renderComponentTag(record.grammar_vocab_test, 'Core', 'bg-blue-100 text-blue-700')}
          {renderComponentTag(record.listening_test, 'Listen', 'bg-green-100 text-green-700')}
          {renderComponentTag(record.reading_test, 'Read', 'bg-orange-100 text-orange-700')}
          {renderComponentTag(record.writing_test, 'Write', 'bg-purple-100 text-purple-700')}
          {renderComponentTag(record.speaking_test, 'Speak', 'bg-rose-100 text-rose-700')}
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
          <Tooltip title="Edit test">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              className="text-indigo-600 hover:bg-indigo-50 rounded-full"
              onClick={() => navigate(`/admin/aptis/full-tests/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm 
            title="Delete test?" 
            description="Warning: This action cannot be undone."
            onConfirm={() => handleDelete(record.id)} 
            okText="Delete" 
            cancelText="Cancel"
            okButtonProps={{ danger: true, size: 'small' }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50 rounded-full" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto animate-fade-in space-y-6">
      
      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden rounded-[32px] p-8 md:p-10 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10">
          <Title level={2} className="!text-white !mb-2 !font-extrabold tracking-tight drop-shadow-md flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 text-white">
              <AppstoreOutlined />
            </div>
            Aptis Full Test Management
          </Title>
          <Text className="!text-white/80 text-lg font-medium tracking-wide block">
            List of Aptis Full Tests (5 skills)
          </Text>
        </div>

        <Space className="relative z-10">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchTests} 
            loading={loading}
            className="bg-white/20 text-white hover:bg-white/30 hover:text-white border-white/30 shadow-lg font-semibold rounded-xl h-12 px-6 backdrop-blur-sm transition-all duration-300"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/aptis/full-tests/create")}
            className="bg-white text-fuchsia-600 hover:bg-fuchsia-50 hover:text-fuchsia-700 hover:scale-105 border-none shadow-lg font-bold rounded-xl h-12 px-6 transition-all duration-300"
          >
            Create New Test
          </Button>
        </Space>

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white opacity-5 blur-2xl mix-blend-overlay" />
      </div>

      {/* DATA TABLE */}
      <Card 
        className="rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 bg-white overflow-hidden" 
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={tests}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: <Empty description="No tests have been created yet" /> }}
          pagination={{ 
            pageSize: 10, 
            showTotal: (total) => <span className="text-gray-400 font-medium">Total: {total} tests</span>,
            className: "px-6 py-4"
          }}
          onRow={(record) => ({
            // Double click to quickly edit
            onDoubleClick: () => navigate(`/admin/aptis/full-tests/edit/${record.id}`),
            className: "cursor-pointer hover:bg-fuchsia-50/50 transition-colors"
          })}
        />
      </Card>
    </div>
  );
};

export default ExamAptisManagerPage;
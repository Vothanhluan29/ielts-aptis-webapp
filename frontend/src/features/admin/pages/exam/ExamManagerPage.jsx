import React from 'react';
import { Table, Tag, Button, Space, Card, Typography, Popconfirm, Tooltip, Empty, Input } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  AppstoreOutlined, EyeOutlined, EyeInvisibleOutlined,
  ReloadOutlined, SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import { useExamManager } from '../../hooks/exam/useExamManager';

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
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={3} className="mb-1 text-indigo-900 font-bold">
            <AppstoreOutlined className="mr-2 text-indigo-500" /> IELTS Full Test Management
          </Title>
          <Text className="text-gray-500">Manage combination of 4 IELTS skills (Listening, Reading, Writing, Speaking)</Text>
        </div>
        
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refresh} 
            loading={loading}
            className="rounded-full"
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />} 
            className="bg-indigo-600 hover:bg-indigo-500 shadow-md font-medium rounded-full px-6 border-0"
            onClick={() => navigate('/admin/full-tests/create')}
          >
            Create New Test
          </Button>
        </Space>
      </div>

      <div className="mb-4 flex justify-end">
        <Input
          placeholder="Search by exam title..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="max-w-md rounded-xl py-2 shadow-sm border-gray-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </div>

      <Card 
        className="shadow-sm rounded-2xl border-0 overflow-hidden" 
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
            className: "cursor-pointer hover:bg-indigo-50/30 transition-colors"
          })}
        />
      </Card>
    </div>
  );
};

export default ExamManagerPage;
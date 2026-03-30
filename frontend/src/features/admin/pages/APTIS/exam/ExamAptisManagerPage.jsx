import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Button, Space, Card, Typography, message, Popconfirm, Tooltip, Empty } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  AppstoreOutlined, EyeOutlined, EyeInvisibleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import examAptisAdminApi from '../../../api/APTIS/exam/examAptisAdminApi'; 

const { Title, Text } = Typography;

const ExamAptisManagerPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch test list (using useCallback for optimization)
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examAptisAdminApi.getAllFullTests();
      // Accept both array format or paginated format { items: [...] }
      const data = res.data?.items || res.data || res || [];
      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch Error:", error);
      message.error("Unable to load Aptis test list!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // 2. Handle delete test
  const handleDelete = async (id) => {
    const hide = message.loading("Deleting test...", 0);
    try {
      await examAptisAdminApi.deleteFullTest(id);
      message.success("Test deleted successfully!");
      fetchTests();
    } catch (error) {
      message.error("Unable to delete this test. Please try again!", error);
    } finally {
      hide();
    }
  };

  // 3. Render component skill tag
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

  // 4. Table columns definition
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
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* MANAGEMENT HEADER */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={3} className="mb-1! text-indigo-900 font-bold!">
            <AppstoreOutlined className="mr-2 text-indigo-500" /> Aptis Full Test Management
          </Title>
          <Text className="text-gray-500">List of Aptis Full Tests (5 skills)</Text>
        </div>
        
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchTests} 
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
            onClick={() => navigate('/admin/aptis/full-tests/create')}
          >
            Create New Test
          </Button>
        </Space>
      </div>

      {/* DATA TABLE */}
      <Card 
        className="shadow-sm rounded-2xl border-0 overflow-hidden" 
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
            className: "cursor-pointer hover:bg-indigo-50/30 transition-colors"
          })}
        />
      </Card>
    </div>
  );
};

export default ExamAptisManagerPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Tag, Button, Space, Card, Typography,
  Input, Tabs, Badge, Row, Col, Avatar, Tooltip
} from 'antd';
import {
  EyeOutlined, UserOutlined, ClockCircleOutlined,
  CheckCircleOutlined, FolderOpenOutlined, SafetyCertificateOutlined,
  FileTextOutlined, SearchOutlined, TrophyOutlined, EditOutlined, SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Nhúng Custom Hook
import { useExamAptisSubmissionsManager } from '../../../hooks/APTIS/exam/useExamAptisSubmissionsManager'; // Sửa lại đường dẫn nếu cần

const { Title, Text } = Typography;

const ExamAptisSubmissionsManager = () => {
  const navigate = useNavigate();

  // Bóc tách data từ Hook
  const {
    loading,
    data,
    pagination,
    setPagination,
    stats,
    filters,
    setFilters,
    fetchSubmissions
  } = useExamAptisSubmissionsManager();

  // Hàm phụ trợ tạo màu Avatar ngẫu nhiên
  const getAvatarColor = (name) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#1677ff'];
    const charCode = name?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: getAvatarColor(user?.full_name) }}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserOutlined />}
          </Avatar>
          <div>
            <Text strong className="text-gray-800 block leading-tight">
              {user?.full_name || 'Anonymous'}
            </Text>
            <Text type="secondary" className="text-xs">
              {user?.email || 'N/A'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Test (Full Test)',
      dataIndex: 'full_test',
      key: 'test',
      render: (test) => (
        <Space>
          <div className="w-7 h-7 rounded bg-indigo-50 flex items-center justify-center text-indigo-500">
            <TrophyOutlined />
          </div>
          <Tooltip title={test?.title}>
            <Text className="text-gray-700 font-medium truncate block max-w-50">
              {test?.title || 'Unknown Test'}
            </Text>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Time',
      render: (_, record) => (
        <div>
          <Text className="block text-gray-700">
            <ClockCircleOutlined className="mr-1 text-gray-400" />
            {dayjs(record.start_time).format('DD/MM/YYYY')}
          </Text>
          <Text type="secondary" className="text-xs">
            Started: {dayjs(record.start_time).format('HH:mm')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      render: (status) => {
        if (status === 'COMPLETED') {
          return <Tag color="success" icon={<CheckCircleOutlined />} className="rounded-full px-3 py-0.5 border-0 bg-green-50 text-green-600 font-bold">Graded</Tag>;
        }
        if (status === 'PENDING') {
          return <Tag color="warning" icon={<ClockCircleOutlined />} className="rounded-full px-3 py-0.5 border-0 bg-amber-50 text-amber-600 font-bold">Needs Grading</Tag>;
        }
        return <Tag color="processing" icon={<SyncOutlined spin />} className="rounded-full px-3 py-0.5 border-0 bg-blue-50 text-blue-600 font-bold">In Progress</Tag>;
      },
    },
    {
      title: 'Result',
      align: 'center',
      render: (_, record) => {
        if (record.status === 'IN_PROGRESS') return <Text type="secondary" italic>---</Text>;
        return (
          <Tooltip title={`Current CEFR Level: ${record.overall_cefr_level || 'Not updated'}`}>
            <div className="text-center">
              <span className={`text-lg font-bold ${record.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-500'}`}>
                {record.overall_score || 0}
              </span>
              <span className="text-gray-400 font-medium">/250</span>
              {record.overall_cefr_level && (
                <div className={`text-[11px] font-bold text-white rounded-md inline-block px-2 ml-2 ${record.status === 'COMPLETED' ? 'bg-green-500' : 'bg-amber-400'}`}>
                  {record.overall_cefr_level}
                </div>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      align: 'right',
      render: (_, record) => {
        if (record.status === 'PENDING') {
          return (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/aptis/submissions/${record.id}`)}
              className="bg-amber-500 hover:bg-amber-400 border-0 shadow-sm font-bold rounded-xl"
            >
              Grade Now
            </Button>
          );
        }
        if (record.status === 'COMPLETED') {
          return (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/aptis/submissions/${record.id}`)}
              className="bg-green-600 hover:bg-green-500 border-0 shadow-sm font-bold rounded-xl"
            >
              View Result
            </Button>
          );
        }
        return (
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/aptis/submissions/${record.id}`)}
            className="rounded-xl font-medium text-slate-500"
          >
            Monitor
          </Button>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: 'PENDING',
      label: (
        <span className="px-2 font-semibold">
          Pending (Needs Grading) <Badge count={stats.pending} showZero className="ml-1" color={filters.status === 'PENDING' ? '#f59e0b' : '#d9d9d9'} />
        </span>
      ),
    },
    {
      key: 'COMPLETED',
      label: (
        <span className="px-2 font-semibold">
          Completed (Graded) <Badge count={stats.completed} showZero className="ml-1" color={filters.status === 'COMPLETED' ? '#22c55e' : '#d9d9d9'} />
        </span>
      ),
    },
    {
      key: 'IN_PROGRESS',
      label: (
        <span className="px-2 font-semibold">
          In Progress <Badge count={stats.in_progress} showZero className="ml-1" color={filters.status === 'IN_PROGRESS' ? '#3b82f6' : '#d9d9d9'} />
        </span>
      ),
    },
  ];

  const renderTabBarExtraContent = () => (
    <Input
      placeholder="Search student..."
      prefix={<SearchOutlined className="text-gray-400" />}
      allowClear
      value={filters.searchText}
      onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
      onPressEnter={() => {
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchSubmissions();
      }}
      className="w-64 md:w-80 rounded-full"
    />
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={3} className="mb-1 text-indigo-900 font-bold">
            <FileTextOutlined className="mr-2 text-indigo-500" /> Aptis Submission Management
          </Title>
          <Text className="text-gray-500">View progress, overall results and grade open-ended responses (Writing/Speaking)</Text>
        </div>
      </div>

      {/* STATS CARDS */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-gray-200 relative overflow-hidden">
            <FolderOpenOutlined className="absolute -right-4 -bottom-4 text-7xl text-gray-100" />
            <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Attempts</Text>
            <div className="mt-1"><span className="text-3xl font-black text-gray-800">{stats.total}</span></div>
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-amber-200 bg-amber-50 relative overflow-hidden">
            <ClockCircleOutlined className="absolute -right-4 -bottom-4 text-7xl text-amber-200 opacity-40" />
            <Text className="text-amber-600 font-bold text-xs uppercase tracking-wider">Pending</Text>
            <div className="mt-1"><span className="text-3xl font-black text-amber-600">{stats.pending}</span> <span className="text-xs text-amber-500 font-medium">needs grading</span></div>
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-green-200 bg-green-50 relative overflow-hidden">
            <SafetyCertificateOutlined className="absolute -right-4 -bottom-4 text-7xl text-green-200 opacity-40" />
            <Text className="text-green-600 font-bold text-xs uppercase tracking-wider">Completed</Text>
            <div className="mt-1"><span className="text-3xl font-black text-green-600">{stats.completed}</span> <span className="text-xs text-green-500 font-medium">graded</span></div>
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-blue-200 bg-blue-50 relative overflow-hidden">
            <SyncOutlined className="absolute -right-4 -bottom-4 text-7xl text-blue-200 opacity-40" />
            <Text className="text-blue-600 font-bold text-xs uppercase tracking-wider">In Progress</Text>
            <div className="mt-1"><span className="text-3xl font-black text-blue-600">{stats.in_progress}</span> <span className="text-xs text-blue-500 font-medium">ongoing</span></div>
          </Card>
        </Col>
      </Row>

      {/* DATA TABLE & TABS */}
      <Card className="shadow-sm rounded-2xl border-0 overflow-hidden" styles={{ body: { padding: '16px 24px' } }}>
        <Tabs
          activeKey={filters.status}
          items={tabItems}
          onChange={(key) => {
            setFilters({ ...filters, status: key });
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          tabBarExtraContent={renderTabBarExtraContent()}
          className="mb-2"
        />
        
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
            showTotal: (total) => `Total ${total} records`,
          }}
          size="middle"
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </Card>
    </div>
  );
};

export default ExamAptisSubmissionsManager;
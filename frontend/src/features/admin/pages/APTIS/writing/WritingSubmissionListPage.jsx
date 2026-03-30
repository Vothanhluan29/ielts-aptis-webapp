import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Tag, Button, Space, Card, Typography,
  Input, Tabs, Badge, Row, Col, message, Avatar, Tooltip
} from 'antd';
import {
  EditOutlined, EyeOutlined, SearchOutlined,
  ClockCircleOutlined, CheckCircleOutlined,
  UserOutlined, FolderOpenOutlined, SafetyCertificateOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import writingAptisAdminApi from '../../../api/APTIS/writing/writingAptisAdminApi';

const { Title, Text } = Typography;

const WritingSubmissionListPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // State to store overview statistics
  const [stats, setStats] = useState({ total: 0, pending: 0, graded: 0 });

  const [filters, setFilters] = useState({
    status: 'PENDING',
    searchText: '',
  });

  // 🔥 ĐÃ THÊM LỌC: is_full_test_only: false
  const loadOverviewStats = async () => {
    try {
      const [pendingRes, gradedRes] = await Promise.all([
        writingAptisAdminApi.getAllSubmissions({ page: 1, limit: 1, status: 'PENDING', is_full_test_only: false }),
        writingAptisAdminApi.getAllSubmissions({ page: 1, limit: 1, status: 'GRADED', is_full_test_only: false })
      ]);
      
      const pData = pendingRes.data || pendingRes;
      const gData = gradedRes.data || gradedRes;

      const pCount = pData.total !== undefined ? pData.total : (pData.items?.length || pData.length || 0);
      const gCount = gData.total !== undefined ? gData.total : (gData.items?.length || gData.length || 0);
      
      setStats({
        pending: pCount,
        graded: gCount,
        total: pCount + gCount
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status,
        search: filters.searchText,
        is_full_test_only: false, // 🔥 Báo backend CHỈ lấy bài thi lẻ (Practice)
      };

      const res = await writingAptisAdminApi.getAllSubmissions(params);
      const result = res.data || res;

      if (Array.isArray(result)) {
        setData(result);
        setPagination(prev => ({ 
          ...prev, 
          total: result.length < pagination.pageSize ? (pagination.current - 1) * pagination.pageSize + result.length : 1000 
        }));
      } else if (result && result.items) {
        setData(result.items);
        setPagination(prev => ({ ...prev, total: result.total || 0 }));
      }
    } catch (error) {
      console.error("Error loading submission list:", error);
      message.error("Unable to load submission data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters.status, filters.searchText]);

  useEffect(() => {
    loadOverviewStats();
  }, [filters.status]);

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
      title: 'Test (Practice)',
      key: 'test',
      render: (_, record) => (
        <Space>
          <div className="w-7 h-7 rounded bg-indigo-50 flex items-center justify-center text-indigo-500">
            <FileTextOutlined />
          </div>
          <Text className="text-gray-700 font-medium">{record.test?.title || 'Writing Test'}</Text>
        </Space>
      ),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submitted_at',
      render: (date) => (
        <div>
          <Text className="block text-gray-700">{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" className="text-xs">{dayjs(date).format('HH:mm')}</Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      render: (status) => {
        const isGraded = status === 'GRADED';
        return (
          <Tag
            color={isGraded ? 'success' : 'warning'}
            icon={isGraded ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            className={`rounded-full px-3 py-0.5 border-0 font-bold ${
              isGraded ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isGraded ? 'Graded' : 'Needs Grading'}
          </Tag>
        );
      },
    },
    {
      title: 'Score',
      align: 'center',
      render: (_, record) => {
        if (record.status !== 'GRADED') return <Text type="secondary" italic>---</Text>;
        return (
          <Tooltip title={`CEFR Level: ${record.cefr_level || 'N/A'}`}>
            <div className="text-center">
              <span className="text-lg font-bold text-green-600">{record.score}</span>
              <span className="text-gray-400 font-medium">/50</span>
              {record.cefr_level && (
                <div className="text-[11px] font-bold text-white bg-green-500 rounded-md inline-block px-2 ml-2">
                  {record.cefr_level}
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
        const isPending = record.status === 'PENDING';
        return (
          <Button
            type="primary"
            icon={isPending ? <EditOutlined /> : <EyeOutlined />}
            onClick={() => navigate(`/admin/aptis/submissions/writing/${record.id}`)}
            className={`shadow-sm font-bold rounded-xl border-0 ${
              isPending 
                ? 'bg-amber-500 hover:bg-amber-400' 
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isPending ? 'Grade Now' : 'View Result'}
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
          Needs Grading <Badge count={stats.pending} showZero className="ml-1" color={filters.status === 'PENDING' ? '#f59e0b' : '#d9d9d9'} />
        </span>
      ),
    },
    {
      key: 'GRADED',
      label: (
        <span className="px-2 font-semibold">
          Completed <Badge count={stats.graded} showZero className="ml-1" color={filters.status === 'GRADED' ? '#22c55e' : '#d9d9d9'} />
        </span>
      ),
    },
  ];

  const renderTabBarExtraContent = () => (
    <Input
      placeholder="Search by student name or email..."
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
          <Title level={3} className="!mb-1 !text-indigo-900 font-bold">
            <FileTextOutlined className="mr-2 text-indigo-500" /> Writing Practice Submissions
          </Title>
          <Text className="text-gray-500">Read and evaluate students' standalone writing practice submissions</Text>
        </div>
      </div>

      {/* STATS CARDS */}
      <Row gutter={24} className="mb-6">
        <Col span={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-gray-200 relative overflow-hidden">
            <FolderOpenOutlined className="absolute -right-4 -bottom-4 text-7xl text-gray-100" />
            <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Submissions</Text>
            <div className="mt-1"><span className="text-3xl font-black text-gray-800">{stats.total}</span></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-amber-200 bg-amber-50 relative overflow-hidden">
            <ClockCircleOutlined className="absolute -right-4 -bottom-4 text-7xl text-amber-200 opacity-40" />
            <Text className="text-amber-600 font-bold text-xs uppercase tracking-wider">Pending Grading</Text>
            <div className="mt-1"><span className="text-3xl font-black text-amber-600">{stats.pending}</span> <span className="text-xs text-amber-500 font-medium">to process</span></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-green-200 bg-green-50 relative overflow-hidden">
            <SafetyCertificateOutlined className="absolute -right-4 -bottom-4 text-7xl text-green-200 opacity-40" />
            <Text className="text-green-600 font-bold text-xs uppercase tracking-wider">Completed</Text>
            <div className="mt-1"><span className="text-3xl font-black text-green-600">{stats.graded}</span> <span className="text-xs text-green-500 font-medium">graded</span></div>
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

export default WritingSubmissionListPage;
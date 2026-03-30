import React from 'react';
import { 
  Table, Tag, Select, Button, Avatar, Space, Typography, Card, Segmented, Tooltip 
} from 'antd';
import { 
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  EyeOutlined, UserOutlined, AppstoreOutlined, AudioOutlined, 
  EditOutlined, BookOutlined, CustomerServiceOutlined, FilterOutlined
} from '@ant-design/icons';
import { useAdminSubmissions } from '../../hooks/submissions/useAdminSubmissions';

const { Title, Text } = Typography;
const { Option } = Select;

/* ================= STATUS BADGE ================= */
const StatusBadge = ({ status }) => {
  switch (status) {
    case 'GRADED':
    case 'COMPLETED':
      return <Tag color="success" icon={<CheckCircleOutlined />}>{status}</Tag>;
    case 'GRADING':
    case 'IN_PROGRESS': 
      return <Tag color="processing" icon={<ClockCircleOutlined />}>{status}</Tag>;
    case 'ERROR':
      return <Tag color="error" icon={<CloseCircleOutlined />}>ERROR</Tag>;
    default:
      return <Tag color="default">{status || 'UNKNOWN'}</Tag>;
  }
};

/* ================= MAIN PAGE ================= */
const AdminSubmissions = () => {
  const {
    submissions, totalSubmissions, currentPage, pageSize, loading,
    activeSkill, setActiveSkill,
    statusFilter, setStatusFilter,
    handleViewDetails, handlePageChange
  } = useAdminSubmissions();

  // Cấu hình các tùy chọn cho thanh Tabs (Segmented)
  const skillOptions = [
    { value: 'exam', icon: <AppstoreOutlined />, label: 'Full Tests' },
    { value: 'speaking', icon: <AudioOutlined />, label: 'Speaking' },
    { value: 'writing', icon: <EditOutlined />, label: 'Writing' },
    { value: 'reading', icon: <BookOutlined />, label: 'Reading' },
    { value: 'listening', icon: <CustomerServiceOutlined />, label: 'Listening' }
  ];

  // Định nghĩa các cột cho bảng dữ liệu
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (id) => <Text type="secondary" className="font-mono">#{id}</Text>,
    },
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar 
            className="bg-indigo-100 text-indigo-600" 
            icon={<UserOutlined />} 
          />
          <div className="flex flex-col">
            <Text strong className="text-slate-800">
              {record.user?.full_name || 'Unknown Student'}
            </Text>
            <Text type="secondary" className="text-xs">
              {record.user?.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Test Title',
      key: 'test',
      render: (_, record) => (
        <Text strong className="text-slate-700 truncate max-w-[240px] block" title={record.test?.title || record.full_test?.title}>
          {record.test?.title || record.full_test?.title || `Test #${record.test_id || record.full_test_id}`}
        </Text>
      ),
    },
    {
      title: 'Submitted',
      key: 'submitted',
      width: 160,
      render: (_, record) => {
        const dateValue = record.submitted_at || record.start_time;
        return (
          <Text type="secondary" className="text-sm">
            {dateValue ? new Date(dateValue).toLocaleString('en-GB', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }) : 'N/A'}
          </Text>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Score',
      key: 'score',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const displayScore = record.band_score ?? record.overall_score ?? '-';
        return (
          <Text 
            strong 
            className={`text-lg ${displayScore !== '-' ? 'text-indigo-600' : 'text-slate-300'}`}
          >
            {displayScore}
          </Text>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button 
            type="text" 
            icon={<EyeOutlined className="text-slate-400 hover:text-indigo-600" />} 
            onClick={() => handleViewDetails(record.id)}
            className="hover:bg-indigo-50"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans px-4 py-8 md:px-8 md:py-10 pb-24">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* ================= HEADER & TABS ================= */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <Title level={2} className="!m-0 !text-slate-800">
              Submissions Management
            </Title>
            <Text className="text-slate-500 mt-1 block">
              Review and manage student exam submissions across all skills.
            </Text>
          </div>

          <Segmented 
            options={skillOptions} 
            value={activeSkill} 
            onChange={setActiveSkill}
            size="large"
            className="p-1 font-medium bg-white border border-slate-200 shadow-sm"
          />
        </div>

        {/* ================= FILTER & TABLE CARD ================= */}
        <Card 
          className="rounded-2xl shadow-sm border-slate-200 overflow-hidden" 
          bodyStyle={{ padding: 0 }}
        >
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <Space>
              <FilterOutlined className="text-slate-400" />
              <Text strong className="text-slate-600">Filter by Status:</Text>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 160 }}
                className="font-medium"
              >
                <Option value="">All Statuses</Option>
                <Option value="GRADED">Graded</Option>
                <Option value="COMPLETED">Completed</Option>
                <Option value="GRADING">Grading</Option>
                <Option value="IN_PROGRESS">In Progress</Option>
                <Option value="ERROR">Error</Option>
              </Select>
            </Space>
          </div>

          {/* Data Table */}
          <Table 
            columns={columns} 
            dataSource={submissions} 
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalSubmissions,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} submissions`,
              position: ['bottomCenter']
            }}
            onChange={(pagination) => handlePageChange(pagination.current, pagination.pageSize)}
            className="custom-table"
          />
        </Card>

      </div>
    </div>
  );
};

export default AdminSubmissions;
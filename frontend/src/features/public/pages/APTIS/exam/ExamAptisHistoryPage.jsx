import React from 'react';
import { 
  Table, Tag, Space, Typography, Card, Row, Col, 
  Statistic, Button, Empty, Spin 
} from 'antd';
import { 
  HistoryOutlined, 
  FileTextOutlined, 
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Gọi Custom Hook
import { useExamAptisHistory } from '../../../hooks/APTIS/exam/useExamAptisHistory';

const { Title, Text } = Typography;

const ExamAptisHistoryPage = () => {
  // 🔥 Lấy toàn bộ data và function từ Hook
  const { 
    loading, 
    historyData, 
    stats, 
    handleGoBack, 
    handleViewResult, 
    handleResumeTest 
  } = useExamAptisHistory();

  // Cấu hình cột của bảng (Đẩy các hàm điều hướng từ Hook vào)
  const columns = [
    {
      title: 'Test',
      dataIndex: 'full_test',
      key: 'test_title',
      render: (fullTest) => <Text strong className="text-slate-800">{fullTest?.title || 'Aptis Full Mock Test'}</Text>,
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      sorter: (a, b) => new Date(a.start_time) - new Date(b.start_time),
      render: (time) => (
        <Space>
          <CalendarOutlined className="text-slate-400" />
          <Text className="text-slate-600 font-medium">{time ? dayjs(time).format('DD/MM/YYYY HH:mm') : 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (['GRADED', 'COMPLETED', 'FINISHED'].includes(status)) {
          return <Tag color="success" icon={<CheckCircleOutlined />} className="font-bold border-0 bg-green-50 px-3 py-1 text-green-600 rounded-full">Completed</Tag>;
        }
        if (status === 'PENDING') {
          return <Tag color="processing" icon={<SyncOutlined spin />} className="font-bold border-0 bg-blue-50 px-3 py-1 text-blue-600 rounded-full">Awaiting Review</Tag>;
        }
        if (status === 'IN_PROGRESS') {
          return <Tag color="warning" icon={<ClockCircleOutlined />} className="font-bold border-0 bg-amber-50 px-3 py-1 text-amber-600 rounded-full">In Progress</Tag>;
        }
        return <Tag color="default" className="rounded-full px-3 py-1">{status}</Tag>;
      },
    },
    {
      title: 'Score',
      key: 'score',
      align: 'center',
      render: (_, record) => {
        if (record.status === 'PENDING') {
          return (
            <div className="flex flex-col items-center">
              <Text strong style={{ color: '#f59e0b', fontSize: 16 }}>{record.overall_score || 0}/250</Text>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>Partial Score</Text>
            </div>
          );
        }
        if (['GRADED', 'COMPLETED', 'FINISHED'].includes(record.status)) {
          return <Text strong style={{ color: '#16a34a', fontSize: 16 }}>{record.overall_score || 0}/250</Text>;
        }
        return <Text type="secondary">--</Text>;
      },
    },
    {
      title: 'CEFR Level',
      dataIndex: 'overall_cefr_level',
      key: 'cefr_level',
      align: 'center',
      render: (level, record) => {
        if (record.status === 'PENDING') {
          return <Tag color="orange" className="font-bold rounded-lg border-0 bg-amber-50">Pending</Tag>;
        }
        return ['GRADED', 'COMPLETED', 'FINISHED'].includes(record.status) && level ? (
          <Tag color="blue" className="font-bold rounded-lg border-0 bg-indigo-50 text-indigo-600 px-3">{level}</Tag>
        ) : <Text type="secondary">--</Text>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => {
        if (['GRADED', 'COMPLETED', 'FINISHED', 'PENDING'].includes(record.status)) {
          return (
            <Button 
              type="primary" 
              ghost 
              icon={<EyeOutlined />} 
              onClick={() => handleViewResult(record.id)}
              className="font-semibold rounded-lg"
            >
              View Result
            </Button>
          );
        }
        if (record.status === 'IN_PROGRESS') {
          return (
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />} 
              onClick={() => handleResumeTest(record.full_test_id)}
              style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
              className="font-semibold rounded-lg shadow-sm"
            >
              Resume Test
            </Button>
          );
        }
        return null;
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }} className="font-sans">

      {/* BACK BUTTON */}
      <button
        onClick={handleGoBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 999,
          border: '1px solid #e2e8f0',
          background: '#fff',
          color: '#475569',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: 24,
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#f8fafc'; }}
        onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
      >
        <ArrowLeftOutlined />
        Back to Exam List
      </button>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: 32 }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <div style={{ padding: 12, background: '#4f46e5', borderRadius: 14, display: 'flex', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
            <HistoryOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 800 }}>
              Full Mock Test History
            </Title>
            <Text type="secondary" className="text-slate-500 font-medium text-base">
              Track your progress and review your comprehensive exam submissions
            </Text>
          </div>
        </Space>
      </div>

      {/* STATS SECTION */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <Statistic 
              title={<span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Total Submissions</span>}
              value={stats.total} 
              prefix={<FileTextOutlined className="text-indigo-500" />} 
              valueStyle={{ fontWeight: 800, color: '#1e293b' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fcfdfd', background: '#f0fdf4' }}>
            <Statistic 
              title={<span className="text-green-600 font-bold uppercase text-xs tracking-wider">Completed</span>}
              value={stats.completed} 
              prefix={<CheckCircleOutlined className="text-green-500" />} 
              valueStyle={{ fontWeight: 800, color: '#16a34a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fefce8', background: '#fffbeb' }}>
            <Statistic 
              title={<span className="text-amber-600 font-bold uppercase text-xs tracking-wider">Pending Review</span>}
              value={stats.pending} 
              prefix={<SyncOutlined spin className="text-amber-500" />} 
              valueStyle={{ fontWeight: 800, color: '#d97706' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f8fafc' }}>
            <Statistic 
              title={<span className="text-slate-500 font-bold uppercase text-xs tracking-wider">In Progress</span>}
              value={stats.inProgress} 
              prefix={<ClockCircleOutlined className="text-slate-400" />} 
              valueStyle={{ fontWeight: 800, color: '#475569' }}
            />
          </Card>
        </Col>
      </Row>

      {/* TABLE SECTION */}
      <Card 
        variant="borderless" 
        style={{ borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}
        styles={{ body: { padding: '24px' } }}
      >
        {historyData.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={historyData} 
            rowKey="id"
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            className="custom-table font-medium"
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={<span className="text-slate-500 font-medium">You have not taken any full mock tests yet.</span>}
          >
            <Button 
              type="primary" 
              size="large"
              onClick={handleGoBack}
              style={{ backgroundColor: '#4f46e5', borderRadius: 12, fontWeight: 700 }}
              className="mt-2"
            >
              Start an Exam
            </Button>
          </Empty>
        )}
      </Card>

    </div>
  );
};

export default ExamAptisHistoryPage;
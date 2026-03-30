import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import writingAptisStudentApi from '../../../api/APTIS/writing/writingAptisStudentApi';

const { Title, Text } = Typography;

const WritingAptisHistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await writingAptisStudentApi.getMyHistory();
      const data = res.data || res;
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: history.length,
    graded: history.filter(h => h.status === 'GRADED').length,
  };

  const columns = [
    {
      title: 'Test',
      dataIndex: ['test', 'title'],
      key: 'title',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Submission Date',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      sorter: (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          GRADED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Graded' },
          PENDING: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Pending Review' },
        };

        const s = config[status] || { color: 'default', text: status };

        return (
          <Tag color={s.color} icon={s.icon}>
            {s.text}
          </Tag>
        );
      },
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (score, record) => (
        record.status === 'GRADED' ? (
          <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
            {score}/50
          </Text>
        ) : (
          <Text type="secondary">--</Text>
        )
      ),
    },
    {
      title: 'Level',
      dataIndex: 'cefr_level',
      key: 'cefr_level',
      align: 'center',
      render: (level, record) => (
        record.status === 'GRADED' ? (
          <Tag color="blue" style={{ fontWeight: 'bold' }}>
            {level}
          </Tag>
        ) : null
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost 
          icon={<EyeOutlined />} 
          onClick={() => navigate(`/aptis/writing/result/${record.test_id}`)}
        >
          View Details
        </Button>
      ),
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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/aptis/writing')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 999,
          border: '1px solid #e2e8f0',
          background: '#fff',
          color: '#475569',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: 24,
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.borderColor = '#d8b4fe'; }}
        onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
      >
        <ArrowLeftOutlined />
        Back
      </button>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: 32 }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <div style={{ padding: 12, background: '#7c3aed', borderRadius: 12 }}>
            <HistoryOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>

          <div>
            <Title level={2} style={{ margin: 0 }}>
              Practice History
            </Title>

            <Text type="secondary">
              Track your progress and review submitted writing tests
            </Text>
          </div>
        </Space>
      </div>

      {/* STATS SECTION */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        
        <Col xs={24} sm={12}>
          <Card 
            variant="borderless" 
            style={{ 
              borderRadius: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Statistic 
              title="Total Submissions" 
              value={stats.total} 
              prefix={
                <FileTextOutlined style={{ color: '#1890ff' }} />
              } 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card 
            variant="borderless" 
            style={{ 
              borderRadius: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Statistic 
              title="Graded Tests" 
              value={stats.graded} 
              prefix={
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              } 
            />
          </Card>
        </Col>

      </Row>

      {/* TABLE SECTION */}
      <Card 
        variant="borderless" 
        style={{ 
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {history.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={history} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="custom-table"
          />
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="You have not taken any writing tests yet."
          >
            <Button 
              type="primary" 
              onClick={() => navigate('/aptis/writing')}
            >
              Start Practice
            </Button>
          </Empty>
        )}
      </Card>

    </div>
  );
};

export default WritingAptisHistoryPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, Tag, Space, Typography, Card, Row, Col, 
  Statistic, Button, Empty, Spin
} from 'antd';
import { 
  HistoryOutlined, 
  AudioOutlined, 
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

const { Title, Text } = Typography;

const SpeakingAptisHistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  
  // State to store test ID -> test title map
  const [testTitles, setTestTitles] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Call 2 APIs in parallel: history + test list
      const [historyRes, testsRes] = await Promise.all([
        speakingAptisStudentApi.getMyHistory(),
        speakingAptisStudentApi.getListTests({ skip: 0, limit: 1000 }).catch(() => ({ data: [] }))
      ]);

      const historyData = historyRes.data || historyRes || [];
      const testsData = testsRes.data || testsRes || [];

      // Build lookup map for test titles by ID
      const titleMap = {};
      testsData.forEach(test => {
        titleMap[test.id] = test.title;
      });
      setTestTitles(titleMap);
      
      // Sort newest first
      const sortedData = historyData.sort((a, b) => {
        return new Date(b.created_at || b.submitted_at) - new Date(a.created_at || a.submitted_at);
      });

      setHistory(sortedData);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: history.length,
    graded: history.filter(h => h.status?.toUpperCase() === 'GRADED').length,
  };

  const columns = [
    {
      title: 'Test',
      key: 'title',
      render: (_, record) => {
        // Look up title from map, fallback to ID if not found
        const title = testTitles[record.test_id] || record.test_title || record.test?.title || `Aptis Speaking Test #${record.test_id}`;
        return <Text strong>{title}</Text>;
      },
    },
    {
      title: 'Submission Date',
      key: 'submitted_at',
      sorter: (a, b) => new Date(a.submitted_at || a.created_at) - new Date(b.submitted_at || b.created_at),
      render: (_, record) => {
        const date = record.submitted_at || record.created_at;
        return (
          <Space>
            <CalendarOutlined style={{ color: '#8c8c8c' }} />
            {date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const normalizedStatus = status?.toUpperCase();
        const config = {
          GRADED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Graded' },
          PENDING: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Pending Review' },
        };

        const s = config[normalizedStatus] || { color: 'default', text: status || 'Unknown' };

        return (
          <Tag color={s.color} icon={s.icon}>
            {s.text}
          </Tag>
        );
      },
    },
    {
      title: 'Score',
      key: 'score',
      align: 'center',
      render: (_, record) => {
        const isGraded = record.status?.toUpperCase() === 'GRADED';
        const scoreVal = record.total_score ?? record.score ?? 0;
        
        return isGraded ? (
          <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
            {scoreVal}/50
          </Text>
        ) : (
          <Text type="secondary">--</Text>
        );
      },
    },
    {
      title: 'Level',
      dataIndex: 'cefr_level',
      key: 'cefr_level',
      align: 'center',
      render: (level, record) => (
        record.status?.toUpperCase() === 'GRADED' ? (
          <Tag color="blue" style={{ fontWeight: 'bold' }}>
            {level || 'N/A'}
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
          onClick={() => navigate(`/aptis/speaking/result/${record.test_id}`)}
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
        onClick={() => navigate('/aptis/speaking')}
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
              Track your progress and review submitted speaking tests
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
                <AudioOutlined style={{ color: '#1890ff' }} />
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
            pagination={{ pageSize: 10, placement: ['bottomRight'] }}
            className="custom-table"
          />
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="You have not taken any speaking tests yet."
          >
            <Button 
              type="primary" 
              onClick={() => navigate('/aptis/speaking')}
            >
              Start Practice
            </Button>
          </Empty>
        )}
      </Card>

    </div>
  );
};

export default SpeakingAptisHistoryPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, Table, Tag, Button, Typography, 
  Card, Empty, Skeleton
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EyeOutlined, 
  HistoryOutlined,
  CalendarOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';

import listeningAptisStudentApi from '../../../api/APTIS/listening/listeningAptisStudentApi';

const { Content } = Layout;
const { Title, Text } = Typography;

// CEFR tag color helper
const getCefrColor = (level) => {
  if (level === 'C') return 'success';
  if (level?.includes('B')) return 'processing';
  if (level?.includes('A')) return 'warning';
  return 'default';
};

const ListeningAptisHistoryPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const response = await listeningAptisStudentApi.getMyHistory();
      const data = response.data || response || [];

      // Sort newest first
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.submitted_at || b.created_at) -
          new Date(a.submitted_at || a.created_at)
      );

      setHistory(sortedData);

    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Test Name',
      dataIndex: ['test', 'title'],
      key: 'title',
      render: (text, record) => (
        <div className="flex flex-col">
          <Text strong className="text-slate-700 text-base">
            {text || `Test #${record.test_id}`}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Submission ID: {record.id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submitted_at',
      key: 'date',
      width: 200,
      render: date => (
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarOutlined />
          <span>
            {new Date(date).toLocaleDateString('en-US', {
              hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
            })}
          </span>
        </div>
      ),
    },
    {
      title: 'Result',
      key: 'score',
      align: 'center',
      width: 180,
      render: (_, record) => {
        const score = record.score || 0;
        const cefr = record.cefr_level || 'N/A';

        return (
          <div className="flex flex-col items-center gap-1.5">
            <Tag
              color="blue"
              className="font-bold px-3 py-1 rounded-full border-0 bg-blue-50 text-blue-700 m-0 text-sm"
            >
              {score} / 50
            </Tag>
            <Tag color={getCefrColor(cefr)} className="font-bold m-0 border-0 rounded px-2">
              CEFR: {cefr}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          className="bg-blue-600 hover:bg-blue-500 border-none rounded-lg font-semibold shadow-md shadow-blue-200"
          onClick={() => navigate(`/aptis/listening/result/${record.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>

      <Content style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>

             <button
                  onClick={() => navigate('/aptis/listening')}
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
                  onMouseOver={(e) => { e.currentTarget.style.color = '#059669'; e.currentTarget.style.borderColor = '#6ee7b7'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <ArrowLeftOutlined />
                  Back
                </button>

        {/* BANNER */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <HistoryOutlined style={{ fontSize: 32 }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
                Listening Test History
              </Title>
              <Text className="text-slate-500 text-base">
                Review your scores, CEFR level, and detailed answers from past tests.
              </Text>
            </div>
          </div>

          {/* Mini Stats */}
          {history.length > 0 && (
            <Card className="rounded-2xl border-blue-100 bg-blue-50/50 shadow-sm" styles={{ body: { padding: '12px 24px' } }}>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Text className="block text-[10px] uppercase font-bold text-blue-600 mb-1">Total Tests</Text>
                  <Text className="text-xl font-black text-blue-800">{history.length}</Text>
                </div>
                <div className="w-px h-10 bg-blue-200"></div>
                <div className="text-center">
                  <Text className="block text-[10px] uppercase font-bold text-blue-600 mb-1">Best Score</Text>
                  <Text className="text-xl font-black text-blue-800">
                    {Math.max(...history.map(h => h.score || 0))} <span className="text-sm">/ 50</span>
                  </Text>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* MAIN TABLE */}
        {loading ? (
          <Card className="rounded-3xl border-0 shadow-sm"><Skeleton active paragraph={{ rows: 6 }} /></Card>
        ) : history.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-sm text-center py-20">
            <Empty 
              image={<CustomerServiceOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />}
              description={<Text type="secondary" className="text-lg">You haven't taken any Listening tests yet.</Text>}
            />
            <Button
              type="primary"
              size="large"
              className="mt-6 bg-blue-600 hover:bg-blue-500 border-none h-12 px-8 rounded-xl font-bold shadow-md shadow-blue-200"
              onClick={() => navigate('/aptis/listening')}
            >
              Take a Test Now
            </Button>
          </Card>
        ) : (
          <Card className="rounded-3xl border-0 shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
            <Table
              columns={columns}
              dataSource={history}
              rowKey="id"
              pagination={{ pageSize: 8, hideOnSinglePage: true }}
              scroll={{ x: 700 }}
              className="custom-history-table"
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default ListeningAptisHistoryPage;
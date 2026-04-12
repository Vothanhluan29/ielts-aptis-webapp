import React from 'react';
import { 
  Layout, Table, Tag, Button, Typography, 
  Card, Space, Empty, Skeleton 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EyeOutlined, 
  HistoryOutlined,
  CalendarOutlined
} from '@ant-design/icons';

// Nhúng Custom Hook
import { useGrammarVocabHistory } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabHistory';

const { Content } = Layout;
const { Title, Text } = Typography;

const GrammarVocabHistoryPage = () => {
  // 🔥 Rút vũ khí từ Hook
  const { 
    loading, 
    history, 
    stats, 
    handleGoBack, 
    handleViewResult 
  } = useGrammarVocabHistory();

  // 🔥 Định nghĩa các cột của Table
  const columns = [
    {
      title: 'Test Title',
      dataIndex: ['test', 'title'],
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-slate-700">
            {text || `Test #${record.test_id}`}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Submission ID: {record.id}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Submission Date',
      dataIndex: 'submitted_at',
      key: 'date',
      width: 200,
      render: date => (
        <Space className="text-slate-500">
          <CalendarOutlined />
          {new Date(date).toLocaleDateString('en-GB', {
              hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
          })}
        </Space>
      ),
    },
    {
      title: 'Result',
      key: 'score',
      align: 'center',
      width: 150,
      render: (_, record) => {
        const score = record.total_score || record.score || 0;
        return (
          <Tag
            color="emerald"
            className="font-bold px-3 py-1 rounded-full border-0 bg-emerald-100 text-emerald-700"
          >
            {score} / 50
          </Tag>
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
          className="bg-emerald-600 hover:bg-emerald-500 border-none rounded-lg font-semibold"
          onClick={() => handleViewResult(record.id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Content style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        
        {/* NÚT BACK */}
        <button
          onClick={handleGoBack}
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
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100">
              <HistoryOutlined style={{ fontSize: 28 }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Grammar & Vocab Test History</Title>
              <Text className="text-slate-500 text-base">
                Review your results and detailed explanations for each question
              </Text>
            </div>
          </div>

          {/* Mini Stats (Chỉ hiển thị khi có dữ liệu) */}
          {stats && (
            <Card className="rounded-2xl border-emerald-100 bg-emerald-50/50 shadow-sm" styles={{ body: { padding: '12px 24px' } }}>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Text className="block text-[10px] uppercase font-bold text-emerald-600 mb-1">Total Tests</Text>
                  <Text className="text-xl font-black text-emerald-800">{stats.totalTests}</Text>
                </div>
                <div className="w-px h-10 bg-emerald-200"></div>
                <div className="text-center">
                  <Text className="block text-[10px] uppercase font-bold text-emerald-600 mb-1">Best Score</Text>
                  <Text className="text-xl font-black text-emerald-800">
                    {stats.bestScore} <span className="text-sm">/ 50</span>
                  </Text>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* NỘI DUNG CHÍNH (LOADING / EMPTY / TABLE) */}
        {loading ? (
          <Card className="rounded-2xl border-0 shadow-sm"><Skeleton active paragraph={{ rows: 6 }} /></Card>
        ) : history.length === 0 ? (
          <Card className="rounded-2xl border-0 shadow-sm text-center py-16">
            <Empty description="You have not taken any tests yet." />
            <Button
              type="primary"
              className="mt-4 bg-emerald-600 border-none h-10 px-8 rounded-lg"
              onClick={handleGoBack}
            >
              Start Practice
            </Button>
          </Card>
        ) : (
          <Card className="rounded-2xl border-0 shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
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

export default GrammarVocabHistoryPage;
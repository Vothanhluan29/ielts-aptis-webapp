import React from 'react';
import { 
  Layout, Table, Tag, Button, Typography, 
  Card, Empty, Skeleton
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EyeOutlined, 
  HistoryOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AudioOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Nhúng Custom Hook
import { useSpeakingAptisHistory } from '../../../hooks/APTIS/speaking/useSpeakingAptisHistory';

const { Content } = Layout;
const { Title, Text } = Typography;

const getCefrColor = (level) => {
  if (level === 'C') return 'success';
  if (level?.includes('B')) return 'processing';
  if (level?.includes('A')) return 'warning';
  return 'default';
};

const SpeakingAptisHistoryPage = () => {
  // 🔥 Kéo Data và Handlers từ Hook
  const { 
    loading, 
    history, 
    testTitles,
    stats, 
    handleGoBack, 
    handleViewResult 
  } = useSpeakingAptisHistory();

  // 🔥 Định nghĩa cấu trúc cột Table
  const columns = [
    {
      title: 'Test Name',
      key: 'title',
      render: (_, record) => {
        // Look up title from map, fallback to ID if not found
        const title = testTitles[record.test_id] || record.test_title || record.test?.title || `Aptis Speaking Test #${record.test_id}`;
        return (
          <div className="flex flex-col">
            <Text strong className="text-slate-700 text-base">{title}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>Submission ID: {record.id}</Text>
          </div>
        );
      },
    },
    {
      title: 'Submission Date',
      key: 'submitted_at',
      width: 200,
      sorter: (a, b) => new Date(a.submitted_at || a.created_at) - new Date(b.submitted_at || b.created_at),
      render: (_, record) => {
        const date = record.submitted_at || record.created_at;
        return (
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarOutlined />
            <span>{date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'}</span>
          </div>
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
          <Tag color={s.color} icon={s.icon} className="font-bold border-0 px-2 py-0.5 rounded-md text-sm">
            {s.text}
          </Tag>
        );
      },
    },
    {
      title: 'Result',
      key: 'score',
      align: 'center',
      width: 180,
      render: (_, record) => {
        const isGraded = record.status?.toUpperCase() === 'GRADED';
        const scoreVal = record.total_score ?? record.score ?? 0;
        const cefr = record.cefr_level || 'N/A';

        if (!isGraded) {
          return <Text type="secondary" className="italic text-sm">Awaiting Score</Text>;
        }

        return (
          <div className="flex flex-col items-center gap-1.5">
            <Tag className="font-bold px-3 py-1 rounded-full border-0 bg-purple-50 text-purple-600 m-0 text-sm">
              {scoreVal} / 50
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
          className="bg-purple-600 hover:bg-purple-500 border-none rounded-lg font-semibold shadow-md shadow-purple-200"
          // 🔥 TRUYỀN SUBMISSION ID THAY VÌ TEST_ID ĐỂ KHÔNG BỊ VĂNG LỖI 404
          onClick={() => handleViewResult(record.id)} 
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Content style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>

        {/* NÚT BACK */}
        <button
          onClick={handleGoBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 999, border: '1px solid #e2e8f0', background: '#fff',
            color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            marginBottom: 24,
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#9333ea'; e.currentTarget.style.borderColor = '#d8b4fe'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <ArrowLeftOutlined />
          Back
        </button>

        {/* BANNER */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200">
              <HistoryOutlined style={{ fontSize: 32 }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
                Speaking Test History
              </Title>
              <Text className="text-slate-500 text-base">
                Track your progress, recordings, and teacher feedback.
              </Text>
            </div>
          </div>

          {/* Mini Stats (Sử dụng object stats từ Hook) */}
          {stats && (
            <Card className="rounded-2xl border-purple-100 bg-purple-50/50 shadow-sm" styles={{ body: { padding: '12px 24px' } }}>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Text className="block text-[10px] uppercase font-bold text-purple-600 mb-1">Total Submissions</Text>
                  <Text className="text-xl font-black text-purple-800">{stats.totalSubmissions}</Text>
                </div>
                <div className="w-px h-10 bg-purple-200"></div>
                <div className="text-center">
                  <Text className="block text-[10px] uppercase font-bold text-purple-600 mb-1">Graded Tests</Text>
                  <Text className="text-xl font-black text-purple-800">{stats.gradedSubmissions}</Text>
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
              image={<AudioOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />}
              description={<Text type="secondary" className="text-lg">You have not taken any Speaking tests yet.</Text>}
            />
            <Button
              type="primary"
              size="large"
              className="mt-6 bg-purple-600 hover:bg-purple-500 border-none h-12 px-8 rounded-xl font-bold shadow-md shadow-purple-200"
              onClick={handleGoBack}
            >
              Start Practice
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

export default SpeakingAptisHistoryPage;
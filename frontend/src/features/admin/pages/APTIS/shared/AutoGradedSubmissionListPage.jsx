import React, { useMemo } from 'react';
import {
  Table, Tag, Button, Space, Card, Typography,
  Input, Row, Col, Avatar, Tooltip, Badge
} from 'antd';
import {
  EyeOutlined, SearchOutlined,
  CheckCircleOutlined, UserOutlined,
  FolderOpenOutlined, SafetyCertificateOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useAutoGradedSubmissionList } from '../../../hooks/APTIS/useAutoGradedSubmissionList';

const { Title, Text } = Typography;

const SKILL_CONFIG = {
  listening: {
    label: 'Listening',
    color: '#10B981',
    accent: '#ECFDF5',
    border: '#D1FAE5',
    icon: '🎧',
    totalLabel: '/50',
    scoreKey: 'score',
  },
  reading: {
    label: 'Reading',
    color: '#F59E0B',
    accent: '#FFFBEB',
    border: '#FDE68A',
    icon: '📖',
    totalLabel: '/50',
    scoreKey: 'score',
  },
  grammar_vocab: {
    label: 'Grammar & Vocabulary',
    color: '#4F46E5',
    accent: '#EEF2FF',
    border: '#C7D2FE',
    icon: '📝',
    totalLabel: '/50',
    scoreKey: 'total_score',
  },
};

const getAvatarColor = (name) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#1677ff'];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
};

/**
 * Generic Submission List Page cho 3 kỹ năng auto-graded (view-only)
 * Props:
 *   - skill: 'listening' | 'reading' | 'grammar_vocab'
 *   - api: API object với method getAllSubmissions + getSubmissionDetail
 *   - detailRoute: '/admin/aptis/submissions/listening' v.v.
 */
const AutoGradedSubmissionListPage = ({ skill, api, detailRoute }) => {
  const cfg = SKILL_CONFIG[skill];
  const {
    loading, data, pagination, setPagination,
    stats, searchText, setSearchText, handleViewDetail,
  } = useAutoGradedSubmissionList(api, detailRoute);

  const columns = useMemo(() => [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => {
        const user = record.user;
        const name = user?.full_name || 'Anonymous';
        return (
          <Space>
            <Avatar style={{ backgroundColor: getAvatarColor(name) }}>
              {name !== 'Anonymous' ? name.charAt(0).toUpperCase() : <UserOutlined />}
            </Avatar>
            <div>
              <Text strong className="block leading-tight text-gray-800">{name}</Text>
              <Text type="secondary" className="text-xs">{user?.email || 'N/A'}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Test',
      key: 'test',
      render: (_, record) => (
        <Text className="font-medium text-gray-700">
          {record.test?.title || `Test #${record.test_id}`}
        </Text>
      ),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submitted_at',
      render: (date) => date ? (
        <div>
          <Text className="block text-gray-700">{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" className="text-xs">{dayjs(date).format('HH:mm')}</Text>
        </div>
      ) : <Text type="secondary">—</Text>,
    },
    {
      title: 'Score',
      align: 'center',
      render: (_, record) => {
        const score = skill === 'grammar_vocab'
          ? record.total_score
          : record.score;
        const graded = score !== null && score !== undefined;
        return graded ? (
          <Tooltip title={skill === 'grammar_vocab' ? `Grammar: ${record.grammar_score} · Vocab: ${record.vocab_score}` : undefined}>
            <div className="text-center">
              <span className="text-lg font-bold" style={{ color: cfg.color }}>{score}</span>
              <span className="text-gray-400 font-medium">{cfg.totalLabel}</span>
              {skill === 'grammar_vocab' && (
                <div className="text-[10px] text-gray-400 mt-0.5">
                  G:{record.grammar_score} · V:{record.vocab_score}
                </div>
              )}
            </div>
          </Tooltip>
        ) : <Text type="secondary" italic>—</Text>;
      },
    },
    {
      title: 'Status',
      align: 'center',
      render: (_, record) => {
        const status = record.status || 'GRADED';
        return (
          <Tag
            color="success"
            icon={<CheckCircleOutlined />}
            className="rounded-full border-0 font-semibold"
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      align: 'right',
      render: (_, record) => (
        <Tooltip title="View result (read-only)">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
            className="rounded-xl font-semibold shadow-sm border-0"
            style={{ background: cfg.color, color: '#fff' }}
          >
            View Result
          </Button>
        </Tooltip>
      ),
    },
  ], [handleViewDetail, skill, cfg]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
        <div>
          <Title level={3} className="mb-1 font-bold" style={{ color: cfg.color }}>
            <span className="mr-2">{cfg.icon}</span> {cfg.label} Submissions
          </Title>
          <Text className="text-gray-500">
            Admin view-only · Standalone practice submissions · Auto-graded
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            count={<InfoCircleOutlined style={{ color: cfg.color }} />}
            style={{ backgroundColor: cfg.accent }}
          />
          <Text className="text-xs text-gray-400 italic">Read-only access</Text>
        </div>
      </div>

      {/* STATS */}
      <Row gutter={24} className="mb-6">
        <Col span={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-gray-200 relative overflow-hidden">
            <FolderOpenOutlined className="absolute -right-4 -bottom-4 text-7xl text-gray-100" />
            <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Total Submissions</Text>
            <div className="mt-1"><span className="text-3xl font-black text-gray-800">{stats.total}</span></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl border relative overflow-hidden"
            style={{ borderColor: cfg.border, background: cfg.accent }}>
            <SafetyCertificateOutlined className="absolute -right-4 -bottom-4 text-7xl opacity-10" style={{ color: cfg.color }} />
            <Text className="font-bold text-xs uppercase tracking-wider" style={{ color: cfg.color }}>Auto-graded</Text>
            <div className="mt-1"><span className="text-3xl font-black" style={{ color: cfg.color }}>{stats.total}</span></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl border border-blue-100 bg-blue-50 relative overflow-hidden">
            <InfoCircleOutlined className="absolute -right-4 -bottom-4 text-7xl text-blue-100" />
            <Text className="text-blue-600 font-bold text-xs uppercase tracking-wider">Access Level</Text>
            <div className="mt-1 text-sm font-bold text-blue-700">View Only</div>
            <div className="text-[10px] text-blue-400">No editing allowed</div>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Card className="shadow-sm rounded-2xl border-0 overflow-hidden" styles={{ body: { padding: '16px 24px' } }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <Text className="font-semibold text-gray-600">All submissions ({stats.total} total)</Text>
          <Input
            placeholder="Search by student name, email or test..."
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-72 rounded-full"
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize })),
            showTotal: (total) => `Total ${total} records`,
          }}
          size="middle"
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </Card>
    </div>
  );
};

export default AutoGradedSubmissionListPage;

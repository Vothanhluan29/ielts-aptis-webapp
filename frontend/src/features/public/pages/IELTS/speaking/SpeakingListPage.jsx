import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Row, Col, Skeleton, Empty, Space, Radio, Input } from 'antd';
import {
  Mic, Clock, CheckCircle,
  AlertCircle, ArrowRight, History, Search, RotateCcw
} from 'lucide-react';
import { useSpeakingList } from '../../../hooks/IELTS/speaking/useSpeakingList';

const { Title, Paragraph, Text } = Typography;

const SpeakingListPage = () => {
  const navigate = useNavigate();
  const { filteredTests, loading, searchTerm, setSearchTerm, filter, setFilter } = useSpeakingList();

  // ─── Status config ────────────────────────────────────────────────────────────
  const getStatusConfig = (status, testId) => {
    const s = status?.toUpperCase();

    if (['GRADED', 'COMPLETED', 'FINISHED'].includes(s)) {
      return {
        tagColor: 'success',
        text: 'Completed',
        icon: <CheckCircle size={14} className="mr-1" />,
        mainBtnText: 'View History',
        mainBtnAction: () => navigate(`/speaking/history`),
        isStartBtn: false,
        showRetry: true,
        // Emerald
        cardBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
        cardBorder: '#86efac',
        hoverBg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 60%, #a7f3d0 100%)',
        retryColor: '#16a34a',
        retryBorder: '#86efac',
        retryBg: '#f0fdf4',
      };
    }

    if (['SUBMITTED', 'GRADING', 'PENDING', 'ERROR'].includes(s)) {
      return {
        tagColor: 'warning',
        text: 'Pending Review',
        icon: <Clock size={14} className="mr-1" />,
        mainBtnText: 'View History',
        mainBtnAction: () => navigate(`/speaking/history`),
        isStartBtn: false,
        showRetry: true,
        // Amber
        cardBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)',
        cardBorder: '#fcd34d',
        hoverBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 60%, #fcd34d 100%)',
        retryColor: '#d97706',
        retryBorder: '#fcd34d',
        retryBg: '#fffbeb',
      };
    }

    if (s === 'IN_PROGRESS') {
      return {
        tagColor: 'processing',
        text: 'In Progress',
        icon: <Clock size={14} className="mr-1" />,
        mainBtnText: 'Continue Test',
        mainBtnAction: () => navigate(`/speaking/exam/${testId}`),
        isStartBtn: false,
        showRetry: false,
        // Sky
        cardBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 60%, #bae6fd 100%)',
        cardBorder: '#7dd3fc',
        hoverBg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 60%, #93c5fd 100%)',
      };
    }

    return {
      tagColor: 'purple',
      text: 'Not Started',
      icon: <AlertCircle size={14} className="mr-1" />,
      mainBtnText: 'Start Test',
      mainBtnAction: () => navigate(`/speaking/exam/${testId}`),
      isStartBtn: true,
      showRetry: false,
      // Indigo/violet
      cardBg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 60%, #ddd6fe 100%)',
      cardBorder: '#c4b5fd',
      hoverBg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 60%, #c4b5fd 100%)',
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-in fade-in duration-500 font-sans bg-transparent">

      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <Mic size={32} strokeWidth={2.5} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 650, color: '#1e293b' }}>
              IELTS Speaking Practice
            </Title>
            <Text className="text-slate-500 font-medium">
              Improve your fluency with AI-powered scoring and feedback
            </Text>
          </div>
        </div>

        <Space size="middle" wrap>
          <Input
            prefix={<Search size={16} className="text-slate-400" />}
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg h-10 w-full sm:w-48 lg:w-64 border-slate-200 bg-white"
            allowClear
          />

          <Radio.Group
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="custom-radio-group"
          >
            <Radio.Button value="ALL">All</Radio.Button>
            <Radio.Button value="NOT_STARTED">New</Radio.Button>
            <Radio.Button value="COMPLETED">Completed</Radio.Button>
          </Radio.Group>

          <Button
            icon={<History size={18} />}
            onClick={() => navigate('/speaking/history')}
            className="flex items-center gap-2 rounded-lg font-bold border-slate-200 hover:text-indigo-600 shadow-sm h-10"
          >
            History
          </Button>
        </Space>
      </div>

      {/* ═══════════════ CONTENT ═══════════════ */}

      {loading ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} md={12} lg={8} key={i}>
              <Card className="rounded-3xl border-slate-100">
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>

      ) : filteredTests.length === 0 ? (
        <Empty
          className="mt-20"
          description={
            <Text type="secondary" style={{ fontSize: 16 }}>
              No tests found matching your criteria.
            </Text>
          }
        />

      ) : (
        <Row gutter={[24, 24]}>
          {filteredTests.map((test) => {
            const config = getStatusConfig(test.status, test.id);

            return (
              <Col xs={24} md={12} lg={8} key={test.id}>
                <Card
                  hoverable
                  className="h-full flex flex-col rounded-3xl shadow-sm transition-all duration-300"
                  style={{ background: config.cardBg, borderColor: config.cardBorder, borderWidth: 1.5 }}
                  styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' } }}
                  onMouseEnter={e => { e.currentTarget.style.background = config.hoverBg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = config.cardBg; }}
                >
                  {/* Status tag + time badge */}
                  <div className="flex justify-between items-center mb-4">
                    <Tag
                      color={config.tagColor}
                      className="flex items-center gap-1 px-3 py-1 m-0 rounded-lg font-bold border-0"
                    >
                      {config.icon}
                      {config.text}
                    </Tag>

                    <Space className="text-slate-400 text-xs font-bold bg-white/70 px-2 py-1 rounded-md border border-white/80">
                      <Clock size={12} />
                      {test.time_limit || 15} Mins
                    </Space>
                  </div>

                  {/* Title + description */}
                  <div className="flex-1 mb-6">
                    <Title
                      level={4}
                      className="line-clamp-1"
                      style={{ marginTop: 0, marginBottom: 8, fontWeight: 800 }}
                    >
                      {test.title}
                    </Title>
                    <Paragraph className="text-slate-500 line-clamp-2 m-0" style={{ fontSize: 13 }}>
                      {test.description || 'Includes Part 1, Part 2, and Part 3 with real-time AI feedback and band score prediction.'}
                    </Paragraph>
                  </div>

                  {/* Action buttons — same structure as AptisListPage */}
                  <div className="flex flex-col gap-2">
                    <Button
                      type={config.isStartBtn ? 'primary' : 'default'}
                      size="large"
                      block
                      onClick={config.mainBtnAction}
                      className={`h-11 rounded-xl font-bold flex items-center justify-center gap-2 ${config.isStartBtn ? 'bg-indigo-600' : 'bg-white/80'}`}
                    >
                      {config.mainBtnText}
                      <ArrowRight size={18} />
                    </Button>

                    {config.showRetry && (
                      <Button
                        icon={<RotateCcw size={16} />}
                        block
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/speaking/exam/${test.id}`);
                        }}
                        style={{
                          color: config.retryColor,
                          borderColor: config.retryBorder,
                          backgroundColor: config.retryBg,
                        }}
                        className="h-11 rounded-xl font-semibold"
                      >
                        Retry Test
                      </Button>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

    </div>
  );
};

export default SpeakingListPage;
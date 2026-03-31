import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Row, Col, Skeleton, Empty, Space, Radio, Input } from 'antd';
import {
  AppstoreOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, ArrowRightOutlined, HistoryOutlined, 
  SearchOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useExamList } from '../../../hooks/IELTS/exam/useExamList';

const { Title, Paragraph, Text } = Typography;

const ExamListPage = () => {
  const navigate = useNavigate();
  const {
    exams: filteredExams,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    handleAction 
  } = useExamList();

  const getStatusConfig = (userStatus, exam) => {
    const s = userStatus?.toUpperCase();

    if (s === 'COMPLETED') {
      return {
        tagColor: 'success',
        text: 'Completed',
        icon: <CheckCircleOutlined className="mr-1" />,
        mainBtnText: 'View Result',
        mainBtnAction: () => handleAction(exam), // 🔥 Trả quyền điều hướng cho Hook
        isStartBtn: false,
        showRetry: true,
        cardBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
        cardBorder: '#86efac',
        hoverBg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 60%, #a7f3d0 100%)',
        retryColor: '#16a34a',
        retryBorder: '#86efac',
        retryBg: '#f0fdf4',
      };
    }

    if (s === 'IN_PROGRESS') {
      return {
        tagColor: 'warning',
        text: exam.current_step ? `In Progress · ${exam.current_step}` : 'In Progress',
        icon: <ClockCircleOutlined className="mr-1" />,
        mainBtnText: 'Resume Test',
        mainBtnAction: () => handleAction(exam), // 🔥 Trả quyền điều hướng cho Hook
        isStartBtn: false,
        showRetry: false,
        cardBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)',
        cardBorder: '#fcd34d',
        hoverBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 60%, #fcd34d 100%)',
      };
    }

    // NOT_STARTED — Purple: Full Test brand color
    return {
      tagColor: 'purple',
      text: 'Not Started',
      icon: <ExclamationCircleOutlined className="mr-1" />,
      mainBtnText: 'Start Test',
      mainBtnAction: () => handleAction(exam), // 🔥 Trả quyền điều hướng cho Hook
      isStartBtn: true,
      showRetry: false,
      cardBg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 60%, #e9d5ff 100%)',
      cardBorder: '#d8b4fe',
      hoverBg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 60%, #d8b4fe 100%)',
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans bg-transparent">

      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center">
            <AppstoreOutlined style={{ fontSize: '32px' }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
              IELTS Full Test Simulation
            </Title>
            <Text className="text-slate-500 font-medium">
              Complete mock exam covering all 4 skills with real timing
            </Text>
          </div>
        </div>

        <Space size="middle" wrap>
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search full exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl h-10 w-full sm:w-48 lg:w-64 border-slate-200 bg-white shadow-sm"
            allowClear
          />

          <Radio.Group
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="shadow-sm"
          >
            <Radio.Button value="ALL" className="rounded-l-xl">All</Radio.Button>
            <Radio.Button value="NOT_STARTED">New</Radio.Button>
            <Radio.Button value="IN_PROGRESS">In Progress</Radio.Button>
            <Radio.Button value="COMPLETED" className="rounded-r-xl">Completed</Radio.Button>
          </Radio.Group>

          <Button
            icon={<HistoryOutlined />}
            onClick={() => navigate('/exam/history')}
            className="flex items-center gap-2 rounded-xl font-bold border-slate-200 hover:text-indigo-600 shadow-sm h-10"
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
              <Card className="rounded-3xl border-slate-100 shadow-sm h-48">
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>

      ) : filteredExams.length === 0 ? (
        <Empty
          className="mt-20 p-10 bg-white rounded-3xl shadow-sm border border-slate-100"
          description={
            <Text type="secondary" className="text-base font-medium">
              No exams found matching your criteria.
            </Text>
          }
        />

      ) : (
        <Row gutter={[24, 24]}>
          {filteredExams.map((exam) => {
            const config = getStatusConfig(exam.user_status, exam);

            return (
              <Col xs={24} md={12} lg={8} key={exam.id}>
                <Card
                  hoverable
                  className="h-full flex flex-col rounded-3xl shadow-sm transition-all duration-300"
                  style={{ background: config.cardBg, borderColor: config.cardBorder, borderWidth: 1.5 }}
                  styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' } }}
                  onMouseEnter={e => { e.currentTarget.style.background = config.hoverBg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = config.cardBg; }}
                >
                  {/* Status tag + skills badge */}
                  <div className="flex justify-between items-center mb-4">
                    <Tag
                      color={config.tagColor}
                      className="flex items-center gap-1 px-3 py-1.5 m-0 rounded-lg font-bold border-0 shadow-sm"
                    >
                      {config.icon}
                      {config.text}
                    </Tag>

                    <Space className="text-slate-500 text-xs font-bold bg-white/60 px-2.5 py-1 rounded-lg border border-white shadow-sm">
                      <AppstoreOutlined />
                      4 Skills
                    </Space>
                  </div>

                  {/* Title + description */}
                  <div className="flex-1 mb-6">
                    <Title level={4} className="line-clamp-1 mt-0! mb-2! font-bold! text-slate-800">
                      {exam.title}
                    </Title>
                    <Paragraph className="text-slate-600 line-clamp-2 m-0 text-sm font-medium">
                      {exam.description || 'Complete IELTS mock exam with Listening, Reading, Writing and Speaking sections.'}
                    </Paragraph>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      type={config.isStartBtn ? 'primary' : 'default'}
                      size="large"
                      block
                      onClick={config.mainBtnAction}
                      className={`h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm ${config.isStartBtn ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-white hover:border-indigo-400 hover:text-indigo-600'}`}
                    >
                      {config.mainBtnText}
                      <ArrowRightOutlined />
                    </Button>

                    {config.showRetry && (
                      <Button
                        icon={<ReloadOutlined />}
                        block
                        onClick={(e) => {
                          e.stopPropagation();
                          // Nút Retry bắt buộc phải vào Lobby để tạo lượt thi MỚI
                          navigate(`/exam/lobby/${exam.id}`);
                        }}
                        style={{
                          color: config.retryColor,
                          borderColor: config.retryBorder,
                          backgroundColor: config.retryBg,
                        }}
                        className="h-12 rounded-xl font-bold shadow-sm"
                      >
                        Retake Test
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

export default ExamListPage;
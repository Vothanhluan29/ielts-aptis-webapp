import React from 'react';
import { Card, Button, Tag, Typography, Row, Col, Skeleton, Empty, Space, Radio } from 'antd';
import { 
  Mic, Clock, CheckCircle, 
  AlertCircle, ArrowRight, History, RotateCcw 
} from 'lucide-react';

// Nhúng Custom Hook vào
import { useSpeakingAptisList } from './useSpeakingAptisList';

const { Title, Paragraph, Text } = Typography;

const SpeakingAptisListPage = () => {

  const { 
    loading, 
    filterStatus, 
    setFilterStatus, 
    filteredTests, 
    handleNavigateHistory, 
    handleNavigateLobby, 
    handleNavigateResult 
  } = useSpeakingAptisList();


  const getStatusConfig = (status, testId) => {
    const s = status?.toUpperCase();
    
    switch (s) {
      case 'GRADED':
      case 'COMPLETED':
        return {
          tagColor: 'success',
          text: 'Graded',
          icon: <CheckCircle size={14} className="mr-1" />,
          mainBtnText: 'View History',
          mainBtnAction: handleNavigateHistory,
          showRetry: true
        };

      case 'PENDING':
      case 'GRADING':
      case 'SUBMITTED':
        return {
          tagColor: 'warning',
          text: 'Pending Review',
          icon: <Clock size={14} className="mr-1" />,
          mainBtnText: 'Review Submission',
          mainBtnAction: () => handleNavigateResult(testId),
          showRetry: true
        };

      default:
        return {
          tagColor: 'purple',
          text: 'Not Started',
          icon: <AlertCircle size={14} className="mr-1" />,
          mainBtnText: 'Start Test',
          mainBtnAction: () => handleNavigateLobby(testId), 
          showRetry: false
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-in fade-in duration-500">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
            <Mic size={32} strokeWidth={2.5} />
          </div>

          <div>
            <Title level={2} className="m-0! font-extrabold! text-slate-800">
              Aptis Speaking Practice
            </Title>
            <Text className="text-slate-500 font-medium">
              Practice speaking based on the British Council structure
            </Text>
          </div>
        </div>

        <Space size="middle" wrap>
          {/* STATUS FILTER */}
          <Radio.Group 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="custom-radio-group"
          >
            <Radio.Button value="ALL">All</Radio.Button>
            <Radio.Button value="NOT_STARTED">Not Started</Radio.Button>
            <Radio.Button value="PENDING">Pending</Radio.Button>
            <Radio.Button value="GRADED">Completed</Radio.Button>
          </Radio.Group>

          <Button 
            icon={<History size={18} />} 
            onClick={handleNavigateHistory}
            className="flex items-center gap-2 rounded-lg font-bold border-slate-200 hover:text-indigo-600 shadow-sm h-10"
          >
            History
          </Button>
        </Space>
      </div>

      {/* ================= CONTENT SECTION ================= */}
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
          description={<Text type="secondary" className="text-base">No tests found matching the selected filter.</Text>}
        />

      ) : (
        <Row gutter={[24, 24]}>
          {filteredTests.map((test) => {
            const config = getStatusConfig(test.status, test.id);

            return (
              <Col xs={24} md={12} lg={8} key={test.id}>
                <Card 
                  hoverable
                  className="h-full flex flex-col rounded-3xl border-slate-200 shadow-sm transition-all duration-300 hover:shadow-indigo-100/60 hover:border-indigo-200"
                  styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' } }}
                >
                  {/* STATUS + TIME */}
                  <div className="flex justify-between items-center mb-4">
                    <Tag color={config.tagColor} className="flex items-center gap-1 px-3 py-1 m-0 rounded-lg font-bold border-0">
                      {config.icon}
                      {config.text}
                    </Tag>

                    <Space className="text-slate-400 text-xs font-bold bg-slate-50 px-2 py-1 rounded-md">
                      <Clock size={12} />
                      {test.time_limit || 12} Minutes
                    </Space>
                  </div>

                  {/* INFO */}
                  <div className="flex-1 mb-6">
                    <Title level={4} className="line-clamp-1 mt-0! mb-2! font-extrabold!">
                      {test.title}
                    </Title>
                    <Paragraph className="text-slate-500 line-clamp-2 m-0 text-[13px]">
                      {test.description || 'Practice all four Speaking parts following the Aptis standard.'}
                    </Paragraph>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      type={test.status === 'NOT_STARTED' || !test.status ? 'primary' : 'default'}
                      size="large"
                      block
                      onClick={config.mainBtnAction}
                      className={`h-11 rounded-xl font-bold flex items-center justify-center gap-2 ${
                        test.status === 'NOT_STARTED' || !test.status
                          ? 'bg-indigo-600 hover:bg-indigo-500 border-none'
                          : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                      }`}
                    >
                      {config.mainBtnText}
                      <ArrowRight size={18} />
                    </Button>

                    {/* RETRY BUTTON */}
                    {config.showRetry && (
                      <Button 
                        icon={<RotateCcw size={16} />}
                        block
                        className="h-11 rounded-xl font-semibold text-slate-500 border-slate-200 hover:text-orange-500 hover:border-orange-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateLobby(test.id);
                        }}
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

export default SpeakingAptisListPage;
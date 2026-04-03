import React from 'react';
import { Layout, Button, Typography, Spin, Space, Card, Divider, Alert, Row, Col } from 'antd';
import { 
  PlayCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleFilled,
  WarningOutlined,
  ReadOutlined,
  FileTextOutlined
} from '@ant-design/icons';

// Nhúng Custom Hook
import { useReadingAptisLobby } from '../../../hooks/APTIS/reading/useReadingAptisLobby';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ReadingAptisLobbyPage = () => {
  const {
    loading,
    testDetail,
    totalQuestions,
    timeLimit,
    handleStartTest,
    handleGoBack
  } = useReadingAptisLobby();

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Space orientation="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary" className="font-medium text-lg">Preparing the test room...</Text>
        </Space>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!testDetail) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-center p-4">
        <Space orientation="vertical">
          <WarningOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <Title level={4}>Test not found</Title>
          <Button type="primary" onClick={handleGoBack}>
            Back to list
          </Button>
        </Space>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      <Content style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 800, width: '100%' }} className="animate-in slide-in-from-bottom-4 duration-500">
          
          <Card 
            variant="borderless" 
            style={{ borderRadius: 24, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}
            styles={{ body: { padding: '40px' } }}
          >
            {/* ICON & TITLE */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ 
                display: 'inline-flex', justifyContent: 'center', alignItems: 'center', 
                width: 80, height: 80, borderRadius: '50%', backgroundColor: '#fff7ed', color: '#f97316', marginBottom: 16 
              }}>
                <ReadOutlined style={{ fontSize: 40 }} />
              </div>
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                {testDetail.title}
              </Title>
              <Text style={{ fontSize: 16, color: '#64748b', marginTop: 8, display: 'block' }}>
                Get ready before the timer starts
              </Text>
            </div>

            {/* TEST INFORMATION */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={12}>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ClockCircleOutlined style={{ fontSize: 28, color: '#f97316' }} />
                  <div>
                    <Text type="secondary" style={{ display: 'block', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Time Limit
                    </Text>
                    <Text strong style={{ fontSize: 20, color: '#0f172a' }}>
                      {timeLimit} Minutes
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <FileTextOutlined style={{ fontSize: 28, color: '#f59e0b' }} />
                  <div>
                    <Text type="secondary" style={{ display: 'block', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total Questions
                    </Text>
                    <Text strong style={{ fontSize: 20, color: '#0f172a' }}>
                      {totalQuestions > 0 ? totalQuestions : 'Multiple'} Questions
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider dashed />

            {/* DETAILED INSTRUCTIONS */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16, color: '#334155' }}>
                Aptis Reading Test Instructions:
              </Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#f97316', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Test layout:</Text> The screen is split into two panels — the reading passage on the left and the corresponding questions on the right for easy reference.
                  </Paragraph>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#f97316', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Time management:</Text> The Reading test can be lengthy. Apply <em>Skimming</em> (reading for main ideas) and <em>Scanning</em> (searching for keywords) techniques to manage your time effectively.
                  </Paragraph>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#f97316', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Auto-submit:</Text> The countdown begins as soon as you press Start. When the timer reaches 0, your answers will be submitted automatically.
                  </Paragraph>
                </div>
              </Space>
            </div>

            {/* IMPORTANT WARNING */}
            <Alert
              title={<Text strong>Important Notice</Text>}
              description="The timer will start counting down immediately after you press the Start button. Please do not refresh the page (F5) or close the browser during the test to avoid losing your data."
              type="warning"
              showIcon
              style={{ borderRadius: 12, backgroundColor: '#fffbeb', borderColor: '#fef08a' }}
            />

            {/* NÚT BACK & START */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40, flexWrap: 'wrap' }}>
              
              <Button 
                size="large" 
                onClick={handleGoBack}
                style={{ 
                  height: 56, 
                  padding: '0 32px', 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  borderRadius: 28,
                  color: '#475569',
                  borderColor: '#cbd5e1'
                }}
                className="hover:border-slate-400 hover:text-slate-700 transition-colors"
              >
                Back to List
              </Button>

              <Button 
                type="primary" 
                size="large" 
                icon={<PlayCircleOutlined />}
                onClick={handleStartTest}
                style={{ 
                  height: 56, 
                  padding: '0 48px', 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  borderRadius: 28,
                  backgroundColor: '#f97316', // Màu cam Reading
                  border: 'none',
                  boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)'
                }}
                className="hover:bg-orange-400 hover:scale-105 transition-all"
              >
                Start Test
              </Button>

            </div>

          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default ReadingAptisLobbyPage;
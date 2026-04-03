import React from 'react';
import { Layout, Button, Typography, Spin, Space, Card, Divider, Alert, Row, Col } from 'antd';
import { 
  PlayCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleFilled,
  WarningOutlined,
  CustomerServiceOutlined,
  FileDoneOutlined
} from '@ant-design/icons';

// Gọi Custom Hook vào
import { useListeningAptisLobby } from '../../../hooks/APTIS/listening/useListeningAptisLobby';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ListeningAptisLobbyPage = () => {
  const { 
    loading, 
    testDetail, 
    timeLimit, 
    totalQuestions, 
    handleStartTest, 
    handleGoBack 
  } = useListeningAptisLobby();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Space orientation="vertical" align="center">
          <Spin size="large" />
          <Text type="secondary">Preparing the test room...</Text>
        </Space>
      </div>
    );
  }

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
                width: 80, height: 80, borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', marginBottom: 16 
              }}>
                <CustomerServiceOutlined style={{ fontSize: 40 }} />
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
                  <ClockCircleOutlined style={{ fontSize: 28, color: '#3b82f6' }} />
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
                  <FileDoneOutlined style={{ fontSize: 28, color: '#8b5cf6' }} />
                  <div>
                    <Text type="secondary" style={{ display: 'block', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total Questions
                    </Text>
                    <Text strong style={{ fontSize: 20, color: '#0f172a' }}>
                      {totalQuestions} Questions
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider dashed />

            {/* DETAILED INSTRUCTIONS */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16, color: '#334155' }}>
                Aptis Listening Test Instructions:
              </Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#3b82f6', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Audio Check:</Text> Make sure your speakers or headphones are working properly and the volume is at a comfortable level.
                  </Paragraph>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#3b82f6', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Play Limit:</Text> Each audio track may only be played a maximum of <strong>2 times</strong>. Pay close attention.
                  </Paragraph>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#3b82f6', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Scoring:</Text> The test is graded automatically. You will receive your results and transcripts immediately after finishing.
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

            {/* NÚT BACK & START ĐẶT CẠNH NHAU */}
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
                  backgroundColor: '#3b82f6', // Màu xanh dương Listening
                  border: 'none',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
                }}
                className="hover:bg-blue-500 hover:scale-105 transition-all"
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

export default ListeningAptisLobbyPage;
import React from 'react';
import { Layout, Button, Typography, Spin, Space, Card, Divider, Alert, Row, Col } from 'antd';
import { 
  PlayCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleFilled,
  WarningOutlined,
  AudioOutlined,
  SettingOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

// Nhúng Custom Hook
import { useSpeakingAptisLobby } from '../../../hooks/APTIS/speaking/useSpeakingAptisLobby';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const SpeakingAptisLobbyPage = () => {
  const {
    loading,
    testDetail,
    micStatus,
    timeLimit,
    checkMicrophone,
    handleStartTest,
    handleGoBack
  } = useSpeakingAptisLobby();

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
          <WarningOutlined className="text-5xl text-amber-500" />
          <Title level={4}>Test not found</Title>
          <Button type="primary" onClick={handleGoBack}>Back to list</Button>
        </Space>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-slate-50">
      <Content className="flex justify-center px-6 py-16">
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '40px' } }}>
            
            {/* ICON & TITLE */}
            <div className="text-center mb-10">
              <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-purple-50 text-purple-500 mb-4">
                <AudioOutlined className="text-4xl" />
              </div>
              <Title level={2} className="m-0! font-extrabold! text-slate-800">
                {testDetail.title}
              </Title>
              <Text className="text-base text-slate-500 mt-2 block">
                Complete the equipment check before starting
              </Text>
            </div>

            {/* TEST INFORMATION & HARDWARE CHECK */}
            <Row gutter={[16, 16]} className="mb-10">
              {/* Col 1: Thời gian làm bài */}
              <Col xs={24} sm={12}>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 h-full">
                  <ClockCircleOutlined className="text-3xl text-purple-500" />
                  <div>
                    <Text type="secondary" className="block text-[13px] uppercase tracking-widest">Time Limit</Text>
                    <Text strong className="text-xl text-slate-800">{timeLimit} Minutes</Text>
                  </div>
                </div>
              </Col>

              {/* Col 2: Khu vực Check Mic */}
              <Col xs={24} sm={12}>
                <div className={`p-4 rounded-2xl border flex items-center justify-between h-full transition-colors ${
                  micStatus === 'success' ? 'bg-green-50 border-green-200' : 
                  micStatus === 'error' ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'
                }`}>
                  <div className="flex items-center gap-4">
                    {micStatus === 'success' ? <CheckCircleFilled className="text-3xl text-green-500" /> : 
                     micStatus === 'error' ? <CloseCircleOutlined className="text-3xl text-red-500" /> : 
                     <SettingOutlined spin={micStatus === 'checking'} className="text-3xl text-purple-500" />
                    }
                    <div>
                      <Text type="secondary" className="block text-[13px] uppercase tracking-widest">Microphone</Text>
                      <Text strong className={`text-lg ${
                        micStatus === 'success' ? 'text-green-700' : 
                        micStatus === 'error' ? 'text-red-700' : 'text-slate-800'
                      }`}>
                        {micStatus === 'success' ? 'Ready' : micStatus === 'error' ? 'Not Found' : 'Required'}
                      </Text>
                    </div>
                  </div>
                  
                  {micStatus !== 'success' && (
                    <Button 
                      type="primary" 
                      onClick={checkMicrophone} 
                      loading={micStatus === 'checking'}
                      className="bg-purple-500 hover:bg-purple-400 border-none rounded-xl font-bold"
                    >
                      Check
                    </Button>
                  )}
                </div>
              </Col>
            </Row>

            <Divider dashed />

            {/* DETAILED INSTRUCTIONS */}
            <div className="mb-10 mt-6">
              <Title level={4} className="mb-4! text-slate-700">Aptis Speaking Test Instructions:</Title>
              <Space direction="vertical" size="middle" className="w-full">
                <div className="flex items-start gap-3">
                  <CheckCircleFilled className="text-purple-500 mt-1 text-base" />
                  <Paragraph className="m-0 text-[15px] text-slate-600">
                    <Text strong>Quiet Environment:</Text> Ensure you are in a quiet room with no background noise or other people speaking.
                  </Paragraph>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled className="text-purple-500 mt-1 text-base" />
                  <Paragraph className="m-0 text-[15px] text-slate-600">
                    <Text strong>Auto-Recording:</Text> Each question has a fixed preparation time and speaking time. When the speaking time ends, the system will automatically save your audio.
                  </Paragraph>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled className="text-purple-500 mt-1 text-base" />
                  <Paragraph className="m-0 text-[15px] text-slate-600">
                    <Text strong>Clear Speech:</Text> Speak clearly and naturally at a normal volume. Do not rush or whisper.
                  </Paragraph>
                </div>
              </Space>
            </div>

            {/* IMPORTANT WARNING */}
            <Alert
              title={<Text strong>Important Notice</Text>}
              description={
                <>You <strong>MUST</strong> click the <strong>"Check"</strong> button above to allow microphone access before you can start the test. Do not refresh the page during the exam.</>
              }
              type={micStatus !== 'success' ? "error" : "warning"}
              showIcon
              className={`rounded-xl border ${micStatus !== 'success' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
            />

            {/* NÚT BACK & START */}
            <div className="flex justify-center gap-4 mt-10 flex-wrap">
              <Button 
                size="large" 
                onClick={handleGoBack}
                className="h-14 px-8 text-lg font-bold rounded-full text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-700 transition-colors"
              >
                Back to List
              </Button>

              <Button 
                type="primary" 
                size="large" 
                icon={<PlayCircleOutlined />}
                onClick={handleStartTest}
                disabled={micStatus !== 'success'} // Bắt buộc check mic
                className={`h-14 px-12 text-lg font-bold rounded-full border-none transition-all ${
                  micStatus === 'success' 
                    ? 'bg-purple-500 hover:bg-purple-400 hover:scale-105 shadow-lg shadow-purple-200 text-white' 
                    : 'bg-slate-200 text-slate-400'
                }`}
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

export default SpeakingAptisLobbyPage;
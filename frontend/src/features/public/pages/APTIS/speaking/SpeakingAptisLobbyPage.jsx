import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Card, Space, Spin, Divider, Row, Col, message, Alert } from 'antd';
import { 
  PlayCircleOutlined, 
  ClockCircleOutlined,
  CheckCircleFilled,
  WarningOutlined,
  FileDoneOutlined,
  AudioOutlined,
  SettingOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const SpeakingAptisLobbyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [testDetail, setTestDetail] = useState(null);
  
  // Trạng thái kiểm tra Micro: 'idle' | 'checking' | 'success' | 'error'
  const [micStatus, setMicStatus] = useState('idle');

  useEffect(() => {
    const fetchTestDetail = async () => {
      try {
        setLoading(true);
        const response = await speakingAptisStudentApi.getTestDetail(id);
        const data = response.data || response;
        setTestDetail(data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin đề thi:", error);
        message.error("Không thể tải thông tin đề thi. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTestDetail();
  }, [id]);

  // Hàm yêu cầu quyền truy cập Micro
  const checkMicrophone = async () => {
    try {
      setMicStatus('checking');
      // Yêu cầu trình duyệt cấp quyền thu âm
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Nếu thành công, lập tức đóng luồng stream để không giữ mic quá lâu
      stream.getTracks().forEach(track => track.stop());
      
      setMicStatus('success');
      message.success("Microphone is working perfectly!");
    } catch (err) {
      console.error("Mic error:", err);
      setMicStatus('error');
      message.error("Unable to access microphone. Please check browser permissions!");
    }
  };

  const handleStartTest = () => {
    if (micStatus !== 'success') {
      message.warning("Please check your microphone before starting the test!");
      return;
    }
    navigate(`/aptis/speaking/taking/${id}`);
  };

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

  if (!testDetail) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-center p-4">
        <Space orientation="vertical">
          <WarningOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <Title level={4}>Test not found</Title>
          <Button type="primary" onClick={() => navigate('/aptis/speaking')}>
            Back to list
          </Button>
        </Space>
      </div>
    );
  }

  const timeLimit = testDetail.time_limit || 12; // Default Aptis Speaking time is approx 12 mins
  


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
                width: 80, height: 80, borderRadius: '50%', backgroundColor: '#faf5ff', color: '#a855f7', marginBottom: 16 
              }}>
                <AudioOutlined style={{ fontSize: 40 }} />
              </div>
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                {testDetail.title}
              </Title>
              <Text style={{ fontSize: 16, color: '#64748b', marginTop: 8, display: 'block' }}>
                Complete the equipment check before starting
              </Text>
            </div>

            {/* TEST INFORMATION & HARDWARE CHECK */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {/* Col 1: Thời gian làm bài */}
              <Col xs={24} sm={12}>
                <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16, height: '100%' }}>
                  <ClockCircleOutlined style={{ fontSize: 28, color: '#a855f7' }} />
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

              {/* Col 2: Khu vực Check Mic */}
              <Col xs={24} sm={12}>
                <div style={{ 
                  padding: '16px 20px', borderRadius: 16, border: '1px solid #f1f5f9', 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%',
                  backgroundColor: micStatus === 'success' ? '#f0fdf4' : micStatus === 'error' ? '#fef2f2' : '#faf5ff',
                  borderColor: micStatus === 'success' ? '#bbf7d0' : micStatus === 'error' ? '#fecaca' : '#e9d5ff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {micStatus === 'success' ? (
                      <CheckCircleFilled style={{ fontSize: 28, color: '#10b981' }} />
                    ) : micStatus === 'error' ? (
                      <CloseCircleOutlined style={{ fontSize: 28, color: '#ef4444' }} />
                    ) : (
                      <SettingOutlined spin={micStatus === 'checking'} style={{ fontSize: 28, color: '#a855f7' }} />
                    )}
                    <div>
                      <Text type="secondary" style={{ display: 'block', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Microphone
                      </Text>
                      <Text strong style={{ 
                        fontSize: 16, 
                        color: micStatus === 'success' ? '#15803d' : micStatus === 'error' ? '#b91c1c' : '#0f172a' 
                      }}>
                        {micStatus === 'success' ? 'Ready' : micStatus === 'error' ? 'Not Found' : 'Required'}
                      </Text>
                    </div>
                  </div>
                  
                  {/* Nút check/thử lại thu nhỏ bên phải */}
                  {micStatus !== 'success' && (
                    <Button 
                      type="primary" 
                      onClick={checkMicrophone} 
                      loading={micStatus === 'checking'}
                      style={{ backgroundColor: '#a855f7', border: 'none', borderRadius: 8, fontWeight: 'bold' }}
                      className="hover:bg-purple-400"
                    >
                      Check
                    </Button>
                  )}
                </div>
              </Col>
            </Row>

            <Divider dashed />

            {/* DETAILED INSTRUCTIONS */}
            <div style={{ marginBottom: 32 }}>
              <Title level={4} style={{ marginBottom: 16, color: '#334155' }}>
                Aptis Speaking Test Instructions:
              </Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#a855f7', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Quiet Environment:</Text> Ensure you are in a quiet room with no background noise or other people speaking.
                  </Paragraph>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#a855f7', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Auto-Recording:</Text> Each question has a fixed preparation time and speaking time. When the speaking time ends, the system will automatically save your audio.
                  </Paragraph>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleFilled style={{ color: '#a855f7', marginTop: 4, fontSize: 16 }} />
                  <Paragraph style={{ margin: 0, fontSize: 15, color: '#475569' }}>
                    <Text strong>Clear Speech:</Text> Speak clearly and naturally at a normal volume. Do not rush or whisper.
                  </Paragraph>
                </div>
              </Space>
            </div>

            {/* IMPORTANT WARNING */}
            <Alert
              title={<Text strong>Important Notice</Text>}
              description={
                <>
                  You <strong>MUST</strong> click the <strong>"Check"</strong> button above to allow microphone access before you can start the test. Do not refresh the page during the exam.
                </>
              }
              type={micStatus !== 'success' ? "error" : "warning"}
              showIcon
              style={{ 
                borderRadius: 12, 
                backgroundColor: micStatus !== 'success' ? '#fef2f2' : '#fffbeb', 
                borderColor: micStatus !== 'success' ? '#fecaca' : '#fef08a' 
              }}
            />

            {/* NÚT BACK & START ĐẶT CẠNH NHAU */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40, flexWrap: 'wrap' }}>
              
              <Button 
                size="large" 
                onClick={() => navigate('/aptis/speaking')}
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
                disabled={micStatus !== 'success'} // Bắt buộc phải check mic mới cho thi
                style={{ 
                  height: 56, 
                  padding: '0 48px', 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  borderRadius: 28,
                  backgroundColor: micStatus === 'success' ? '#a855f7' : '#e2e8f0', // Màu tím Speaking
                  border: 'none',
                  boxShadow: micStatus === 'success' ? '0 4px 14px 0 rgba(168, 85, 247, 0.39)' : 'none',
                  color: micStatus === 'success' ? '#fff' : '#94a3b8'
                }}
                className={micStatus === 'success' ? "hover:bg-purple-400 hover:scale-105 transition-all" : ""}
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
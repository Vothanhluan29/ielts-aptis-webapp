import React from "react";
import { 
  Card, Button, Typography, Row, Col, 
  Spin, Space, Tag, Divider 
} from "antd";
import {
  DesktopOutlined, ClockCircleOutlined, FileTextOutlined,
  SafetyCertificateOutlined, CustomerServiceOutlined,
  AudioOutlined, CheckCircleFilled, WarningFilled,
  PlayCircleOutlined, ArrowRightOutlined
} from "@ant-design/icons";

import useExamLobby from "../../../hooks/IELTS/exam/useExamLobby";

const { Title, Text, Paragraph } = Typography;

const ExamLobbyPage = () => {
  const {
    audioRef,
    test,
    loading,
    starting,
    isAudioTested,
    isMicTested,
    micPermission,
    handleTestAudio,
    handleTestMic,
    handleStartExam,
  } = useExamLobby();

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" description="Loading exam details..." />
      </div>
    );
  }

  if (!test) return null;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Hidden Audio for Testing */}
        <audio
          ref={audioRef}
          src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
          preload="auto"
        />

        {/* HEADER */}
        <Space align="center" className="mb-8">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 flex items-center justify-center">
            <DesktopOutlined className="text-xl" />
          </div>
          <Title level={3} className="m-0! text-slate-800">
            Exam System Check
          </Title>
        </Space>

        <Row gutter={[24, 24]}>
          
          {/* ================= LEFT PANEL ================= */}
          <Col xs={24} lg={15}>
            
            {/* Exam Info Card */}
            <Card className="rounded-2xl shadow-sm border-slate-200 mb-6">
              <Tag color="geekblue" className="mb-4 font-semibold px-3 py-1 rounded-full uppercase tracking-wide border-0 bg-indigo-50 text-indigo-600">
                Official Mode
              </Tag>
              
              <Title level={2} className="mt-0! mb-4! text-slate-800">
                {test.title}
              </Title>
              
              <Paragraph className="text-lg text-slate-600 mb-6">
                {test.description ||
                  "This full mock test includes Listening, Reading, Writing and Speaking sections."}
              </Paragraph>

              <Space size="middle" wrap>
                <Tag 
                  icon={<ClockCircleOutlined />} 
                  className="px-4 py-2 text-sm border-slate-200 bg-slate-50 text-slate-700 rounded-xl"
                >
                  {test.time_limit || 180} minutes
                </Tag>
                <Tag 
                  icon={<FileTextOutlined />} 
                  className="px-4 py-2 text-sm border-slate-200 bg-slate-50 text-slate-700 rounded-xl"
                >
                  4 Skills
                </Tag>
              </Space>
            </Card>

            {/* Rules Card */}
            <Card 
              className="rounded-2xl shadow-sm border-slate-200"
              title={
                <Space>
                  <SafetyCertificateOutlined className="text-emerald-500 text-lg" />
                  <Text strong className="text-lg">Rules & Notes</Text>
                </Space>
              }
            >
              <ul className="list-disc pl-5 space-y-3 text-slate-600 text-base m-0">
                <li>Ensure a stable internet connection before starting.</li>
                <li>The Speaking section requires explicit microphone access.</li>
                <li>Your answers will be automatically saved during the test.</li>
                <li>Do not refresh the page during the exam.</li>
              </ul>
            </Card>
          </Col>

          {/* ================= RIGHT PANEL ================= */}
          <Col xs={24} lg={9}>
            <Card 
              className="rounded-2xl shadow-sm border-slate-200 sticky top-8"
              title={<Text strong className="text-lg">Device Setup</Text>}
            >
              
              {/* AUDIO CHECK */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3">
                  <Text strong className="text-slate-700">
                    <CustomerServiceOutlined className="mr-2 text-indigo-500"/> 
                    Headphones / Speaker
                  </Text>
                  {isAudioTested && <CheckCircleFilled className="text-emerald-500 text-lg" />}
                </div>
                <Button 
                  block 
                  icon={<PlayCircleOutlined />} 
                  onClick={handleTestAudio} 
                  size="large" 
                  className="rounded-xl border-slate-300 hover:border-indigo-400 hover:text-indigo-600"
                >
                  Play Sample Sound
                </Button>
              </div>

              <Divider className="my-5" />

              {/* MIC CHECK */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <Text strong className="text-slate-700">
                    <AudioOutlined className="mr-2 text-indigo-500"/> 
                    Microphone
                  </Text>
                  {isMicTested && <CheckCircleFilled className="text-emerald-500 text-lg" />}
                </div>
                <Button
                  block
                  icon={micPermission === "denied" ? <WarningFilled /> : <AudioOutlined />}
                  onClick={handleTestMic}
                  size="large"
                  danger={micPermission === "denied"}
                  className={`rounded-xl ${micPermission === 'denied' ? 'bg-red-50' : 'border-slate-300 hover:border-indigo-400 hover:text-indigo-600'}`}
                >
                  {micPermission === "denied" ? "Permission Denied" : "Test Microphone"}
                </Button>
              </div>

              {/* START EXAM ACTION */}
              <Button
                type="primary"
                size="large"
                block
                loading={starting}
                onClick={handleStartExam}
                icon={!starting && <ArrowRightOutlined />}
                iconPlacement="end"
                className="h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-base shadow-md border-0"
              >
                {starting ? 'Preparing System...' : 'Start Exam Now'}
              </Button>
              
              <div className="text-center mt-4">
                <Text type="secondary" className="text-xs">
                  By clicking Start, you agree to follow the exam regulations.
                </Text>
              </div>
            </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
};

export default ExamLobbyPage;
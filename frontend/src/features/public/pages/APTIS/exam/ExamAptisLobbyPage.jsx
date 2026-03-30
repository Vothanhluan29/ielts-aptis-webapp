import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, message, Steps, Divider, Alert, Space } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { ClipboardList, BookOpen, Headphones, PenTool, Mic } from 'lucide-react';

import examAptisStudentApi from '../../../api/APTIS/exam/examAptisStudentApi';

const { Title, Text, Paragraph } = Typography;

// Định nghĩa lộ trình 5 kỹ năng chuẩn Aptis
const APTIS_SKILLS_STEPS = [
  { id: 'GRAMMAR_VOCAB', title: 'Grammar & Vocab', icon: <ClipboardList size={20} />, time: '25 mins' },
  { id: 'READING', title: 'Reading', icon: <BookOpen size={20} />, time: '35 mins' },
  { id: 'LISTENING', title: 'Listening', icon: <Headphones size={20} />, time: '40 mins' },
  { id: 'WRITING', title: 'Writing', icon: <PenTool size={20} />, time: '50 mins' },
  { id: 'SPEAKING', title: 'Speaking', icon: <Mic size={20} />, time: '12 mins' },
];

const ExamAptisLobbyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);

  useEffect(() => {
    fetchLobbyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLobbyData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin đề thi
      const testRes = await examAptisStudentApi.getLibraryTestDetail(id);
      setTestDetail(testRes.data || testRes);

      // 2. Quét lịch sử xem có bài thi nào đang "IN_PROGRESS" của đề này không
      const historyRes = await examAptisStudentApi.getMyExamHistory();
      const history = historyRes.data || historyRes || [];
      
      const inProgressSub = history.find(
        (sub) => sub.test_id === Number(id) && sub.status === 'IN_PROGRESS'
      );
      
      if (inProgressSub) {
        // Nếu có, gọi API lấy chi tiết progress hiện tại
        const progressRes = await examAptisStudentApi.getCurrentProgress(inProgressSub.id);
        setActiveSubmission(progressRes.data || progressRes);
      }

    } catch (error) {
      console.error("Lobby Error:", error);
      message.error("Không thể tải dữ liệu phòng thi!");
      navigate('/aptis/exam');
    } finally {
      setLoading(false);
    }
  };

  // Logic lấy URL để điều hướng vào Layout thi Full Test
  const getSkillUrl = (stepId, submissionId) => {
    // Không cần routeMap nữa vì Full Test dùng chung 1 Layout duy nhất
    return `/aptis/exam/taking/${submissionId}`;
  };

  const handleStartOrResume = async () => {
    setStarting(true);
    try {
      if (activeSubmission) {
        // Tình huống 1: Resume bài đang làm dở
        const currentStep = activeSubmission.current_step || 'GRAMMAR_VOCAB';
        message.info(`Tiếp tục bài thi ở phần: ${currentStep.replace('_', ' ')}`);
        navigate(getSkillUrl(currentStep, activeSubmission.id));
      } else {
        // Tình huống 2: Bắt đầu bài thi mới tinh
        const startRes = await examAptisStudentApi.startExam(id);
        const newSubmission = startRes.data || startRes;
        message.success("Bắt đầu bài thi Full Test!");
        navigate(getSkillUrl('GRAMMAR_VOCAB', newSubmission.id));
      }
    } catch (error) {
      console.error("Start Error:", error);
      message.error("Không thể khởi tạo bài thi. Vui lòng thử lại!");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spin size="large" />
        <Text className="mt-4 text-slate-500 font-medium">Đang chuẩn bị phòng thi...</Text>
      </div>
    );
  }

  if (!testDetail) return null;

  // Xác định current step index cho component Steps của AntD
  let currentStepIndex = 0;
  if (activeSubmission && activeSubmission.current_step) {
    currentStepIndex = APTIS_SKILLS_STEPS.findIndex(s => s.id === activeSubmission.current_step);
    if (currentStepIndex === -1) currentStepIndex = 0;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/aptis/exam')}
        className="mb-6 font-semibold text-slate-500 hover:text-indigo-600"
      >
        Trở về danh sách
      </Button>

      <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center -mx-6 -mt-6 mb-8">
          <Title level={2} className="!text-white !m-0 !mb-2 font-black tracking-wide">
            {testDetail.title}
          </Title>
          <Text className="text-indigo-100 text-base font-medium">
            Thời gian dự kiến: ~160 Phút • 5 Kỹ năng liên tục
          </Text>
        </div>

        <div className="px-2 md:px-6">
          <Alert
            title="Hướng dẫn làm bài Full Test" // 🔥 Đã sửa message -> title
            description={
              <ul className="list-disc pl-5 mt-2 text-slate-600 space-y-1">
                <li>Bài thi gồm 5 phần liên tục. Hệ thống sẽ tự động lưu sau mỗi phần kỹ năng.</li>
                <li>Vui lòng chuẩn bị tai nghe (Earphones/Headphones) và Microphone cho phần Listening & Speaking.</li>
                <li>Nếu vô tình thoát trình duyệt, bạn có thể quay lại trang này và chọn <b>Tiếp tục thi</b>.</li>
                <li>Hệ thống có đồng hồ đếm ngược riêng cho từng kỹ năng. Hết giờ, bài sẽ tự động nộp và chuyển sang phần kế tiếp.</li>
              </ul>
            }
            type="info"
            showIcon
            className="mb-10 rounded-xl border-indigo-200 bg-indigo-50/50"
          />

          {/* 🔥 Đã sửa orientation -> titlePlacement */}
          <Divider titlePlacement="left"><Text className="text-lg font-bold text-slate-700">Lộ trình bài thi của bạn</Text></Divider>

          <div className="py-8 px-4 overflow-x-auto">
            <Steps
              current={currentStepIndex}
              items={APTIS_SKILLS_STEPS.map((skill, index) => ({
                title: <span className="font-bold text-sm">{skill.title}</span>,
                content: <span className="text-xs text-slate-500 font-medium">{skill.time}</span>, // 🔥 Đã sửa description -> content
                icon: (
                  <div className={`p-2 rounded-full ${
                    index < currentStepIndex ? 'bg-emerald-100 text-emerald-600' : 
                    index === currentStepIndex ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {skill.icon}
                  </div>
                )
              }))}
            />
          </div>

          <div className="flex flex-col items-center mt-10 mb-4">
            <Button
              type="primary"
              size="large"
              loading={starting}
              onClick={handleStartOrResume}
              icon={activeSubmission ? <ReloadOutlined /> : <PlayCircleOutlined />}
              className={`h-14 px-12 text-lg font-bold rounded-2xl shadow-lg transition-transform hover:-translate-y-1 ${
                activeSubmission 
                  ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-200' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'
              }`}
            >
              {activeSubmission ? 'TIẾP TỤC BÀI THI DANG DỞ' : 'BẮT ĐẦU BÀI THI MỚI'}
            </Button>
            {activeSubmission && (
              <Text className="mt-4 text-slate-500 font-medium">
                Hệ thống ghi nhận bạn đang dừng ở phần: <strong className="text-amber-600">{activeSubmission.current_step?.replace('_', ' ')}</strong>
              </Text>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExamAptisLobbyPage;
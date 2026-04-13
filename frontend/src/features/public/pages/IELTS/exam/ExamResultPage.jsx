import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Spin, Button, Tag } from 'antd';
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  CustomerServiceOutlined,
  ReadOutlined,
  EditOutlined,
  AudioOutlined,
  LoadingOutlined
} from '@ant-design/icons';

import { useExamResult } from '../../../hooks/IELTS/exam/useExamResult';

const { Title, Text } = Typography;

const ExamResultPage = () => {
  const navigate = useNavigate();
  // 🔥 Lược bỏ handleReviewSkill vì không còn dùng đến
  const { result, loading, overallBand } = useExamResult();

  // ============================
  // EARLY RETURNS (LOADING)
  // ============================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#4f46e5' }} spin />} />
        <Text className="text-slate-500 font-medium text-lg">
          Calculating your Band Score...
        </Text>
      </div>
    );
  }

  if (!result) return null;

  // ============================
  // DATA PREP
  // ============================
  const {
    full_test,
    listening_score,
    reading_score,
    writing_score,
    speaking_score,
    completed_at,
    start_time,
    created_at
  } = result;

  // Xử lý ngày tháng hiển thị
  const rawDate = completed_at || start_time || created_at;
  let dateStr = "—";
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    }
  }

  // Hiển thị điểm Overall (Chấp nhận cả điểm 0.0)
  const isPending = overallBand === null || overallBand === undefined || overallBand === "Pending";
  const displayOverall = !isPending ? Number(overallBand).toFixed(1) : "?";

  // ============================
  // MAIN RENDER
  // ============================
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Nút Back */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/exam/history')}
          className="text-slate-500 hover:text-indigo-600 font-semibold px-0 hover:bg-transparent"
        >
          Back to History
        </Button>

        {/* ================= HERO CARD (OVERALL SCORE) ================= */}
        <div className="relative bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-800 rounded-3xl shadow-xl border border-indigo-500 p-8 md:p-12 overflow-hidden text-white">
          
          {/* Background Decorations */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl opacity-10 pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-indigo-400 rounded-full blur-3xl opacity-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">
                <CalendarOutlined className="text-sm" />
                <span>{dateStr}</span>
              </div>

              <Title level={1} className="text-white! font-black! mb-4! text-4xl! md:text-5xl! line-clamp-2">
                {full_test?.title || "IELTS Mock Test"}
              </Title>

              {/* 🔥 Đã sửa lại câu thông báo cho phù hợp vì không còn click được nữa */}
              <p className="text-indigo-100 text-lg max-w-xl leading-relaxed m-0">
                Congratulations on completing your test! Here is your overall band score and the breakdown of your performance across all four skills.
              </p>
            </div>

            {/* Overall Band Badge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="bg-white text-indigo-900 w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-2xl ring-8 ring-indigo-500/30 transform transition-transform hover:scale-105">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Overall
                </span>
                <span className="text-6xl font-black">
                  {displayOverall}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SKILL CARDS ================= */}
        <div>
          <Title level={4} className="text-slate-700! mb-6! font-bold!">Detailed Results</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkillCard
              title="Listening"
              score={listening_score}
              icon={<CustomerServiceOutlined />}
              colorClass="text-blue-600 bg-blue-50"
            />
            <SkillCard
              title="Reading"
              score={reading_score}
              icon={<ReadOutlined />}
              colorClass="text-purple-600 bg-purple-50"
            />
            <SkillCard
              title="Writing"
              score={writing_score}
              icon={<EditOutlined />}
              colorClass="text-rose-600 bg-rose-50"
            />
            <SkillCard
              title="Speaking"
              score={speaking_score}
              icon={<AudioOutlined />}
              colorClass="text-orange-600 bg-orange-50"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================
// SUB-COMPONENT: SKILL CARD (STATIC)
// ============================
const SkillCard = ({ title, score, icon, colorClass }) => {
  const hasScore = score !== null && score !== undefined && score >= 0;

  return (
    <div 
      className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full relative overflow-hidden transition-all duration-300
        ${hasScore ? 'hover:shadow-md' : 'opacity-90'}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${colorClass}`}>
          {icon}
        </div>
      </div>

      <Text className="text-slate-500 text-sm font-bold uppercase tracking-wider block mb-1">
        {title}
      </Text>

      <div className="mt-auto pt-2">
        {hasScore ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-slate-800">
              {Number(score).toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 9.0</span>
          </div>
        ) : (
          <Tag 
            icon={<LoadingOutlined />} 
            color="warning" 
            className="px-3 py-1.5 rounded-lg font-semibold text-sm m-0 border-0"
          >
            Grading...
          </Tag>
        )}
      </div>
    </div>
  );
};

export default ExamResultPage;
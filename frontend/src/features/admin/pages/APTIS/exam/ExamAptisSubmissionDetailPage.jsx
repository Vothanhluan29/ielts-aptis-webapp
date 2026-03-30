import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Tag, message } from 'antd';
import {
  ArrowLeftOutlined, SyncOutlined, EditOutlined, AudioOutlined,
  ReadOutlined, FontColorsOutlined, ClockCircleOutlined,
  UserOutlined, SafetyCertificateOutlined, FileTextOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import examAptisAdminApi from '../../../api/APTIS/exam/examAptisAdminApi';

const SKILLS = [
  { key: 'grammar_vocab', label: 'Grammar & Vocab', icon: <FontColorsOutlined />, color: '#3B82F6', bg: '#EFF6FF', manual: false },
  { key: 'listening',     label: 'Listening',        icon: <AudioOutlined />,       color: '#10B981', bg: '#ECFDF5', manual: false },
  { key: 'reading',       label: 'Reading',           icon: <ReadOutlined />,        color: '#F59E0B', bg: '#FFFBEB', manual: false },
  { key: 'writing',       label: 'Writing',           icon: <EditOutlined />,        color: '#8B5CF6', bg: '#F5F3FF', manual: true  },
  { key: 'speaking',      label: 'Speaking',          icon: <AudioOutlined />,       color: '#EF4444', bg: '#FEF2F2', manual: true  },
];

const SkillCard = ({ skill, score, submissionId, onGrade }) => {
  const graded = score !== null && score !== undefined;
  const pct = graded ? Math.round((score / 50) * 100) : 0;

  return (
    <div className={`bg-white rounded-2xl p-5 flex flex-col gap-3 border transition-shadow hover:shadow-md ${skill.manual ? 'border-gray-300' : 'border-gray-100'}`}>
      <div className="flex justify-between items-center">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: skill.bg, color: skill.color }}>
          {skill.icon}
        </div>
        {graded
          ? <Tag color="success" className="rounded-full border-0 m-0 text-xs font-semibold">Graded</Tag>
          : submissionId
            ? <Tag color="processing" className="rounded-full border-0 m-0 text-xs font-semibold">Pending</Tag>
            : <Tag className="rounded-full border-0 m-0 text-xs font-semibold bg-gray-100 text-gray-400">Not Taken</Tag>
        }
      </div>
      <div>
        <div className="text-3xl font-semibold leading-none" style={{ color: skill.color }}>
          {graded ? score : '—'}
          <span className="text-sm font-normal text-gray-400">/50</span>
        </div>
        <div className="text-xs text-gray-400 mt-1.5">{skill.label}</div>
      </div>
      <div className="h-0.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: skill.color }} />
      </div>
      {skill.manual && (
        <button
          disabled={!submissionId}
          onClick={() => onGrade(skill.label, submissionId)}
          className="w-full py-2 rounded-lg text-xs font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: skill.color, color: '#fff', border: 'none', cursor: submissionId ? 'pointer' : 'not-allowed' }}
        >
          {graded ? 'Re-grade' : 'Grade Now'}
        </button>
      )}
    </div>
  );
};

const InfoRow = ({ label, value, valueClass = '' }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400">{label}</span>
    <span className={`text-xs font-medium text-slate-700 ${valueClass}`}>{value}</span>
  </div>
);

const ExamAptisSubmissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await examAptisAdminApi.getSubmissionDetail(id);
      setData(res.data || res);
    } catch { message.error('Unable to load submission data!'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const handleGrade = (label, subId) => {
    if (label === 'Writing') navigate(`/admin/aptis/submissions/writing/${subId}`, { state: { fromExamId: data.id } });
    else if (label === 'Speaking') navigate(`/admin/aptis/submissions/speaking/${subId}`, { state: { fromExamId: data.id } });
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Spin size="large" description="Loading submission data..." />
    </div>
  );
  if (!data) return <div className="p-10 text-center text-red-500 font-bold">Submission data not found!</div>;

  const isCompleted = data.status === 'COMPLETED';
  const overall = data.overall_score || 0;
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (overall / 250) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/aptis/submissions')}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors bg-white"
            >
              <ArrowLeftOutlined style={{ fontSize: 13 }} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isCompleted
                  ? <Tag color="success" className="rounded-full border-0 m-0 text-xs font-semibold">Completed</Tag>
                  : <Tag color="processing" className="rounded-full border-0 m-0 text-xs font-semibold">In Progress</Tag>
                }
                <span className="text-xs text-gray-300">Submission #{data.id}</span>
              </div>
              <div className="flex items-center gap-1.5 text-base font-semibold text-slate-800">
                <UserOutlined className="text-gray-300" style={{ fontSize: 14 }} />
                {data.user?.full_name || data.user?.email || `Student ID: ${data.user_id}`}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                <FileTextOutlined style={{ fontSize: 11 }} />
                {data.full_test?.title || 'Unknown Test'}
              </div>
            </div>
          </div>
          <button
            onClick={fetchDetail}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:text-slate-700 hover:border-gray-300 transition-colors bg-white"
          >
            <SyncOutlined style={{ fontSize: 12 }} /> Refresh Results
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left */}
          <div className="flex flex-col gap-5">
            {/* Score */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Overall Result</div>
              <div className="relative w-32 h-32 mx-auto my-5">
                <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="64" cy="64" r="50" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                  <circle cx="64" cy="64" r="50" stroke="#4F46E5" strokeWidth="8" fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset .8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-slate-800 leading-none">{overall}</span>
                  <span className="text-xs text-gray-400">/250</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">Total Score</div>
                  <div className="text-xl font-semibold text-slate-700">{overall}<span className="text-xs font-normal text-gray-300">/250</span></div>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#4F46E5' }}>
                  <div className="text-xs mb-1" style={{ color: '#c7d2fe' }}>CEFR</div>
                  <div className="text-2xl font-semibold text-white">{data.overall_cefr_level || '—'}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                <ClockCircleOutlined style={{ fontSize: 12 }} /> Timeline
              </div>
              <InfoRow label="Started At" value={dayjs(data.start_time).format('HH:mm – DD/MM/YYYY')} />
              <InfoRow
                label="Submitted At"
                value={data.completed_at ? dayjs(data.completed_at).format('HH:mm – DD/MM/YYYY') : 'In progress...'}
                valueClass={data.completed_at ? 'text-emerald-600' : 'text-amber-500 italic'}
              />
              <InfoRow label="Test" value={data.full_test?.title || '—'} />
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">Skill Breakdown</div>
              <div className="grid grid-cols-2 gap-4">
                {SKILLS.map(skill => (
                  <SkillCard
                    key={skill.key} skill={skill}
                    score={data[`${skill.key}_score`]}
                    submissionId={data[`${skill.key}_submission_id`]}
                    onGrade={handleGrade}
                  />
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-3">
                <InfoCircleOutlined className="text-blue-400" style={{ fontSize: 13 }} /> Examiner Guide
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-500">
                <li><span className="font-semibold text-slate-600">Grammar, Listening, Reading</span> are graded automatically by the system.</li>
                <li><span className="font-semibold text-indigo-600">Writing, Speaking</span> require manual grading — click <span className="font-semibold">"Grade Now"</span>.</li>
                <li>Once done, click <span className="font-semibold text-indigo-600">Refresh Results</span> to update the CEFR level.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamAptisSubmissionDetailPage;
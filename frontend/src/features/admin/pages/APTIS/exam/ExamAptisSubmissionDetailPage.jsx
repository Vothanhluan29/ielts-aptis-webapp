import React, { useState, useEffect } from 'react';
import { Spin, Tag, Modal } from 'antd';
import {
  ArrowLeftOutlined, SyncOutlined, EditOutlined, AudioOutlined,
  ReadOutlined, FontColorsOutlined, ClockCircleOutlined,
  UserOutlined, FileTextOutlined, InfoCircleOutlined,
  BookOutlined, TrophyOutlined, EditFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useExamAptisSubmissionDetail } from '../../../hooks/APTIS/exam/useExamAptisSubmissionDetail';

// ─── CEFR CONFIG ────────────────────────────────────────────
const CEFR_OPTIONS = [
  { value: 'A0', label: 'Beginner',            color: '#9CA3AF', bg: '#F9FAFB' },
  { value: 'A1', label: 'Elementary',           color: '#3B82F6', bg: '#EFF6FF' },
  { value: 'A2', label: 'Pre-Intermediate',     color: '#10B981', bg: '#ECFDF5' },
  { value: 'B1', label: 'Intermediate',         color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'B2', label: 'Upper-Intermediate',   color: '#8B5CF6', bg: '#F5F3FF' },
  { value: 'C',  label: 'Advanced',             color: '#EF4444', bg: '#FEF2F2' },
];
const CEFR_COLOR = { A0:'#9CA3AF', A1:'#3B82F6', A2:'#10B981', B1:'#F59E0B', B2:'#8B5CF6', C:'#EF4444' };

// ─── 4 KỸ NĂNG CHÍNH (Grammar&Vocab tách riêng phía trên) ───
const SKILLS = [
  { key: 'listening', label: 'Listening', icon: <AudioOutlined />, color: '#10B981', bg: '#ECFDF5', manual: false },
  { key: 'reading',   label: 'Reading',   icon: <ReadOutlined />,  color: '#F59E0B', bg: '#FFFBEB', manual: false },
  { key: 'writing',   label: 'Writing',   icon: <EditOutlined />,  color: '#8B5CF6', bg: '#F5F3FF', manual: true  },
  { key: 'speaking',  label: 'Speaking',  icon: <AudioOutlined />, color: '#EF4444', bg: '#FEF2F2', manual: true  },
];

// ─── SKILL CARD ──────────────────────────────────────────────
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
          {graded ? score : '—'}<span className="text-sm font-normal text-gray-400">/50</span>
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

// ─── GRAMMAR & VOCAB SECTION (điểm tách riêng, KHÔNG tính vào overall) ──
const GrammarVocabSection = ({ grammarVocabScore, grammarScore, vocabScore }) => {
  const gvGraded = grammarVocabScore !== null && grammarVocabScore !== undefined;
  const grammarPct = (grammarScore != null && gvGraded) ? Math.round((grammarScore / 25) * 100) : 0;
  const vocabPct   = (vocabScore   != null && gvGraded) ? Math.round((vocabScore   / 25) * 100) : 0;

  return (
    <div className="rounded-2xl border border-blue-100 overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#EFF6FF 0%,#F5F3FF 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-blue-100 bg-white/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background:'#EFF6FF', color:'#3B82F6' }}>
            <FontColorsOutlined />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">Grammar &amp; Vocabulary</div>
            <div className="text-xs text-gray-400">Scored separately · not added to overall</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gvGraded
            ? <Tag color="success" className="rounded-full border-0 m-0 text-xs font-semibold">Graded</Tag>
            : <Tag color="processing" className="rounded-full border-0 m-0 text-xs font-semibold">Pending</Tag>
          }
          <div className="text-2xl font-bold" style={{ color:'#4F46E5' }}>
            {gvGraded ? grammarVocabScore : '—'}<span className="text-sm font-normal text-gray-400">/50</span>
          </div>
        </div>
      </div>

      {/* 2 sub-cards */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="bg-white rounded-xl p-4 border border-blue-50 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ background:'#DBEAFE', color:'#2563EB' }}>
              <FontColorsOutlined />
            </div>
            <span className="text-xs font-semibold text-slate-600">Grammar</span>
          </div>
          <div className="text-2xl font-bold" style={{ color:'#2563EB' }}>
            {grammarScore != null ? grammarScore : '—'}<span className="text-xs font-normal text-gray-400">/25</span>
          </div>
          <div className="h-1.5 rounded-full bg-blue-50 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${grammarPct}%`, background:'linear-gradient(90deg,#3B82F6,#6366F1)' }} />
          </div>
          <div className="text-xs text-gray-400">{grammarPct}% correct</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-purple-50 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ background:'#EDE9FE', color:'#7C3AED' }}>
              <BookOutlined />
            </div>
            <span className="text-xs font-semibold text-slate-600">Vocabulary</span>
          </div>
          <div className="text-2xl font-bold" style={{ color:'#7C3AED' }}>
            {vocabScore != null ? vocabScore : '—'}<span className="text-xs font-normal text-gray-400">/25</span>
          </div>
          <div className="h-1.5 rounded-full bg-purple-50 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${vocabPct}%`, background:'linear-gradient(90deg,#8B5CF6,#A855F7)' }} />
          </div>
          <div className="text-xs text-gray-400">{vocabPct}% correct</div>
        </div>
      </div>
    </div>
  );
};

// ─── CEFR OVERRIDE MODAL ─────────────────────────────────────
const CefrOverrideModal = ({ open, loading, currentCefr, onSave, onCancel }) => {
  const [selected, setSelected] = useState(currentCefr || null);

  useEffect(() => {
    if (open) setSelected(currentCefr || null);
  }, [open, currentCefr]);

  const selOpt = CEFR_OPTIONS.find(o => o.value === selected);

  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={440} centered
      title={
        <div className="flex items-center gap-2.5 pb-1">
          <TrophyOutlined style={{ color:'#4F46E5', fontSize:18 }} />
          <span className="text-base font-semibold text-slate-800">Override CEFR Level</span>
        </div>
      }
    >
      <p className="text-xs text-gray-500 mt-2 mb-5">
        Manually set the CEFR level for this student. This overrides the auto-calculated value and
        will <strong>not</strong> be reset unless the exam status changes to Pending.
      </p>

      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {CEFR_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => setSelected(opt.value)}
            className="rounded-xl p-3 text-center border-2 transition-all duration-150 cursor-pointer"
            style={{
              borderColor: selected === opt.value ? opt.color : '#E5E7EB',
              background:  selected === opt.value ? opt.bg    : '#fff',
              transform:   selected === opt.value ? 'scale(1.05)' : 'scale(1)',
              boxShadow:   selected === opt.value ? `0 0 0 3px ${opt.color}30` : 'none',
            }}
          >
            <div className="text-xl font-bold" style={{ color: opt.color }}>{opt.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{opt.label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:border-gray-300 bg-white transition-colors">
          Cancel
        </button>
        <button
          disabled={!selected || loading}
          onClick={() => selected && onSave(selected)}
          className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: selOpt ? selOpt.color : '#4F46E5' }}
        >
          {loading ? 'Saving…' : `Set ${selected || '—'}`}
        </button>
      </div>
    </Modal>
  );
};

// ─── INFO ROW ────────────────────────────────────────────────
const InfoRow = ({ label, value, valueClass = '' }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400">{label}</span>
    <span className={`text-xs font-medium text-slate-700 ${valueClass}`}>{value}</span>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────
const ExamAptisSubmissionDetailPage = () => {
  const {
    loading, data, isCompleted, overall, circumference, offset,
    fetchDetail, handleGrade, navigate,
    cefrModalOpen, cefrLoading, handleOpenCefrModal, handleSaveCefr, setCefrModalOpen,
  } = useExamAptisSubmissionDetail();

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Spin size="large" tip="Loading submission data..." />
    </div>
  );
  if (!data) return <div className="p-10 text-center text-red-500 font-bold">Submission data not found!</div>;

  const cefrKey = data.overall_cefr_level?.toUpperCase();
  const cefrColor = CEFR_COLOR[cefrKey] || '#4F46E5';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/aptis/submissions')}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors bg-white"
            >
              <ArrowLeftOutlined style={{ fontSize:13 }} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isCompleted
                  ? <Tag color="success"    className="rounded-full border-0 m-0 text-xs font-semibold">Completed</Tag>
                  : <Tag color="processing" className="rounded-full border-0 m-0 text-xs font-semibold">In Progress</Tag>
                }
                <span className="text-xs text-gray-300">Submission #{data.id}</span>
              </div>
              <div className="flex items-center gap-1.5 text-base font-semibold text-slate-800">
                <UserOutlined className="text-gray-300" style={{ fontSize:14 }} />
                {data.user?.full_name || data.user?.email || `Student ID: ${data.user_id}`}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                <FileTextOutlined style={{ fontSize:11 }} />
                {data.full_test?.title || 'Unknown Test'}
              </div>
            </div>
          </div>
          <button onClick={fetchDetail}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:text-slate-700 hover:border-gray-300 transition-colors bg-white">
            <SyncOutlined style={{ fontSize:12 }} /> Refresh Results
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="flex flex-col gap-5">

            {/* Overall Result card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Overall Result</div>
              <div className="text-[10px] text-gray-300 mb-3">4 core skills · Grammar &amp; Vocab scored separately</div>

              {/* Circle */}
              <div className="relative w-32 h-32 mx-auto my-4">
                <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="64" cy="64" r="50" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                  <circle cx="64" cy="64" r="50" stroke="#4F46E5" strokeWidth="8" fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition:'stroke-dashoffset .8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-slate-800 leading-none">{overall}</span>
                  <span className="text-xs text-gray-400">/200</span>
                </div>
              </div>

              {/* Score + CEFR row */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-50 rounded-xl p-3 text-left">
                  <div className="text-xs text-gray-400 mb-1">Total Score</div>
                  <div className="text-xl font-semibold text-slate-700">
                    {overall}<span className="text-xs font-normal text-gray-300">/200</span>
                  </div>
                </div>

                {/* CEFR card — clickable */}
                <button onClick={handleOpenCefrModal}
                  className="rounded-xl p-3 text-left relative overflow-hidden group transition-all hover:scale-105 hover:shadow-md"
                  style={{ background: cefrColor }}
                  title="Click to override CEFR level"
                >
                  <div className="text-[10px] mb-0.5 font-medium" style={{ color:'rgba(255,255,255,0.75)' }}>CEFR Level</div>
                  <div className="text-2xl font-bold text-white leading-none">
                    {data.overall_cefr_level || '—'}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditFilled style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }} />
                  </div>
                </button>
              </div>

              {/* Admin override button */}
              <button onClick={handleOpenCefrModal}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all"
                style={{ borderColor:'#4F46E5', color:'#4F46E5', background:'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background='#EEF2FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
              >
                <TrophyOutlined style={{ fontSize:12 }} />
                Set CEFR Level
              </button>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                <ClockCircleOutlined style={{ fontSize:12 }} /> Timeline
              </div>
              <InfoRow label="Started At"    value={dayjs(data.start_time).format('HH:mm – DD/MM/YYYY')} />
              <InfoRow
                label="Submitted At"
                value={data.completed_at ? dayjs(data.completed_at).format('HH:mm – DD/MM/YYYY') : 'In progress...'}
                valueClass={data.completed_at ? 'text-emerald-600' : 'text-amber-500 italic'}
              />
              <InfoRow label="Test" value={data.full_test?.title || '—'} />
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Grammar & Vocab (tách riêng, có note "not in overall") */}
            <GrammarVocabSection
              grammarVocabScore={data.grammar_vocab_score}
              grammarScore={data.grammar_score}
              vocabScore={data.vocab_score}
            />

            {/* 4 kỹ năng chính */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">Skill Breakdown</div>
                <div className="text-xs text-gray-300">Each skill /50 · Total /200</div>
              </div>
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

            {/* Examiner Guide */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-3">
                <InfoCircleOutlined className="text-blue-400" style={{ fontSize:13 }} /> Examiner Guide
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-500">
                <li><span className="font-semibold text-blue-600">Grammar &amp; Vocabulary</span> is scored separately and <span className="font-semibold text-slate-700">not included</span> in the overall 4-skill total.</li>
                <li><span className="font-semibold text-slate-600">Listening &amp; Reading</span> are auto-graded by the system.</li>
                <li><span className="font-semibold text-indigo-600">Writing &amp; Speaking</span> require manual grading — click <span className="font-semibold">"Grade Now"</span>.</li>
                <li>Use <span className="font-semibold text-indigo-600">Set CEFR Level</span> to manually override the student's CEFR band. It will not be auto-reset after being set.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CEFR Override Modal */}
      <CefrOverrideModal
        open={cefrModalOpen}
        loading={cefrLoading}
        currentCefr={data.overall_cefr_level}
        onSave={handleSaveCefr}
        onCancel={() => setCefrModalOpen(false)}
      />
    </div>
  );
};

export default ExamAptisSubmissionDetailPage;
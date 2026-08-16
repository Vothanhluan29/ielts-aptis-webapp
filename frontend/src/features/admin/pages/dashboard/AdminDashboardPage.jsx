import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/dashboard/useAdminDashboard';
import SkillPieChart from '../../components/dashboard/SkillPieChart';
import { 
  Users, 
  UserPlus, 
  FileText, 
  FileCheck, 
  Trophy, 
  BarChart3,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  GraduationCap,
  ClipboardList,
  Library,
  PlusCircle,
  ChevronRight,
  Zap,
  TrendingUp
} from 'lucide-react';

import useAuthStore from '../../../../store/authStore';

/* ================= STAT CARDS DATA ================= */
const ALL_STAT_CARDS = [
  {
    title: 'Total Users',
    key: 'total_users',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
    aptisOnly: false,
  },
  {
    title: 'New Users Today',
    key: 'new_users_today',
    icon: UserPlus,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
    aptisOnly: false,
  },
  {
    title: 'APTIS Mock Exams',
    key: 'total_aptis_full_tests', 
    icon: Trophy,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    ring: 'ring-orange-500/20',
    aptisOnly: false,
  },
  {
    title: 'APTIS Attempts',
    key: 'total_aptis_submissions', 
    icon: BarChart3,
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    ring: 'ring-rose-500/20',
    aptisOnly: false,
  }
];

const TEACHER_STAT_CARDS = [
  {
    title: 'My Students',
    key: 'teacher_students',
    icon: Users,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
    ring: 'ring-violet-500/20',
    desc: 'Students under your management',
  },
  {
    title: 'Student Attempts',
    key: 'teacher_aptis_submissions',
    icon: BarChart3,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
    desc: 'Total test submissions',
  },
  {
    title: 'Available Tests',
    key: 'total_aptis_full_tests',
    icon: Trophy,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    ring: 'ring-orange-500/20',
    desc: 'Tests ready to assign',
  }
];

const IELTS_SKILLS = [
  { key: 'Reading', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', fill: '#3b82f6' },
  { key: 'Listening', icon: Headphones, color: 'text-teal-500', bg: 'bg-teal-500/10', fill: '#14b8a6' },
  { key: 'Writing', icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-500/10', fill: '#f59e0b' },
  { key: 'Speaking', icon: Mic, color: 'text-purple-500', bg: 'bg-purple-500/10', fill: '#8b5cf6' }
];

const APTIS_SKILLS = [
  { key: 'GrammarVocab', label: 'Grammar & Vocab', icon: GraduationCap, color: 'text-pink-500', bg: 'bg-pink-500/10', fill: '#ec4899', route: '/teacher/grammar_vocab' },
  { key: 'Reading', label: 'Reading', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', fill: '#3b82f6', route: '/teacher/reading' },
  { key: 'Listening', label: 'Listening', icon: Headphones, color: 'text-teal-500', bg: 'bg-teal-500/10', fill: '#14b8a6', route: '/teacher/listening' },
  { key: 'Writing', label: 'Writing', icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-500/10', fill: '#f59e0b', route: '/teacher/writing' },
  { key: 'Speaking', label: 'Speaking', icon: Mic, color: 'text-violet-500', bg: 'bg-violet-500/10', fill: '#8b5cf6', route: '/teacher/speaking' }
];

const QUICK_ACTIONS = [];

/* ================= COMPONENTS ================= */

const StatCard = ({ item, value }) => {
  const Icon = item.icon;
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm ring-1 ring-zinc-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-zinc-300 group flex flex-col justify-between h-[150px]">
      <div className="flex justify-between items-start">
        <span className="text-zinc-500 font-bold text-[11px] uppercase tracking-[0.15em]">
          {item.title}
        </span>
        <div className={`p-2.5 rounded-2xl ${item.bg} ${item.ring} ring-1 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={20} className={item.color} />
        </div>
      </div>
      <div>
        <h3 className="text-4xl font-black text-zinc-900 tracking-tight">
          {value ?? 0}
        </h3>
        {item.desc && (
          <p className="text-xs text-zinc-400 font-medium mt-0.5">{item.desc}</p>
        )}
      </div>
    </div>
  );
};

/* ── TEACHER WELCOME BANNER ── */
const WelcomeBanner = ({ userName }) => {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div
      className="relative overflow-hidden rounded-[24px] mb-8"
      style={{ background: 'linear-gradient(135deg, #2d3f73 0%, #445A95 50%, #5b70b0 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute top-4 right-48 w-2 h-2 rounded-full bg-white/30" />
      <div className="absolute top-10 right-36 w-1 h-1 rounded-full bg-white/20" />

      <div className="relative px-8 py-7 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium mb-1">{dateStr}</p>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
            {greeting}, {userName || 'Teacher'}! 👋
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Overview of your APTIS teaching workspace
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 flex-shrink-0">
          <GraduationCap size={40} className="text-white" />
        </div>
      </div>
    </div>
  );
};

/* ── APTIS SKILL TEST LIBRARY ROWS ── */
const SkillBankRows = ({ skills, data, navigate }) => {
  const total = skills.reduce((acc, s) => acc + (data?.[s.key] || 0), 0);

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm ring-1 ring-zinc-200/60 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-black text-zinc-800 tracking-tight">APTIS Test Library</h3>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">{total} questions total</p>
        </div>
        <div className="p-2 rounded-xl bg-[#445A95]/10">
          <Library size={16} className="text-[#445A95]" />
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {skills.map((skill) => {
          const Icon = skill.icon;
          const count = data?.[skill.key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={skill.key}
              onClick={() => skill.route && navigate(skill.route)}
              className="w-full flex items-center gap-3 p-3 rounded-[14px] hover:bg-zinc-50 group transition-all duration-200 text-left focus:outline-none hover:ring-1 hover:ring-zinc-200"
            >
              <div className={`p-2 rounded-xl ${skill.bg} flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={16} className={skill.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-bold text-zinc-700 group-hover:text-zinc-900">{skill.label || skill.key}</span>
                  <span className="text-[13px] font-black text-zinc-800 tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: skill.fill }}
                  />
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── QUICK ACTIONS ── */
const QuickActions = ({ navigate }) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <Zap size={16} className="text-[#445A95]" />
      <h3 className="text-base font-black text-zinc-800 tracking-tight">Quick Actions</h3>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => navigate(action.route)}
            className={`group flex flex-col items-start gap-3 p-5 rounded-[20px] border ${action.border} ${action.bg} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left focus:outline-none`}
          >
            <div className={`p-2.5 rounded-xl bg-white shadow-sm`}>
              <Icon size={20} className={action.color} />
            </div>
            <div>
              <p className="text-[13px] font-black text-zinc-800">{action.label}</p>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{action.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const SkillBankGrid = ({ title, skills, data }) => (
  <div className="bg-white rounded-[28px] p-8 shadow-sm ring-1 ring-zinc-200/60 h-full flex flex-col">
    <h3 className="text-lg font-black text-zinc-800 tracking-tight mb-6">{title}</h3>
    <div className="grid grid-cols-2 gap-4 flex-1">
      {skills.map((skill) => {
        const Icon = skill.icon;
        return (
          <div key={skill.key} className="flex items-center justify-between p-4 rounded-[20px] bg-zinc-50/50 ring-1 ring-zinc-100 hover:bg-white hover:ring-zinc-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${skill.bg} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={18} className={skill.color} />
              </div>
              <span className="font-bold text-[13px] text-zinc-600 group-hover:text-zinc-900 transition-colors">
                {skill.label || skill.key}
              </span>
            </div>
            <div className="font-black text-lg text-zinc-800 tabular-nums">
              {data?.[skill.key] || 0}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ================= PAGE ================= */

const AdminDashboardPage = () => {
  const { stats, loading } = useAdminDashboard();
  const location = useLocation();
  const navigate = useNavigate();
  const isTeacher = location.pathname.startsWith('/teacher');
  const user = useAuthStore(state => state.user);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#445A95]/20 border-t-[#445A95] rounded-full animate-spin" />
          <span className="text-zinc-500 font-bold tracking-wide text-sm">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  /* ── TEACHER VIEW ── */
  if (isTeacher) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4 pb-8">

        {/* Welcome Banner */}
        <WelcomeBanner userName={user?.full_name} />

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {TEACHER_STAT_CARDS.map((item) => (
            <StatCard key={item.key} item={item} value={stats?.[item.key]} />
          ))}
        </div>

        {/* Middle Row: Pie Chart + Skill Bank */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {/* APTIS Distribution Pie */}
          <div className="bg-white rounded-[24px] p-7 shadow-sm ring-1 ring-zinc-200/60">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-black text-zinc-800 tracking-tight">APTIS Test Distribution</h3>
              <TrendingUp size={16} className="text-zinc-400" />
            </div>
            <p className="text-xs text-zinc-400 font-medium mb-5">Breakdown of questions by skill</p>
            <div className="h-[260px]">
              <SkillPieChart skills={stats?.aptis_skills} />
            </div>
          </div>

          {/* APTIS Skill Test Library Rows */}
          <SkillBankRows
            skills={APTIS_SKILLS}
            data={stats?.aptis_skills}
            navigate={navigate}
          />
        </div>
      </div>
    );
  }

  /* ── ADMIN VIEW: Full combined (IELTS + APTIS) ── */
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4">

      {/* ── MAIN BENTO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Top Stats Grid (Spans full width via columns) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ALL_STAT_CARDS.map((item) => (
            <div key={item.key} className="col-span-1 sm:col-span-1 lg:col-span-1">
              <StatCard item={item} value={stats?.[item.key]} />
            </div>
          ))}
        </div>

        {/* ── MIDDLE ROW: PIE CHARTS ── */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-[28px] p-8 shadow-sm ring-1 ring-zinc-200/60 h-full">
            <h3 className="text-lg font-black text-zinc-800 tracking-tight mb-2">IELTS Distribution</h3>
            <p className="text-zinc-500 text-sm mb-6 font-medium">Breakdown of IELTS questions by skill</p>
            <div className="h-[280px]">
              <SkillPieChart skills={stats?.ielts_skills} />
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-[28px] p-8 shadow-sm ring-1 ring-zinc-200/60 h-full">
            <h3 className="text-lg font-black text-zinc-800 tracking-tight mb-2">APTIS Distribution</h3>
            <p className="text-zinc-500 text-sm mb-6 font-medium">Breakdown of APTIS questions by skill</p>
            <div className="h-[280px]">
              <SkillPieChart skills={stats?.aptis_skills} />
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: SKILL BANKS ── */}
        <div className="col-span-1 lg:col-span-2">
          <SkillBankGrid 
            title="IELTS Exam Bank" 
            skills={IELTS_SKILLS} 
            data={stats?.ielts_skills} 
          />
        </div>

        <div className="col-span-1 lg:col-span-2">
          <SkillBankGrid 
            title="APTIS Exam Bank" 
            skills={APTIS_SKILLS} 
            data={stats?.aptis_skills} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

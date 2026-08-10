import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/dashboard/useAdminDashboard';
import SkillPieChart from '../../components/dashboard/SkillPieChart';
import { 
  Users, 
  UserPlus, 
  FileText, 
  FileCheck, 
  Trophy, 
  BarChart,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  GraduationCap
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
    icon: BarChart,
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
  },
  {
    title: 'Student Attempts',
    key: 'teacher_aptis_submissions',
    icon: BarChart,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
  },
  {
    title: 'Available Mock Tests',
    key: 'total_aptis_full_tests',
    icon: Trophy,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    ring: 'ring-orange-500/20',
  }
];

const IELTS_SKILLS = [
  { key: 'Reading', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'Listening', icon: Headphones, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { key: 'Writing', icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'Speaking', icon: Mic, color: 'text-purple-500', bg: 'bg-purple-500/10' }
];

const APTIS_SKILLS = [
  { key: 'GrammarVocab', label: 'Grammar & Vocab', icon: GraduationCap, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { key: 'Reading', label: 'Reading', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'Listening', label: 'Listening', icon: Headphones, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { key: 'Writing', label: 'Writing', icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'Speaking', label: 'Speaking', icon: Mic, color: 'text-purple-500', bg: 'bg-purple-500/10' }
];

/* ================= COMPONENTS ================= */

const StatCard = ({ item, value }) => {
  const Icon = item.icon;
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm ring-1 ring-zinc-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-zinc-300 group flex flex-col justify-between h-[160px]">
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
          {value || 0}
        </h3>
      </div>
    </div>
  );
};

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
  const isTeacher = location.pathname.startsWith('/teacher');
  const user = useAuthStore(state => state.user);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-zinc-500 font-bold tracking-wide text-sm">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  /* ── TEACHER VIEW: APTIS only ── */
  if (isTeacher) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-orange-500 to-rose-500" />
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Welcome back, {user?.full_name || 'Teacher'}!
            </h1>
          </div>
          <p className="text-zinc-500 text-sm ml-5 font-medium">Overview of your APTIS teaching workspace</p>
        </div>

        {/* APTIS Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {TEACHER_STAT_CARDS.map((item) => (
            <StatCard key={item.key} item={item} value={stats?.[item.key]} />
          ))}
        </div>

        {/* APTIS Charts & Skill Bank */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* APTIS Distribution Pie */}
          <div className="bg-white rounded-[28px] p-8 shadow-sm ring-1 ring-zinc-200/60">
            <h3 className="text-lg font-black text-zinc-800 tracking-tight mb-2">APTIS Distribution</h3>
            <p className="text-zinc-500 text-sm mb-6 font-medium">Breakdown of APTIS questions by skill</p>
            <div className="h-[280px]">
              <SkillPieChart skills={stats?.aptis_skills} />
            </div>
          </div>

          {/* APTIS Skill Bank */}
          <SkillBankGrid 
            title="APTIS Exam Bank" 
            skills={APTIS_SKILLS} 
            data={stats?.aptis_skills} 
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

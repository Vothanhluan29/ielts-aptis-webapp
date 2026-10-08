import {
  BarChart3,
  BookOpen,
  Edit3,
  GraduationCap,
  Headphones,
  Mic,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';

export const ADMIN_STAT_CARDS = [
  { title: 'Total Users', key: 'total_users', icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20' },
  { title: 'New Users Today', key: 'new_users_today', icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
  { title: 'APTIS Mock Exams', key: 'total_aptis_full_tests', icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20' },
  { title: 'APTIS Attempts', key: 'total_aptis_submissions', icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-500/10', ring: 'ring-rose-500/20' },
];

export const TEACHER_STAT_CARDS = [
  { title: 'My Students', key: 'teacher_students', icon: Users, color: 'text-violet-600', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20', desc: 'Students under your management' },
  { title: 'Student Attempts', key: 'teacher_aptis_submissions', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', desc: 'Total test submissions' },
  { title: 'Available Tests', key: 'total_aptis_full_tests', icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20', desc: 'Tests ready to assign' },
];

export const IELTS_SKILLS = [
  { key: 'Reading', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'Listening', icon: Headphones, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { key: 'Writing', icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'Speaking', icon: Mic, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export const APTIS_SKILLS = [
  { key: 'GrammarVocab', label: 'Grammar & Vocab', icon: GraduationCap, color: 'text-pink-500', bg: 'bg-pink-500/10', fill: '#ec4899', route: '/teacher/grammar-vocab' },
  { key: 'Reading', label: 'Reading', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', fill: '#3b82f6', route: '/teacher/reading' },
  { key: 'Listening', label: 'Listening', icon: Headphones, color: 'text-teal-500', bg: 'bg-teal-500/10', fill: '#14b8a6', route: '/teacher/listening' },
  { key: 'Writing', label: 'Writing', icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-500/10', fill: '#f59e0b', route: '/teacher/writing' },
  { key: 'Speaking', label: 'Speaking', icon: Mic, color: 'text-violet-500', bg: 'bg-violet-500/10', fill: '#8b5cf6', route: '/teacher/speaking' },
];

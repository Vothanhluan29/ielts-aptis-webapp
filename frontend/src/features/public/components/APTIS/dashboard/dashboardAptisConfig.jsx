import React from 'react';
import { ClipboardList, BookOpen, Headphones, PenTool, Mic, Award } from 'lucide-react';

export const SKILL_CONFIG = {
  GRAMMAR_VOCAB: { color: '#059669', bg: 'bg-emerald-100', text: 'text-emerald-600', icon: <ClipboardList size={18} />, label: 'Grammar & Vocab' },
  READING: { color: '#ea580c', bg: 'bg-orange-100', text: 'text-orange-600', icon: <BookOpen size={18} />, label: 'Reading' },
  LISTENING: { color: '#2563eb', bg: 'bg-blue-100', text: 'text-blue-600', icon: <Headphones size={18} />, label: 'Listening' },
  WRITING: { color: '#9333ea', bg: 'bg-purple-100', text: 'text-purple-600', icon: <PenTool size={18} />, label: 'Writing' },
  SPEAKING: { color: '#e11d48', bg: 'bg-rose-100', text: 'text-rose-600', icon: <Mic size={18} />, label: 'Speaking' },
  FULLTEST: { color: '#4f46e5', bg: 'bg-indigo-100', text: 'text-indigo-600', icon: <Award size={18} />, label: 'Full Mock Test' },
};

export const getCEFRColor = (level) => {
  const map = { 'A0': '#94a3b8', 'A1': '#60a5fa', 'A2': '#3b82f6', 'B1': '#22c55e', 'B2': '#16a34a', 'C': '#f59e0b' };
  return map[level?.toUpperCase()] || '#6366f1'; 
};
import React from 'react';
import { 
  ReadOutlined, CustomerServiceOutlined, 
  EditOutlined, AudioOutlined, AppstoreOutlined 
} from '@ant-design/icons';

export const SKILL_CONFIG = {
  READING: { color: '#ea580c', bg: 'bg-orange-100', text: 'text-orange-600', icon: <ReadOutlined style={{ fontSize: 18 }} />, label: 'Reading' },
  LISTENING: { color: '#2563eb', bg: 'bg-blue-100', text: 'text-blue-600', icon: <CustomerServiceOutlined style={{ fontSize: 18 }} />, label: 'Listening' },
  WRITING: { color: '#9333ea', bg: 'bg-purple-100', text: 'text-purple-600', icon: <EditOutlined style={{ fontSize: 18 }} />, label: 'Writing' },
  SPEAKING: { color: '#e11d48', bg: 'bg-rose-100', text: 'text-rose-600', icon: <AudioOutlined style={{ fontSize: 18 }} />, label: 'Speaking' },
  FULLTEST: { color: '#4f46e5', bg: 'bg-indigo-100', text: 'text-indigo-600', icon: <AppstoreOutlined style={{ fontSize: 18 }} />, label: 'Full Mock Test' },
};

export const getBandColor = (band) => {
  if (band >= 8.0) return '#10b981'; // Emerald
  if (band >= 6.5) return '#3b82f6'; // Blue
  if (band >= 5.0) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
};
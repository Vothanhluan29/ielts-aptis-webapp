import React from 'react';
import { Card, Typography, Tabs } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SKILL_CONFIG } from './dashboardConfig';

const { Text } = Typography;

const ProgressChart = ({ chartData }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" title={<span className="font-bold text-slate-700"><RiseOutlined className="mr-2 text-indigo-500" />Progress Chart</span>}>
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <Text className="text-slate-500 font-medium">Not enough data to display the chart.</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" title={<span className="font-bold text-slate-700"><RiseOutlined className="mr-2 text-indigo-500" />Progress Chart (Last 10 Days)</span>}>
      <Tabs 
        defaultActiveKey="practice" 
        className="custom-chart-tabs font-medium"
        items={[
          {
            key: 'practice',
            label: 'Individual Skills',
            children: (
              <div className="mt-4">
                {/* 🔥 ĐÃ FIX: Thêm width, height, minWidth, minHeight để dập tắt warning recharts */}
                <ResponsiveContainer width="100%" height={350} minWidth={1} minHeight={1}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 9]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" name="Reading" dataKey="reading" stroke={SKILL_CONFIG.READING.color} strokeWidth={3} dot={{ r: 4 }} connectNulls />
                    <Line type="monotone" name="Listening" dataKey="listening" stroke={SKILL_CONFIG.LISTENING.color} strokeWidth={3} dot={{ r: 4 }} connectNulls />
                    <Line type="monotone" name="Writing" dataKey="writing" stroke={SKILL_CONFIG.WRITING.color} strokeWidth={3} dot={{ r: 4 }} connectNulls />
                    <Line type="monotone" name="Speaking" dataKey="speaking" stroke={SKILL_CONFIG.SPEAKING.color} strokeWidth={3} dot={{ r: 4 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )
          },
          {
            key: 'fulltest',
            label: 'Full Mock Test',
            children: (
              <div className="mt-4">
                {/* 🔥 ĐÃ FIX: Thêm width, height, minWidth, minHeight để dập tắt warning recharts */}
                <ResponsiveContainer width="100%" height={350} minWidth={1} minHeight={1}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4f46e5', fontSize: 12, fontWeight: 'bold' }} domain={[0, 9]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" name="Overall Band" dataKey="full_test" stroke={SKILL_CONFIG.FULLTEST.color} strokeWidth={4} strokeDasharray="5 5" dot={{ r: 6 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )
          }
        ]}
      />
    </Card>
  );
};

export default ProgressChart;
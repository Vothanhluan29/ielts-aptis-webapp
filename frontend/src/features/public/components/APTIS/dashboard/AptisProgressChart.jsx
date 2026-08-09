import React from 'react';
import { Typography, Tabs } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SKILL_CONFIG } from './dashboardAptisConfig';

const { Text } = Typography;

const AptisProgressChart = ({ chartData }) => {
  return (
    <div className="rounded-[2rem] bg-white/60 backdrop-blur-xl shadow-xl shadow-indigo-500/5 border border-white/80 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
      <h3 className="font-black text-slate-800 text-lg mb-6 tracking-tight">Progress Chart (Last 10 Days)</h3>
      {chartData && chartData.length > 0 ? (
        <Tabs 
          defaultActiveKey="practice" 
          className="custom-chart-tabs font-medium"
          items={[
            {
              key: 'practice',
              label: 'Individual Skills (Practice)',
              children: (
                <div style={{ width: '100%', height: 350, marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height={350} minWidth={1} minHeight={1}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
                      <YAxis 
                        axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
                        domain={[0, 50]} ticks={[0, 10, 20, 30, 40, 50]}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ fontWeight: 'bold' }} 
                        cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                      <Bar name="Grammar" dataKey="grammar_vocab" fill={SKILL_CONFIG.GRAMMAR_VOCAB.color} radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar name="Reading" dataKey="reading" fill={SKILL_CONFIG.READING.color} radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar name="Listening" dataKey="listening" fill={SKILL_CONFIG.LISTENING.color} radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar name="Writing" dataKey="writing" fill={SKILL_CONFIG.WRITING.color} radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar name="Speaking" dataKey="speaking" fill={SKILL_CONFIG.SPEAKING.color} radius={[4, 4, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            },
            {
              key: 'fulltest',
              label: 'Full Mock Test',
              children: (
                <div style={{ width: '100%', height: 350, marginTop: 16 }}>
                  <ResponsiveContainer width="100%" height={350} minWidth={1} minHeight={1}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorFullTest" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={SKILL_CONFIG.FULLTEST.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={SKILL_CONFIG.FULLTEST.color} stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} dy={10} />
                      <YAxis 
                        axisLine={false} tickLine={false} tick={{ fill: '#4f46e5', fontSize: 12, fontWeight: 'bold' }} 
                        domain={[0, 250]} ticks={[0, 50, 100, 150, 200, 250]}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ fontWeight: 'bold' }} 
                        cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                      <Bar name="Full Test (0-250)" dataKey="full_test" fill="url(#colorFullTest)" radius={[8, 8, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            }
          ]}
        />
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <Text className="text-slate-500 font-medium">Not enough data to display the chart.</Text>
        </div>
      )}
    </div>
  );
};

export default AptisProgressChart;
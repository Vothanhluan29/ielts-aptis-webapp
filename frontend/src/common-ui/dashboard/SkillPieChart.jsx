import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { Reading: '#3b82f6', Listening: '#14b8a6', Writing: '#f59e0b', Speaking: '#8b5cf6', GrammarVocab: '#ec4899' };
const LABELS = { GrammarVocab: 'Grammar & Vocab', Reading: 'Reading', Listening: 'Listening', Writing: 'Writing', Speaking: 'Speaking' };

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return <div className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-white shadow-lg">{LABELS[name] || name}: <strong>{value}</strong></div>;
}

export default function SkillPieChart({ skills }) {
  const data = Object.entries(skills || {}).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (!data.length) return <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400"><span className="text-3xl">📊</span><span className="text-sm font-medium">No data yet</span></div>;

  return (
    <div className="flex h-full w-full items-center gap-4">
      <div className="relative h-full min-h-[200px] w-[200px] shrink-0">
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"><span className="text-2xl font-black leading-none text-zinc-900">{total}</span><span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Total</span></div>
        <ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip content={<ChartTooltip />} /><Pie data={data} innerRadius={60} outerRadius={88} paddingAngle={3} dataKey="value" strokeWidth={2} stroke="#fff">{data.map(item => <Cell key={item.name} fill={COLORS[item.name] || '#d4d4d8'} />)}</Pie></PieChart></ResponsiveContainer>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2">
        {data.map(item => {
          const percentage = total ? Math.round((item.value / total) * 100) : 0;
          const color = COLORS[item.name] || '#d4d4d8';
          return <div key={item.name} className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} /><span className="min-w-0 flex-1 text-xs font-semibold text-zinc-600">{LABELS[item.name] || item.name}</span><span className="min-w-7 text-right text-xs font-extrabold text-zinc-900">{item.value}</span><span className="min-w-10 rounded-full px-2 py-0.5 text-center text-[10px] font-bold" style={{ color, backgroundColor: `${color}18` }}>{percentage}%</span></div>;
        })}
      </div>
    </div>
  );
}

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

/* ================= COLORS ================= */

const COLORS = {
  Reading: '#3b82f6',
  Listening: '#14b8a6',
  Writing: '#f59e0b',
  Speaking: '#8b5cf6',
  GrammarVocab: '#ec4899'
};

const LABEL_MAP = {
  GrammarVocab: 'Grammar & Vocab',
  Reading: 'Reading',
  Listening: 'Listening',
  Writing: 'Writing',
  Speaking: 'Speaking',
};

/* ================= TOOLTIP ================= */

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const name = payload[0].name;
    return (
      <div
        style={{
          background: '#1f2937',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        {LABEL_MAP[name] || name}: <span style={{ fontWeight: 800 }}>{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

/* ================= COMPONENT ================= */

const SkillPieChart = ({ skills, showRightLegend = false }) => {
  const raw = Object.entries(skills || {}).map(([name, value]) => ({ name, value }));
  // filter out zeros for cleaner display
  const data = raw.filter(d => d.value > 0);
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
        <span className="text-3xl">📊</span>
        <span className="text-sm font-medium">No data yet</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* PIE CHART */}
      <div style={{ position: 'relative', flex: '0 0 auto', width: 200, height: '100%', minHeight: 200 }}>
        {/* CENTER */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 900, color: '#18181b', lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 3 }}>Total</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] || '#d4d4d8'}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* RIGHT LEGEND */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        {data.map((entry) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          const fill = COLORS[entry.name] || '#d4d4d8';
          return (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* color dot */}
              <div style={{
                width: 10, height: 10, borderRadius: '50%', backgroundColor: fill, flexShrink: 0
              }} />
              {/* label */}
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#52525b' }}>
                {LABEL_MAP[entry.name] || entry.name}
              </span>
              {/* count + pct */}
              <span style={{ fontSize: 12, fontWeight: 800, color: '#18181b', minWidth: 28, textAlign: 'right' }}>
                {entry.value}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: fill,
                backgroundColor: fill + '18',
                borderRadius: 20,
                padding: '2px 7px',
                minWidth: 38,
                textAlign: 'center'
              }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillPieChart;
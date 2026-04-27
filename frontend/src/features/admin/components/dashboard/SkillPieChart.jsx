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
  Reading: '#1677ff',
  Listening: '#13c2c2',
  Writing: '#faad14',
  Speaking: '#722ed1',
  GrammarVocab: '#eb2f96'
};

/* ================= TOOLTIP ================= */

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#1f2937',
          color: '#fff',
          padding: '6px 10px',
          borderRadius: 8,
          fontSize: 12
        }}
      >
        {payload[0].name}: {payload[0].value}
      </div>
    );
  }
  return null;
};

/* ================= COMPONENT ================= */

const SkillPieChart = ({ skills }) => {
  const data = Object.entries(skills || {}).map(([name, value]) => ({
    name,
    value
  }));

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div
      style={{
        width: '100%',
        height: 300,
        position: 'relative'
      }}
    >
      {/* CENTER INFO */}
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
        <span style={{ fontSize: 26, fontWeight: 800 }}>
          {total}
        </span>
        <span style={{ fontSize: 12, color: '#888' }}>
          Total
        </span>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            innerRadius={70}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name] || '#ccc'}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* LEGEND */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          flexWrap: 'wrap'
        }}
      >
        {data.map((entry) => (
          <div
            key={entry.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 20,
              background: '#f5f5f5',
              fontSize: 11
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: COLORS[entry.name]
              }}
            />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillPieChart;
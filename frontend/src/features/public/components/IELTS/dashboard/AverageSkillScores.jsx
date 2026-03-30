import React from 'react';
import { Card, Typography, Progress } from 'antd';
import { SKILL_CONFIG } from './dashboardConfig';

const { Text } = Typography;

const AverageSkillScores = ({ skillStats }) => {
  return (
    <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200 h-full" title={<span className="font-bold text-slate-700">Average Skill Scores (Scale of 9.0)</span>}>
      <div className="space-y-5">
        {skillStats?.map((stat) => {
          const config = SKILL_CONFIG[stat.skill];
          if (!config) return null;
          const percent = (stat.average_score / 9.0) * 100;

          return (
            <div key={stat.skill}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${config.bg} ${config.text}`}>
                    {config.icon}
                  </div>
                  <Text className="font-bold text-slate-700">{config.label}</Text>
                </div>
                <div className="text-right">
                  <Text className="font-black text-lg" style={{ color: config.color }}>{Number(stat.average_score).toFixed(1)}</Text>
                  <Text className="text-slate-400 text-xs font-semibold"> / 9.0</Text>
                </div>
              </div>
              <Progress percent={percent} showInfo={false} strokeColor={config.color} railColor="#f1f5f9" size={["100%", 8]} />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AverageSkillScores;
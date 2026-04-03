import React from 'react';
import { Card, Typography, Progress, Tag } from 'antd';
import { SKILL_CONFIG, getCEFRColor } from './dashboardAptisConfig';

const { Text } = Typography;

const getEstimatedCEFR = (score) => {
  if (score >= 40) return 'C';
  if (score >= 30) return 'B2';
  if (score >= 20) return 'B1';
  if (score >= 10) return 'A2';
  if (score > 0) return 'A1';
  return 'A0';
};

const AverageAptisSkillScores = ({ skillStats }) => {
  return (
    <Card 
      variant="borderless" 
      className="rounded-3xl shadow-sm border-slate-200 h-full" 
      title={<span className="font-bold text-slate-700">Average Skill Levels (Certification)</span>}
    >
      <div className="space-y-6"> 
        {skillStats?.map((stat) => {
          const config = SKILL_CONFIG[stat.skill];
          if (!config) return null;

          const percent = (stat.average_score / 50) * 100;
          const cefrLevel = getEstimatedCEFR(stat.average_score);
          const cefrColor = getCEFRColor(cefrLevel);

          return (
            <div key={stat.skill}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl flex items-center justify-center ${config.bg} ${config.text}`}>
                    {config.icon}
                  </div>
                  <Text className="font-bold text-slate-700 text-sm md:text-base">{config.label}</Text>
                </div>
                
                {/* Khu vực bên phải: CHỈ HIỂN THỊ THẺ CEFR */}
                <Tag 
                  color={cefrColor} 
                  className="m-0 px-3 py-1 rounded-lg font-black text-sm border-0 shadow-sm min-w-10 text-center tracking-wider"
                >
                  {cefrLevel}
                </Tag>
              </div>
              
              <Progress 
                percent={percent} 
                showInfo={false} 
                strokeColor={cefrColor} 
                railColor="#f1f5f9" 
                size={["100%", 8]} 
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AverageAptisSkillScores;
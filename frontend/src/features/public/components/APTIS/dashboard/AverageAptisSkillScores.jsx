import React from 'react';
import { Typography, Progress, Tag } from 'antd';
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
    <div className="rounded-[2rem] bg-white/60 backdrop-blur-xl shadow-xl shadow-indigo-500/5 border border-white/80 p-6 md:p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
      <h3 className="font-black text-slate-800 text-lg mb-6 tracking-tight">Average Skill Levels (Certification)</h3>
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
                  className="m-0 px-3 py-1 rounded-xl font-black text-sm border-0 shadow-md min-w-10 text-center tracking-wider"
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
    </div>
  );
};

export default AverageAptisSkillScores;
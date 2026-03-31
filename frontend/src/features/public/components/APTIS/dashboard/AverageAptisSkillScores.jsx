import React from 'react';
import { Card, Typography, Progress, Tag } from 'antd';
// Nhớ export hàm getCEFRColor từ file dashboardAptisConfig.jsx để import vào đây nhé
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
      title={<span className="font-bold text-slate-700">Average Skill Levels (CEFR)</span>}
    >
      <div className="space-y-5">
        {skillStats?.map((stat) => {
          const config = SKILL_CONFIG[stat.skill];
          if (!config) return null;

          // Tính toán % cho thanh Progress Bar
          const percent = (stat.average_score / 50) * 100;
          
          // Lấy level CEFR và màu sắc tương ứng
          const cefrLevel = getEstimatedCEFR(stat.average_score);
          const cefrColor = getCEFRColor(cefrLevel);

          return (
            <div key={stat.skill}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${config.bg} ${config.text}`}>
                    {config.icon}
                  </div>
                  <Text className="font-bold text-slate-700">{config.label}</Text>
                </div>
                
                {/* Khu vực hiển thị cả Điểm và Thẻ CEFR */}
                <div className="flex items-center gap-3">
                  <div className="text-right flex flex-col justify-center">
                    <Text className="font-black text-base leading-none" style={{ color: config.color }}>
                      {Number(stat.average_score).toFixed(1)}
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-semibold leading-none mt-1">/ 50</Text>
                  </div>
                  
                  {/* Thẻ hiển thị Level CEFR */}
                  <Tag 
                    color={cefrColor} 
                    className="m-0 px-2 py-1 rounded-lg font-black text-sm border-0 shadow-sm min-w-9 text-center"
                  >
                    {cefrLevel}
                  </Tag>
                </div>
              </div>
              
              {/* 🔥 ĐÃ FIX: Sửa trailColor thành railColor và dùng màu CEFR cho thanh tiến trình */}
              <Progress 
                percent={percent} 
                showInfo={false} 
                strokeColor={cefrColor} 
                railColor="#f1f5f9" 
                size="small" 
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AverageAptisSkillScores;
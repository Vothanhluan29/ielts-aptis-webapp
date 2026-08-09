import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { FireFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

const DashboardAptisHeader = ({ streakInfo }) => {
  const currentStreak = streakInfo?.current_streak || 0;
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const prevStreak = localStorage.getItem('aptis_prev_streak');
    
    if (prevStreak !== null) {
      if (currentStreak > parseInt(prevStreak, 10)) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 3000);
      }
    }
    
    localStorage.setItem('aptis_prev_streak', currentStreak.toString());
  }, [currentStreak]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-indigo-500/5 border border-white/80 transition-all hover:shadow-indigo-500/10">
      <div>
        <Title level={3} className="m-0! text-slate-800 font-black tracking-tight">
          Aptis Learning Overview
        </Title>
        <Text className="text-slate-500 font-medium">
          Track your progress and statistics
        </Text>
      </div>

      <div className="flex items-center gap-4 bg-orange-50 px-5 py-3 rounded-2xl border border-orange-100 relative">
        {showAnimation && (
          <div 
            className="absolute font-black text-orange-600 text-2xl z-10"
            style={{
              top: '5px',
              left: '20px',
              animation: 'floatUpAndFade 2s ease-out forwards',
              pointerEvents: 'none',
              textShadow: '0 2px 4px rgba(234, 88, 12, 0.3)'
            }}
          >
            +1
          </div>
        )}

        <div className={`p-2 bg-orange-500 text-white rounded-xl shadow-sm shadow-orange-200 relative transition-transform duration-300 ${showAnimation ? 'scale-110' : ''}`}>
          <FireFilled className="text-xl" />
        </div>
        <div>
          <Text className="block text-orange-600 font-bold text-lg leading-tight">
            {currentStreak} Days
          </Text>
          <Text className="text-orange-400 text-xs font-semibold uppercase tracking-wider">
            Learning Streak
          </Text>
        </div>
      </div>

      <style>{`
        @keyframes floatUpAndFade {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { transform: translateY(-15px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-40px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DashboardAptisHeader;
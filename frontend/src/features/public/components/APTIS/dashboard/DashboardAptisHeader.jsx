import React from 'react';
import { Typography } from 'antd';
import { FireFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

const DashboardAptisHeader = ({ streakInfo }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div>
        <Title level={3} className="m-0! text-slate-800 font-black">Aptis Learning Overview</Title>
        <Text className="text-slate-500">Track your progress and statistics</Text>
      </div>
      
      <div className="flex items-center gap-4 bg-orange-50 px-5 py-3 rounded-2xl border border-orange-100">
        <div className="p-2 bg-orange-500 text-white rounded-xl shadow-sm shadow-orange-200">
          <FireFilled className="text-xl" />
        </div>
        <div>
          <Text className="block text-orange-600 font-bold text-lg leading-tight">
            {streakInfo?.current_streak || 0} Days
          </Text>
          <Text className="text-orange-400 text-xs font-semibold uppercase tracking-wider">Learning Streak</Text>
        </div>
        <div className="gap-1 ml-2 pl-4 border-l border-orange-200 hidden sm:flex">
          {streakInfo?.activity_map?.map((isActive, idx) => (
            <div 
              key={idx} 
              className={`w-3 h-3 rounded-full ${isActive ? 'bg-orange-500' : 'bg-orange-200'}`}
              title={isActive ? 'Studied' : 'Not studied'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardAptisHeader;
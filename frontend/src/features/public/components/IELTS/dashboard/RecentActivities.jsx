import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { SKILL_CONFIG } from './dashboardConfig';

const { Text } = Typography;

const RecentActivities = ({ activities }) => {
  return (
    <Card 
      variant="borderless" 
      className="rounded-3xl shadow-sm border-slate-200 h-full flex flex-col" 
      title={<span className="font-bold text-slate-700">Recent Activities</span>}
      styles={{ body: { padding: '0 16px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' } }}
    >
      {activities.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          {activities.map((item, index) => {
            const config = SKILL_CONFIG[item.type] || SKILL_CONFIG.FULLTEST;
            const isFullTest = item.type === 'FULLTEST';
            
            return (
              <div 
                key={item.id || index} 
                className="flex items-center justify-between border-b border-slate-100 last:border-0 py-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.text}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-700 line-clamp-1">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <ClockCircleOutlined /> {dayjs(item.date).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </div>
                </div>
                
                <div className="text-right pl-2 flex flex-col items-end">
                  {isFullTest && <Tag color="indigo" className="mb-1 rounded border-0 text-[10px]">Mock Test</Tag>}
                  <div className="font-black text-slate-800 text-lg">
                    {Number(item.score).toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center opacity-60">
          <CalendarOutlined style={{ fontSize: 32, color: '#94a3b8', marginBottom: 8 }} />
          <Text className="text-slate-500 font-medium">No recent tests found</Text>
        </div>
      )}
    </Card>
  );
};

export default RecentActivities;
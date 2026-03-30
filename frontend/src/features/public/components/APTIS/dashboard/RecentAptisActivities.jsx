import React from 'react';
import { Card, Typography, List, Space, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { SKILL_CONFIG } from './dashboardAptisConfig';

const { Text } = Typography;

const RecentAptisActivities = ({ activities }) => {
  return (
    <Card 
      variant="borderless" 
      className="rounded-3xl shadow-sm border-slate-200 h-full flex flex-col" 
      title={<span className="font-bold text-slate-700">Recent Activities</span>}
      styles={{ body: { padding: '0 16px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' } }}
    >
      {activities.length > 0 ? (
        <List
          className="flex-1"
          itemLayout="horizontal"
          dataSource={activities}
          renderItem={(item) => {
            const config = SKILL_CONFIG[item.type] || SKILL_CONFIG.FULLTEST;
            const maxScore = item.type === 'FULLTEST' ? 250 : 50;
            
            return (
              <List.Item className="border-b border-slate-100 last:border-0 py-3">
                <List.Item.Meta
                  avatar={
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.text}`}>
                      {config.icon}
                    </div>
                  }
                  title={<Text className="font-bold text-slate-700 line-clamp-1">{item.title}</Text>}
                  description={
                    <Space size="small" className="text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Clock size={12} /> {dayjs(item.date).format('DD/MM/YYYY HH:mm')}</span>
                    </Space>
                  }
                />
                <div className="text-right pl-2">
                  {item.cefr_level ? (
                    <Tag color="blue" className="m-0 font-bold rounded-md border-0">{item.cefr_level}</Tag>
                  ) : (
                    <div className="flex flex-col items-end">
                      <Text className="font-black text-slate-700">{item.score}</Text>
                      <Text className="text-[10px] text-slate-400">/ {maxScore}</Text>
                    </div>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center opacity-60">
          <CalendarOutlined style={{ fontSize: 32, color: '#94a3b8', marginBottom: 8 }} />
          <Text className="text-slate-500 font-medium">No recent tests found</Text>
        </div>
      )}
    </Card>
  );
};

export default RecentAptisActivities;
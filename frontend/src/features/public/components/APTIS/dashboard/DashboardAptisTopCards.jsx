import React from 'react';
import { Row, Col, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { getCEFRColor } from './dashboardAptisConfig';

const { Text } = Typography;

const DashboardAptisTopCards = ({ stats }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <div className="rounded-[2rem] bg-white/60 backdrop-blur-xl shadow-xl shadow-indigo-500/5 border border-white/80 p-6 overflow-hidden relative hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 h-full">
          <div className="absolute -right-4 -top-4 opacity-5 text-indigo-500 transition-transform duration-500 hover:scale-110">
            <TrophyOutlined style={{ fontSize: 120 }} />
          </div>
          <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">Total Full Tests</Text>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">{stats?.total_exams || 0}</span>
            <span className="text-slate-400 font-medium mb-1">Tests Completed</span>
          </div>
        </div>
      </Col>
      <Col xs={24} md={8}>
        <div className="rounded-[2rem] bg-white/60 backdrop-blur-xl shadow-xl shadow-indigo-500/5 border border-white/80 p-6 relative hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 h-full flex flex-col justify-between">
          <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">Highest Certification Level</Text>
          <div className="mt-4 flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${getCEFRColor(stats?.highest_cefr)}, ${getCEFRColor(stats?.highest_cefr)}dd)`,
                boxShadow: `0 10px 15px -3px ${getCEFRColor(stats?.highest_cefr)}40` 
              }}
            >
              {stats?.highest_cefr || '-'}
            </div>
            {stats?.highest_cefr && <Text className="text-slate-400 font-medium"></Text>}
          </div>
        </div>
      </Col>
      <Col xs={24} md={8}>
        <div className="rounded-[2rem] bg-white/60 backdrop-blur-xl shadow-xl shadow-indigo-500/5 border border-white/80 p-6 relative hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 h-full flex flex-col justify-between">
          <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">Best Full Test Score</Text>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-5xl font-black bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">{stats?.highest_overall || 0}</span>
            <span className="text-slate-400 font-medium text-lg">/ 250</span>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default DashboardAptisTopCards;
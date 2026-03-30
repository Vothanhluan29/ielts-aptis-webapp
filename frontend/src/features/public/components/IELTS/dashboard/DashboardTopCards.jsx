import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { getBandColor } from './dashboardConfig';

const { Text } = Typography;

const DashboardTopCards = ({ stats }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card variant="borderless" className="rounded-3xl shadow-sm h-full border-slate-200 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 opacity-5 text-indigo-500">
            <TrophyOutlined style={{ fontSize: 120 }} />
          </div>
          <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Full Tests</Text>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-black text-indigo-600">{stats?.total_exams || 0}</span>
            <span className="text-slate-400 font-medium mb-1">tests completed</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card variant="borderless" className="rounded-3xl shadow-sm h-full border-slate-200">
          <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider">Average Overall Band</Text>
          <div className="mt-2 flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-sm"
              style={{ backgroundColor: getBandColor(stats?.average_overall) }}
            >
              {Number(stats?.average_overall || 0).toFixed(1)}
            </div>
            <Text className="text-slate-400 font-medium leading-snug max-w-[120px]">Based on all your submissions</Text>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card variant="borderless" className="rounded-3xl shadow-sm h-full border-slate-200">
          <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider">Highest Overall Band</Text>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-black text-slate-800">{Number(stats?.highest_overall || 0).toFixed(1)}</span>
            <span className="text-slate-400 font-medium text-lg">/ 9.0</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardTopCards;
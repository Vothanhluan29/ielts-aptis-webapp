import React from 'react';
import { Row, Col, Spin, Typography, Space } from 'antd';
import { useDashboardAptis } from '../../../hooks/APTIS/dashboard/useDashboardAptis';

import DashboardAptisHeader from '../../../components/APTIS/dashboard/DashboardAptisHeader';
import DashboardAptisTopCards from '../../../components/APTIS/dashboard/DashboardAptisTopCards';
import AverageAptisSkillScores from '../../../components/APTIS/dashboard/AverageAptisSkillScores';
import RecentAptisActivities from '../../../components/APTIS/dashboard/RecentAptisActivities';
import AptisProgressChart from '../../../components/APTIS/dashboard/AptisProgressChart';

const { Text } = Typography;

const DashboardAptisStudentPage = () => {
  const { overview, progress, activities, loading } = useDashboardAptis(5);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text className="text-slate-500 font-medium">Loading your learning data...</Text>
        </Space>
      </div>
    );
  }

  const { full_test_stats, skill_stats } = overview || {};
  const { chart_data, streak_info } = progress || {};

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        <DashboardAptisHeader streakInfo={streak_info} />
        
        <DashboardAptisTopCards stats={full_test_stats} />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <AverageAptisSkillScores skillStats={skill_stats} />
          </Col>
          <Col xs={24} lg={10}>
            <RecentAptisActivities activities={activities} />
          </Col>
        </Row>

        <AptisProgressChart chartData={chart_data} />

      </div>
    </div>
  );
};

export default DashboardAptisStudentPage;
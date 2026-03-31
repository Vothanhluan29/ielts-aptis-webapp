import React from 'react';
import { Row, Col, Spin, Typography, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useDashboard } from '../../../hooks/IELTS/dashboard/useDashboard';

// Import các sub-components
import DashboardHeader from '../../../components/IELTS/dashboard/DashboardHeader';
import DashboardTopCards from '../../../components/IELTS/dashboard/DashboardTopCards';
import AverageSkillScores from '../../../components/IELTS/dashboard/AverageSkillScores';
import RecentActivities from '../../../components/IELTS/dashboard/RecentActivities';
import ProgressChart from '../../../components/IELTS/dashboard/ProgressChart';

const { Text } = Typography;

const DashboardPage = () => {
  const { overview, progress, activities, loading } = useDashboard(5);

if (loading || !overview || !progress) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#4f46e5' }} spin />} />
          <Text className="text-slate-500 font-medium text-lg">Loading your IELTS learning data...</Text>
        </div>
      </div>
    );
  }

  const { full_test_stats, skill_stats } = overview;
  const { chart_data, streak_info } = progress;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        <DashboardHeader streakInfo={streak_info} />
        
        <DashboardTopCards stats={full_test_stats} />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <AverageSkillScores skillStats={skill_stats} />
          </Col>
          <Col xs={24} lg={10}>
            <RecentActivities activities={activities} />
          </Col>
        </Row>

        <ProgressChart chartData={chart_data} />

      </div>
    </div>
  );
};

export default DashboardPage;
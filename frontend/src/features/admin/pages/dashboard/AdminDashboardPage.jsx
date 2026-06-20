import React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Space
} from 'antd';

import {
  UserOutlined,
  UserAddOutlined, 
  FileTextOutlined,
  BarChartOutlined,
  BookOutlined,
  SoundOutlined,
  EditOutlined,
  MessageOutlined,
  TrophyOutlined
} from '@ant-design/icons';

import { useAdminDashboard } from '../../hooks/dashboard/useAdminDashboard';
import SkillPieChart from '../../components/dashboard/SkillPieChart';

const { Title, Text } = Typography;

/* ================= CONFIG ================= */

const STAT_CARDS = [
  {
    title: 'Total Users',
    key: 'total_users',
    icon: <UserOutlined />,
    color: '#3b82f6', // blue-500
    bg: 'linear-gradient(135deg, #eff6ff, #ffffff)' // blue-50
  },
  {
    title: 'IELTS Tests',
    key: 'total_full_tests',
    icon: <BookOutlined />,
    color: '#f97316', // orange-500
    bg: 'linear-gradient(135deg, #fff7ed, #ffffff)' // orange-50
  },
  {
    title: 'IELTS Attempts',
    key: 'total_submissions',
    icon: <FileTextOutlined />,
    color: '#eab308', // yellow-500
    bg: 'linear-gradient(135deg, #fefce8, #ffffff)' // yellow-50
  },
  {
    title: 'New Users Today',
    key: 'new_users_today',
    icon: <UserAddOutlined />,
    color: '#22c55e', // green-500
    bg: 'linear-gradient(135deg, #f0fdf4, #ffffff)' // green-50
  },
  {
    title: 'APTIS Tests',
    key: 'total_aptis_full_tests', 
    icon: <TrophyOutlined />,
    color: '#a855f7', // purple-500
    bg: 'linear-gradient(135deg, #faf5ff, #ffffff)' // purple-50
  },
  {
    title: 'APTIS Attempts',
    key: 'total_aptis_submissions', 
    icon: <BarChartOutlined />,
    color: '#ec4899', // pink-500
    bg: 'linear-gradient(135deg, #fdf2f8, #ffffff)' // pink-50
  }
];

const IELTS_SKILLS = [
  { key: 'Reading', icon: <BookOutlined /> },
  { key: 'Listening', icon: <SoundOutlined /> },
  { key: 'Writing', icon: <EditOutlined /> },
  { key: 'Speaking', icon: <MessageOutlined /> }
];

const APTIS_SKILLS = [
  { key: 'GrammarVocab', icon: <BookOutlined /> },
  { key: 'Reading', icon: <BookOutlined /> },
  { key: 'Listening', icon: <SoundOutlined /> },
  { key: 'Writing', icon: <EditOutlined /> },
  { key: 'Speaking', icon: <MessageOutlined /> }
];

const SKILL_COLOR_MAP = {
  Reading: '#3b82f6',
  Listening: '#14b8a6',
  Writing: '#eab308',
  Speaking: '#a855f7',
  GrammarVocab: '#ec4899'
};

/* ================= SKILL CARD ================= */

const SkillCard = ({ title, skills, data }) => (
  <Card
    title={<span className="text-xl font-bold text-gray-800 tracking-tight">{title}</span>}
    bordered={false}
    className="rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-500 h-full border border-gray-100 bg-white"
    styles={{ header: { borderBottom: '1px solid #f3f4f6', padding: '20px 24px' }, body: { padding: '24px' } }}
  >
    <Row gutter={[16, 16]}>
      {skills.map((skill) => (
        <Col span={12} key={skill.key}>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <Space size="middle">
              <div
                className="p-3 rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                style={{ background: SKILL_COLOR_MAP[skill.key] }}
              >
                {skill.icon}
              </div>
              <Text className="font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                {skill.key}
              </Text>
            </Space>

            <Text className="font-bold text-xl text-gray-800 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all duration-300">
              {data?.[skill.key] || 0}
            </Text>
          </div>
        </Col>
      ))}
    </Row>
  </Card>
);

/* ================= PAGE ================= */

const AdminDashboardPage = () => {
  const { stats, loading } = useAdminDashboard();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spin size="large" tip="Loading dashboard data..." className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[32px] mb-8 p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10">
          <Title level={2} className="!text-white !mb-2 !font-extrabold tracking-tight drop-shadow-md">
            Admin Dashboard
          </Title>
          <Text className="!text-indigo-100 text-lg font-medium tracking-wide">
            Overview of platform performance and key metrics
          </Text>
        </div>
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl mix-blend-overlay animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white opacity-5 blur-2xl mix-blend-overlay" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-fuchsia-400 opacity-20 blur-2xl mix-blend-overlay" />
      </div>

      {/* STATS */}
      <Row gutter={[24, 24]}>
        {STAT_CARDS.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.key}>
            <Card
              bordered={false}
              className="rounded-[28px] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group border border-white/60"
              style={{
                background: item.bg,
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
              }}
            >
              <Statistic
                title={<span className="text-gray-500 font-bold text-xs uppercase tracking-widest">{item.title}</span>}
                value={stats?.[item.key] || 0}
                valueStyle={{ fontWeight: 800, fontSize: '36px', color: '#111827', marginTop: '12px', letterSpacing: '-0.02em' }}
                prefix={
                  <div
                    className="p-4 rounded-2xl mr-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                      color: '#fff',
                    }}
                  >
                    {item.icon}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHARTS */}
      <Row gutter={[24, 24]} className="mt-8">
        <Col xs={24} lg={12}>
          <Card
            title={<span className="text-xl font-bold text-gray-800 tracking-tight">IELTS Distribution</span>}
            bordered={false}
            className="rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 h-full bg-white"
            styles={{ header: { borderBottom: '1px solid #f3f4f6', padding: '20px 24px' } }}
          >
            <div className="py-4">
              <SkillPieChart skills={stats?.ielts_skills} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span className="text-xl font-bold text-gray-800 tracking-tight">APTIS Distribution</span>}
            bordered={false}
            className="rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-500 border border-gray-100 h-full bg-white"
            styles={{ header: { borderBottom: '1px solid #f3f4f6', padding: '20px 24px' } }}
          >
            <div className="py-4">
              <SkillPieChart skills={stats?.aptis_skills} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* SKILLS */}
      <Row gutter={[24, 24]} className="mt-8 mb-8">
        <Col xs={24} lg={12}>
          <SkillCard
            title="IELTS Question Bank"
            skills={IELTS_SKILLS}
            data={stats?.ielts_skills}
          />
        </Col>

        <Col xs={24} lg={12}>
          <SkillCard
            title="APTIS Question Bank"
            skills={APTIS_SKILLS}
            data={stats?.aptis_skills}
          />
        </Col>
      </Row>

    </div>
  );
};

export default AdminDashboardPage;
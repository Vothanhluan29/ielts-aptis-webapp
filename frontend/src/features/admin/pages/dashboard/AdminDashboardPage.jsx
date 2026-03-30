import React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Tag,
  Space
} from 'antd';

import {
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  BookOutlined,
  SoundOutlined,
  EditOutlined,
  MessageOutlined
} from '@ant-design/icons';

import { useAdminDashboard } from '../../hooks/dashboard/useAdminDashboard';
import SkillPieChart from '../../components/dashboard/SkillPieChart';

const { Title, Text } = Typography;

/* ================= CONFIG ================= */

const STAT_CARDS = [
  {
    title: 'Enrolled Users',
    key: 'total_users',
    icon: <UserOutlined />,
    color: '#1677ff',
    bg: 'linear-gradient(135deg, #e6f4ff, #ffffff)'
  },
  {
    title: 'Total Attempts',
    key: 'total_submissions',
    icon: <FileTextOutlined />,
    color: '#52c41a',
    bg: 'linear-gradient(135deg, #f6ffed, #ffffff)'
  },
  {
    title: 'Assessments',
    key: 'total_full_tests',
    icon: <BarChartOutlined />,
    color: '#fa541c',
    bg: 'linear-gradient(135deg, #fff2e8, #ffffff)'
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
  Reading: '#1677ff',
  Listening: '#13c2c2',
  Writing: '#faad14',
  Speaking: '#722ed1',
  GrammarVocab: '#eb2f96'
};

/* ================= SKILL CARD ================= */

const SkillCard = ({ title, skills, data }) => (
  <Card
    title={title}
    bordered={false}
    style={{
      borderRadius: 20,
      boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
    }}
  >
    <Row gutter={[12, 12]}>
      {skills.map((skill) => (
        <Col span={12} key={skill.key}>
          <Card
            size="small"
            bordered={false}
            style={{
              borderRadius: 14,
              background: '#fafafa'
            }}
            hoverable
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <div
                  style={{
                    background: SKILL_COLOR_MAP[skill.key],
                    color: '#fff',
                    padding: 6,
                    borderRadius: 8
                  }}
                >
                  {skill.icon}
                </div>
                <Text strong>{skill.key}</Text>
              </Space>

              <Text strong>{data?.[skill.key] || 0}</Text>
            </div>
          </Card>
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
      <div style={{ height: 300 }} className="flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 10 }}>

      {/* HEADER */}
      <div
        style={{
          padding: 24,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #1677ff, #722ed1)',
          color: '#fff',
          marginBottom: 24,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Admin Dashboard
        </Title>
        <Text style={{ color: '#f0f0f0' }}>
          Overview of platform performance
        </Text>

        <div style={{ marginTop: 12 }}>
          <Tag color="gold" style={{ fontWeight: 600 }}>
            +{stats?.new_users_today || 0} new users today
          </Tag>
        </div>
      </div>

      {/* STATS */}
      <Row gutter={[16, 16]}>
        {STAT_CARDS.map((item) => (
          <Col xs={24} md={8} key={item.key}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                background: item.bg,
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}
              hoverable
            >
              <Statistic
                title={item.title}
                value={stats?.[item.key] || 0}
                valueStyle={{ fontWeight: 700 }}
                prefix={
                  <div
                    style={{
                      background: item.color,
                      color: '#fff',
                      padding: 10,
                      borderRadius: 12
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
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="IELTS Distribution"
            bordered={false}
            style={{ borderRadius: 20 }}
          >
            <SkillPieChart skills={stats?.ielts_skills} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="APTIS Distribution"
            bordered={false}
            style={{ borderRadius: 20 }}
          >
            <SkillPieChart skills={stats?.aptis_skills} />
          </Card>
        </Col>
      </Row>

      {/* SKILLS */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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
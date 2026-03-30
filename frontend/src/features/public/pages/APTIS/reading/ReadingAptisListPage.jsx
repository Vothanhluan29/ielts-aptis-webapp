import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Button, Tag, Typography, Row, Col,
  Skeleton, Empty, Space, Radio
} from 'antd';

import {
  BookOpen, Clock, CheckCircle,
  AlertCircle, ArrowRight, History, RotateCcw
} from 'lucide-react';

import readingAptisStudentApi
  from '../../../api/APTIS/reading/readingAptisStudentApi';

const { Title, Paragraph, Text } = Typography;

const ReadingAptisListPage = () => {

  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await readingAptisStudentApi.getListTests();
      const data = response.data || response || [];
      setTests(data);
    } catch (error) {
      console.error('Error fetching Reading test list:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = useMemo(() => {
    if (filterStatus === 'ALL') return tests;
    return tests.filter(test => test.status === filterStatus);
  }, [tests, filterStatus]);

  const getStatusConfig = (status, testId) => {
    switch (status) {
      case 'GRADED':
      case 'COMPLETED':
        return {
          tagColor: 'success',
          text: 'Completed',
          icon: <CheckCircle size={14} className="mr-1" />,
          mainBtnText: 'View Result',
          mainBtnAction: () => navigate(`/aptis/reading/result/${testId}`),
          showRetry: true
        };
      default:
        return {
          tagColor: 'orange',
          text: 'Not Started',
          icon: <AlertCircle size={14} className="mr-1" />,
          mainBtnText: 'Start Now',
          mainBtnAction: () => navigate(`/aptis/reading/lobby/${testId}`),
          showRetry: false
        };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-200">
            <BookOpen size={32} strokeWidth={2.5} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
              Aptis Reading Practice
            </Title>
            <Text className="text-slate-500 font-medium">
              Practice Reading based on the British Council structure
            </Text>
          </div>
        </div>

        <Space size="middle" wrap>

          {/* STATUS FILTER */}
          <Radio.Group
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="custom-radio-group"
          >
            <Radio.Button value="ALL">All</Radio.Button>
            <Radio.Button value="NOT_STARTED">Not Started</Radio.Button>
            <Radio.Button value="GRADED">Completed</Radio.Button>
          </Radio.Group>

          <Button
            icon={<History size={18} />}
            onClick={() => navigate('/aptis/reading/history')}
            className="flex items-center gap-2 rounded-lg font-bold border-slate-200 hover:text-orange-500 shadow-sm h-10"
          >
            History
          </Button>

        </Space>
      </div>

      {/* CONTENT */}
      {loading ? (

        <Row gutter={[24, 24]}>
          {[1, 2, 3].map(i => (
            <Col xs={24} md={12} lg={8} key={i}>
              <Card className="rounded-3xl border-slate-100">
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>

      ) : filteredTests.length === 0 ? (

        <Empty
          className="mt-20"
          description={
            <Text type="secondary" style={{ fontSize: 16 }}>
              No reading tests found.
            </Text>
          }
        />

      ) : (

        <Row gutter={[24, 24]}>
          {filteredTests.map(test => {

            const config = getStatusConfig(test.status, test.id);

            return (
              <Col xs={24} md={12} lg={8} key={test.id}>
                <Card
                  hoverable
                  className="h-full flex flex-col rounded-3xl border-slate-200 shadow-sm transition-all duration-300 hover:shadow-orange-100/60 hover:border-orange-200"
                  styles={{
                    body: {
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      padding: '24px'
                    }
                  }}
                >

                  {/* STATUS + TIME */}
                  <div className="flex justify-between items-center mb-4">
                    <Tag
                      color={config.tagColor}
                      className="flex items-center gap-1 px-3 py-1 m-0 rounded-lg font-bold border-0"
                    >
                      {config.icon}
                      {config.text}
                    </Tag>

                    <Space className="text-slate-400 text-xs font-bold bg-slate-50 px-2 py-1 rounded-md">
                      <Clock size={12} />
                      {test.time_limit || 35}
                      Minutes
                    </Space>
                  </div>

                  {/* INFO */}
                  <div className="flex-1 mb-6">
                    <Title
                      level={4}
                      className="line-clamp-1"
                      style={{ marginTop: 0, marginBottom: 8, fontWeight: 800 }}
                    >
                      {test.title}
                    </Title>

                    <Paragraph
                      className="text-slate-500 line-clamp-2 m-0"
                      style={{ fontSize: 13 }}
                    >
                      {test.description ||
                        'This reading test follows the official Aptis format with multiple parts. Read each passage carefully before answering.'}
                    </Paragraph>
                  </div>

                  {/* ACTION */}
                  <div className="flex flex-col gap-2">
                    <Button
                      type={test.status === 'NOT_STARTED' ? 'primary' : 'default'}
                      size="large"
                      block
                      onClick={config.mainBtnAction}
                      className={`
                        h-11 rounded-xl font-bold flex items-center justify-center gap-2
                        ${test.status === 'NOT_STARTED'
                          ? 'bg-orange-500 hover:bg-orange-400 border-none'
                          : 'text-orange-500 border-orange-200 hover:bg-orange-50'
                        }
                      `}
                    >
                      {config.mainBtnText}
                      <ArrowRight size={18} />
                    </Button>

                    {config.showRetry && (
                      <Button
                        icon={<RotateCcw size={16} />}
                        block
                        className="h-11 rounded-xl font-semibold text-slate-500 border-slate-200 hover:text-orange-500 hover:border-orange-500"
                        onClick={() => navigate(`/aptis/reading/taking/${test.id}`)}
                      >
                        Retry Test
                      </Button>
                    )}
                  </div>

                </Card>
              </Col>
            );
          })}
        </Row>

      )}
    </div>
  );
};

export default ReadingAptisListPage;
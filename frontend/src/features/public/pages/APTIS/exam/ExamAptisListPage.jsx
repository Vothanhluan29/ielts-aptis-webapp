import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Row, Col, Skeleton, Empty, Space, Radio } from 'antd';
import { 
  Clock, CheckCircle, 
  AlertCircle, ArrowRight, History, RotateCcw, 
  ClipboardList, RefreshCw 
} from 'lucide-react';

import examAptisStudentApi from '../../../api/APTIS/exam/examAptisStudentApi';

const { Title, Paragraph, Text } = Typography;

const ExamAptisListPage = () => {
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
      const response = await examAptisStudentApi.getLibraryTests();
      setTests(response?.data || response || []);
    } catch (error) {
      console.error("Error fetching Aptis Full Test list:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ĐÃ SỬA: Lọc dựa theo `user_status` thay vì `status`
  const filteredTests = useMemo(() => {
    if (filterStatus === 'ALL') return tests;
    if (filterStatus === 'COMPLETED') return tests.filter(test => ['GRADED', 'COMPLETED', 'FINISHED'].includes(test.user_status));
    return tests.filter(test => test.user_status === filterStatus);
  }, [tests, filterStatus]);

  // 🔥 ĐÃ SỬA: Cấu hình thông minh dùng user_status và exam_submission_id
  const getStatusConfig = (test) => {
    const status = test.user_status || 'NOT_STARTED';
    const testId = test.id;
    // Lấy submission id để xem kết quả, nếu không có thì fallback tạm về testId
    const subId = test.exam_submission_id || testId; 

    if (['GRADED', 'COMPLETED', 'FINISHED'].includes(status)) {
      return {
        tagColor: 'success',
        text: 'Completed',
        icon: <CheckCircle size={14} className="mr-1" />,
        mainBtnText: 'View Result',
        mainBtnAction: () => navigate(`/aptis/exam/result/${subId}`), // Dẫn vào Result
        btnClass: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50',
        showRetry: true // Hiện thêm nút làm lại
      };
    } else if (status === 'IN_PROGRESS') {
      return {
        tagColor: 'warning',
        text: 'In Progress',
        icon: <RefreshCw size={14} className="mr-1" />,
        mainBtnText: 'Resume Test',
        mainBtnAction: () => navigate(`/aptis/exam/lobby/${testId}`), // Dẫn vào Lobby
        btnClass: 'bg-amber-500 hover:bg-amber-400 border-none text-white',
        showRetry: false
      };
    } else {
      return {
        tagColor: 'purple',
        text: 'Not Started',
        icon: <AlertCircle size={14} className="mr-1" />,
        mainBtnText: 'Start Now',
        mainBtnAction: () => navigate(`/aptis/exam/lobby/${testId}`), // Dẫn vào Lobby
        btnClass: 'bg-indigo-600 hover:bg-indigo-500 border-none text-white',
        showRetry: false
      };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-in fade-in duration-500">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          
          {/* ICON */}
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center">
            <ClipboardList size={32} strokeWidth={2} />
          </div>

          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
              Aptis Full Mock Test
            </Title>
            <Text className="text-slate-500 font-medium">
              Comprehensive 5-skill assessment based on the British Council structure
            </Text>
          </div>
        </div>

        <Space size="middle" wrap>

          <Radio.Group 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="custom-radio-group"
          >
            <Radio.Button value="ALL">All</Radio.Button>
            <Radio.Button value="NOT_STARTED">Not Started</Radio.Button>
            <Radio.Button value="IN_PROGRESS">In Progress</Radio.Button>
            <Radio.Button value="COMPLETED">Completed</Radio.Button>
          </Radio.Group>

          <Button 
            icon={<History size={18} />} 
            onClick={() => navigate('/aptis/exam/history')}
            className="flex items-center gap-2 rounded-lg font-bold border-slate-200 hover:text-indigo-600 shadow-sm h-10"
          >
            History
          </Button>

        </Space>
      </div>

      {/* ================= CONTENT SECTION ================= */}

      {loading ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map((i) => (
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
              No matching tests found.
            </Text>
          } 
        />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredTests.map((test) => {
            // 🔥 Truyền thẳng test object vào
            const config = getStatusConfig(test);
            
            return (
              <Col xs={24} md={12} lg={8} key={test.id}>
                <Card 
                  hoverable
                  className="h-full flex flex-col rounded-3xl border-slate-200 shadow-sm transition-all duration-300 hover:shadow-indigo-100/60 hover:border-indigo-200"
                  styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' } }}
                >

                  <div className="flex justify-between items-center mb-4">
                    <Tag color={config.tagColor} className="flex items-center gap-1 px-3 py-1 m-0 rounded-lg font-bold border-0">
                      {config.icon} {config.text}
                    </Tag>

                    <Space className="text-slate-400 text-xs font-bold bg-slate-50 px-2 py-1 rounded-md">
                      <Clock size={12} /> {test.time_limit || 160} Minutes
                    </Space>
                  </div>

                  <div className="flex-1 mb-6">
                    <Title level={4} className="line-clamp-1" style={{ marginTop: 0, marginBottom: 8, fontWeight: 800 }}>
                      {test.title}
                    </Title>

                    <Paragraph className="text-slate-500 line-clamp-2 m-0" style={{ fontSize: 13 }}>
                      {test.description || 'This full mock test evaluates your comprehensive English proficiency across 5 skills: Grammar & Vocab, Reading, Listening, Writing, and Speaking.'}
                    </Paragraph>
                  </div>

                  <div className="flex flex-col gap-2">

                    {/* NÚT MAIN (Start, Resume, hoặc View Result) */}
                    <Button 
                      type={test.user_status === 'NOT_STARTED' || test.user_status === 'IN_PROGRESS' ? 'primary' : 'default'}
                      size="large"
                      block
                      onClick={config.mainBtnAction}
                      className={`h-11 rounded-xl font-bold flex items-center justify-center gap-2 ${config.btnClass}`}
                    >
                      {config.mainBtnText} <ArrowRight size={18} />
                    </Button>

                    {/* NÚT RETRY (Chỉ hiện khi đã thi xong) */}
                    {config.showRetry && (
                      <Button 
                        icon={<RotateCcw size={16} />}
                        block
                        className="h-11 rounded-xl font-semibold text-slate-500 border-slate-200 hover:text-orange-500 hover:border-orange-500"
                        onClick={() => navigate(`/aptis/exam/lobby/${test.id}`)}
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

export default ExamAptisListPage;
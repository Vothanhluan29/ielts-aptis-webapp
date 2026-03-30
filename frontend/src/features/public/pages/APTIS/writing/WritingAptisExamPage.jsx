import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Button, Input, Modal, Typography, Spin, message, Space, Card, Row, Col, Divider, Tag } from 'antd';
import { 
  ClockCircleOutlined, 
  ExclamationCircleOutlined, 
  SendOutlined, 
  LeftOutlined, 
  RightOutlined,
  EditOutlined
} from '@ant-design/icons';
import writingAptisStudentApi from '../../../api/APTIS/writing/writingAptisStudentApi';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 🔥 NHẬN PROPS TỪ LAYOUT MẸ (ExamAptisExamPage)
const WritingAptisExamPage = ({ 
  isFullTest = false, 
  fullTestSubmissionId = null, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  // 🔥 LẤY ID ĐỘNG TÙY THUỘC VÀO CHẾ ĐỘ THI
  const testId = isFullTest ? testIdFromProps : urlId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  
  const [currentPart, setCurrentPart] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);

  const [answers, setAnswers] = useState({
    part_1: ["", "", "", "", ""],
    part_2: "",
    part_3: ["", "", ""],
    part_4: { informal: "", formal: "" }
  });

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // ==========================================
  // 1. FETCH API & MAP DATABASE
  // ==========================================
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        if (!testId) throw new Error("Không tìm thấy ID bài thi Writing!");

        // 🔥 Đã đổi `id` thành `testId`
        const data = await writingAptisStudentApi.getTestDetail(testId);
        setTestDetail(data);
        setTimeLeft((data?.time_limit || 50) * 60); 
      } catch (error) {
        message.error(`Không thể tải đề thi: ${error.message || "Vui lòng thử lại!"}`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (isAutoSubmit) {
        message.warning({ content: "Đã hết thời gian! Hệ thống tự động nộp bài.", duration: 5 });
      } else {
        message.loading({ content: 'Đang nộp bài...', key: 'submit' });
      }

      const currentAnswers = answersRef.current;
      
      const payload = {
        test_id: parseInt(testId), // 🔥 Đã đổi `id` thành `testId`
        is_full_test_only: isFullTest, // 🔥 Khai báo chế độ thi
        user_answers: {
          part_1: JSON.stringify(currentAnswers.part_1), 
          part_2: String(currentAnswers.part_2 || ""),   
          part_3: JSON.stringify(currentAnswers.part_3), 
          part_4: JSON.stringify(currentAnswers.part_4)  
        }
      };

      const res = await writingAptisStudentApi.submitTest(payload);
      const submissionData = res.data || res;
      
      message.success({ content: 'Nộp bài thành công!', key: 'submit' });
      
      // 🔥 RẼ NHÁNH ĐIỀU HƯỚNG
      if (isFullTest && onSkillFinish) {
        // Gọi Layout mẹ để chuyển sang kỹ năng tiếp theo (Speaking)
        onSkillFinish(submissionData.id);
      } else {
        // Đổi về điều hướng sang Result thay vì History để nhất quán
        navigate(`/aptis/writing/result/${submissionData.id}`); 
      }

    } catch (error) {
      console.error("submission error:", error?.response?.data || error);
      message.error({ content: 'Lỗi nộp bài. Vui lòng kiểm tra lại!', key: 'submit' });
      setSubmitting(false);
    }
  };

  // ==========================================
  // 3. TIMER LOGIC
  // ==========================================
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) {
      if (timeLeft <= 0 && !loading && !submitting && testDetail) {
        handleSubmit(true);
      }
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading, submitting, testDetail]);

  // ==========================================
  // 4. HELPERS & UI COMPONENTS
  // ==========================================
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const countWords = (str) => {
    if (!str || str.trim() === '') return 0;
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const updateAnswer = (part, index, value, subKey = null) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (subKey) {
        newAnswers[part] = { ...newAnswers[part], [subKey]: value };
      } else if (index !== null) {
        const newArr = [...newAnswers[part]];
        newArr[index] = value;
        newAnswers[part] = newArr;
      } else {
        newAnswers[part] = value;
      }
      return newAnswers;
    });
  };

  const confirmSubmit = () => {
    Modal.confirm({
      title: 'Xác nhận nộp bài',
      icon: <ExclamationCircleOutlined />,
      // 🔥 Đổi thông báo tùy thuộc chế độ thi
      content: isFullTest 
        ? 'Sau khi nộp, hệ thống sẽ tự động chuyển sang phần Speaking. Bạn sẽ không thể sửa lại đáp án phần này. Tiếp tục?' 
        : 'Bạn có chắc chắn muốn nộp bài? Bạn không thể thay đổi câu trả lời sau khi nộp.',
      okText: 'Nộp bài',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => handleSubmit(false)
    });
  };

  const renderWordCount = (current, min, max) => {
    let color = '#8c8c8c'; 
    if (min && max) {
      if (current >= min && current <= max) color = '#52c41a'; 
      else if (current > 0) color = '#faad14'; 
    }
    return (
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Text style={{ color, fontWeight: 'bold' }}>Words: {current} {max ? `/ ${max}` : ''}</Text>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Spin size="large" />
          <Text type="secondary">Đang tải đề thi...</Text>
        </div>
      </div>
    );
  }

  // ========================================================
  // 🔥 BÓC TÁCH DỮ LIỆU TỪ DATABASE
  // ========================================================
  const partsList = testDetail?.parts || [];
  const getPart = (num) => partsList.find(p => p.part_number === num) || { instruction: "", questions: [] };
  
  const p1 = getPart(1);
  const p2 = getPart(2);
  const p3 = getPart(3);
  const p4 = getPart(4);

  const getQuestionText = (part, index, defaultText) => {
    if (part.questions && part.questions[index]) {
      return part.questions[index].question_text;
    }
    return defaultText;
  };

  const isTimeRunningOut = timeLeft < 300;

  return (
    <Layout style={{ minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh', backgroundColor: '#f0f2f5', overflow: 'hidden' }}>
      
      {/* HEADER GỐC: Ẩn nếu đang ở Full Test */}
      {!isFullTest && (
        <Header style={{ backgroundColor: '#fff', borderBottom: '1px solid #d9d9d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', zIndex: 10 }}>
          <Space>
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
              <EditOutlined style={{ marginRight: 4 }}/> Aptis Writing
            </Tag>
            <Text strong style={{ fontSize: 16 }}>{testDetail?.title}</Text>
          </Space>
          <Space size="large">
            <div style={{ backgroundColor: isTimeRunningOut ? '#fff1f0' : '#f6ffed', border: `1px solid ${isTimeRunningOut ? '#ffa39e' : '#b7eb8f'}`, padding: '4px 16px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockCircleOutlined style={{ color: isTimeRunningOut ? '#f5222d' : '#52c41a', fontSize: 18 }} />
              <Text strong style={{ color: isTimeRunningOut ? '#f5222d' : '#52c41a', fontSize: 18 }}>
                {formatTime(timeLeft)}
              </Text>
            </div>
          </Space>
        </Header>
      )}

      {/* HEADER PHỤ CHO FULL TEST */}
      {isFullTest && (
        <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center z-10 shadow-sm shrink-0">
          <Text strong className="text-lg text-slate-700">Phần thi: Writing</Text>
          <div style={{ backgroundColor: isTimeRunningOut ? '#fff1f0' : '#f6ffed', border: `1px solid ${isTimeRunningOut ? '#ffa39e' : '#b7eb8f'}`, padding: '4px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClockCircleOutlined style={{ color: isTimeRunningOut ? '#f5222d' : '#52c41a', fontSize: 16 }} />
            <Text strong style={{ color: isTimeRunningOut ? '#f5222d' : '#52c41a', fontSize: 16 }}>
              Thời gian còn lại: {formatTime(timeLeft)}
            </Text>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <Content className="overflow-y-auto custom-scrollbar flex-1" style={{ padding: '24px', width: '100%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
            {[1, 2, 3, 4].map(partNum => (
              <Button key={partNum} type={currentPart === partNum ? 'primary' : 'default'} onClick={() => setCurrentPart(partNum)} style={{ flex: 1, minWidth: 100, height: 40, fontWeight: currentPart === partNum ? 'bold' : 'normal' }}>
                Part {partNum}
              </Button>
            ))}
          </div>

          <Card variant="borderless" style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            
            {/* ----- PART 1 ----- */}
            {currentPart === 1 && (
              <div>
                <Title level={4}>Part 1: Word-level writing</Title>
                <Paragraph style={{ fontSize: 16, backgroundColor: '#fafafa', padding: 16, borderLeft: '4px solid #1890ff', whiteSpace: 'pre-wrap' }}>
                  {p1.instruction || "You are joining a club. You have 5 messages from a member of the club. Write short answers (1 to 5 words) to each message."}
                </Paragraph>
                <Divider />
                <Row gutter={[24, 24]}>
                  {[...Array(5)].map((_, idx) => (
                    <Col xs={24} sm={12} key={idx}>
                      <Card size="small" type="inner" title={`Message ${idx + 1}`} style={{ backgroundColor: '#fafafa' }}>
                        <Text strong style={{ display: 'block', marginBottom: 12, whiteSpace: 'pre-wrap' }}>
                          {getQuestionText(p1, idx, `Question ${idx + 1}?`)}
                        </Text>
                        <Input placeholder="Write your answer here..." value={answers.part_1[idx]} onChange={(e) => updateAnswer('part_1', idx, e.target.value)} disabled={submitting} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* ----- PART 2 ----- */}
            {currentPart === 2 && (
              <div>
                <Title level={4}>Part 2: Short text writing</Title>
                <Paragraph style={{ fontSize: 16, backgroundColor: '#fafafa', padding: 16, borderLeft: '4px solid #1890ff', whiteSpace: 'pre-wrap' }}>
                  {p2.instruction || "You are a new member of the club. Fill in the form. Write in sentences. Use 20 - 30 words."}
                </Paragraph>
                <Divider />
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>
                    {getQuestionText(p2, 0, "Please tell us why you are interested in joining this club.")}
                  </Text>
                </div>
                <TextArea rows={6} placeholder="Start typing your response here..." value={answers.part_2} onChange={(e) => updateAnswer('part_2', null, e.target.value)} disabled={submitting} style={{ fontSize: 16 }} />
                {renderWordCount(countWords(answers.part_2), 20, 30)}
              </div>
            )}

            {/* ----- PART 3 ----- */}
            {currentPart === 3 && (
              <div>
                <Title level={4}>Part 3: Three written responses</Title>
                <Paragraph style={{ fontSize: 16, backgroundColor: '#fafafa', padding: 16, borderLeft: '4px solid #1890ff', whiteSpace: 'pre-wrap' }}>
                  {p3.instruction || "You are talking to other members of the club in the chat room. Talk to them using sentences. Use 30 - 40 words per answer."}
                </Paragraph>
                <Divider />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 16 }}>
                      <div style={{ width: 40, height: 40, backgroundColor: '#bfbfbf', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold', shrink: 0 }}>M{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ backgroundColor: '#e6f7ff', padding: '12px 16px', borderRadius: '0 8px 8px 8px', display: 'inline-block', marginBottom: 12 }}>
                          <Text style={{ whiteSpace: 'pre-wrap' }}>
                              {getQuestionText(p3, idx, `Message ${idx + 1} from a member.`)}
                          </Text>
                        </div>
                        <TextArea rows={3} placeholder="Reply to the member..." value={answers.part_3[idx]} onChange={(e) => updateAnswer('part_3', idx, e.target.value)} disabled={submitting} />
                        {renderWordCount(countWords(answers.part_3[idx]), 30, 40)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----- PART 4 ----- */}
            {currentPart === 4 && (
              <div>
                <Title level={4}>Part 4: Formal and informal writing</Title>
                <Paragraph style={{ fontSize: 16, backgroundColor: '#fafafa', padding: 16, borderLeft: '4px solid #1890ff', whiteSpace: 'pre-wrap' }}>
                  {p4.instruction || "You are a member of a club. You received an email from the club manager. Read the email and write two responses."}
                </Paragraph>
                <Divider />
                
                <Card size="small" style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f', marginBottom: 24 }}>
                  <Text style={{ whiteSpace: 'pre-wrap', fontSize: 15 }}>
                    {getQuestionText(p4, 0, "Dear Members,\n\nWe are writing to inform you that the upcoming club event will be cancelled due to bad weather. We apologize for the inconvenience.\n\nManager.")}
                  </Text>
                </Card>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                      {getQuestionText(p4, 1, "Task 1: Write to a friend (approx. 50 words)")}
                    </Text>
                    <TextArea rows={8} style={{ marginTop: 12 }} placeholder="Start your email to your friend here..." value={answers.part_4.informal} onChange={(e) => updateAnswer('part_4', null, e.target.value, 'informal')} disabled={submitting} />
                    {renderWordCount(countWords(answers.part_4.informal), null, 50)}
                  </Col>

                  <Col xs={24} md={12}>
                    <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                      {getQuestionText(p4, 2, "Task 2: Write to the manager (120-150 words)")}
                    </Text>
                    <TextArea rows={8} style={{ marginTop: 12 }} placeholder="Start your formal email here..." value={answers.part_4.formal} onChange={(e) => updateAnswer('part_4', null, e.target.value, 'formal')} disabled={submitting} />
                    {renderWordCount(countWords(answers.part_4.formal), 120, 150)}
                  </Col>
                </Row>
              </div>
            )}

          </Card>
        </div>
      </Content>

      {/* FOOTER */}
      <Footer style={{ backgroundColor: '#fff', borderTop: '1px solid #d9d9d9', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, shrink: 0 }}>
        <Button size="large" disabled={currentPart === 1 || submitting} onClick={() => setCurrentPart(prev => prev - 1)} icon={<LeftOutlined />}>
          Previous
        </Button>
        {currentPart < 4 ? (
          <Button type="primary" size="large" onClick={() => setCurrentPart(prev => prev + 1)} disabled={submitting}>
            Next <RightOutlined />
          </Button>
        ) : (
          <Button type="primary" danger size="large" onClick={confirmSubmit} loading={submitting} icon={<SendOutlined />}>
            {isFullTest ? 'Nộp & Sang phần Speaking' : 'Submit Test'}
          </Button>
        )}
      </Footer>
    </Layout>
  );
};

export default WritingAptisExamPage;
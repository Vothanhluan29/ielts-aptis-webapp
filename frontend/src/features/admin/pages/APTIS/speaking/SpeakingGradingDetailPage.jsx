import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // 🔥 ADD useLocation
import { 
  Row, Col, Card, Typography, Button, Input, 
  InputNumber, Select, Space, Spin, message, Badge, Slider, Image
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, 
  UserOutlined, AudioOutlined, EditOutlined, 
  WarningOutlined
} from '@ant-design/icons';
import speakingAptisAdminApi from '../../../api/APTIS/speaking/speakingAptisAdminApi';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Standard color palette for each Part
const themeColors = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', hex: '#3b82f6', leftBorder: 'border-l-blue-500' },
  green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', hex: '#22c55e', leftBorder: 'border-l-green-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', hex: '#f97316', leftBorder: 'border-l-orange-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', hex: '#a855f7', leftBorder: 'border-l-purple-500' },
};

const SpeakingGradingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 GET STATE TO KNOW WHERE WE CAME FROM

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);

  const [grading, setGrading] = useState({
    p1: 0, p2: 0, p3: 0, p4: 0,
    feedback: { p1: "", p2: "", p3: "", p4: "" },
    overall_feedback: "",
    cefr_level: "A0"
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await speakingAptisAdminApi.getSubmissionDetail(id);
      const data = res.data || res;
      setSubmission(data);
      
      if (data.status === 'GRADED') {
        const getAnswer = (p) => data.answers?.find(a => a.part_number === p) || {};
        setGrading({
          p1: getAnswer(1).part_score || 0, p2: getAnswer(2).part_score || 0,
          p3: getAnswer(3).part_score || 0, p4: getAnswer(4).part_score || 0,
          feedback: {
            p1: getAnswer(1).admin_feedback || "", p2: getAnswer(2).admin_feedback || "",
            p3: getAnswer(3).admin_feedback || "", p4: getAnswer(4).admin_feedback || "",
          },
          overall_feedback: data.overall_feedback || "",
          cefr_level: data.cefr_level || "A0"
        });
      }
    } catch (error) {
      message.error("Error loading submission details!", error);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = grading.p1 + grading.p2 + grading.p3 + grading.p4;
  
  const autoSuggestCEFR = (score) => {
    if (score >= 48) return "C"; if (score >= 40) return "B2";
    if (score >= 26) return "B1"; if (score >= 18) return "A2";
    if (score >= 6) return "A1"; return "A0";
  };

  const getCEFRColor = (level) => {
    const colors = { "A0": "#ff4d4f", "A1": "#ff4d4f", "A2": "#fa8c16", "B1": "#fadb14", "B2": "#1677ff", "C": "#52c41a" };
    return colors[level] || "#d9d9d9";
  };

  // 🔥 1. Back navigation logic
  const handleBack = () => {
    if (location.state && location.state.fromExamId) {
      navigate(`/admin/aptis/submissions/${location.state.fromExamId}`);
    } else {
      navigate("/admin/aptis/submissions/speaking");
    }
  };

  // 🔥 2. Save grade handler
  const handleSaveGrade = async () => {
    setSubmitting(true);
    try {
      const payload = {
        total_score: totalScore,
        cefr_level: grading.cefr_level || autoSuggestCEFR(totalScore),
        overall_feedback: grading.overall_feedback,
        part_feedbacks: [
          { part_number: 1, score: grading.p1, comments: grading.feedback.p1 },
          { part_number: 2, score: grading.p2, comments: grading.feedback.p2 },
          { part_number: 3, score: grading.p3, comments: grading.feedback.p3 },
          { part_number: 4, score: grading.p4, comments: grading.feedback.p4 },
        ]
      };
      await speakingAptisAdminApi.gradeSubmission(id, payload);
      message.success("Grade saved successfully!");
      
      // After saving, automatically call handleBack for smart redirection
      handleBack();

    } catch (error) {
      message.error("Error saving grade!", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Spin size="large" /></div>;

  const gradingSections = [
    { key: 'p1', title: 'Part 1: Personal Info', max: 5, colorKey: 'blue' },
    { key: 'p2', title: 'Part 2: Describe Picture', max: 5, colorKey: 'green' },
    { key: 'p3', title: 'Part 3: Compare Pictures', max: 15, colorKey: 'orange' },
    { key: 'p4', title: 'Part 4: Abstract Topic', max: 25, colorKey: 'purple' },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      
      {/* COMPACT HEADER */}
      <div className="bg-white px-5 py-3 rounded-lg shadow-sm mb-4 flex justify-between items-center border border-gray-200">
        <Space size="large">
          {/* 🔥 3. Apply handleBack to the Back button */}
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} size="small">Back</Button>
          
          <div className="flex items-center gap-4">
            <Space>
              <UserOutlined className="text-gray-400" />
              <Text strong className="text-base">{submission?.user?.full_name || 'Anonymous'}</Text>
            </Space>
            <span className="text-gray-300">|</span>
            <Space>
              <AudioOutlined className="text-indigo-400" />
              <Text className="text-gray-600">{submission?.test?.title}</Text>
            </Space>

            {/* 🔥 Show Badge if coming from Full Test */}
            {location.state?.fromExamId && (
              <Badge color="purple" text="Full Test Component" className="ml-2 font-semibold" />
            )}
          </div>
        </Space>

        <Space>
          <div className="bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
            <Text className="text-gray-500 text-xs mr-2 uppercase">Total Score</Text>
            <Text strong className="text-lg text-indigo-600">{totalScore}/50</Text>
            <Badge count={autoSuggestCEFR(totalScore)} style={{ backgroundColor: getCEFRColor(autoSuggestCEFR(totalScore)), marginLeft: 8 }} />
          </div>
          <Button 
            type="primary" icon={<SaveOutlined />} 
            loading={submitting} onClick={handleSaveGrade}
            className="bg-indigo-600 font-medium"
          >
            Save Results
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        {/* TEST QUESTIONS & AUDIO */}
        <Col xs={24} lg={13}>
          <div className="space-y-4">
            {submission?.test?.parts?.map((part, index) => {
              const studentAnswer = submission?.answers?.find(a => a.part_number === part.part_number);
              // Apply color based on Part order
              const colorKeys = ['blue', 'green', 'orange', 'purple'];
              const theme = themeColors[colorKeys[index % 4]];
              
              return (
                <Card 
                  key={part.id} 
                  size="small"
                  className={`shadow-sm border-gray-200 rounded-lg border-l-4 ${theme.leftBorder}`}
                  title={<Text strong className={theme.text}>Part {part.part_number}: {part.part_type}</Text>}
                  extra={
                    studentAnswer?.audio_url ? (
                      <audio controls controlsList="nodownload" className="h-8 w-60" src={studentAnswer.audio_url} />
                    ) : (
                      <Text type="danger" className="text-xs"><WarningOutlined /> No Audio</Text>
                    )
                  }
                >
                  <Text italic className="text-gray-500 text-sm block mb-3">{part.instruction}</Text>

                  {/* IMAGES */}
                  {(part.image_url || part.image_url_2) && (
                    <div className="mb-3 flex gap-2">
                      {part.image_url && <Image src={part.image_url} height={100} className="rounded border" />}
                      {part.image_url_2 && <Image src={part.image_url_2} height={100} className="rounded border" />}
                    </div>
                  )}

                  {/* QUESTIONS */}
                  <div className={`space-y-1 p-2 rounded border ${theme.bg} ${theme.border}`}>
                    {part.questions?.map((q, idx) => (
                      <div key={q.id} className="text-sm">
                        <Text strong className="mr-2">Q{idx + 1}.</Text>
                        <Text>{q.question_text}</Text>
                        <Text type="secondary" className="ml-2 text-xs">({q.prep_time}s / {q.response_time}s)</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </Col>

        {/* GRADING PANEL */}
        <Col xs={24} lg={11}>
          <div className="sticky top-4">
            <Card 
              size="small" 
              className="shadow-sm border-gray-200 rounded-lg"
              title={<Space><EditOutlined className="text-indigo-500" /><Text strong>Grading Panel</Text></Space>}
            >
              <div className="space-y-3">
                {gradingSections.map((sec) => {
                  const theme = themeColors[sec.colorKey];
                  return (
                    <div key={sec.key} className={`p-3 rounded-md border ${theme.bg} ${theme.border}`}>
                      <div className="flex justify-between items-center mb-1">
                        <Text strong className={`text-sm ${theme.text}`}>{sec.title}</Text>
                        <div className="flex items-center gap-3 w-1/2">
                          <Slider 
                            min={0} max={sec.max} value={grading[sec.key]} 
                            onChange={v => setGrading({...grading, [sec.key]: v})} 
                            className="flex-grow m-0"
                            trackStyle={{ backgroundColor: theme.hex }}
                            handleStyle={{ borderColor: theme.hex }}
                          />
                          <InputNumber 
                            min={0} max={sec.max} value={grading[sec.key]} 
                            onChange={v => setGrading({...grading, [sec.key]: v || 0})} 
                            size="small" className="w-14 text-center"
                          />
                        </div>
                      </div>
                      <TextArea 
                        placeholder="Detailed feedback (Vocabulary, Grammar, Fluency...)" 
                        rows={2}
                        value={grading.feedback[sec.key]} 
                        onChange={e => setGrading({...grading, feedback: {...grading.feedback, [sec.key]: e.target.value}})} 
                        className="text-sm mt-1 border-white/50 focus:border-white"
                      />
                    </div>
                  );
                })}

                <div className="p-3 mt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong className="text-sm text-gray-700">Overall CEFR Level:</Text>
                    <Select 
                      size="small" value={grading.cefr_level} style={{ width: 80 }}
                      onChange={v => setGrading({...grading, cefr_level: v})}
                    >
                      {['A0', 'A1', 'A2', 'B1', 'B2', 'C'].map(lvl => <Option key={lvl} value={lvl}>{lvl}</Option>)}
                    </Select>
                  </div>
                  <TextArea 
                    placeholder="Overall feedback to send to the student..."
                    rows={3} 
                    value={grading.overall_feedback} 
                    onChange={e => setGrading({...grading, overall_feedback: e.target.value})} 
                    className="text-sm"
                  />
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SpeakingGradingDetailPage;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Row, Col, Card, Typography, Button, Input,
  InputNumber, Select, Space, Spin, message, Badge, Slider
} from "antd";
import {
  ArrowLeftOutlined, SaveOutlined, UserOutlined,
  FileTextOutlined, EditOutlined
} from "@ant-design/icons";
import writingAptisAdminApi from "../../../api/APTIS/writing/writingAptisAdminApi";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Standard color palette for 5 Writing grading sections
const themeColors = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', hex: '#3b82f6', leftBorder: 'border-l-blue-500' },
  green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', hex: '#22c55e', leftBorder: 'border-l-green-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', hex: '#f97316', leftBorder: 'border-l-orange-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', hex: '#a855f7', leftBorder: 'border-l-purple-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', hex: '#f43f5e', leftBorder: 'border-l-rose-500' },
};

// Hàm hỗ trợ Parse JSON an toàn (Lớp 1)
const safeParseAnswers = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (error) {
    return {error}; ;
  }
};

const WritingGradingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);

  const [grading, setGrading] = useState({
    p1: 0, p2: 0, p3: 0, p4_inf: 0, p4_form: 0,
    feedback: { PART_1: "", PART_2: "", PART_3: "", PART_4_INF: "", PART_4_FORM: "" },
    overall_feedback: "",
    cefr_level: "A0",
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await writingAptisAdminApi.getSubmissionDetail(id);
      const data = res.data || res;
      setSubmission(data);

      if (data.status === "GRADED") {
        setGrading({
          p1: data.teacher_feedback?.PART_1?.score || 0,
          p2: data.teacher_feedback?.PART_2?.score || 0,
          p3: data.teacher_feedback?.PART_3?.score || 0,
          p4_inf: data.teacher_feedback?.PART_4_INF?.score || 0,
          p4_form: data.teacher_feedback?.PART_4_FORM?.score || 0,
          feedback: {
            PART_1: data.teacher_feedback?.PART_1?.comments || "",
            PART_2: data.teacher_feedback?.PART_2?.comments || "",
            PART_3: data.teacher_feedback?.PART_3?.comments || "",
            PART_4_INF: data.teacher_feedback?.PART_4_INF?.comments || "",
            PART_4_FORM: data.teacher_feedback?.PART_4_FORM?.comments || "",
          },
          overall_feedback: data.overall_feedback || "",
          cefr_level: data.cefr_level || "A0",
        });
      }
    } catch {
      message.error("Unable to load submission details!");
    } finally {
      setLoading(false);
    }
  };

  const totalScore = grading.p1 + grading.p2 + grading.p3 + grading.p4_inf + grading.p4_form;

  const autoSuggestCEFR = (score) => {
    if (score >= 48) return "C";
    if (score >= 40) return "B2";
    if (score >= 26) return "B1";
    if (score >= 18) return "A2";
    if (score >= 6) return "A1";
    return "A0";
  };

  const getCEFRColor = (level) => {
    const colors = { A0: "#ff4d4f", A1: "#ff4d4f", A2: "#fa8c16", B1: "#fadb14", B2: "#1677ff", C: "#52c41a" };
    return colors[level] || "#d9d9d9";
  };

  const handleBack = () => {
    if (location.state && location.state.fromExamId) {
      navigate(`/admin/aptis/submissions/${location.state.fromExamId}`);
    } else {
      navigate("/admin/aptis/submissions/writing");
    }
  };

  const handleSaveGrade = async () => {
    setSubmitting(true);
    try {
      const payload = {
        score: totalScore,
        cefr_level: grading.cefr_level || autoSuggestCEFR(totalScore),
        teacher_feedback: {
          PART_1: { score: grading.p1, comments: grading.feedback.PART_1 },
          PART_2: { score: grading.p2, comments: grading.feedback.PART_2 },
          PART_3: { score: grading.p3, comments: grading.feedback.PART_3 },
          PART_4_INF: { score: grading.p4_inf, comments: grading.feedback.PART_4_INF },
          PART_4_FORM: { score: grading.p4_form, comments: grading.feedback.PART_4_FORM },
        },
        overall_feedback: grading.overall_feedback,
      };

      await writingAptisAdminApi.gradeSubmission(id, payload);
      message.success("Grade saved successfully!");
      
      handleBack(); 

    } catch {
      message.error("Error saving grade!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Spin size="large" /></div>;

  const gradingSections = [
    { key: "p1", fbKey: "PART_1", title: "Part 1: Word Level", max: 5, colorKey: 'blue' },
    { key: "p2", fbKey: "PART_2", title: "Part 2: Personal Info", max: 5, colorKey: 'green' },
    { key: "p3", fbKey: "PART_3", title: "Part 3: Social Chat", max: 15, colorKey: 'orange' },
    { key: "p4_inf", fbKey: "PART_4_INF", title: "Part 4: Informal Email", max: 10, colorKey: 'purple' },
    { key: "p4_form", fbKey: "PART_4_FORM", title: "Part 4: Formal Email", max: 15, colorKey: 'rose' },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* COMPACT HEADER */}
      <div className="bg-white px-5 py-3 rounded-lg shadow-sm mb-4 flex justify-between items-center border border-gray-200">
        <Space size="large">
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} size="small">Back</Button>
          
          <div className="flex items-center gap-4">
            <Space>
              <UserOutlined className="text-gray-400" />
              <Text strong className="text-base">{submission?.user?.full_name || "Anonymous"}</Text>
            </Space>
            <span className="text-gray-300">|</span>
            <Space>
              <FileTextOutlined className="text-indigo-400" />
              <Text className="text-gray-600">{submission?.test?.title}</Text>
            </Space>
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
        {/* TEST QUESTIONS & STUDENT ANSWERS */}
        <Col xs={24} lg={13}>
          <div className="space-y-4">
            {(() => {
              // Parse Object bọc ngoài cùng (part_1, part_2...)
              const parsedUserAnswers = safeParseAnswers(submission?.user_answers);

              return submission?.test?.parts?.map((part, index) => {
                const colorKeys = ['blue', 'green', 'orange', 'purple', 'rose'];
                const theme = themeColors[colorKeys[index % 5]];

                // 🔥 BỘ GIẢI MÃ: Parse đáp án của từng Part (Lớp 2)
                const partKey = `part_${part.part_number}`;
                const rawPartData = parsedUserAnswers[partKey] || "";
                let decodedPartAnswers;
                try {
                  decodedPartAnswers = JSON.parse(rawPartData);
                } catch {
                  decodedPartAnswers = rawPartData; // Fallback nếu nó là chuỗi thuần (như part_2)
                }

                return (
                  <Card
                    key={part.id}
                    size="small"
                    className={`shadow-sm border-gray-200 rounded-lg border-l-4 ${theme.leftBorder}`}
                    title={<Text strong className={theme.text}>Part {part.part_number}: {part.part_type}</Text>}
                  >
                    <Text type="secondary" italic className="block mb-3 text-sm">
                      {part.instruction}
                    </Text>

                    <div className="space-y-3">
                      {part.questions?.map((q, qIndex) => {
                        
                        // 🔥 BỘ GIẢI MÃ: Khớp vị trí câu hỏi với dữ liệu vừa giải mã
                        let finalAnswer = "";
                        
                        if (Array.isArray(decodedPartAnswers)) {
                          // Nếu là mảng (như Part 1, Part 3) -> Lấy theo vị trí index
                          finalAnswer = decodedPartAnswers[qIndex] || "";
                        } else if (typeof decodedPartAnswers === 'object' && decodedPartAnswers !== null) {
                          // Nếu là Object (như Part 4) -> Phân biệt informal / formal
                          finalAnswer = qIndex === 0 
                            ? (decodedPartAnswers.informal || "") 
                            : (decodedPartAnswers.formal || "");
                        } else {
                          // Nếu là chuỗi trơn (như Part 2)
                          finalAnswer = decodedPartAnswers || "";
                        }

                        const wordCount = finalAnswer ? finalAnswer.trim().split(/\s+/).length : 0;

                        return (
                          <div key={q.id} className={`p-3 border rounded-lg ${theme.bg} ${theme.border}`}>
                            <Text strong className={`text-sm block mb-1 ${theme.text}`}>{q.question_text}</Text>
                            <div className="p-2 bg-white border border-gray-200 rounded min-h-[50px] whitespace-pre-wrap text-sm text-gray-800">
                              {finalAnswer || <Text type="danger" italic>Student left this blank</Text>}
                            </div>
                            <div className="mt-1 text-right">
                              <Text type="secondary" className="text-[11px] font-medium">
                                Word Count: <span className={wordCount === 0 ? "text-red-500" : "text-green-600"}>{wordCount}</span>
                              </Text>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              });
            })()}
          </div>
        </Col>

        {/* GRADING PANEL WITH COLORS */}
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
                            onChange={(v) => setGrading({ ...grading, [sec.key]: v })}
                            className="flex-grow m-0"
                            trackStyle={{ backgroundColor: theme.hex }}
                            handleStyle={{ borderColor: theme.hex }}
                          />
                          <InputNumber
                            min={0} max={sec.max} value={grading[sec.key]}
                            onChange={(v) => setGrading({ ...grading, [sec.key]: v || 0 })}
                            size="small" className="w-14 text-center"
                          />
                        </div>
                      </div>
                      <TextArea
                        placeholder="Detailed feedback (Vocabulary, Grammar, Cohesion...)"
                        rows={2}
                        value={grading.feedback[sec.fbKey]}
                        onChange={(e) =>
                          setGrading({
                            ...grading,
                            feedback: { ...grading.feedback, [sec.fbKey]: e.target.value },
                          })
                        }
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
                      onChange={(v) => setGrading({ ...grading, cefr_level: v })}
                    >
                      {["A0", "A1", "A2", "B1", "B2", "C"].map((lvl) => (
                        <Option key={lvl} value={lvl}>{lvl}</Option>
                      ))}
                    </Select>
                  </div>
                  <TextArea
                    placeholder="Overall feedback to send to the student..."
                    rows={3}
                    value={grading.overall_feedback}
                    onChange={(e) => setGrading({ ...grading, overall_feedback: e.target.value })}
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

export default WritingGradingDetailPage;
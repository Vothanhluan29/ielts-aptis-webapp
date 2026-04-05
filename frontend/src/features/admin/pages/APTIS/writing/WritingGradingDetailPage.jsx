import React from "react";
import {
  Row, Col, Card, Typography, Button, Input,
  InputNumber, Select, Space, Spin, Badge, Slider
} from "antd";
import {
  ArrowLeftOutlined, SaveOutlined, UserOutlined,
  FileTextOutlined, EditOutlined
} from "@ant-design/icons";

// Import Custom Hook và các hằng số
import { 
  useWritingGradingDetail, 
  safeParseAnswers, 
  themeColors, 
  gradingSections 
} from "../../../hooks/APTIS/writing/useWritingGradingDetail";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const WritingGradingDetailPage = () => {
  // Lấy data và hàm từ Custom Hook
  const {
    loading,
    submitting,
    submission,
    grading,
    setGrading,
    totalScore,
    autoSuggestCEFR,
    getCEFRColor,
    handleBack,
    handleSaveGrade,
    location
  } = useWritingGradingDetail();

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Spin size="large" /></div>;

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
                          <div key={q.id || qIndex} className={`p-3 border rounded-lg ${theme.bg} ${theme.border}`}>
                            <Text strong className={`text-sm block mb-1 ${theme.text}`}>{q.question_text}</Text>
                            <div className="p-2 bg-white border border-gray-200 rounded min-h-12.5 whitespace-pre-wrap text-sm text-gray-800">
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
                            className="grow m-0"
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
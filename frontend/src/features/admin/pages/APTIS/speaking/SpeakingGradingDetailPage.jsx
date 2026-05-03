import React from 'react';
import { 
  Row, Col, Card, Typography, Button, Input, 
  InputNumber, Select, Space, Spin, Badge, Slider, Image
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, 
  UserOutlined, AudioOutlined, EditOutlined, 
  WarningOutlined
} from '@ant-design/icons';

// Import Custom Hook và các thông số cấu hình
import { 
  useSpeakingGradingDetail, 
  themeColors, 
  gradingSections 
} from '../../../hooks/APTIS/speaking/useSpeakingGradingDetail'; // Điều chỉnh lại đường dẫn cho đúng

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SpeakingGradingDetailPage = () => {
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
  } = useSpeakingGradingDetail();

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
              <Text strong className="text-base">{submission?.user?.full_name || 'Anonymous'}</Text>
            </Space>
            <span className="text-gray-300">|</span>
            <Space>
              <AudioOutlined className="text-indigo-400" />
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
        {/* TEST QUESTIONS & AUDIO */}
        <Col xs={24} lg={13}>
          <div className="space-y-4">
            {submission?.test?.parts?.map((part, index) => {
              const colorKeys = ['blue', 'green', 'orange', 'purple'];
              const theme = themeColors[colorKeys[index % 4]];
              
              return (
                <Card 
                  key={part.id} 
                  size="small"
                  className={`shadow-sm border-gray-200 rounded-lg border-l-4 ${theme.leftBorder}`}
                  title={<Text strong className={theme.text}>Part {part.part_number}: {part.part_type}</Text>}
                >
                  <Text italic className="text-gray-500 text-sm block mb-3">{part.instruction}</Text>

                  {/* IMAGES */}
                  {(part.image_url || part.image_url_2) && (
                    <div className="mb-3 flex gap-2">
                      {part.image_url && <Image src={part.image_url} height={100} className="rounded border" />}
                      {part.image_url_2 && <Image src={part.image_url_2} height={100} className="rounded border" />}
                    </div>
                  )}

                  {/* QUESTIONS & INDIVIDUAL AUDIO */}
                  <div className={`space-y-3 p-3 rounded border ${theme.bg} ${theme.border}`}>
                    {part.questions?.map((q, idx) => {
                      const qAnswer = submission?.answers?.find(a => String(a.question_id) === String(q.id) || String(a.id) === String(q.id));
                      const audioUrl = qAnswer?.audio_url || qAnswer?.user_answer || qAnswer?.audio_path || qAnswer?.user_audio_url;

                      return (
                        <div key={q.id} className="text-sm pb-3 mb-2 border-b border-white/60 last:border-0 last:pb-0 last:mb-0">
                          <div className="mb-2">
                            <Text strong className="mr-2">Q{idx + 1}.</Text>
                            <Text>{q.question_text}</Text>
                            <Text type="secondary" className="ml-2 text-xs">({q.prep_time}s / {q.response_time}s)</Text>
                          </div>
                          
                          <div className="pl-6">
                            {audioUrl ? (
                              <audio 
                                controls 
                                controlsList="nodownload" 
                                className="h-9 w-full max-w-sm outline-none" 
                                src={audioUrl.startsWith('http') ? audioUrl : `http://localhost:8000${audioUrl}`} 
                              />
                            ) : (
                              <Text type="danger" className="text-xs italic bg-red-50 px-2 py-1 rounded border border-red-100">
                                <WarningOutlined className="mr-1"/> No recording submitted
                              </Text>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                            className="grow m-0"
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
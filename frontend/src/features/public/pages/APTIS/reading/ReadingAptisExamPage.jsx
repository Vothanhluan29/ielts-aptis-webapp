import React from 'react';
import { Layout, Button, Typography, Spin, Card, Tag } from 'antd'; 
import { 
  ClockCircleOutlined, ExclamationCircleOutlined, SendOutlined, 
  LeftOutlined, RightOutlined, ReadOutlined, FileTextOutlined
} from '@ant-design/icons';

import MultipleChoiceQuestion from '../../../components/APTIS/ExamForms/MultipleChoiceQuestion'; 
import DropdownQuestion from '../../../components/APTIS/ExamForms/DropdownQuestion'; 
import ReorderQuestion from '../../../components/APTIS/ExamForms/ReorderQuestion'; 
import FillInBlankQuestion from '../../../components/APTIS/ExamForms/FillInBlankQuestion'; 

// Nhúng Custom Hook
import { useReadingAptisExam } from '../../../hooks/APTIS/reading/useReadingAptisExam';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const ReadingAptisExamPage = ({ 
  isFullTest = false, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  const {
    loading,
    submitting,
    testDetail,
    currentPartId,
    setCurrentPartId,
    timeLeft,
    answers,
    parts,
    activePart,
    currentTabIndex,
    hasReadingPassage,
    isTimeRunningOut,
    handleAnswerChange,
    confirmSubmit,
    formatTime,
    handleGoBackEmpty
  } = useReadingAptisExam({ isFullTest, testIdFromProps, onSkillFinish });

  // ==========================================
  // HÀM TÍNH TỔNG SỐ CÂU THỰC TẾ (Hỗ trợ Reorder)
  // ==========================================
  const getTrueQuestionCount = (groups) => {
    if (!groups || groups.length === 0) return 0;
    return groups.reduce((acc, group) => {
      const groupCount = (group.questions || []).reduce((sum, q) => {
        if (q.question_type === 'REORDER_SENTENCES') {
          const optCount = Array.isArray(q.options) ? q.options.length : 0;
          return sum + (optCount > 0 ? optCount : 1);
        }
        return sum + 1;
      }, 0);
      return acc + groupCount;
    }, 0);
  };

  // ==========================================
  // RENDER DANH SÁCH CÂU HỎI
  // ==========================================
  const renderQuestionsList = (groups) => {
    if (!groups || groups.length === 0) {
      return <div className="text-center py-10 text-slate-400">No questions in this section.</div>;
    }

    // 🔥 LOGIC MỚI: TÍNH TOÁN SỐ THỨ TỰ CÂU HỎI ĐỘNG (Dynamic Numbering)
    let globalQNum = 1;
    const currentPartIndex = parts.findIndex(p => p.id === currentPartId);

    // Cộng dồn số câu của các Part phía trước để lấy mốc xuất phát chuẩn
    for (let i = 0; i < currentPartIndex; i++) {
      parts[i].groups?.forEach(g => {
        (g.questions || []).forEach(q => {
          if (q.question_type === 'REORDER_SENTENCES') {
            const optCount = Array.isArray(q.options) ? q.options.length : 0;
            globalQNum += (optCount > 0 ? optCount : 1);
          } else {
            globalQNum += 1;
          }
        });
      });
    }

    return groups.map((group) => (
      <div key={group.id} className="mb-14 last:mb-0 pb-8 border-b border-slate-100 last:border-0 last:pb-0">
        
        {/* Hướng dẫn riêng của từng Group (nếu có) */}
        {!hasReadingPassage && group.instruction && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
            <Text className="text-orange-800 font-bold text-base whitespace-pre-wrap">
              {group.instruction}
            </Text>
          </div>
        )}

        <div className="pl-2 space-y-8">
          {group.questions?.map((q) => {
            const qType = q.question_type?.toUpperCase() || "";
            const pType = q.part_type?.toUpperCase() || "";
            
            const isDropdown = qType === 'DROPDOWN' || qType === 'MATCHING' || qType === 'MATCHING_HEADINGS' || qType === 'MATCHING_OPINIONS' || pType.includes('PART_4');
            const isReorder = qType === 'REORDER_SENTENCES';
            const isFillInBlank = qType === 'FILL_IN_BLANKS'; 

            // 🔥 Định hình chuỗi số câu hỏi hiển thị ra màn hình (VD: "12" hoặc "12 - 16")
            let questionNumberDisplay = globalQNum.toString();
            let stepsToAdvance = 1;

            if (isReorder && Array.isArray(q.options)) {
              const optCount = q.options.length;
              if (optCount > 1) {
                const endNumber = globalQNum + optCount - 1;
                questionNumberDisplay = `${globalQNum} - ${endNumber}`;
                stepsToAdvance = optCount; // Cắm cờ nhảy cóc số thứ tự
              }
            }

            // Tiến số thứ tự lên để dành cho vòng lặp của câu hỏi tiếp theo
            globalQNum += stepsToAdvance;

            // Render giao diện theo loại câu
            if (isReorder) {
              return (
                <ReorderQuestion 
                  key={q.id} questionId={q.id} questionNumber={questionNumberDisplay}
                  questionText={q.question_text} options={q.options} selectedValue={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              );
            } else if (isFillInBlank) {
              return (
                <FillInBlankQuestion 
                  key={q.id} questionId={q.id} questionNumber={questionNumberDisplay}
                  questionText={q.question_text} selectedValue={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              );
            } else if (isDropdown) {
              return (
                <DropdownQuestion 
                  key={q.id} questionId={q.id} questionNumber={questionNumberDisplay}
                  questionText={q.question_text} options={q.options} selectedValue={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              );
            } else {
              return (
                <MultipleChoiceQuestion 
                  key={q.id} questionId={q.id} questionNumber={questionNumberDisplay}
                  questionText={q.question_text} options={q.options} selectedValue={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              );
            }
          })}
        </div>
      </div>
    ));
  };

  // ==========================================
  // LOADING & EMPTY STATES
  // ==========================================
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <Text type="secondary" className="font-medium text-lg">Loading test data...</Text>
        </div>
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="text-center rounded-3xl shadow-sm border-0 py-10 px-8">
          <ExclamationCircleOutlined className="text-red-400 text-5xl mb-4 block" />
          <Title level={4}>Empty Test</Title>
          <Text type="secondary">No content has been added to this test yet.</Text>
          <Button type="primary" onClick={handleGoBackEmpty} className="mt-6 bg-orange-500 border-none">Go Back</Button>
        </Card>
      </div>
    );
  }

  // Đếm tổng số câu hỏi thực tế để hiển thị trên UI
  const currentPartTrueQCount = getTrueQuestionCount(activePart?.groups);

  // ==========================================
  // MAIN LAYOUT
  // ==========================================
  return (
    <Layout style={{ minHeight: isFullTest ? 'calc(100vh - 64px)' : '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* HEADER TƯƠNG TỰ LISTENING */}
      {!isFullTest && (
        <Header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
          <div className="flex items-center gap-3">
            <Tag color="orange" className="px-3 py-1 font-bold rounded-lg border-0 bg-orange-100 text-orange-700 m-0">
              <ReadOutlined className="mr-1"/> Reading
            </Tag>
            <Text strong className="text-base hidden sm:block text-slate-800">{testDetail?.title}</Text>
          </div>
          
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
            <ClockCircleOutlined /> {formatTime(timeLeft)}
          </div>
        </Header>
      )}

      {isFullTest && (
        <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <Text strong className="text-lg text-slate-700">Section: Reading</Text>
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-lg transition-colors ${isTimeRunningOut ? 'bg-red-50 border-red-200 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
            <ClockCircleOutlined /> Time remaining: {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {/* CONTENT (Độ rộng thay đổi linh hoạt tùy có đoạn văn hay không) */}
      <Content style={{ padding: '24px', maxWidth: hasReadingPassage ? 1280 : 900, margin: '0 auto', width: '100%' }}>
        
        {/* TABS (Thiết kế giống Listening nhưng màu cam) */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {parts.map((p, idx) => (
            <Button 
              key={p.id} 
              type={currentPartId === p.id ? 'primary' : 'default'} 
              onClick={() => setCurrentPartId(p.id)} 
              className={`flex-1 min-w-35 h-12 font-bold rounded-xl transition-all ${
                currentPartId === p.id 
                  ? 'bg-orange-600 hover:bg-orange-500 border-none shadow-md shadow-orange-200 text-white' 
                  : 'text-slate-500 border-slate-200 hover:text-orange-500 hover:border-orange-300 bg-white'
              }`}
            >
              Part {p.part_number || idx + 1}
            </Button>
          ))}
        </div>

        {/* ================= KHU VỰC CÂU HỎI VÀ ĐOẠN VĂN ================= */}
        {hasReadingPassage ? (
          // CHẾ ĐỘ SPLIT SCREEN (Có đoạn văn dài)
          <div className="flex flex-col lg:flex-row gap-6 animation-fade-in relative items-start">
            
            {/* CỘT TRÁI: BÀI ĐỌC (Sử dụng sticky top để ghim lại khi cuộn chuột) */}
            <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-fit">
              <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200 bg-white" styles={{ body: { padding: '32px 24px' } }}>
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <FileTextOutlined className="text-orange-500 text-2xl" />
                  <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Reading Passage</Title>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {activePart?.content && (
                    <div className="text-slate-700 text-base leading-loose whitespace-pre-wrap text-justify bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50 mb-8">
                      {activePart.content}
                    </div>
                  )}

                  {activePart?.groups?.map((group) => {
                    const groupContent = group.transcript || group.content || group.text;
                    if (!group.instruction && !group.image_url && !groupContent) return null;
                    return (
                      <div key={group.id} className="mb-8">
                        {group.image_url && <img src={group.image_url} alt="Reading Resource" className="max-w-full rounded-xl mb-6 shadow-sm border border-slate-100" />}
                        {group.instruction && <Paragraph className="text-slate-800 font-bold text-lg mb-4 whitespace-pre-wrap">{group.instruction}</Paragraph>}
                        {groupContent && (
                          <div className="text-slate-700 text-base leading-loose whitespace-pre-wrap text-justify bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50">
                            {groupContent}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* CỘT PHẢI: CÂU HỎI */}
            <div className="w-full lg:w-1/2">
              <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200 bg-white" styles={{ body: { padding: '32px 24px' } }}>
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ReadOutlined className="text-orange-500 text-2xl" />
                    <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Questions</Title>
                  </div>
                  <Tag className="rounded-full bg-slate-100 text-slate-600 font-bold border-0 px-3 py-1 m-0 text-sm">
                    {currentPartTrueQCount} questions
                  </Tag>
                </div>

                <div className="mb-8 p-4 bg-orange-50/50 rounded-xl border-l-4 border-orange-500 text-slate-700 font-medium flex items-start gap-3">
                  <ReadOutlined className="text-orange-600 text-xl mt-0.5" />
                  <div>
                    Read the text carefully and select the most accurate answers for the questions below.
                  </div>
                </div>

                {renderQuestionsList(activePart.groups)}
              </Card>
            </div>
          </div>

        ) : (

          // CHẾ ĐỘ SINGLE COLUMN (Giống hệt Listening)
          <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200 bg-white animation-fade-in" styles={{ body: { padding: '32px 24px' } }}>
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <ReadOutlined className="text-orange-500 text-2xl" />
                <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Questions</Title>
              </div>
              <Tag className="rounded-full bg-slate-100 text-slate-600 font-bold border-0 px-3 py-1 m-0 text-sm">
                {currentPartTrueQCount} questions
              </Tag>
            </div>

            <div className="mb-8 p-4 bg-orange-50/50 rounded-xl border-l-4 border-orange-500 text-slate-700 font-medium flex items-start gap-3">
              <ReadOutlined className="text-orange-600 text-xl mt-0.5" />
              <div>
                Read the instructions carefully and answer the questions below.
              </div>
            </div>

            {renderQuestionsList(activePart.groups)}
          </Card>
        )}
      </Content>

      {/* FOOTER (Sticky dưới cùng, giống hệt Listening) */}
      <Footer style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, zIndex: 40 }}>
        <Button
          size="large"
          className="rounded-xl font-semibold text-slate-600 border-slate-300"
          disabled={currentTabIndex === 0 || submitting}
          onClick={() => setCurrentPartId(parts[currentTabIndex - 1]?.id)}
          icon={<LeftOutlined />}
        >
          Previous Part
        </Button>
        
        {currentTabIndex < parts.length - 1 ? (
          <Button
            type="primary"
            size="large"
            className="rounded-xl font-bold bg-slate-800 hover:bg-slate-700 border-none shadow-md shadow-slate-300 text-white"
            onClick={() => setCurrentPartId(parts[currentTabIndex + 1]?.id)}
            disabled={submitting}
          >
            Next Part <RightOutlined />
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            className="rounded-xl font-bold px-10 bg-orange-600 hover:bg-orange-500 border-none shadow-lg shadow-orange-200 text-white"
            onClick={confirmSubmit}
            loading={submitting}
            icon={<SendOutlined />}
          >
            {isFullTest ? 'Submit & Go to Writing' : 'Submit Test'}
          </Button>
        )}
      </Footer>

      <style>{`
        .animation-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </Layout>
  );
};

export default ReadingAptisExamPage;
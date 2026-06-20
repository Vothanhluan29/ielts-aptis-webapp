import React from 'react';
import { Spin, Result, Button, Typography, Layout, Divider } from 'antd';
import { ReadOutlined } from '@ant-design/icons';

// Import Custom Hook
import { useReadingAptisResult } from '../../../hooks/APTIS/reading/useReadingAptisResult';

import ResultHeader from '../../../components/APTIS/result/ResultHeader';
import ScoreHeroCard from '../../../components/APTIS/result/ScoreHeroCard';
import ProgressSummaryBar from '../../../components/APTIS/result/ProgressSummaryBar';
import PartTabBar from '../../../components/APTIS/result/PartTabBar';
import QuestionReviewCard from '../../../components/APTIS/result/QuestionReviewCard';

const { Content } = Layout;
const { Text, Title } = Typography;

const ReadingAptisResultPage = () => {
  const {
    loading, submission, testDetail, activePartId, setActivePartId, computedData, handleGoBack
  } = useReadingAptisResult();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-3 text-slate-400 text-sm">Loading results...</div>
      </div>
    </div>
  );

  if (!submission || !testDetail || !computedData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Result status="404" title="Result Not Found" subTitle="This submission does not exist." extra={<Button type="primary" onClick={handleGoBack} className="bg-orange-500 border-none">Back to List</Button>} />
    </div>
  );

  const { parts, resultsArray, cefrLevel, scoreVal, submitDate, activePart } = computedData;

  // Transform tabs data
  const tabsConfig = parts.map((p, i) => ({
    id: p.id,
    label: `Part ${p.part_number || i + 1}`
  }));

  // Calculate stats for ProgressSummaryBar
  let activeCorrect = 0;
  let activeIncorrect = 0;
  let activeSkipped = 0;
  
  if (activePart?.groups) {
    activePart.groups.forEach(group => {
      group.questions?.forEach(q => {
        const qResult = resultsArray.find(r => String(r.id) === String(q.id) || String(r.question_number) === String(q.question_number));
        if (qResult?.is_correct) activeCorrect++;
        else if (!qResult?.user_answer || String(qResult.user_answer).trim() === '') activeSkipped++;
        else activeIncorrect++;
      });
    });
  }

  const renderReviewQuestions = (groups) => {
    let globalQNum = 1;

    // Accumulate question counts from previous parts to get the correct starting number
    const currentPartIndex = parts.findIndex(p => p.id === activePartId);
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

    return groups?.map((group) => (
      <div key={group.id} className="mb-8 last:mb-0">
        {group.instruction && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <Text className="text-orange-800 font-bold text-[13px] whitespace-pre-wrap">{group.instruction}</Text>
          </div>
        )}
        <div className="space-y-3 pl-1">
          {group.questions?.map((q) => {
            const qResult = resultsArray.find(r => r.id === q.id || String(r.question_number) === String(q.question_number));

            let qNumDisplay = globalQNum.toString();
            let stepsToAdvance = 1;

            if (q.question_type === 'REORDER_SENTENCES') {
              const optCount = Array.isArray(q.options) ? q.options.length : 0;
              if (optCount > 1) {
                const endNum = globalQNum + optCount - 1;
                qNumDisplay = `${globalQNum} - ${endNum}`;
                stepsToAdvance = optCount;
              }
            }

            // Advance the counter for the next iteration
            globalQNum += stepsToAdvance;

            return (
              <QuestionReviewCard 
                key={q.id} 
                q={q} 
                questionNumber={qNumDisplay} 
                userAnswerKey={qResult?.user_answer}
                answerDetail={qResult || {}}
              />
            );
          })}
        </div>
        <Divider dashed className="my-6 border-slate-200" />
      </div>
    ));
  };

  return (
    <Layout className="min-h-screen bg-slate-50">

      <ResultHeader
        onGoBack={handleGoBack}
        skillName="READING"
        skillIcon={<ReadOutlined />}
        skillColor="orange"
        testTitle={testDetail?.title}
      />

      <Content className="px-6 pb-8 max-w-4xl mx-auto w-full">

        <ScoreHeroCard
          score={scoreVal}
          maxScore={50}
          cefrLevel={cefrLevel}
          submitDate={submitDate}
          skillColor="orange"
        />

        <PartTabBar
          tabs={tabsConfig}
          activeId={activePartId}
          onChange={setActivePartId}
          skillColor="orange"
        />

        {/* ── SINGLE COLUMN LAYOUT ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8 animate-in fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <ReadOutlined className="text-orange-500 text-xl" />
              <Title level={5} style={{ margin: 0, color: '#1e293b' }}>Detailed Explanations</Title>
            </div>
            
            <ProgressSummaryBar
              correct={activeCorrect}
              incorrect={activeIncorrect}
              skipped={activeSkipped}
              skillColor="orange"
            />
            
            {renderReviewQuestions(activePart?.groups)}
          </div>
        </div>

      </Content>
    </Layout>
  );
};

export default ReadingAptisResultPage;
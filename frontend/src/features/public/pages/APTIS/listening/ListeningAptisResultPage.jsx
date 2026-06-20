import React from 'react';
import { Spin, Result, Button, Typography, Layout, Card } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';
import { useListeningAptisResult } from '../../../hooks/APTIS/listening/useListeningAptisResult';

import ResultHeader from '../../../components/APTIS/result/ResultHeader';
import ScoreHeroCard from '../../../components/APTIS/result/ScoreHeroCard';
import ProgressSummaryBar from '../../../components/APTIS/result/ProgressSummaryBar';
import PartTabBar from '../../../components/APTIS/result/PartTabBar';
import QuestionReviewCard from '../../../components/APTIS/result/QuestionReviewCard';

const { Content } = Layout;
const { Text } = Typography;

const ListeningAptisResultPage = () => {
  const { loading, submission, testDetail, activePartId, setActivePartId, computedData, handleGoBack } = useListeningAptisResult();

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
      <Result status="404" title="Result not found" subTitle="This submission does not exist." extra={<Button type="primary" onClick={handleGoBack} className="bg-blue-600">Back to list</Button>} />
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

  return (
    <Layout className="min-h-screen bg-slate-50">
      <style>{`.review-audio::-webkit-media-controls-panel { background-color: #eff6ff; }`}</style>

      <ResultHeader
        onGoBack={handleGoBack}
        skillName="LISTENING"
        skillIcon={<CustomerServiceOutlined />}
        skillColor="blue"
        testTitle={testDetail?.title}
      />

      <Content className="px-6 pb-8 max-w-4xl mx-auto w-full">

        <ScoreHeroCard
          score={scoreVal}
          maxScore={50}
          cefrLevel={cefrLevel}
          submitDate={submitDate}
          skillColor="blue"
        />

        <PartTabBar
          tabs={tabsConfig}
          activeId={activePartId}
          onChange={setActivePartId}
          skillColor="blue"
        />

        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '24px 32px' } }}>
          <div className="animate-in fade-in slide-in-from-bottom-2">
            
            <ProgressSummaryBar
              correct={activeCorrect}
              incorrect={activeIncorrect}
              skipped={activeSkipped}
              skillColor="blue"
            />

            {!activePart?.groups || activePart.groups.length === 0 ? (
              <div className="text-center py-10 text-slate-400">No data available for this part.</div>
            ) : (
              activePart.groups.map(group => {
                const src = group.audio_url || group.media_url || group.audio_file || group.attached_audio;
                return (
                  <div key={group.id} className="mb-8 last:mb-0 pb-6 border-b border-dashed border-slate-300 last:border-0 last:pb-0">

                    {src ? (
                      <div className="mb-4 p-4 rounded-xl bg-blue-50/70 border border-blue-100 shadow-sm flex flex-col gap-2">
                        <Text className="font-bold text-blue-800 text-[13px] flex items-center gap-2"><CustomerServiceOutlined /> Audio Recording:</Text>
                        <audio controls src={src.startsWith('http') ? src : `http://localhost:8000${src}`} className="w-full h-10 outline-none review-audio" controlsList="nodownload" />
                      </div>
                    ) : (
                      <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 italic text-[13px]">No audio file attached.</div>
                    )}

                    <div className="pl-1">
                      {group.questions?.map((q, idx) => {
                        const qResult = resultsArray.find(r => String(r.id) === String(q.id) || String(r.question_number) === String(q.question_number));
                        return (
                          <QuestionReviewCard 
                            key={q.id} 
                            q={q} 
                            questionNumber={q.question_number || idx + 1}
                            userAnswerKey={qResult?.user_answer}
                            answerDetail={qResult || {}}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

      </Content>
    </Layout>
  );
};

export default ListeningAptisResultPage;
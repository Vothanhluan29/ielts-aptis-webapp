import React, { useState } from 'react';
import { Spin, Result, Button, Layout, Card } from 'antd';
import { BookOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { useGrammarVocabResult } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabResult';
import ResultHeader from '../../../components/APTIS/result/ResultHeader';
import ScoreHeroCard from '../../../components/APTIS/result/ScoreHeroCard';
import ProgressSummaryBar from '../../../components/APTIS/result/ProgressSummaryBar';
import PartTabBar from '../../../components/APTIS/result/PartTabBar';
import QuestionReviewCard from '../../../components/APTIS/result/QuestionReviewCard';

const { Content } = Layout;

const GrammarVocabResultPage = () => {
  const {
    loading,
    submission,
    testDetail,
    activeTab,
    setActiveTab,
    computedData,
    handleGoBack
  } = useGrammarVocabResult();

  if (loading || !computedData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spin size="large" />
        <div className="mt-3 text-slate-400 text-sm">Loading results...</div>
      </div>
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Result
        status="404"
        title="Result not found"
        subTitle="This submission has not been submitted or does not exist."
        extra={<Button type="primary" onClick={handleGoBack} className="bg-emerald-600 border-none">Back to list</Button>}
      />
    </div>
  );

  const {
    userAnswers, answerDetails, totalQuestions, scoreVal, correctCount, 
    submitDate, activeGroups, tabsConfig
  } = computedData;

  // Calculate stats for ProgressSummaryBar
  let activeCorrect = 0;
  let activeIncorrect = 0;
  let activeSkipped = 0;
  
  activeGroups.forEach(group => {
    group.questions?.forEach(q => {
      const detail = answerDetails[q.id];
      const answer = userAnswers[q.id];
      if (detail?.is_correct) activeCorrect++;
      else if (!answer || String(answer).trim() === '') activeSkipped++;
      else activeIncorrect++;
    });
  });

  return (
    <Layout className="min-h-screen bg-slate-50">
      
      <ResultHeader
        onGoBack={handleGoBack}
        skillName="GRAMMAR & VOCAB"
        skillIcon={<BookOutlined />}
        skillColor="emerald"
        testTitle={testDetail?.title}
      />

      <Content className="px-6 pb-8 max-w-4xl mx-auto w-full">

        <ScoreHeroCard
          score={scoreVal}
          maxScore={50}
          correctCount={correctCount}
          totalQuestions={totalQuestions}
          submitDate={submitDate}
          skillColor="emerald"
        />

        <PartTabBar
          tabs={tabsConfig}
          activeId={activeTab}
          onChange={setActiveTab}
          skillColor="emerald"
        />

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 border-l-4 border-l-emerald-500 text-sm text-slate-600 mb-5 animate-in fade-in">
          Reviewing <strong>{activeTab === 'GRAMMAR' ? 'Grammar' : 'Vocabulary'}</strong> section. Check your mistakes and read the explanations below.
        </div>

        <Card variant="borderless" className="rounded-3xl shadow-sm border-slate-200" styles={{ body: { padding: '24px 32px' } }}>
          <div className="animate-in fade-in slide-in-from-bottom-2">
            
            <ProgressSummaryBar
              correct={activeCorrect}
              incorrect={activeIncorrect}
              skipped={activeSkipped}
              skillColor="emerald"
            />

            {activeGroups.length === 0 ? (
              <div className="text-center py-10 text-slate-400">No data available for this part.</div>
            ) : (
              activeGroups.map((group, groupIdx) => (
                <div key={group.id} className={groupIdx !== activeGroups.length - 1 ? "mb-10 border-b border-slate-100 pb-6" : ""}>
                  
                  {group.instruction && (
                    <div className="mb-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-indigo-800 text-[13px] flex gap-2 items-start">
                      <InfoCircleOutlined className="mt-0.5 text-indigo-600" />
                      <span className="font-medium whitespace-pre-wrap">{group.instruction}</span>
                    </div>
                  )}

                  {group.questions?.map((q) => (
                    <QuestionReviewCard
                      key={q.id}
                      q={q}
                      questionNumber={q.question_number}
                      userAnswerKey={userAnswers[q.id]}
                      answerDetail={answerDetails[q.id] || {}}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </Card>

      </Content>
    </Layout>
  );
};

export default GrammarVocabResultPage;
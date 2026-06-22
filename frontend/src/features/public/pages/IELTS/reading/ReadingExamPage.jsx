import React, { useState, useEffect, useMemo } from 'react';
import { useReadingExam } from '../../../hooks/IELTS/reading/useReadingExam';
import { Clock, Send, BookOpen, ChevronRight, ChevronLeft, Highlighter, ArrowRight, ArrowLeft } from 'lucide-react'; 

import StudentQuestionDisplay from '../../../components/IELTS/Question Display/StudentQuestionDisplay'; 

const ReadingExamPage = ({ testId, onFinish }) => {
  const { test, loading, submitting, answers, timeLeft, handleAnswerChange, handleSubmit, isFullTestMode } = useReadingExam(testId, onFinish);
  const [activeTab, setActiveTab] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const questionContainer = document.getElementById('reading-question-container');
    const textWrapper = document.getElementById('reading-text-wrapper');
    if (questionContainer) questionContainer.scrollTo({ top: 0, behavior: 'auto' });
    if (textWrapper) textWrapper.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  const allQuestions = useMemo(() => {
    if (!test?.passages) return [];
    const questions = [];
    test.passages.forEach((p, pIndex) => {
      p.groups?.forEach(g => {
        g.questions?.forEach(q => {
          questions.push({ ...q, passageIndex: pIndex });
        });
      });
    });
    return questions.sort((a, b) => a.question_number - b.question_number);
  }, [test]);

  const scrollToQuestion = (qNumber, pIndex) => {
    if (activeTab !== pIndex) {
      setActiveTab(pIndex);
      setTimeout(() => {
        const el = document.getElementById(`question-${qNumber}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else {
      const el = document.getElementById(`question-${qNumber}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatTime = (s) => {
    if (s === null) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center text-blue-600 font-bold text-xl">Loading Reading Test...</div>
    </div>
  );

  if (!test) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center text-slate-500 text-lg font-bold">Test not found.</div>
    </div>
  );

  const currentPassage = test.passages?.[activeTab];
  const isTimeWarning = timeLeft !== null && timeLeft <= 300;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden text-slate-800">
      
      {/* HEADER: Softer Blue */}
      {!isFullTestMode && (
        <header className="bg-blue-600 text-white h-[56px] shrink-0 z-30 flex items-center justify-between px-8 shadow-md shadow-blue-900/10 rounded-b-xl mx-2">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-wide" title={test.title}>{test.title}</h1>
          </div>

          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-transparent hover:border-white/30 transition-all text-sm font-semibold">
              <Highlighter size={16} />
              Highlight
            </button>
            <div className={`flex items-center gap-2 font-bold text-xl bg-white/10 px-4 py-1.5 rounded-lg ${isTimeWarning ? 'text-red-300 animate-pulse' : 'text-white'}`}>
              <Clock size={20} /> 
              {formatTime(timeLeft)}
            </div>
          </div>
        </header>
      )}

      {/* MAIN BODY - Split View */}
      <div className="flex-1 overflow-hidden relative p-3 lg:p-4">
        {currentPassage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-4">
            
            {/* LEFT PANEL: Reading Passage */}
            <div id="reading-text-wrapper" className="bg-white h-full overflow-y-auto rounded-2xl shadow-sm border border-slate-200" style={{scrollbarWidth: 'thin'}}>
              <div className="p-8 max-w-3xl mx-auto">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-800 text-center">
                    {currentPassage.title}
                  </h2>
                </div>

                <div 
                  className="text-[15px] text-justify font-sans leading-relaxed text-slate-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: currentPassage.content }}
                />
              </div>
            </div>

            {/* RIGHT PANEL: Questions */}
            <div className="bg-slate-50 h-full flex flex-col overflow-hidden rounded-2xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">
                  Part {activeTab + 1}: Questions {currentPassage.groups?.[0]?.questions?.[0]?.question_number} - {currentPassage.groups?.[currentPassage.groups.length - 1]?.questions?.slice(-1)[0]?.question_number}
                </h3>
              </div>

              <div id="reading-question-container" className="flex-1 overflow-y-auto bg-white" style={{scrollbarWidth: 'thin'}}>
                <div className="p-8 max-w-2xl mx-auto">
                  <div className="space-y-10 pb-10">
                    {currentPassage.groups?.map((group, gIndex) => (
                      <div key={group.id || gIndex}>
                        {group.instruction && (
                          <div className="bg-slate-100 border border-slate-300 p-4 mb-6 text-sm font-bold text-slate-800 whitespace-pre-wrap">
                            {group.instruction}
                            {group.image_url && (
                              <img src={group.image_url} alt="Illustration" className="mt-4 max-h-64 object-contain border border-slate-300 p-1 bg-white" />
                            )}
                          </div>
                        )}

                        <div className="space-y-8">
                          {group.questions?.map((question) => (
                            <div id={`question-${question.question_number}`} key={question.id || question.question_number} className="scroll-mt-6">
                              <StudentQuestionDisplay 
                                question={question}
                                currentAnswer={answers[String(question.question_number)]} 
                                onAnswerChange={handleAnswerChange}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {(!currentPassage.groups || currentPassage.groups.length === 0) && (
                      <div className="text-center py-24 text-slate-500 font-semibold">
                        No questions available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER - Question Navigation */}
      <footer className="bg-white border-t border-slate-200 flex flex-col shrink-0 z-30 pb-2">
        
        {/* Navigation Bar */}
        <div className="h-12 px-6 flex items-center justify-between mt-1">
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveTab(prev => Math.max(0, prev - 1))} 
              disabled={activeTab === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-colors disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16}/>
              Previous Passage
            </button>
              
            <button 
              onClick={() => setActiveTab(prev => Math.min((test.passages?.length || 1) - 1, prev + 1))} 
              disabled={activeTab === (test.passages?.length || 1) - 1}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-lg transition-colors disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed"
            >
              Next Passage
              <ArrowRight size={16}/>
            </button>
          </div>
          
          <div>
            {activeTab === (test.passages?.length || 1) - 1 && (
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/30 disabled:bg-slate-400 disabled:shadow-none transition-all animate-in fade-in duration-300"
              >
                {submitting ? 'Processing...' : (isFullTestMode ? 'Finish Section' : 'Submit Test')}
                <Send size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Question Grid */}
        <div className="overflow-x-auto py-2 px-6 flex items-center gap-2 scrollbar-hide">
          {allQuestions.map((q) => {
            const qNum = q.question_number;
            const hasAnswer = answers[String(qNum)] && String(answers[String(qNum)]).trim() !== '';
            return (
              <button
                key={qNum}
                onClick={() => scrollToQuestion(qNum, q.passageIndex)}
                className={`flex-shrink-0 w-9 h-9 flex flex-col items-center justify-center rounded-lg font-semibold text-sm transition-all border ${
                  hasAnswer ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {qNum}
              </button>
            );
          })}
        </div>
      </footer>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {isFullTestMode ? 'Finish Section?' : 'Submit Test?'}
              </h3>
              <p className="text-slate-600 mb-6">
                You still have <span className="font-bold text-red-500">{formatTime(timeLeft)}</span> remaining. Are you sure you want to submit now?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleSubmit(false);
                  }}
                  className="flex-1 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/30 transition-all"
                >
                  Submit Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingExamPage;
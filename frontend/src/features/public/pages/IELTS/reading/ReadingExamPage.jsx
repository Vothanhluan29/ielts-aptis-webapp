import React, { useState, useEffect } from 'react';
import { useReadingExam } from '../../../hooks/IELTS/reading/useReadingExam';
import { Clock, Send, BookOpen, ChevronRight, ChevronLeft, Check, Info } from 'lucide-react';

import StudentQuestionDisplay from '../../../components/IELTS/Question Display/StudentQuestionDisplay'; 

const ReadingExamPage = ({ testId, onFinish }) => {
  const { test, loading, submitting, answers, timeLeft, handleAnswerChange, handleSubmit, isFullTestMode } = useReadingExam(testId, onFinish);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const questionContainer = document.getElementById('reading-question-container');
    const textWrapper = document.getElementById('reading-text-wrapper');
    if (questionContainer) questionContainer.scrollTo({ top: 0, behavior: 'smooth' });
    if (textWrapper) textWrapper.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const formatTime = (s) => {
    if (s === null) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <div className="text-lg font-bold text-indigo-900">Loading Reading Test</div>
          <div className="text-sm text-indigo-600 mt-1">Please wait...</div>
        </div>
      </div>
    </div>
  );

  if (!test) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <BookOpen className="mx-auto mb-4 text-slate-300" size={64} />
        <p className="text-slate-600 text-lg font-semibold">Test not found.</p>
      </div>
    </div>
  );

  const currentPassage = test.passages?.[activeTab];

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-slate-50 to-blue-50/30 font-sans overflow-hidden">
      
      {/* HEADER */}
      {!isFullTestMode && (
        <header className="bg-white border-b-2 border-indigo-200 shadow-sm h-14 shrink-0 z-30">
          <div className="h-full max-w-400 mx-auto px-6 flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-9 bg-linear-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-widest">IELTS Reading</span>
                <h1 className="text-sm font-bold text-slate-800 truncate max-w-xs" title={test.title}>{test.title}</h1>
              </div>
            </div>

            {/* Right: Timer & Submit */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg border-2 ${timeLeft < 300 ? 'text-red-600 bg-red-50 border-red-300 animate-pulse' : 'text-slate-800 bg-slate-50 border-indigo-200'}`}>
                <Clock size={18} className={timeLeft < 300 ? 'text-red-500' : 'text-indigo-600'} /> 
                {formatTime(timeLeft)}
              </div>
              <button onClick={() => handleSubmit(false)} disabled={submitting} className="flex items-center gap-2 px-6 py-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold text-sm hover:from-indigo-700 hover:to-blue-700 shadow-md disabled:from-slate-400 disabled:to-slate-400 transition-all">
                {submitting ? 'Submitting...' : 'Submit Test'} <Send size={16} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* MAIN BODY - Split View */}
      <div className="flex-1 overflow-hidden relative">
        {currentPassage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-x-2 divide-indigo-200">
            
            {/* LEFT PANEL: Reading Passage */}
            <div id="reading-text-wrapper" className="bg-white h-full overflow-y-auto scroll-smooth" style={{scrollbarWidth: 'thin', scrollbarColor: '#818cf8 #f1f5f9'}}>
              <div className="p-8 md:p-12 max-w-4xl mx-auto">
                <div className="bg-linear-to-br from-white to-slate-50 border-2 border-indigo-200 rounded-lg shadow-sm p-8 md:p-10">
                  <div className="mb-6 pb-6 border-b-2 border-indigo-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {activeTab + 1}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-serif leading-tight">
                        {currentPassage.title}
                      </h2>
                    </div>
                  </div>
                  <div className="prose prose-slate prose-lg max-w-none text-justify font-serif leading-relaxed text-slate-800">
                    {/* Render HTML content without PassageViewer */}
                    <div dangerouslySetInnerHTML={{ __html: currentPassage.content }} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Questions */}
            <div className="bg-linear-to-br from-white to-slate-50/50 h-full flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b-2 border-indigo-200 bg-white shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-linear-to-r from-indigo-600 to-blue-600"></div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Questions - Passage {activeTab + 1}</h3>
                </div>
                <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {currentPassage.groups?.reduce((acc, g) => acc + (g.questions?.length || 0), 0) || 0} Questions
                </div>
              </div>

              <div id="reading-question-container" className="flex-1 overflow-y-auto scroll-smooth bg-white" style={{scrollbarWidth: 'thin', scrollbarColor: '#818cf8 #f1f5f9'}}>
                <div className="p-6 md:p-8 max-w-3xl mx-auto">
                  <div className="space-y-8 pb-10">
                    {currentPassage.groups?.map((group, gIndex) => (
                      <div key={group.id || gIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {group.instruction && (
                          <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 border-l-4 border-indigo-600 p-5 rounded-r-lg mb-6 shadow-sm">
                            <p className="font-semibold text-slate-800 text-sm flex gap-2 items-start leading-relaxed">
                              <Info size={18} className="text-indigo-600 mt-0.5 shrink-0"/>
                              <span>{group.instruction}</span>
                            </p>
                            {group.image_url && (
                              <img src={group.image_url} alt="Illustration" className="mt-4 rounded-lg max-h-64 w-full object-contain border-2 border-indigo-200 bg-white shadow-sm p-2" />
                            )}
                          </div>
                        )}

                        <div className="space-y-6">
                          {group.questions?.map((question) => (
                            <StudentQuestionDisplay 
                              key={question.id || question.question_number}
                              question={question}
                              currentAnswer={answers[String(question.question_number)]} 
                              onAnswerChange={handleAnswerChange}
                            />
                          ))}
                        </div>
                        
                        {gIndex < currentPassage.groups.length - 1 && (
                          <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t-2 border-indigo-100"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-white px-4 text-xs font-bold text-indigo-600 uppercase tracking-wider border border-indigo-200 rounded-full">
                                Section {gIndex + 1}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(!currentPassage.groups || currentPassage.groups.length === 0) && (
                      <div className="text-center py-24 bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-dashed border-indigo-300">
                        <BookOpen className="mx-auto mb-4 text-indigo-300" size={56} />
                        <p className="text-indigo-600 font-semibold">No questions available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER - Passage Navigation */}
      <footer className="bg-white border-t-2 border-indigo-200 h-16 shrink-0 z-30 shadow-sm">
        <div className="h-full max-w-400  mx-auto px-6 flex items-center justify-between">

          {/* Left: Previous */}
          <button 
            onClick={() => setActiveTab(prev => Math.max(0, prev - 1))} 
            disabled={activeTab === 0} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all border-2 border-transparent hover:border-indigo-200"
          >
            <ChevronLeft size={18}/>
            Previous
          </button>
          
          {/* Center: Passage Tabs */}
          <div className="flex gap-2">
            {test.passages?.map((p, index) => (
              <button 
                key={index} 
                onClick={() => setActiveTab(index)} 
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                  activeTab === index 
                    ? 'bg-linear-to-r from-indigo-600 to-blue-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400'
                }`}
              >
                Passage {index + 1}
              </button>
            ))}
          </div>

          {/* Right: Next hoặc Finish Section */}
          {isFullTestMode && activeTab === (test.passages?.length || 1) - 1 ? (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-md disabled:from-slate-400 disabled:to-slate-400 transition-all border-2 border-transparent"
            >
              {submitting ? 'Saving...' : 'Finish Section'}
              <Check size={16} />
            </button>
          ) : (
            <button 
              onClick={() => setActiveTab(prev => Math.min((test.passages?.length || 1) - 1, prev + 1))} 
              disabled={activeTab === (test.passages?.length || 1) - 1} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all border-2 border-transparent hover:border-indigo-200"
            >
              Next
              <ChevronRight size={18}/>
            </button>
          )}

        </div>
      </footer>
    </div>
  );
};

export default ReadingExamPage;
import React, { useState } from 'react';
import { useWritingExam } from '../../../hooks/IELTS/writing/useWritingExam';
import { Clock, Send, Info, Edit, FileText, AlertTriangle } from 'lucide-react';

const MIN_WORDS_TASK_1 = 150;
const MIN_WORDS_TASK_2 = 250;

const WritingExamPage = ({ testId, onFinish }) => {
  const {
    test, loading, submitting, activeTask, setActiveTask, answers, handleContentChange,
    wordCounts, timeLeft, formatTime, isTask1Valid, isTask2Valid, canSubmit,
    isQuotaFull, handleSubmit, isFullTestMode,
    questionContainerRef, editorRef, leftWidth, setIsDragging
  } = useWritingExam(testId, onFinish);

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  if (loading || !test) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-blue-600 font-bold text-xl">Loading Exam Environment...</div>
      </div>
    );
  }

  const currentTaskData = test.tasks?.find((t) => t.task_type === activeTask);
  const currentWordCount = wordCounts[activeTask];
  const minWords = activeTask === 'TASK_1' ? MIN_WORDS_TASK_1 : MIN_WORDS_TASK_2;

  const goToTask = (task) => {
    setActiveTask(task);
  };

  const isTimeWarning = timeLeft !== null && timeLeft <= 300;

  return (
    <div className="h-screen bg-white flex flex-col font-sans text-slate-800 overflow-hidden">
      
      {/* ================= HEADER ================= */}
      {!isFullTestMode && (
        <header className="bg-blue-600 text-white h-[56px] shrink-0 z-30 flex items-center justify-between px-8 border-b border-slate-300">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-wide uppercase" title={test.title}>
              {test.title} - WRITING
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className={`flex items-center gap-2 font-bold text-xl px-4 py-1.5 ${isTimeWarning ? 'text-red-300 animate-pulse' : 'text-white'}`}>
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </header>
      )}

      {/* Quota Alert */}
      {isQuotaFull && !isFullTestMode && (
        <div className="bg-red-600 text-white font-bold text-center py-2 text-sm flex justify-center items-center gap-2 shrink-0">
          <AlertTriangle size={16} />
          Daily limit reached. You cannot submit more tests today.
        </div>
      )}

      {/* ================= MAIN CONTENT (SPLIT VIEW) ================= */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: QUESTION */}
        <div 
          className="h-full bg-white border-r border-slate-300 overflow-y-auto"
          style={{ width: `${leftWidth}%`, scrollbarWidth: 'thin' }}
        >
          <div className="p-8 max-w-3xl mx-auto">
            
            {/* Task Info Header */}
            <div className="mb-8 pb-4 border-b border-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-lg border border-slate-300">
                  {activeTask === 'TASK_1' ? '1' : '2'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 m-0">
                    Writing Task {activeTask === 'TASK_1' ? '1' : '2'}
                  </h2>
                  <p className="uppercase font-bold tracking-wide text-xs text-slate-500 mt-1">
                    {activeTask === 'TASK_1' ? 'Report / Letter' : 'Essay'}
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 text-sm font-semibold border border-slate-300 bg-slate-50 text-slate-600 flex items-center gap-2">
                <Info size={16} />
                Minimum: {minWords} words
              </div>
            </div>

            {/* Task 1 Image */}
            {activeTask === 'TASK_1' && currentTaskData?.image_url && (
              <div className="mb-8 p-3 border border-slate-300 bg-white flex justify-center">
                <img
                  src={currentTaskData.image_url}
                  alt="Task Chart"
                  className="max-w-full h-auto max-h-[450px] object-contain"
                />
              </div>
            )}

            {/* Question Text */}
            <div 
              ref={questionContainerRef}
              className="text-[16px] leading-loose text-justify text-slate-800 whitespace-pre-wrap font-sans"
            >
              {currentTaskData?.question_text ? (
                currentTaskData.question_text
              ) : (
                <span className="text-slate-500 italic">No question content available.</span>
              )}
            </div>

          </div>
        </div>

        {/* RESIZER DRAG BAR */}
        <div 
          onMouseDown={() => setIsDragging(true)}
          className="w-3 bg-slate-200 hover:bg-slate-300 cursor-col-resize shrink-0 transition-colors z-10 flex items-center justify-center group"
          title="Drag to resize"
        >
          <div className="w-0.5 h-10 bg-slate-400 group-hover:bg-slate-600"></div>
        </div>

        {/* RIGHT PANEL: EDITOR */}
        <div 
          className="h-full bg-white flex flex-col overflow-hidden"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Text Area */}
          <div className="flex-1 relative bg-white border-b border-slate-300">
            <textarea
              ref={editorRef}
              className="w-full h-full p-8 text-[16px] text-slate-800 leading-[2.2] outline-none resize-none bg-white font-sans"
              style={{ scrollbarWidth: 'thin' }}
              placeholder="Start typing your answer here..."
              value={answers[activeTask]}
              onChange={(e) => handleContentChange(e.target.value, activeTask)}
              spellCheck="false"
            />
          </div>

          {/* Word Count Footer */}
          <div className="px-6 py-2 bg-slate-50 border-t border-slate-300 flex justify-end items-center shrink-0">
            <div className={`px-4 py-1 font-bold text-sm border ${currentWordCount >= minWords ? 'bg-white text-slate-800 border-slate-300' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
              Word count: {currentWordCount}
            </div>
          </div>
        </div>

      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#e9ebf0] border-t border-slate-300 h-[50px] shrink-0 z-30 flex items-center justify-between border-b-4 border-slate-800">
        
        {/* Left: Task Navigation */}
        <div className="flex gap-2 pl-6 items-center">
          <button 
            onClick={() => goToTask('TASK_1')}
            className={`w-[88px] py-1.5 font-bold text-[13px] transition-none border border-slate-300 
              ${activeTask === 'TASK_1' ? 'bg-[#465669] text-white border-[#465669]' : 'bg-white text-[#465669] hover:bg-slate-50'}`}
          >
            Part 1
          </button>

          <button 
            onClick={() => goToTask('TASK_2')}
            className={`w-[88px] py-1.5 font-bold text-[13px] transition-none border border-slate-300 
              ${activeTask === 'TASK_2' ? 'bg-[#465669] text-white border-[#465669]' : 'bg-white text-[#465669] hover:bg-slate-50'}`}
          >
            Part 2
          </button>
        </div>

        {/* Right: Submit Button */}
        <button
          onClick={() => setShowSubmitModal(true)}
          disabled={submitting || isQuotaFull || activeTask !== 'TASK_2' || !canSubmit}
          className={`h-full flex items-center justify-center gap-2 px-6 border-l border-slate-300 transition-none 
            ${activeTask === 'TASK_2' && canSubmit ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' : 'bg-[#e2e5ea] text-slate-400 cursor-not-allowed'}`}
        >
          <div className="flex flex-col items-center leading-[1.1] font-semibold text-[13px]">
            <span>Submit</span>
            <span>Test</span>
          </div>
          <Send size={14} className="ml-1 -rotate-45" />
        </button>

      </footer>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {isFullTestMode ? 'Finish Section?' : 'Submit Test?'}
              </h3>
              <p className="text-slate-600 mb-6">
                You still have <span className="font-bold text-red-600">{formatTime(timeLeft)}</span> remaining. Are you sure you want to submit now?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 font-bold text-slate-600 bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleSubmit(false);
                  }}
                  disabled={submitting}
                  className="flex-1 py-2.5 font-bold text-white bg-blue-600 border border-blue-700 hover:bg-blue-700 transition-none disabled:bg-slate-400"
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

export default WritingExamPage;
import React from "react";
import { useListeningExam } from "../../hooks/listening/useListeningExam";
import StudentQuestionDisplay from '../../components/IELTS/Question Display/StudentQuestionDisplay';
import { Clock, Send, Headphones, ChevronRight, ChevronLeft, Info, PlayCircle, CheckCircle } from 'lucide-react';

const ListeningExamPage = ({ testId, onFinish }) => {
  const {
    test, loading, submitting, answers, currentPart, currentPartIndex,
    setCurrentPartIndex, timeLeft, totalQuestions, answeredCount,
    handleAnswerChange, handleSubmit, isFullTestMode, nextPart, prevPart
  } = useListeningExam(testId, onFinish);

  const formatTime = (s) => {
    if (s == null) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-900">Loading Listening Test</div>
            <div className="text-sm text-indigo-600 mt-1">Please wait...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const isTimeWarning = timeLeft !== null && timeLeft <= 300;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30 font-sans overflow-hidden">

      {/* HEADER */}
      {!isFullTestMode && (
        <header className="bg-white border-b-2 border-indigo-200 shadow-sm h-14 flex-shrink-0 z-30">
          <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-9 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-widest">
                  IELTS Listening
                </span>
                <h1 className="text-sm font-bold text-slate-800 truncate max-w-xs" title={test.title}>
                  {test.title}
                </h1>
              </div>
            </div>

            {/* Center: Progress Info */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 px-5 py-2 rounded-lg border border-indigo-200">
              <div className="text-sm text-slate-700">
                Questions answered: <span className="font-semibold text-indigo-600">{answeredCount}</span> of <span className="font-semibold">{totalQuestions}</span>
              </div>
              <div className="w-px h-5 bg-indigo-300"></div>
              <div className="text-sm font-semibold text-indigo-600">
                Part {currentPartIndex + 1} of {test.parts?.length || 0}
              </div>
            </div>

            {/* Right: Timer & Submit */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg border-2 ${
                isTimeWarning ? 'text-red-600 bg-red-50 border-red-300 animate-pulse' : 'text-slate-800 bg-slate-50 border-indigo-200'
              }`}>
                <Clock size={18} className={isTimeWarning ? 'text-red-500' : 'text-indigo-600'} />
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold text-sm hover:from-indigo-700 hover:to-blue-700 shadow-md disabled:from-slate-400 disabled:to-slate-400 transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Test'} <Send size={16} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* MAIN BODY - Split View */}
      <div className="flex-1 overflow-hidden relative">
        {currentPart && (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-x-2 divide-indigo-200">

            {/* LEFT PANEL: Audio & Navigation */}
            <div className="bg-white h-full overflow-y-auto scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#818cf8 #f1f5f9' }}>
              <div className="p-8 md:p-12 max-w-4xl mx-auto">
                {/* Audio Player Card */}
                <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-indigo-200 rounded-lg shadow-sm p-8 mb-8">
                  <div className="mb-6 pb-6 border-b-2 border-indigo-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {currentPart.part_number}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-serif leading-tight">
                        Part {currentPart.part_number}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      Listen carefully to the recording and answer all questions
                    </p>
                  </div>

                  {/* Audio Player */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-600 p-5 rounded-r-lg mb-2">
                    <div className="flex items-center gap-2 mb-3">
                      <PlayCircle size={18} className="text-indigo-600" />
                      <span className="font-bold text-sm text-slate-800">Audio Recording</span>
                    </div>
                    {currentPart.audio_url ? (
                      <audio
                        key={currentPart.id}
                        controls
                        controlsList="nodownload noplaybackrate"
                        className="w-full h-10 accent-indigo-600 rounded"
                        src={currentPart.audio_url.startsWith('http')
                          ? currentPart.audio_url
                          : `http://localhost:8000${currentPart.audio_url}`}
                      />
                    ) : (
                      <div className="text-sm text-amber-700 italic py-3 px-4 bg-amber-50 rounded border-2 border-amber-200">
                        No audio available for this part
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Navigator Map */}
                <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-indigo-200 rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600"></div>
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Question Navigator</h3>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {test.parts?.flatMap(p => p.groups?.flatMap(g => g.questions)).map((q) => {
                      if (!q) return null;

                      const qNum = String(q.question_number);
                      const ansVal = answers[qNum];
                      const isAnswered = ansVal !== undefined && ansVal !== "" && ansVal !== null && (Array.isArray(ansVal) ? ansVal.length > 0 : true);

                      return (
                        <button
                          key={q.id || q.question_number}
                          onClick={() => {
                            const element = document.getElementById(`question-${q.question_number}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className={`h-10 text-xs font-bold border-2 transition-all rounded flex items-center justify-center ${
                            isAnswered
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-sm"
                              : "bg-white text-slate-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400"
                          }`}
                          title={`Question ${q.question_number}`}
                        >
                          {isAnswered && <CheckCircle size={10} className="mr-1" />}
                          {q.question_number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Questions */}
            <div className="bg-gradient-to-br from-white to-slate-50/50 h-full flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b-2 border-indigo-200 bg-white flex-shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600"></div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
                    Questions - Part {currentPart.part_number}
                  </h3>
                </div>
                <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {currentPart.groups?.reduce((acc, g) => acc + (g.questions?.length || 0), 0) || 0} Questions
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroll-smooth bg-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#818cf8 #f1f5f9' }}>
                <div className="p-6 md:p-8 max-w-3xl mx-auto">
                  <div className="space-y-8 pb-10">
                    {currentPart.groups?.map((group, gIndex) => (
                      <div key={group.id || gIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {group.instruction && (
                          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-l-4 border-indigo-600 p-5 rounded-r-lg mb-6 shadow-sm">
                            <p className="font-semibold text-slate-800 text-sm flex gap-2 items-start leading-relaxed whitespace-pre-wrap">
                              <Info size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                              <span>{group.instruction}</span>
                            </p>
                          </div>
                        )}

                        <div className="space-y-6">
                          {group.questions?.map((q) => (
                            <div key={q.id || q.question_number} id={`question-${q.question_number}`}>
                              <StudentQuestionDisplay
                                question={q}
                                currentAnswer={answers[String(q.question_number)]}
                                onAnswerChange={handleAnswerChange}
                              />
                            </div>
                          ))}
                        </div>

                        {gIndex < (currentPart.groups?.length || 0) - 1 && (
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

                    {(!currentPart.groups || currentPart.groups.length === 0) && (
                      <div className="text-center py-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-dashed border-indigo-300">
                        <Headphones className="mx-auto mb-4 text-indigo-300" size={56} />
                        <p className="text-indigo-600 font-semibold">No questions available for this part.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* FOOTER - Part Navigation */}
      <footer className="bg-white border-t-2 border-indigo-200 h-16 flex-shrink-0 z-30 shadow-sm">
        <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">

          <button
            onClick={prevPart}
            disabled={currentPartIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all border-2 border-transparent hover:border-indigo-200"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex gap-2">
            {test.parts?.map((part, index) => (
              <button
                key={index}
                onClick={() => setCurrentPartIndex(index)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                  currentPartIndex === index
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400'
                }`}
              >
                Part {part.part_number}
              </button>
            ))}
          </div>

          {/* RIGHT: Next hoặc Finish Section */}
          {isFullTestMode && currentPartIndex === (test.parts?.length || 1) - 1 ? (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-md disabled:from-slate-400 disabled:to-slate-400 transition-all border-2 border-transparent"
            >
              {submitting ? 'Processing...' : 'Finish Section'}
              <Send size={16} />
            </button>
          ) : (
            <button
              onClick={nextPart}
              disabled={currentPartIndex === (test.parts?.length || 1) - 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all border-2 border-transparent hover:border-indigo-200"
            >
              Next
              <ChevronRight size={18} />
            </button>
          )}

        </div>
      </footer>
    </div>
  );
};

export default ListeningExamPage;
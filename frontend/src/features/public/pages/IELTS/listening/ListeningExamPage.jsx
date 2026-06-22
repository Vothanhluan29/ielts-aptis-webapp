import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useListeningExam } from "../../../hooks/IELTS/listening/useListeningExam";
import StudentQuestionDisplay from '../../../components/IELTS/Question Display/StudentQuestionDisplay';
import { Clock, Send, Headphones, ChevronRight, ChevronLeft, Info, PlayCircle, CheckCircle, Volume2, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

const ListeningExamPage = ({ testId, onFinish }) => {
  const {
    test, loading, submitting, answers, currentPart, currentPartIndex,
    setCurrentPartIndex, timeLeft, totalQuestions, answeredCount,
    handleAnswerChange, handleSubmit, isFullTestMode, nextPart, prevPart
  } = useListeningExam(testId, onFinish);

  const [audioStatus, setAudioStatus] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const audioRef = useRef(null);

  // ==========================================
  // AUDIO STRICT LOGIC (AUTOPLAY, NO SEEK)
  // ==========================================
  const currentAudioStatus = audioStatus[currentPart?.id] || 'ready';

  useEffect(() => {
    // Autoplay logic when the part changes
    if (currentPart && audioRef.current && currentAudioStatus === 'ready') {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setAudioStatus(prev => ({ ...prev, [currentPart.id]: 'playing' }));
        }).catch(err => {
          console.warn("Autoplay was prevented by browser:", err);
          // Wait for user interaction if autoplay is blocked
        });
      }
    }
  }, [currentPart, currentAudioStatus]);

  const handlePlayAudioFallback = () => {
    // If autoplay was blocked, the user can click the button
    if (audioRef.current && currentAudioStatus === 'ready') {
      audioRef.current.play();
      setAudioStatus(prev => ({ ...prev, [currentPart.id]: 'playing' }));
    }
  };

  const handleAudioEnded = () => {
    setAudioStatus(prev => ({ ...prev, [currentPart.id]: 'ended' }));
  };

  const handleAudioPause = (e) => {
    // Force resume if user tries to pause
    if (currentAudioStatus === 'playing' && e.target.currentTime < e.target.duration) {
      e.target.play();
    }
  };

  useEffect(() => {
    const questionContainer = document.getElementById('listening-question-container');
    const textWrapper = document.getElementById('listening-left-wrapper');
    if (questionContainer) questionContainer.scrollTo({ top: 0, behavior: 'auto' });
    if (textWrapper) textWrapper.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPartIndex]);

  const allQuestions = useMemo(() => {
    if (!test?.parts) return [];
    const questions = [];
    test.parts.forEach((p, pIndex) => {
      p.groups?.forEach(g => {
        g.questions?.forEach(q => {
          questions.push({ ...q, partIndex: pIndex });
        });
      });
    });
    return questions.sort((a, b) => a.question_number - b.question_number);
  }, [test]);

  const scrollToQuestion = (qNumber, pIndex) => {
    if (currentPartIndex !== pIndex) {
      setCurrentPartIndex(pIndex);
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
    if (s == null) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-blue-600 font-bold text-xl">Loading Listening Test...</div>
      </div>
    );
  }

  if (!test) return null;

  const isTimeWarning = timeLeft !== null && timeLeft <= 300;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden text-slate-800">

      {/* HEADER */}
      {!isFullTestMode && (
        <header className="bg-blue-600 text-white h-[56px] shrink-0 z-30 flex items-center justify-between px-8 border-b border-slate-300">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-wide" title={test.title}>
              {test.title}
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 border border-transparent hover:border-white/30 transition-all text-sm font-semibold">
              <Volume2 size={18} />
              Volume
            </button>
            <div className={`flex items-center gap-2 font-bold text-xl px-4 py-1.5 ${isTimeWarning ? 'text-red-300 animate-pulse' : 'text-white'}`}>
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </header>
      )}

      {/* MAIN BODY - Split View */}
      <div className="flex-1 overflow-hidden relative">
        {currentPart && (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-x divide-slate-300">

            {/* LEFT PANEL: Audio & Images */}
            <div id="listening-left-wrapper" className="bg-white h-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div className="p-8 max-w-3xl mx-auto flex flex-col items-center">
                
                {/* AUDIO PLAYER */}
                <div className="w-full bg-slate-50 border border-slate-300 p-5 mb-8 text-center transition-all">
                  <div className="flex flex-col items-center justify-center mb-4 gap-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shadow-sm">
                      {currentPart.part_number}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800 leading-tight">Audio Track - Part {currentPart.part_number}</h2>
                      <p className="text-[12px] font-bold text-red-500 uppercase tracking-wider mt-1">Audio will only play once</p>
                    </div>
                  </div>
                  
                  {currentPart.audio_url ? (
                    <div className="w-full mt-4">
                      <button
                        onClick={handlePlayAudioFallback}
                        disabled={currentAudioStatus !== 'ready'}
                        className={`w-full py-3.5 flex items-center justify-center gap-2 font-bold text-[15px] transition-all 
                          ${currentAudioStatus === 'ready' ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' : 
                            currentAudioStatus === 'playing' ? 'bg-amber-50 border border-amber-400 text-amber-700 cursor-not-allowed' : 
                            'bg-slate-100 border border-slate-300 text-slate-500 cursor-not-allowed'}`}
                      >
                        {currentAudioStatus === 'ready' && <><PlayCircle size={22} /> CLICK TO START AUDIO</>}
                        {currentAudioStatus === 'playing' && <><Volume2 size={22} className="animate-pulse" /> AUDIO PLAYING... DO NOT PAUSE</>}
                        {currentAudioStatus === 'ended' && <><Lock size={22} /> AUDIO ENDED</>}
                      </button>
                      
                      <audio
                        ref={audioRef}
                        key={currentPart.id}
                        onEnded={handleAudioEnded}
                        onPause={handleAudioPause}
                        className="hidden"
                        src={currentPart.audio_url.startsWith('http')
                          ? currentPart.audio_url
                          : `http://localhost:8000${currentPart.audio_url}`}
                      />
                    </div>
                  ) : (
                    <div className="text-[15px] text-slate-500 font-semibold italic py-3">
                      No audio available
                    </div>
                  )}
                </div>

                {/* IMAGES FROM GROUPS */}
                <div className="w-full space-y-6">
                  {currentPart.groups?.map((group, gIndex) => (
                    group.image_url && (
                      <div key={`img-${gIndex}`} className="flex flex-col items-center">
                         <div className="bg-white p-3 border border-slate-300">
                           <img 
                             src={group.image_url.startsWith('http') ? group.image_url : `http://localhost:8000${group.image_url}`} 
                             alt="Map or Diagram" 
                             className="max-w-full"
                             style={{ maxHeight: '450px', objectFit: 'contain' }}
                           />
                         </div>
                      </div>
                    )
                  ))}
                </div>

              </div>
            </div>

            {/* RIGHT PANEL: Questions */}
            <div className="bg-slate-50 h-full flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-300 bg-white shrink-0 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">
                  Part {currentPart.part_number}: Questions {currentPart.groups?.[0]?.questions?.[0]?.question_number} - {currentPart.groups?.[currentPart.groups.length - 1]?.questions?.slice(-1)[0]?.question_number}
                </h3>
              </div>

              <div id="listening-question-container" className="flex-1 overflow-y-auto bg-white" style={{ scrollbarWidth: 'thin' }}>
                <div className="p-8 max-w-2xl mx-auto">
                  <div className="space-y-10 pb-10">
                    
                    {currentPart.groups?.map((group, gIndex) => (
                      <div key={group.id || gIndex}>

                        {group.instruction && (
                          <div className="bg-slate-100 border border-slate-300 p-4 mb-6 text-sm font-bold text-slate-800 whitespace-pre-wrap rounded-lg">
                            {group.instruction}
                          </div>
                        )}

                        <div className="space-y-8">
                          {group.questions?.map((q) => (
                            <div key={q.id || q.question_number} id={`question-${q.question_number}`} className="scroll-mt-6">
                              <StudentQuestionDisplay
                                question={q}
                                currentAnswer={answers[String(q.question_number)]}
                                onAnswerChange={handleAnswerChange}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {(!currentPart.groups || currentPart.groups.length === 0) && (
                      <div className="text-center py-24 text-slate-500 font-semibold">
                        No questions available for this part.
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
      <footer className="bg-slate-200 border-t border-slate-300 flex flex-col shrink-0 z-30">
        
        {/* Navigation Bar */}
        <div className="bg-slate-100 border-b border-slate-300 h-12 px-6 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={prevPart}
              disabled={currentPartIndex === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-none"
            >
              <ArrowLeft size={16} />
              Previous Part
            </button>

            <button
              onClick={nextPart}
              disabled={currentPartIndex === (test.parts?.length || 1) - 1}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-none"
            >
              Next Part
              <ArrowRight size={16} />
            </button>
          </div>

          <div>
            {currentPartIndex === (test.parts?.length || 1) - 1 && (
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 disabled:bg-slate-400 transition-none"
              >
                {submitting ? 'Processing...' : (isFullTestMode ? 'Finish Section' : 'Submit Test')}
                <Send size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Question Grid */}
        <div className="overflow-x-auto py-3 px-6 flex items-center gap-1.5 bg-slate-200 scrollbar-hide">
          {allQuestions.map((q) => {
            const qNum = q.question_number;
            const hasAnswer = answers[String(qNum)] && String(answers[String(qNum)]).trim() !== '';
            return (
              <button
                key={qNum}
                onClick={() => scrollToQuestion(qNum, q.partIndex)}
                className={`flex-shrink-0 w-9 h-9 flex flex-col items-center justify-center font-semibold text-sm border transition-none ${
                  hasAnswer ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100'
                }`}
              >
                {qNum}
                {hasAnswer && <div className="w-[80%] h-[3px] bg-white opacity-80 mt-0.5"></div>}
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

export default ListeningExamPage;
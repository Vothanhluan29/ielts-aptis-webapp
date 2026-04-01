import React, { useState, useEffect, useRef } from 'react';
import { useListeningExam } from "../../../hooks/IELTS/listening/useListeningExam";
import StudentQuestionDisplay from '../../../components/IELTS/Question Display/StudentQuestionDisplay';
import { Clock, Send, Headphones, ChevronRight, ChevronLeft, Info, PlayCircle, CheckCircle, Highlighter, Eraser, Volume2, Lock } from 'lucide-react';
import WebHighlighter from 'web-highlighter'; // 🔥 Import trực tiếp thư viện để bọc câu hỏi

const ListeningExamPage = ({ testId, onFinish }) => {
  const {
    test, loading, submitting, answers, currentPart, currentPartIndex,
    setCurrentPartIndex, timeLeft, totalQuestions, answeredCount,
    handleAnswerChange, handleSubmit, isFullTestMode, nextPart, prevPart
  } = useListeningExam(testId, onFinish);

  const [activeTool, setActiveTool] = useState(null);
  
  // 🔥 STATE QUẢN LÝ TRẠNG THÁI AUDIO TỪNG PART: 'ready' | 'playing' | 'ended'
  const [audioStatus, setAudioStatus] = useState({});
  const audioRef = useRef(null);

  // 🔥 REF CHO HIGHLIGHTER
  const questionsContainerRef = useRef(null);
  const highlighterInstance = useRef(null);

  // ==========================================
  // 1. HIGHLIGHTER LOGIC DÀNH RIÊNG CHO LISTENING
  // ==========================================
  useEffect(() => {
    if (!questionsContainerRef.current) return;
    const storageKey = `ielts_listening_${testId}_part_${currentPartIndex}`;

    // Khởi tạo Bút dạ, BỎ QUA các thẻ tương tác (input, select) để học viên vẫn nhập đáp án được
    const highlighter = new WebHighlighter({
      $root: questionsContainerRef.current,
      className: 'highlight-yellow',
      exceptSelectors: ['input', 'select', 'textarea', 'button', 'option']
    });
    highlighterInstance.current = highlighter;

    // Load lại highlight nếu ấn F5
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        JSON.parse(savedData).forEach((h) => highlighter.fromStore(h.startMeta, h.endMeta, h.text, h.id, h.extra));
      } catch (err) {
        console.error('Failed to load highlights from localStorage', err);
      }
    }

    // Lắng nghe sự kiện bôi đen và xóa
    highlighter.on(WebHighlighter.event.CREATE, ({ sources }) => {
      const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...current, ...sources]));
    });

    highlighter.on(WebHighlighter.event.REMOVE, ({ ids }) => {
      const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify(current.filter(h => !ids.includes(h.id))));
    });

    highlighter.on(WebHighlighter.event.CLICK, ({ id }) => highlighter.remove(id));

    return () => highlighter.dispose();
  }, [currentPartIndex, testId]);

  useEffect(() => {
    if (!highlighterInstance.current) return;
    if (!activeTool) {
      highlighterInstance.current.stop();
    } else {
      highlighterInstance.current.run();
      highlighterInstance.current.setOption({ className: `highlight-${activeTool}` });
    }
  }, [activeTool]);

  // ==========================================
  // 2. AUDIO STRICT LOGIC (1 LẦN, NO SEEK)
  // ==========================================
  const currentAudioStatus = audioStatus[currentPart?.id] || 'ready';

  const handlePlayAudio = () => {
    if (audioRef.current && currentAudioStatus === 'ready') {
      audioRef.current.play();
      setAudioStatus(prev => ({ ...prev, [currentPart.id]: 'playing' }));
    }
  };

  const handleAudioEnded = () => {
    setAudioStatus(prev => ({ ...prev, [currentPart.id]: 'ended' }));
  };

  const handleAudioPause = (e) => {
    // Ép phát tiếp nếu học viên dùng thủ thuật chuột phải chọn Pause
    if (currentAudioStatus === 'playing' && e.target.currentTime < e.target.duration) {
      e.target.play();
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
    <div className="h-screen flex flex-col bg-linear-to-br from-slate-50 to-blue-50/30 font-sans overflow-hidden">
      
      {/* CSS ĐỔ MÀU HIGHLIGHT */}
      <style>{`
        .highlight-yellow { background-color: #fef08a !important; cursor: pointer; border-radius: 3px; padding: 2px 0; }
        .highlight-green { background-color: #bbf7d0 !important; cursor: pointer; border-radius: 3px; padding: 2px 0; }
        .highlight-red { background-color: #fecaca !important; cursor: pointer; border-radius: 3px; padding: 2px 0; }
        .highlight-yellow:hover, .highlight-green:hover, .highlight-red:hover { opacity: 0.8; }
      `}</style>

      {/* HEADER */}
      {!isFullTestMode && (
        <header className="bg-white border-b-2 border-indigo-200 shadow-sm h-14 shrink-0 z-30">
          {/* 🔥 FIX MAX-W-7XL ĐỂ ĐỒNG BỘ READING */}
          <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-9 bg-linear-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-widest">
                  IELTS Listening
                </span>
                <h1 className="text-sm font-bold text-slate-800 truncate max-w-xs" title={test.title}>
                  {test.title}
                </h1>
              </div>
            </div>

            {/* Center: Highlight Tools */}
            <div className="items-center gap-3 bg-linear-to-r from-indigo-50/50 to-blue-50/50 px-4 py-2 rounded-lg border border-indigo-200 hidden md:flex">
              <span className="text-[11px] font-bold text-indigo-600 uppercase flex items-center gap-1.5">
                <Highlighter size={14}/> Highlight:
              </span>
              {['yellow', 'green', 'red'].map(color => (
                <button 
                  key={color} 
                  onClick={() => setActiveTool(activeTool === color ? null : color)} 
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${activeTool === color ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110 shadow-md' : 'border-indigo-300 hover:border-indigo-500'}`} 
                  style={{backgroundColor: color === 'yellow' ? '#fef08a' : color === 'green' ? '#bbf7d0' : '#fecaca'}}
                  title={`Highlight ${color}`}
                />
              ))}
              <div className="w-px h-5 bg-indigo-300"></div>
              <button 
                onClick={() => setActiveTool(null)} 
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                title="Put pen down"
              >
                <Eraser size={14}/> Clear Pen
              </button>
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
                className="flex items-center gap-2 px-6 py-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold text-sm hover:from-indigo-700 hover:to-blue-700 shadow-md disabled:from-slate-400 disabled:to-slate-400 transition-all"
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
                <div className="bg-linear-to-br from-white to-slate-50 border-2 border-indigo-200 rounded-lg shadow-sm p-8 mb-8">
                  <div className="mb-6 pb-6 border-b-2 border-indigo-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {currentPart.part_number}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-serif leading-tight">
                        Part {currentPart.part_number}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      Listen carefully to the recording and answer all questions. <strong className="text-red-500">Audio can only be played once.</strong>
                    </p>
                  </div>

                  {/* 🔥 CUSTOM AUDIO PLAYER KHÔNG THỂ TUA */}
                  <div className="bg-linear-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-600 p-5 rounded-r-lg mb-2">
                    <div className="flex items-center gap-2 mb-4">
                      <Headphones size={18} className="text-indigo-600" />
                      <span className="font-bold text-sm text-slate-800">Secure Audio Player</span>
                    </div>
                    
                    {currentPart.audio_url ? (
                      <div className="flex flex-col items-center gap-3">
                        <button
                          onClick={handlePlayAudio}
                          disabled={currentAudioStatus !== 'ready'}
                          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-md transition-all 
                            ${currentAudioStatus === 'ready' ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-lg' : 
                              currentAudioStatus === 'playing' ? 'bg-amber-100 border-2 border-amber-400 text-amber-700 cursor-not-allowed' : 
                              'bg-slate-200 border-2 border-slate-300 text-slate-500 cursor-not-allowed'}`}
                        >
                          {currentAudioStatus === 'ready' && <><PlayCircle size={24} /> PLAY AUDIO NOW</>}
                          {currentAudioStatus === 'playing' && <><Volume2 size={24} className="animate-pulse" /> PLAYING... DO NOT CLOSE</>}
                          {currentAudioStatus === 'ended' && <><Lock size={24} /> AUDIO ENDED</>}
                        </button>
                        
                        {/* Audio ẩn (Hidden) để học viên không thể nhìn thấy thanh tiến trình */}
                        <audio
                          ref={audioRef}
                          key={currentPart.id}
                          onEnded={handleAudioEnded}
                          onPause={handleAudioPause} // Chống pause gian lận
                          className="hidden"
                          src={currentPart.audio_url.startsWith('http')
                            ? currentPart.audio_url
                            : `http://localhost:8000${currentPart.audio_url}`}
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-amber-700 italic py-3 px-4 bg-amber-50 rounded border-2 border-amber-200">
                        No audio available for this part
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Navigator Map */}
                <div className="bg-linear-to-br from-white to-slate-50 border-2 border-indigo-200 rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-linear-to-r from-indigo-600 to-blue-600"></div>
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
                              ? "bg-linear-to-br from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-sm"
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
            <div className="bg-linear-to-br from-white to-slate-50/50 h-full flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b-2 border-indigo-200 bg-white shrink-0 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-linear-to-r from-indigo-600 to-blue-600"></div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
                    Questions - Part {currentPart.part_number}
                  </h3>
                </div>
                <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-4">
                  <span>Questions answered: <span className="font-bold">{answeredCount}</span>/{totalQuestions}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroll-smooth bg-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#818cf8 #f1f5f9' }}>
                <div className="p-6 md:p-8 max-w-3xl mx-auto">
                  {/* 🔥 KHUNG ÁP DỤNG HIGHLIGHTER */}
                  <div className="space-y-8 pb-10" ref={questionsContainerRef}>
                    
                    {currentPart.groups?.map((group, gIndex) => (
                      <div key={group.id || gIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {group.instruction && (
                          <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 border-l-4 border-indigo-600 p-5 rounded-r-lg mb-6 shadow-sm">
                            <p className="font-semibold text-slate-800 text-sm flex gap-2 items-start leading-relaxed whitespace-pre-wrap">
                              <Info size={18} className="text-indigo-600 mt-0.5 shrink-0" />
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
                      <div className="text-center py-24 bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-dashed border-indigo-300">
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
      <footer className="bg-white border-t-2 border-indigo-200 h-16 shrink-0 z-30 shadow-sm">
        {/* 🔥 FIX MAX-W-7XL ĐỂ ĐỒNG BỘ READING */}
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">

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
                    ? 'bg-linear-to-r from-indigo-600 to-blue-600 text-white border-indigo-600 shadow-md'
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
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-md disabled:from-slate-400 disabled:to-slate-400 transition-all border-2 border-transparent"
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
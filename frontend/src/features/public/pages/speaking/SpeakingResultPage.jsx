import React from 'react';
import { useSpeakingResult } from '../../hooks/speaking/useSpeakingResult';
import {
  Trophy,
  PlayCircle,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Info,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  FileText
} from 'lucide-react';

// --- HELPER: XÁC ĐỊNH MÀU SẮC DỰA TRÊN LOẠI LỖI ---
const getCorrectionTheme = (type = '') => {
  const t = type.toLowerCase();
  
  if (t.includes('good') || t.includes('excellent') || t.includes('phrase') || t.includes('vocab')) {
    return {
      card: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300',
      textOriginal: 'text-emerald-700 font-semibold',
      badge: 'border-emerald-200 text-emerald-600 bg-emerald-50',
      fixText: 'text-emerald-700',
      icon: <Sparkles size={14} className="text-emerald-500" />,
      highlighter: 'bg-emerald-100 text-emerald-800 border-emerald-400 group-hover:bg-emerald-200',
      tooltipPrefix: '🌟 Highlight:'
    };
  }
  
  if (t.includes('minor') || t.includes('slip') || t.includes('hesitation') || t.includes('pronunciation')) {
    return {
      card: 'bg-amber-50 border-amber-200 hover:border-amber-300',
      textOriginal: 'text-amber-700 font-semibold line-through decoration-amber-400/60 decoration-2',
      badge: 'border-amber-200 text-amber-600 bg-amber-50',
      fixText: 'text-emerald-600',
      icon: <Info size={14} className="text-amber-500" />,
      highlighter: 'bg-amber-100 text-amber-800 border-amber-400 group-hover:bg-amber-200',
      tooltipPrefix: 'Improvement:'
    };
  }

  return {
    card: 'bg-rose-50 border-rose-200 hover:border-rose-300',
    textOriginal: 'text-rose-700 font-semibold line-through decoration-rose-400/60 decoration-2',
    badge: 'border-rose-200 text-rose-600 bg-rose-50',
    fixText: 'text-emerald-600',
    icon: <TrendingUp size={14} className="text-rose-500" />,
    highlighter: 'bg-rose-100 text-rose-800 border-rose-400 group-hover:bg-rose-200',
    tooltipPrefix: 'Fix:'
  };
};

// --- SCORE RING ---
const ScoreRing = ({ label, value }) => {
  const score = parseFloat(value) || 0;
  const pct = Math.min((score / 9) * 100, 100);
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3.5" />
          <circle
            cx="28" cy="28" r={r} fill="none"
            stroke="rgba(255,255,255,0.9)" strokeWidth="3.5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">
          {value || '–'}
        </span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</span>
    </div>
  );
};

// --- TRANG CHÍNH ---
const SpeakingResultPage = () => {
  const {
    submission,
    loading,
    activePart,
    setActivePart,
    activePartData, // Gọi đúng biến từ Hook mới
    navigate
  } = useSpeakingResult();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="relative w-14 h-14 mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-violet-200"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-indigo-400 animate-spin" style={{animationDuration:'1.4s',animationDirection:'reverse'}}></div>
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase animate-pulse">Loading results</p>
      </div>
    );

  if (!submission)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-rose-500 font-medium">
        Result not found.
        <button onClick={() => navigate('/speaking/history')} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-200 transition">Go Back</button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800" style={{fontFamily:"'DM Sans', system-ui, sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;900&family=DM+Serif+Display:ital@0;1&display=swap');
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp 0.45s ease both; }
        .fu1 { animation: fadeUp 0.45s 0.08s ease both; }
        .fu2 { animation: fadeUp 0.45s 0.16s ease both; }
        .fu3 { animation: fadeUp 0.45s 0.24s ease both; }
        .fu4 { animation: fadeUp 0.45s 0.32s ease both; }
        .part-active { background: linear-gradient(135deg, #f5f3ff, #ede9fe); }
        .header-grad { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #6d28d9 100%); }
      `}</style>

      <div className="max-w-6xl mx-auto">

        {/* --- HEADER CHUNG CỦA BÀI THI --- */}
        <div className="header-grad fu rounded-3xl p-8 md:p-10 mb-8 overflow-hidden relative shadow-xl shadow-violet-300/30">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-24 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">IELTS Speaking</span>
              </div>
              <h1 className="serif text-3xl md:text-4xl text-white font-normal leading-snug mb-3">
                {submission.test?.title || 'Speaking Result'}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-white/60">
                  {new Date(submission.submitted_at).toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'})}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block"></span>
                  {submission.status}
                </span>
              </div>
            </div>

            {/* Right: scores */}
            <div className="flex items-center gap-6 bg-white/10 border border-white/20 rounded-2xl px-7 py-5">
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5">Overall Band</div>
                <div className="serif text-6xl font-normal text-white leading-none">
                  {submission.band_score || '–'}
                </div>
              </div>

              <div className="w-px h-16 bg-white/20"></div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <ScoreRing label="Fluency"  value={submission.score_fluency} />
                <ScoreRing label="Lexical"  value={submission.score_lexical} />
                <ScoreRing label="Grammar"  value={submission.score_grammar} />
                <ScoreRing label="Pronunc"  value={submission.score_pronunciation} />
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT (SIDEBAR + CHI TIẾT PART) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-2 fu1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 pl-1">Sections</p>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setActivePart(num)}
                className={`w-full text-left px-5 py-4 rounded-2xl text-sm border-2 transition-all duration-200 flex items-center justify-between ${
                  activePart === num
                    ? 'part-active border-violet-300 text-violet-700 shadow-sm shadow-violet-100'
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-600 shadow-sm'
                }`}
              >
                <div>
                  <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${activePart === num ? 'text-violet-400' : 'text-slate-300'}`}>
                    Section
                  </div>
                  <div className="text-base font-bold">Part {num}</div>
                </div>
                {activePart === num && (
                  <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center">
                    <PlayCircle size={14} className="text-violet-500 animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Chi tiết Part hiện tại */}
          <div className="lg:col-span-3 space-y-6">
            {!activePartData || activePartData.qaList.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center gap-4 fu2 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No recording data available for this part.</p>
              </div>
            ) : (
              <>
                {/* 1. Lời dẫn & Cue Card của Part (Nếu có) */}
                {activePartData.partInfo?.instruction && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm fu2 flex gap-4 items-start">
                    <Info size={24} className="text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">Part Instruction</h4>
                      <p className="text-slate-600 text-sm">{activePartData.partInfo.instruction}</p>
                    </div>
                  </div>
                )}

                {activePartData.partInfo?.cue_card && (
                  <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 md:p-8 shadow-sm fu2">
                    <div className="flex items-center gap-2 mb-4 text-amber-600">
                      <FileText size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Candidate Task Card</span>
                    </div>
                    <p className="serif text-lg md:text-xl text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {activePartData.partInfo.cue_card}
                    </p>
                  </div>
                )}

                {/* 2. Vòng lặp hiển thị từng Câu hỏi & Câu trả lời */}
                <div className="space-y-12">
                  {activePartData.qaList.map(({ questionInfo, answerDetail }, index) => (
                    <div key={questionInfo.id || index} className="relative fu3">
                      
                      {/* Số thứ tự câu hỏi */}
                      <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md z-10 border-2 border-slate-50">
                        {index + 1}
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        
                        {/* Khu vực Câu hỏi */}
                        <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100">
                          <div className="flex gap-3">
                            <HelpCircle className="text-violet-400 flex-shrink-0 mt-1" size={20} />
                            <h3 className="serif text-xl md:text-2xl text-slate-800 leading-snug">
                              {questionInfo.question_text}
                            </h3>
                          </div>
                        </div>

                        {/* Khu vực Câu trả lời & Đánh giá */}
                        <div className="p-6 md:p-8 space-y-6">
                          {!answerDetail ? (
                            <p className="text-slate-400 italic text-sm text-center py-4">No answer recorded for this question.</p>
                          ) : (
                            <>
                              {/* Audio */}
                              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                                  <PlayCircle size={14} className="text-violet-500" />
                                </div>
                                <audio src={answerDetail.audio_url} controls className="w-full h-10 accent-violet-600" />
                              </div>

                              {/* Điểm của câu này (Chỉ hiện nếu khác 0) */}
                              {answerDetail.score_fluency > 0 && (
                                <div className="flex gap-4 p-4 rounded-2xl bg-violet-50/50 border border-violet-100/50 justify-center">
                                  <div className="text-center px-4">
                                    <div className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Fluency</div>
                                    <div className="font-bold text-violet-700">{answerDetail.score_fluency}</div>
                                  </div>
                                  <div className="text-center px-4 border-l border-violet-200/50">
                                    <div className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Lexical</div>
                                    <div className="font-bold text-violet-700">{answerDetail.score_lexical}</div>
                                  </div>
                                  <div className="text-center px-4 border-l border-violet-200/50">
                                    <div className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Grammar</div>
                                    <div className="font-bold text-violet-700">{answerDetail.score_grammar}</div>
                                  </div>
                                  <div className="text-center px-4 border-l border-violet-200/50">
                                    <div className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Pronunc.</div>
                                    <div className="font-bold text-violet-700">{answerDetail.score_pronunciation}</div>
                                  </div>
                                </div>
                              )}

                              {/* Transcript */}
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
                                  <MessageSquare size={14} className="text-violet-500" /> 
                                  Transcript & Feedback
                                </h4>
                                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 leading-[2.4] text-base text-slate-700" style={{fontFamily:"'DM Serif Display', Georgia, serif"}}>
                                  {answerDetail.transcript ? (
                                    <TranscriptHighlighter
                                      transcript={answerDetail.transcript}
                                      corrections={answerDetail.parsedCorrections || []}
                                    />
                                  ) : (
                                    <span className="italic text-slate-400">Transcribing audio...</span>
                                  )}
                                </div>
                              </div>

                              {/* Corrections List */}
                              {answerDetail.parsedCorrections && answerDetail.parsedCorrections.length > 0 && (
                                <div className="space-y-3 pt-2">
                                  {answerDetail.parsedCorrections.map((err, idx) => {
                                    const theme = getCorrectionTheme(err.type);
                                    return (
                                      <div key={idx} className={`flex flex-col md:flex-row rounded-2xl border transition-all duration-200 overflow-hidden ${theme.card}`}>
                                        <div className="md:w-[36%] p-4">
                                          <div className={`text-[9px] font-bold uppercase tracking-[0.15em] mb-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${theme.badge}`}>
                                            {err.type}
                                          </div>
                                          <div className={`${theme.textOriginal} text-sm leading-relaxed`}>{err.text}</div>
                                        </div>
                                        <div className="hidden md:block w-px bg-black/5 my-4"></div>
                                        <div className="md:w-[28%] p-4 flex flex-col justify-center">
                                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                                            {theme.tooltipPrefix.replace(':', '')}
                                          </div>
                                          <div className={`${theme.fixText} font-semibold text-sm flex items-center gap-1.5`}>
                                            {theme.icon} {err.fix}
                                          </div>
                                        </div>
                                        <div className="hidden md:block w-px bg-black/5 my-4"></div>
                                        <div className="md:w-[36%] p-4 text-slate-500 text-xs leading-relaxed flex items-center italic">
                                          {err.explanation}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Examiner Note cho riêng câu hỏi này */}
                              {answerDetail.feedback && (
                                <div className="rounded-2xl p-5 border border-indigo-100 bg-indigo-50/50 mt-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={13} className="text-indigo-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                                      AI Examiner's Note
                                    </span>
                                  </div>
                                  <p className="italic text-indigo-900/80 leading-relaxed text-sm whitespace-pre-wrap">
                                    {answerDetail.feedback}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- TRANSCRIPT HIGHLIGHTER (Giữ nguyên) ---
const TranscriptHighlighter = ({ transcript, corrections }) => {
  if (!transcript) return null;
  if (!corrections || corrections.length === 0) return <span>{transcript}</span>;

  const sortedCorrections = [...corrections].sort((a, b) => b.text.length - a.text.length);
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = transcript.split(new RegExp(`(${sortedCorrections.map(c => escapeRegExp(c.text)).join('|')})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) => {
        const match = sortedCorrections.find(c => c.text.toLowerCase() === part.toLowerCase());
        if (match) {
          const theme = getCorrectionTheme(match.type);
          return (
            <span key={i} className="relative group cursor-help mx-[2px] inline-block">
              <span className={`border-b-2 border-dotted px-1 py-0.5 rounded-sm transition-all duration-150 ${theme.highlighter}`}>
                {part}
              </span>
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 group-hover:-translate-y-1"
                style={{fontFamily:"'DM Sans', sans-serif"}}>
                <span className="block bg-slate-800 rounded-2xl shadow-2xl p-4 text-center border border-slate-700/50">
                  <span className="block text-emerald-400 font-bold text-sm border-b border-slate-600 pb-2 mb-2">
                    {theme.tooltipPrefix} <span className="text-white">"{match.fix}"</span>
                  </span>
                  <span className="text-slate-300 text-xs leading-relaxed block">{match.explanation}</span>
                </span>
                <span className="block w-3 h-3 mx-auto -mt-1.5 rotate-45 bg-slate-800 border-r border-b border-slate-700/50"></span>
              </span>
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

export default SpeakingResultPage;
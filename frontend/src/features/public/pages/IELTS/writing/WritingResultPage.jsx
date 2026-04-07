import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWritingResult } from '../../../hooks/IELTS/writing/useWritingResult';
import { 
  ArrowLeft, CheckCircle, Lightbulb, 
  BookOpen, Star, MessageSquare, 
  Info, AlertTriangle, SpellCheck, Link, PenTool,
  Bot, RefreshCw
} from 'lucide-react';

const getCorrectionTheme = (type = '') => {
  const t = type.toLowerCase();
  
  if (t === 'grammar') {
    return {
      type: 'Grammar',
      card: 'bg-rose-50 border-rose-200 hover:border-rose-300',
      textOriginal: 'text-rose-700 font-semibold bg-rose-100/50 px-1 rounded line-through decoration-rose-300',
      badge: 'border-rose-200 text-rose-600 bg-rose-100',
      fixBg: 'bg-white border-rose-100 text-emerald-600',
      icon: <AlertTriangle size={14} className="text-rose-500" />,
      highlighter: 'bg-rose-100 text-rose-900 border-rose-400 group-hover:bg-rose-200',
      tooltipPrefix: 'Fix Grammar:'
    };
  }

  if (t === 'vocabulary' || t.includes('phrase')) {
    return {
      type: 'Vocabulary',
      card: 'bg-amber-50 border-amber-200 hover:border-amber-300',
      textOriginal: 'text-amber-700 font-semibold bg-amber-100/50 px-1 rounded line-through decoration-amber-300',
      badge: 'border-amber-200 text-amber-600 bg-amber-100',
      fixBg: 'bg-white border-amber-100 text-emerald-600',
      icon: <PenTool size={14} className="text-amber-500" />,
      highlighter: 'bg-amber-100 text-amber-900 border-amber-400 group-hover:bg-amber-200',
      tooltipPrefix: 'Better Word:'
    };
  }

  if (t === 'coherence') {
    return {
      type: 'Coherence',
      card: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
      textOriginal: 'text-indigo-700 font-semibold bg-indigo-100/50 px-1 rounded line-through decoration-indigo-300',
      badge: 'border-indigo-200 text-indigo-600 bg-indigo-100',
      fixBg: 'bg-white border-indigo-100 text-emerald-600',
      icon: <Link size={14} className="text-indigo-500" />,
      highlighter: 'bg-indigo-100 text-indigo-900 border-indigo-400 group-hover:bg-indigo-200',
      tooltipPrefix: 'Improve Flow:'
    };
  }
  
  if (t === 'spelling' || t === 'punctuation') {
    return {
      type: t.charAt(0).toUpperCase() + t.slice(1),
      card: 'bg-blue-50 border-blue-200 hover:border-blue-300',
      textOriginal: 'text-blue-700 font-semibold bg-blue-100/50 px-1 rounded line-through decoration-dashed decoration-blue-400',
      badge: 'border-blue-200 text-blue-600 bg-blue-100',
      fixBg: 'bg-white border-blue-100 text-emerald-600',
      icon: <SpellCheck size={14} className="text-blue-500" />,
      highlighter: 'bg-blue-100 text-blue-900 border-blue-400 group-hover:bg-blue-200',
      tooltipPrefix: 'Correction:'
    };
  }

  return {
    type: 'Suggestion',
    card: 'bg-slate-50 border-slate-200 hover:border-slate-300',
    textOriginal: 'text-slate-700 font-semibold bg-slate-100/50 px-1 rounded line-through decoration-slate-300',
    badge: 'border-slate-200 text-slate-600 bg-slate-200',
    fixBg: 'bg-white border-slate-200 text-emerald-600',
    icon: <Info size={14} className="text-slate-500" />,
    highlighter: 'bg-slate-200 text-slate-800 border-slate-400 group-hover:bg-slate-300',
    tooltipPrefix: 'Change to:'
  };
};

// --- SCORE BAR ---
const ScoreBar = ({ label, score }) => {
  const pct = Math.min(((parseFloat(score) || 0) / 9) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-bold text-slate-800">
          {score || 0} <span className="text-slate-400 font-normal text-xs">/ 9.0</span>
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #f43f5e, #ec4899)'
          }}
        />
      </div>
    </div>
  );
};

const WritingResultPage = () => {
  const navigate = useNavigate();
  const { submission, loading, activeTab, setActiveTab, taskData } = useWritingResult();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="relative w-14 h-14 mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-rose-200"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-rose-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-pink-400 animate-spin" style={{animationDuration:'1.4s',animationDirection:'reverse'}}></div>
        </div>
        <p className="text-slate-400 text-sm font-bold tracking-widest uppercase animate-pulse">Analyzing your writing</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
        <p className="text-slate-500 font-medium">Submission not found or AI grading failed.</p>
        <button
          onClick={() => navigate('/writing/history')}
          className="mt-4 px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // 🔥 THÊM FALLBACK: Phòng ngừa lỗi khi taskData chưa load xong lúc đang GRADING
  const { scoreOverall, content, feedback, corrections = [], scores = [] } = taskData || {};

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800 font-sans">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .fu  { animation: fadeUp 0.45s ease both; }
        .fu1 { animation: fadeUp 0.45s 0.08s ease both; }
        .fu2 { animation: fadeUp 0.45s 0.16s ease both; }
        .fu3 { animation: fadeUp 0.45s 0.24s ease both; }
        .header-grad { background: linear-gradient(135deg, #e11d48 0%, #be185d 55%, #9f1239 100%); }
        .tab-active { background: linear-gradient(135deg, #fff1f2, #ffe4e6); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        <div className="header-grad fu rounded-3xl p-8 md:p-10 mb-8 overflow-hidden relative shadow-xl shadow-rose-300/30">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-24 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200">IELTS Writing</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-white leading-snug mb-3">
                {submission.test?.title || `Test #${submission.test_id}`}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-white/60 font-medium">
                  {new Date(submission.submitted_at).toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'})}
                </span>
                
                {/* Đổi màu Badge tùy theo trạng thái */}
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${
                  submission.status === 'GRADING' 
                    ? 'text-blue-300 bg-white/10 border-blue-300/30 animate-pulse' 
                    : 'text-emerald-300 bg-white/10 border-white/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${submission.status === 'GRADING' ? 'bg-blue-300' : 'bg-emerald-300'}`}></span>
                  {submission.status || 'GRADED'}
                </span>
              </div>
            </div>

            {/* Right: scores */}
            <div className="flex items-center gap-6 bg-white/10 border border-white/20 rounded-2xl px-7 py-5 relative overflow-hidden">
              {submission.status === 'GRADING' && (
                <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
              )}
              <div className="text-center relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5">Overall Band</div>
                <div className="font-serif text-6xl text-white leading-none">
                  {submission.band_score || '–'}
                </div>
              </div>

              <div className="w-px h-16 bg-white/20 relative z-10"></div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Task 1</span>
                  <span className="text-white font-black text-lg">{submission.score_t1_overall || '–'}</span>
                </div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Task 2</span>
                  <span className="text-white font-black text-lg">{submission.score_t2_overall || '–'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 THÔNG BÁO AI ĐANG CHẤM (Chỉ hiện khi GRADING) */}
        {submission.status === 'GRADING' && (
          <div className="fu1 mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm relative overflow-hidden">
            {/* Hiệu ứng quét sáng (Shimmer) */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0 relative z-10">
              <Bot size={24} className="text-blue-500 animate-bounce" />
            </div>
            
            <div className="text-center sm:text-left relative z-10">
              <h4 className="text-blue-800 font-bold text-base">AI Examiner is analyzing your essay...</h4>
              <p className="text-blue-600/80 text-sm mt-0.5 font-medium">This usually takes 1-2 minutes. Results will be updated automatically.</p>
            </div>
            
            <div className="sm:ml-auto relative z-10">
              <RefreshCw className="text-blue-400 animate-spin" size={20} />
            </div>
          </div>
        )}

        {/* --- CONTENT AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tabs */}
            <div className="fu1 bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5 flex gap-2">
              {['TASK_1', 'TASK_2'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === tab
                      ? 'tab-active text-rose-700 border border-rose-200 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  }`}
                >
                  {tab === 'TASK_1' ? 'Task 1 Result' : 'Task 2 Result'}
                </button>
              ))}
            </div>

            {/* Essay */}
            <div className="fu2 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <BookOpen size={15} className="text-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Your Essay</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">Hover on highlighted words to see feedback</p>
                </div>
              </div>
              
              <div className={`bg-slate-50/80 rounded-2xl p-6 md:p-8 border border-slate-100 leading-[2.2] text-[17px] text-slate-800 font-serif whitespace-pre-wrap ${submission.status === 'GRADING' ? 'opacity-50 pointer-events-none' : ''}`}>
                <CorrectionHighlighter content={content} corrections={corrections} />
              </div>
            </div>

            {/* Feedback */}
            <div className={`fu3 rounded-3xl p-6 md:p-8 border border-indigo-100 overflow-hidden relative bg-linear-to-br from-indigo-50 to-blue-50 ${submission.status === 'GRADING' ? 'opacity-50' : ''}`}>
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-indigo-200/40 blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={13} className="text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                  Examiner's Feedback
                </span>
              </div>
              <p className="font-serif italic text-slate-700 leading-relaxed text-[15px] whitespace-pre-wrap relative z-10">
                {submission.status === 'GRADING' ? 'Waiting for AI feedback...' : (feedback || 'No specific feedback available for this task.')}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Score Breakdown */}
            <div className={`fu2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm ${submission.status === 'GRADING' ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Star size={15} className="text-amber-500 fill-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Score Breakdown</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">Current task criteria</p>
                </div>
              </div>

              <div className="space-y-5">
                {scores.length > 0 ? (
                  scores.map((cri, idx) => (
                    <ScoreBar key={idx} label={cri.label} score={cri.score} />
                  ))
                ) : (
                  <div className="text-sm text-slate-400 italic text-center py-4">Criteria scores pending...</div>
                )}
              </div>

              <div className="mt-7 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Task Overall</div>
                  <div className="text-[10px] font-medium text-slate-300">Average of criteria</div>
                </div>
                <div className="font-serif text-5xl text-transparent bg-clip-text bg-linear-to-br from-rose-500 to-pink-500">
                  {scoreOverall || '–'}
                </div>
              </div>
            </div>

            {/* Review List */}
            <div className={`fu3 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col max-h-150 ${submission.status === 'GRADING' ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <Lightbulb size={15} className="text-violet-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Review & Learn</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">{corrections?.length || 0} annotations found</p>
                </div>
              </div>

              <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-3">
                {submission.status === 'GRADING' ? (
                  <div className="text-center py-10 text-sm text-slate-400 italic">Analyzing your grammar and vocabulary...</div>
                ) : !corrections || corrections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle size={22} className="text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-emerald-700 font-bold text-sm">Excellent job!</p>
                      <p className="text-emerald-600/80 text-xs font-medium mt-1">No grammatical or lexical errors found.</p>
                    </div>
                  </div>
                ) : (
                  corrections.map((err, idx) => {
                    const theme = getCorrectionTheme(err.type);
                    return (
                      <div key={idx} className={`p-4 rounded-2xl border transition-all duration-200 ${theme.card}`}>
                        <div className="flex justify-between items-start gap-2 mb-2.5">
                          <span className={`${theme.textOriginal} text-sm leading-snug`}>{err.text}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest shrink-0 inline-flex items-center px-2 py-0.5 rounded-md border ${theme.badge}`}>
                            {theme.type}
                          </span>
                        </div>
                        <div className={`font-bold mb-2.5 flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-lg border shadow-sm text-sm ${theme.fixBg}`}>
                          {theme.icon} {err.fix}
                        </div>
                        <p className="text-slate-600 text-xs font-medium italic leading-relaxed">{err.explanation}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER: HIGHLIGHT CORRECTIONS IN ESSAY ---
const CorrectionHighlighter = ({ content, corrections }) => {
  if (!content) return <span className="text-slate-400 italic">No essay content available.</span>;
  if (!corrections || corrections.length === 0) return <span>{content}</span>;

  const sortedCorrections = [...corrections].sort((a, b) => b.text.length - a.text.length);
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${sortedCorrections.map(c => escapeRegExp(c.text)).join('|')})`, 'gi');
  
  const parts = content.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        const match = sortedCorrections.find(c => c.text.toLowerCase() === part.toLowerCase());

        if (match) {
          const theme = getCorrectionTheme(match.type);
          return (
            <span key={i} className="relative group cursor-help mx-0.5 inline-block">
              <span className={`border-b-2 border-dotted px-1 py-0.5 rounded transition-all duration-150 font-medium ${theme.highlighter}`}>
                {part}
              </span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 group-hover:-translate-y-1 font-sans">
                <span className="block bg-slate-800 rounded-xl shadow-2xl p-4 text-center border border-slate-700">
                  <span className="block text-emerald-400 font-bold text-sm border-b border-slate-600 pb-2 mb-2">
                    {theme.tooltipPrefix} <span className="text-white">"{match.fix}"</span>
                  </span>
                  <span className="text-slate-300 text-xs font-medium leading-relaxed block">{match.explanation}</span>
                </span>
                <span className="block w-3 h-3 mx-auto -mt-1.5 rotate-45 bg-slate-800 border-r border-b border-slate-700"></span>
              </span>
            </span>
          );
        }

        if (part === '\n') return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default WritingResultPage;
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReadingResult } from '../../../hooks/IELTS/reading/useReadingResult';
import { ArrowLeft, CheckCircle, XCircle, Target, BarChart2, Clock } from 'lucide-react';

import ReadingResultItem from '../../../components/reading/ReadingResultItem';

const ReadingResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { result, loading } = useReadingResult(id);

  const flatList = useMemo(() => {
    if (!result) return [];
    let list = result.details || result.answers_detail || result.results || [];
    return [...list].sort((a, b) => {
      const numA = a.question_number || a.question?.question_number || 0;
      const numB = b.question_number || b.question?.question_number || 0;
      return numA - numB;
    });
  }, [result]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="relative w-14 h-14 mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-indigo-400 animate-spin"
            style={{ animationDuration: '1.4s', animationDirection: 'reverse' }}></div>
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase animate-pulse">Loading results</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-400 text-sm font-medium">Result not found.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-200 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalQuestions = result.total_questions || flatList.length || 0;
  const correctCount = result.correct_count || 0;
  const wrongCount = totalQuestions - correctCount;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const finalBandScore = result.score !== undefined ? result.score : (result.band_score || 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;900&family=DM+Serif+Display:ital@0;1&display=swap');
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp 0.45s ease both; }
        .fu1 { animation: fadeUp 0.45s 0.08s ease both; }
        .fu2 { animation: fadeUp 0.45s 0.16s ease both; }
        .fu3 { animation: fadeUp 0.45s 0.24s ease both; }
        .header-grad { background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 55%, #3730a3 100%); }
        .stat-card { background: #fff; border: 1px solid #f1f5f9; }
        .table-row-hover:hover { background: #f8fafc; }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* --- HEADER --- */}
        <div className="header-grad fu rounded-3xl p-8 md:p-10 mb-8 overflow-hidden relative shadow-xl shadow-blue-300/30">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-24 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

            {/* Left */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">IELTS Reading</span>
              </div>
              <h1 className="serif text-3xl md:text-4xl text-white font-normal leading-snug mb-3">
                {result.test_title || 'Reading Result'}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-white/60 flex items-center gap-1.5">
                  <Clock size={12} />
                  {result.submitted_at
                    ? new Date(result.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                    : 'N/A'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block"></span>
                  completed
                </span>
              </div>
            </div>

            {/* Right: band score */}
            <div className="flex items-center gap-6 bg-white/10 border border-white/20 rounded-2xl px-7 py-5">
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5">Band Score</div>
                <div className="serif text-6xl font-normal text-white leading-none">
                  {Number(finalBandScore).toFixed(1)}
                </div>
              </div>

              <div className="w-px h-16 bg-white/20"></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Correct</span>
                  <span className="text-white font-black text-lg">{correctCount}</span>
                </div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total</span>
                  <span className="text-white font-black text-lg">{totalQuestions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="fu1 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="stat-card rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{correctCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct</p>
            </div>
          </div>

          <div className="stat-card rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <XCircle size={20} className="text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{wrongCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incorrect</p>
            </div>
          </div>

          <div className="stat-card rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
              <Target size={20} className="text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{accuracy}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
            </div>
          </div>
        </div>

        {/* --- ANSWER TABLE --- */}
        <div className="fu2 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <BarChart2 size={15} className="text-blue-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Answer Details</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">{totalQuestions} questions total</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-300 italic hidden sm:block">
              Click a row to view explanation
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 pl-6 pr-4 w-16 text-[10px] font-bold uppercase tracking-widest text-slate-400">#</th>
                  <th className="py-3 px-4 hidden md:table-cell text-[10px] font-bold uppercase tracking-widest text-slate-400">Question</th>
                  <th className="py-3 px-4 w-40 text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Answer</th>
                  <th className="py-3 px-4 w-40 text-[10px] font-bold uppercase tracking-widest text-slate-400">Correct Answer</th>
                  <th className="py-3 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {flatList.map((item, index) => (
                  <ReadingResultItem
                    key={index}
                    item={item}
                    index={index}
                  />
                ))}
                {flatList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-14 text-center text-slate-400 italic text-sm">
                      No detailed data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReadingResultPage;
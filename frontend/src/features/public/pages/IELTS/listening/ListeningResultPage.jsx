import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Target, BarChart2, Clock, PlayCircle, Headphones } from 'lucide-react';
import { useListeningResult } from '../../../hooks/IELTS/listening/useListeningResult';
import ListeningResultItem from '../../../components/listening/ListeningResultItem';

const ListeningResultPage = () => {
  const navigate = useNavigate();
  const { result: submission, loading, testData } = useListeningResult();

  // 🔥 STATE CHO TABS: Lưu vết Part đang được chọn (Mặc định là Part 1)
  const [activePartNumber, setActivePartNumber] = useState(1);

  const { flatList, stats } = useMemo(() => {
    if (!submission) return { flatList: [], stats: {} };

    const list = submission.details || [];
    const totalQuestions = submission.total_questions || list.length || 0;
    const correctCount = submission.correct_count || 0;
    const wrongCount = totalQuestions - correctCount;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const bandScore = submission.band_score || 0;

    return { flatList: list, stats: { totalQuestions, correctCount, wrongCount, accuracy, bandScore } };
  }, [submission]);

  // 🔥 COMPUTED: Chỉ lấy danh sách câu hỏi của Part đang được chọn
  const currentPartQuestions = useMemo(() => {
    return flatList.filter(item => item.part_number === activePartNumber);
  }, [flatList, activePartNumber]);

  // 🔥 COMPUTED: Lấy thông tin Audio của Part đang được chọn
  const currentPartAudio = useMemo(() => {
    if (!testData || !testData.parts) return null;
    return testData.parts.find(p => p.part_number === activePartNumber);
  }, [testData, activePartNumber]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="relative w-14 h-14 mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-purple-200"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-indigo-400 animate-spin"
            style={{ animationDuration: '1.4s', animationDirection: 'reverse' }}></div>
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase animate-pulse">Loading results</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-400 text-sm font-medium">Result not found.</p>
        <button onClick={() => navigate('/listening')} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-200 transition">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;900&family=DM+Serif+Display:ital@0;1&display=swap');
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp 0.45s ease both; }
        .fu1 { animation: fadeUp 0.45s 0.08s ease both; }
        .fu2 { animation: fadeUp 0.45s 0.16s ease both; }
        .header-grad { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 55%, #4c1d95 100%); }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate('/listening')} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-purple-600 text-sm font-semibold transition-all group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Listening Library
        </button>

        {/* --- HEADER --- */}
        <div className="header-grad fu rounded-3xl p-8 md:p-10 mb-8 overflow-hidden relative shadow-xl shadow-purple-300/30">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-24 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-200">IELTS Listening</span>
              </div>
              <h1 className="serif text-3xl md:text-4xl text-white font-normal leading-snug mb-3">
                {submission.test_title || 'Listening Test Result'}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-white/60 flex items-center gap-1.5">
                  <Clock size={12} />
                  {submission.submitted_at
                    ? new Date(submission.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
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
                  {Number(stats.bandScore).toFixed(1)}
                </div>
              </div>
              <div className="w-px h-16 bg-white/20"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Correct</span>
                  <span className="text-white font-black text-lg">{stats.correctCount}</span>
                </div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total</span>
                  <span className="text-white font-black text-lg">{stats.totalQuestions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="fu1 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stats.correctCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correct</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <XCircle size={20} className="text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stats.wrongCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incorrect</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <Target size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stats.accuracy}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
            </div>
          </div>
        </div>

        {/* --- TABBED REVIEW SECTION --- */}
        <div className="fu2 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          
          {/* TAB NAVIGATION */}
          <div className="flex gap-2 p-4 md:px-6 bg-slate-50/80 border-b border-slate-100 overflow-x-auto custom-scrollbar">
            {testData?.parts?.map((part) => (
              <button
                key={part.id || part.part_number}
                onClick={() => setActivePartNumber(part.part_number)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-2 whitespace-nowrap ${
                  activePartNumber === part.part_number
                    ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Headphones size={14} className={activePartNumber === part.part_number ? 'text-purple-600' : 'text-slate-400'}/>
                Review Part {part.part_number}
              </button>
            ))}
          </div>

          {/* AUDIO PLAYER FOR ACTIVE PART */}
          <div className="p-6 border-b border-slate-100 bg-white">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <PlayCircle size={15} className="text-indigo-500" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Audio Track - Part {activePartNumber}</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Listen and check your answers below</p>
                </div>
             </div>
             
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                {currentPartAudio?.audio_url ? (
                  <audio
                    controls
                    controlsList="nodownload"
                    className="w-full h-10 accent-indigo-600 outline-none"
                    src={currentPartAudio.audio_url.startsWith('http') ? currentPartAudio.audio_url : `http://localhost:8000${currentPartAudio.audio_url}`}
                  />
                ) : (
                  <p className="text-sm text-slate-400 italic flex items-center gap-2">
                    <XCircle size={14}/> No audio available for this part.
                  </p>
                )}
             </div>
          </div>

          {/* ANSWER TABLE FOR ACTIVE PART */}
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="py-3 pl-6 pr-4 w-16 text-[10px] font-bold uppercase tracking-widest text-slate-400">#</th>
                  <th className="py-3 px-4 hidden md:table-cell text-[10px] font-bold uppercase tracking-widest text-slate-400">Question</th>
                  <th className="py-3 px-4 w-48 text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Answer</th>
                  <th className="py-3 px-4 w-48 text-[10px] font-bold uppercase tracking-widest text-slate-400">Correct Answer</th>
                  <th className="py-3 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {currentPartQuestions.map((item, index) => (
                  <ListeningResultItem
                    key={item.id || item.question_number}
                    item={item}
                    index={index}
                  />
                ))}
                {currentPartQuestions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-14 text-center text-slate-400 italic text-sm">
                      No questions found for Part {activePartNumber}
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

export default ListeningResultPage;
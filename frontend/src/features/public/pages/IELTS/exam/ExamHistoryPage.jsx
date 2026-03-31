import React from 'react';
import { useExamHistory } from '../../../hooks/IELTS/exam/useExamHistory';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, ChevronRight, 
  TrendingUp, Award,
  Headphones, BookOpen, PenTool, Mic, ArrowRight
} from 'lucide-react';

const ExamHistoryPage = () => {
  const { history, loading } = useExamHistory();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  const safeHistory = Array.isArray(history) ? history : (history?.data || []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Award className="text-indigo-600" size={32} />
              Exam History
            </h1>
            <p className="text-slate-500 mt-1">
              Track your progress and review your past Full Mock Tests.
            </p>
          </div>

          <Link 
            to="/exam"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
          >
            View Library
          </Link>
        </div>

        {/* LIST */}
        {safeHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {safeHistory.map((item) => (
              <HistoryCard key={item.id} submission={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* --- COMPONENTS --- */

const HistoryCard = ({ submission }) => {

  const rawDate = submission.completed_at || submission.start_time;
  let dateStr = "—";

  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  const isCompleted = submission.status === 'COMPLETED';
  const isGrading = isCompleted && (submission.writing_score === null || submission.speaking_score === null);
  const isInProgress = submission.status === 'IN_PROGRESS';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row gap-6 items-center">
      
      {/* INFO */}
      <div className="flex-1 w-full md:w-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
          <Calendar size={12}/>
          {dateStr}
        </div>

        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
          {submission.full_test?.title || "IELTS Mock Test"}
        </h3>

        <div className="mt-2">
          {isInProgress ? (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-amber-200 uppercase tracking-wide">
              <Clock size={12}/> 
              In Progress ({submission.current_step})
            </span>
          ) : isGrading ? (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-blue-200 uppercase tracking-wide animate-pulse">
              <Clock size={12}/> 
              Grading...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-emerald-200 uppercase tracking-wide">
              <CheckCircleIcon /> 
              Graded
            </span>
          )}
        </div>
      </div>

      {/* SKILL SCORES */}
      <div className="flex gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-center">
        <ScoreBadge icon={Headphones} label="L" score={submission.listening_score} color="blue" />
        <ScoreBadge icon={BookOpen} label="R" score={submission.reading_score} color="purple" />
        <ScoreBadge icon={PenTool} label="W" score={submission.writing_score} color="pink" />
        <ScoreBadge icon={Mic} label="S" score={submission.speaking_score} color="orange" />
      </div>

      {/* OVERALL */}
      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">

        <div className="flex flex-col items-center min-w-15">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Overall
          </span>

          <span className={`text-3xl font-black ${
            (isGrading || isInProgress) ? 'text-slate-300' : 'text-indigo-600'
          }`}>
            {(isGrading || isInProgress || submission.overall_score === null)
              ? "?"
              : Number(submission.overall_score).toFixed(1)}
          </span>
        </div>

        <Link 
          to={isInProgress ? `/exam/taking/${submission.id}` : `/exam/result/${submission.id}`}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isInProgress
              ? 'bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white'
              : 'bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white'
          }`}
        >
          {isInProgress 
            ? <ArrowRight size={20} /> 
            : <ChevronRight size={20} />
          }
        </Link>

      </div>
    </div>
  );
};

const ScoreBadge = ({ icon: Icon, label, score, color }) => {

  const hasScore = score !== null && score !== undefined && score >= 0;

  const colors = {
    blue: hasScore ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" : "bg-slate-50 text-slate-400 border-slate-100",
    purple: hasScore ? "bg-purple-50 text-purple-700 border-purple-200 shadow-sm" : "bg-slate-50 text-slate-400 border-slate-100",
    pink: hasScore ? "bg-pink-50 text-pink-700 border-pink-200 shadow-sm" : "bg-slate-50 text-slate-400 border-slate-100",
    orange: hasScore ? "bg-orange-50 text-orange-700 border-orange-200 shadow-sm" : "bg-slate-50 text-slate-400 border-slate-100",
  };

  return (
    <div className={`flex flex-col items-center p-2 rounded-xl border w-18 transition-all ${colors[color]}`}>
      
      <div className={`flex items-center gap-1 mb-1 ${hasScore ? 'opacity-80' : 'opacity-50'}`}>
        {Icon && <Icon size={12} />}
        <span className="text-[10px] font-bold">{label}</span>
      </div>

      <span className="text-lg font-black">
        {hasScore ? Number(score).toFixed(1) : "-"}
      </span>

    </div>
  );
};

const EmptyState = () => (
  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed shadow-sm">
    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
      <TrendingUp size={32} />
    </div>

    <h3 className="text-xl font-bold text-slate-800 mb-2">
      No exams taken yet
    </h3>

    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
      Challenge yourself with a full mock test to evaluate your current band score.
    </p>

    <Link 
      to="/exam"
      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
    >
      Start Mock Test
    </Link>
  </div>
);

const CheckCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

export default ExamHistoryPage;
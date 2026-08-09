import React from 'react';
import { Skeleton, Pagination } from 'antd';
import {
  Clock, CheckCircle, AlertCircle, ArrowRight,
  History, RotateCcw, ClipboardList, RefreshCw, Play
} from 'lucide-react';
import { useExamAptisList } from '../../../hooks/APTIS/exam/useExamAptisList';

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const ExamAptisListPage = () => {
  const {
    loading,
    filterStatus,
    setFilterStatus,
    filteredTests,
    paginatedTests,
    currentPage,
    setCurrentPage,
    total,
    pageSize,
    handleNavigateLobby,
    handleNavigateResult,
    handleNavigateHistory
  } = useExamAptisList();

  const getStatusConfig = (test) => {
    const status = test.user_status || 'NOT_STARTED';
    const testId = test.id;
    const subId = test.exam_submission_id || testId;

    if (['GRADED', 'COMPLETED', 'FINISHED'].includes(status)) {
      return {
        badge: (
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle size={12} /> Completed
          </span>
        ),
        mainBtnText: 'View Result',
        mainBtnAction: () => handleNavigateResult(subId),
        mainBtnClass: "bg-transparent text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300",
        isDone: true,
        showRetry: true,
        accentBorder: "border-l-green-500"
      };
    } else if (status === 'IN_PROGRESS') {
      return {
        badge: (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
            <RefreshCw size={12} /> In Progress
          </span>
        ),
        mainBtnText: 'Continue',
        mainBtnAction: () => handleNavigateLobby(testId),
        mainBtnClass: "bg-gradient-to-r from-amber-500 to-amber-400 text-white border-none shadow-md shadow-amber-500/30 hover:opacity-90 hover:scale-[1.02]",
        isDone: false,
        showRetry: false,
        accentBorder: "border-l-amber-500"
      };
    } else {
      return {
        badge: (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            <AlertCircle size={12} /> Not Started
          </span>
        ),
        mainBtnText: 'Start Now',
        mainBtnAction: () => handleNavigateLobby(testId),
        mainBtnClass: "bg-gradient-to-r from-teal-500 to-blue-500 text-white border-none shadow-md shadow-teal-500/30 hover:opacity-90 hover:scale-[1.02]",
        isDone: false,
        showRetry: false,
        accentBorder: "border-l-blue-500"
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-blue-50/30 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* ===== HEADER BANNER ===== */}
        <div className="mb-10 bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/80 shadow-xl shadow-teal-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0">
              <ClipboardList size={32} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                APTIS Full Mock Test
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap relative z-10">
            <div className="flex bg-white/50 backdrop-blur-md rounded-xl p-1 border border-white/80 shadow-sm">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    filterStatus === opt.value
                      ? 'bg-blue-500 text-white shadow-md shadow-teal-500/20'
                      : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleNavigateHistory}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm text-sm font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm hover:shadow"
            >
              <History size={16} /> History
            </button>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-sm">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-xl shadow-teal-500/5 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 rounded-[1.5rem] bg-blue-100 flex items-center justify-center mb-5 shadow-inner">
              <ClipboardList size={40} className="text-blue-500" />
            </div>
            <p className="m-0 text-lg font-bold text-slate-700">No tests found.</p>
            <p className="mt-2 text-sm text-slate-500 font-medium">Try a different filter or check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTests.map(test => {
                const config = getStatusConfig(test);

                return (
                  <div
                    key={test.id}
                    className={`group bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/80 flex flex-col transition-all duration-300 shadow-lg shadow-teal-500/5 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1 border-l-4 ${config.accentBorder}`}
                  >
                    <div className="p-6 pb-4">
                      <div className="flex justify-between items-center mb-4">
                        {config.badge}
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Clock size={12} /> {test.time_limit || 160} min
                        </span>
                      </div>
                      <h3 className="m-0 mb-2 text-lg font-extrabold text-slate-800 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {test.title}
                      </h3>
                      <p className="m-0 text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium">
                        {test.description || 'Full mock test covering 5 skills: Grammar & Vocab, Reading, Listening, Writing, and Speaking.'}
                      </p>
                    </div>

                    <div className="p-6 pt-3 mt-auto flex flex-col gap-3 bg-gradient-to-b from-transparent to-white/40">
                      <button
                        onClick={config.mainBtnAction}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${config.mainBtnClass}`}
                      >
                        {config.isDone ? (
                          <><History size={16} /> {config.mainBtnText}</>
                        ) : (
                          <><Play size={16} /> {config.mainBtnText}</>
                        )}
                      </button>

                      {config.showRetry && (
                        <button
                          onClick={() => handleNavigateLobby(test.id)}
                          className="w-full py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-transparent text-slate-500 border-2 border-slate-200 hover:border-blue-400 hover:text-blue-500 transition-all duration-300"
                        >
                          <RotateCcw size={14} /> Retry Test
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {total > pageSize && (
              <div className="flex justify-center mt-10">
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/80"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExamAptisListPage;
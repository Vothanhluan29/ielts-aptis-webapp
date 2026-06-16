import React from 'react';
import { Layout, Typography, Card, Skeleton } from 'antd';
import { ArrowLeft, History, Calendar, Clock, CheckCircle2, FileText, ExternalLink, Award, PlayCircle, Loader2 } from 'lucide-react';

// Custom Hook
import { useExamAptisHistory } from '../../../hooks/APTIS/exam/useExamAptisHistory';

const { Content } = Layout;
const { Title, Text } = Typography;

const getCefrColorStyle = (level) => {
  if (level === 'C') return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (level?.includes('B')) return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' };
  if (level?.includes('A')) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
};

const ExamAptisHistoryPage = () => {
  const { 
    loading, 
    historyData, 
    stats, 
    handleGoBack, 
    handleViewResult, 
    handleResumeTest 
  } = useExamAptisHistory();

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <Content style={{ padding: '40px 24px', maxWidth: 1040, margin: '0 auto', width: '100%' }}>
        
        {/* NÚT BACK */}
        <button
          onClick={handleGoBack}
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-semibold mb-8 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Exam List
        </button>

        {/* BANNER */}
        <div className="mb-10 bg-white p-8 rounded-3xl border border-indigo-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <History size={32} strokeWidth={1.5} />
            </div>
            <div>
              <Title level={2} style={{ margin: '0 0 4px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Full Mock Test History
              </Title>
              <Text className="text-slate-500 text-[15px]">
                Track your progress and review your comprehensive exam submissions.
              </Text>
            </div>
          </div>

          {/* Mini Stats */}
          {stats && (
            <div className="flex flex-wrap md:flex-nowrap bg-slate-50 rounded-2xl border border-slate-100 relative z-10 overflow-hidden">
              <div className="p-4 px-5 text-center flex-1 border-r border-slate-100">
                <Text className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Total</Text>
                <Text className="text-xl font-black text-slate-800">{stats.total || 0}</Text>
              </div>
              <div className="p-4 px-5 text-center flex-1 border-r border-slate-100 bg-emerald-50/30">
                <Text className="block text-[10px] uppercase tracking-wider font-bold text-emerald-600 mb-1">Completed</Text>
                <Text className="text-xl font-black text-emerald-700">{stats.completed || 0}</Text>
              </div>
              <div className="p-4 px-5 text-center flex-1 border-r border-slate-100 bg-amber-50/30">
                <Text className="block text-[10px] uppercase tracking-wider font-bold text-amber-600 mb-1">Pending</Text>
                <Text className="text-xl font-black text-amber-600">{stats.pending || 0}</Text>
              </div>
              <div className="p-4 px-5 text-center flex-1 bg-slate-100/50">
                <Text className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">In Progress</Text>
                <Text className="text-xl font-black text-slate-600">{stats.inProgress || 0}</Text>
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="rounded-3xl border border-slate-100 shadow-sm p-6"><Skeleton active /></Card>
            ))}
          </div>
        ) : historyData.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-24 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FileText size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No mock tests found</h3>
            <p className="text-slate-500 mb-8 max-w-md">You haven't taken any full mock tests yet. Start practicing to evaluate your overall level.</p>
            <button
              onClick={handleGoBack}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
            >
              Start an Exam
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {historyData.map((record) => {
              const status = record.status;
              const isCompleted = ['GRADED', 'COMPLETED', 'FINISHED'].includes(status);
              const isPending = status === 'PENDING';
              const isInProgress = status === 'IN_PROGRESS';
              
              const score = record.overall_score || 0;
              const cefr = record.overall_cefr_level || 'N/A';
              const cefrStyle = getCefrColorStyle(cefr);
              const title = record.full_test?.title || 'Aptis Full Mock Test';
              const date = new Date(record.start_time).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={record.id} className="group bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {isCompleted && <CheckCircle2 size={16} className="text-emerald-500" />}
                        {isPending && <Loader2 size={16} className="text-amber-500 animate-spin" />}
                        {isInProgress && <Clock size={16} className="text-slate-400" />}
                        <h4 className="m-0 font-bold text-slate-800 text-[17px] line-clamp-1 pr-2" title={title}>
                          {title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[13px] font-medium">
                        <Calendar size={13} />
                        {date}
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 border border-emerald-100">
                        COMPLETED
                      </div>
                    )}
                    {isPending && (
                      <div className="bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 border border-amber-100">
                        AWAITING REVIEW
                      </div>
                    )}
                    {isInProgress && (
                      <div className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 border border-slate-200">
                        IN PROGRESS
                      </div>
                    )}
                  </div>

                  {/* Card Body (Scores) */}
                  {!isInProgress && (
                    <div className="bg-slate-50/80 rounded-2xl p-4 mb-6 flex items-center justify-between border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 ${isCompleted ? 'text-indigo-500' : 'text-amber-500'}`}>
                          <Award size={20} />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Overall Score</div>
                          <div className="font-black text-lg text-slate-800 leading-none">
                            {score} <span className="text-sm text-slate-400">/ 250</span>
                          </div>
                          {isPending && <div className="text-[10px] font-bold text-amber-500 mt-1 uppercase">Partial Score</div>}
                        </div>
                      </div>
                      {isCompleted && cefr !== 'N/A' && (
                        <div className={`px-4 py-2 rounded-xl border ${cefrStyle.bg} ${cefrStyle.border} flex flex-col items-end justify-center`}>
                          <span className={`text-[10px] uppercase font-bold opacity-70 ${cefrStyle.text}`}>CEFR</span>
                          <span className={`text-lg font-black leading-none mt-1 ${cefrStyle.text}`}>{cefr}</span>
                        </div>
                      )}
                      {isPending && (
                        <div className="px-4 py-2 rounded-xl border bg-amber-50 border-amber-200 flex flex-col items-end justify-center">
                          <span className="text-[10px] uppercase font-bold text-amber-600 opacity-70">CEFR</span>
                          <span className="text-sm font-black mt-1 text-amber-600">Pending</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Spacer for IN_PROGRESS */}
                  {isInProgress && <div className="flex-1 min-h-[80px]" />}

                  {/* Card Footer (Action) */}
                  {isInProgress ? (
                    <button
                      onClick={() => handleResumeTest(record.full_test_id)}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm shadow-amber-200 hover:-translate-y-0.5"
                    >
                      Resume Test <PlayCircle size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleViewResult(record.id)}
                      className="w-full py-3.5 bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      View Result <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default ExamAptisHistoryPage;
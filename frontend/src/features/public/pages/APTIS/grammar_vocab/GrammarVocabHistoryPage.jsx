import React from 'react';
import { Layout, Typography, Card, Skeleton } from 'antd';
import { ArrowLeft, History, Calendar, CheckCircle2, FileText, ExternalLink, Award } from 'lucide-react';

// Custom Hook
import { useGrammarVocabHistory } from '../../../hooks/APTIS/grammar_vocab/useGrammarVocabHistory';

const { Content } = Layout;
const { Title, Text } = Typography;

const GrammarVocabHistoryPage = () => {
  const { 
    loading, 
    history, 
    stats, 
    handleGoBack, 
    handleViewResult 
  } = useGrammarVocabHistory();

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-emerald-100/30 font-sans">
      <Content className="py-10 px-6 max-w-5xl mx-auto w-full">
        
        {/* BANNER */}
        <div className="mb-10 bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/80 shadow-xl shadow-emerald-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            {/* NÚT BACK */}
            <button
              onClick={handleGoBack}
              className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-semibold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm mr-2"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <div>
              <Title level={2} style={{ margin: '0 0 4px', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.5px' }}>
                Grammar & Vocabulary History
              </Title>
              <Text className="text-slate-500 text-[15px]">
                Review your past scores and detailed answers.
              </Text>
            </div>
          </div>

          {/* Mini Stats */}
          {stats && (
            <div className="flex bg-slate-50 rounded-2xl p-4 border border-slate-100 relative z-10">
              <div className="px-6 text-center">
                <Text className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Total Tests</Text>
                <Text className="text-2xl font-black text-indigo-950">{stats.totalTests}</Text>
              </div>
              <div className="w-px bg-slate-200 my-2" />
              <div className="px-6 text-center">
                <Text className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Best Score</Text>
                <Text className="text-2xl font-black text-indigo-600">
                  {stats.bestScore} <span className="text-sm text-slate-400 font-bold">/ 50</span>
                </Text>
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
        ) : history.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-xl shadow-emerald-500/5 text-center py-24 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FileText size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No history found</h3>
            <p className="text-slate-500 mb-8 max-w-md">You haven't taken any Grammar & Vocabulary tests yet. Start practicing to see your progress here.</p>
            <button
              onClick={handleGoBack}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
            >
              Take a Test Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((record) => {
              const score = record.total_score || record.score || 0;
              const title = record.test?.title || `Test #${record.test_id}`;
              const date = new Date(record.submitted_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={record.id} className="group bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/80 p-6 flex flex-col justify-between shadow-lg shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-indigo-500" />
                        <h4 className="m-0 font-bold text-slate-800 text-[17px] line-clamp-1 pr-2" title={title}>
                          {title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[13px] font-medium">
                        <Calendar size={13} />
                        {date}
                      </div>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0">
                      COMPLETED
                    </div>
                  </div>

                  {/* Card Body (Scores) */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 mb-6 flex items-center justify-between border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-indigo-500">
                        <Award size={20} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Score</div>
                        <div className="font-black text-lg text-slate-800 leading-none">{score} <span className="text-sm text-slate-400">/ 50</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer (Action) */}
                  <button
                    onClick={() => handleViewResult(record.id)}
                    className="w-full py-3.5 bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    View Details <ExternalLink size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default GrammarVocabHistoryPage;
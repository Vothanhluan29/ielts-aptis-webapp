import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Pagination, Input } from 'antd';
import {
  Lightbulb,
  Search,
  BookOpen,
  Eye,
  Calendar,
  User,
  ArrowRight,
  Headphones,
  Book,
  PenTool,
  Mic,
  Award,
  Sparkles
} from 'lucide-react';
import { useTips } from '../../../../../hooks/useTips';

const CATEGORY_CONFIG = [
  { value: 'ALL', label: 'All Tips', icon: Sparkles, color: 'bg-indigo-500 text-white' },
  { value: 'GRAMMAR_VOCAB', label: 'Grammar & Vocab', icon: BookOpen, color: 'bg-emerald-500 text-white' },
  { value: 'LISTENING', label: 'Listening', icon: Headphones, color: 'bg-blue-500 text-white' },
  { value: 'READING', label: 'Reading', icon: Book, color: 'bg-orange-500 text-white' },
  { value: 'WRITING', label: 'Writing', icon: PenTool, color: 'bg-purple-500 text-white' },
  { value: 'SPEAKING', label: 'Speaking', icon: Mic, color: 'bg-rose-500 text-white' },
  { value: 'GENERAL', label: 'General Advice', icon: Award, color: 'bg-amber-500 text-white' },
];

const getCategoryBadge = (cat) => {
  switch (cat?.toUpperCase()) {
    case 'GRAMMAR_VOCAB':
      return { label: 'Grammar & Vocab', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    case 'LISTENING':
      return { label: 'Listening', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'READING':
      return { label: 'Reading', bg: 'bg-orange-100 text-orange-700 border-orange-200' };
    case 'WRITING':
      return { label: 'Writing', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
    case 'SPEAKING':
      return { label: 'Speaking', bg: 'bg-rose-100 text-rose-700 border-rose-200' };
    default:
      return { label: 'General', bg: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
};

const TipsStudentListPage = () => {
  const navigate = useNavigate();
  const {
    loading,
    tips,
    total,
    currentPage,
    pageSize,
    category,
    searchQuery,
    setCategory,
    setSearchQuery,
    setCurrentPage
  } = useTips(9);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* ===== HEADER BANNER ===== */}
        <div className="mb-8 bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/80 shadow-xl shadow-indigo-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Lightbulb size={32} className="text-white" />
            </div>
            <div>
              <h1 className="m-0 text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                APTIS Exam Tips & Skill Strategies
              </h1>
              <p className="m-0 mt-1 text-slate-500 font-medium text-sm md:text-base">
                Learn proven techniques, scoring strategies, and secrets directly from our top teachers.
              </p>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="w-full md:w-72 relative z-10">
            <Input
              prefix={<Search size={18} className="text-slate-400 mr-2" />}
              placeholder="Search tips, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="h-11 rounded-xl bg-white/80 border-slate-200 shadow-sm text-sm font-semibold hover:border-indigo-400 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* ===== CATEGORY FILTER PILLS ===== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
          {CATEGORY_CONFIG.map((item) => {
            const Icon = item.icon;
            const isSelected = category === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setCategory(item.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? `${item.color} border-transparent shadow-md shadow-indigo-500/20 scale-105`
                    : 'bg-white/80 backdrop-blur-sm text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===== CONTENT GRID ===== */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-sm">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ))}
          </div>
        ) : tips.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-xl shadow-indigo-500/5 flex flex-col items-center justify-center p-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-4 shadow-inner">
              <Lightbulb size={40} className="text-indigo-500" />
            </div>
            <h3 className="m-0 text-xl font-extrabold text-slate-800">No tips found</h3>
            <p className="mt-2 text-sm text-slate-500 font-medium max-w-sm">
              We couldn't find any tips matching your filter criteria. Try selecting another skill or keyword.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tips.map((item) => {
                const badge = getCategoryBadge(item.category);
                const createdDate = new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/aptis/tips/${item.id}`)}
                    className="group bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/80 flex flex-col justify-between transition-all duration-300 shadow-lg shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 cursor-pointer"
                  >
                    {/* Thumbnail / Header Gradient */}
                    {item.thumbnail_url ? (
                      <div className="h-44 w-full overflow-hidden relative">
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 p-6 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                        <span className={`self-start px-3 py-1 rounded-full text-xs font-black border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <Lightbulb className="self-end text-white/30 w-12 h-12" />
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="m-0 mb-2.5 text-lg font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="m-0 text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                          {item.summary || item.content.slice(0, 140) + '...'}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {item.author?.full_name ? item.author.full_name.charAt(0) : 'T'}
                          </div>
                          <span className="text-slate-600 font-bold truncate max-w-[100px]">
                            {item.author?.full_name || 'Teacher'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye size={13} /> {item.views_count || 0}
                          </span>
                          <span className="flex items-center gap-1 text-indigo-600 group-hover:translate-x-1 transition-transform">
                            Read <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {total > pageSize && (
              <div className="flex justify-center mt-10">
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={(page, size) => setCurrentPage(page, size)}
                  showSizeChanger={false}
                  className="bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-white/80 font-bold"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TipsStudentListPage;

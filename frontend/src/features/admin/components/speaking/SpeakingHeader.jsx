import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Mic, Search, X } from 'lucide-react';

const SpeakingHeader = ({ count, searchTerm, setSearchTerm }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
      
      {/* TITLE & ICON */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200">
          <Mic className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            Speaking Admin
          </h1>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
            {count} ĐỀ THI HIỆN CÓ
          </p>
        </div>
      </div>

      {/* INTEGRATED SEARCH BAR */}
      <div className="relative flex-1 max-w-xl group">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" 
          size={18} 
        />
        <input 
          type="text"
          placeholder="Tìm tên đề Speaking hoặc mã ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-10 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-purple-100 focus:ring-4 focus:ring-purple-500/5 outline-none text-sm font-medium transition-all"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X size={14} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* CREATE BUTTON */}
      <Link 
        to="/admin/skills/speaking/create" 
        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-purple-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-sm transition-all active:scale-95 shrink-0"
      >
        <Plus size={18} strokeWidth={3} />
        Tạo đề mới
      </Link>
    </div>
  );
};

export default SpeakingHeader;
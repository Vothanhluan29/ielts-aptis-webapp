import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const UserPagination = ({ currentPage, onPageChange, hasMore }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
      <p className="text-sm text-slate-500 font-medium">
        Page <span className="text-blue-600 font-bold">{currentPage}</span>
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore} // Nếu data trả về ít hơn pageSize thì là hết
          className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default UserPagination;
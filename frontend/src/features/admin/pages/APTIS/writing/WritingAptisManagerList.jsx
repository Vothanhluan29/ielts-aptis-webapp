import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Edit3,
  PenTool,
  Sparkles,
  Clock,
  LayoutGrid
} from 'lucide-react';
import dayjs from 'dayjs';

import { useWritingAptisManager } from '../../../hooks/APTIS/writing/useWritingAptisManager';
import ConfirmModal from '../../../../../components/common/ConfirmModal';

const WritingAptisManagerList = () => {
  const navigate = useNavigate();
  
  const {
    tests,
    loading,
    pagination,
    isMockFilter,
    setIsMockFilter,
    handleTableChange,
    handleDelete
  } = useWritingAptisManager();

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, testId: null });

  const handlePageChange = (newPage) => {
    handleTableChange({ current: newPage, pageSize: pagination.pageSize });
  };

  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/teacher');
  const base = isTeacher ? '/teacher' : '/admin/aptis';
  const ROUTES = {
    CREATE: `${base}/writing/create`,
    EDIT: (id) => `${base}/writing/edit/${id}`,
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
      
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#445A95]/10 text-[#445A95] rounded-xl ring-1 ring-[#445A95]/20">
              <PenTool size={24} />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight m-0">Writing Tests</h1>
          </div>
          <p className="text-zinc-500 font-medium text-[15px] ml-[52px]">
            Manage Aptis Writing test content
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Toggle Mock Only */}
          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-zinc-200 shadow-sm">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isMockFilter}
                onChange={(e) => setIsMockFilter(e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${isMockFilter ? 'bg-[#445A95]' : 'bg-zinc-200'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isMockFilter ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-bold text-zinc-600 select-none">Mock Only</span>
          </label>
          
          <button
            onClick={() => navigate(ROUTES.CREATE)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#445A95] text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-[#445A95]/20 focus:outline-none"
          >
            <Plus size={18} />
            New Test
          </button>
        </div>
      </div>

      {/* ── LIST VIEW ── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header (Desktop only) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-4">Test Title</div>
          <div className="col-span-2">Time Limit</div>
          <div className="col-span-1">Difficulty</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Loading State */}
        {loading && tests.length === 0 && (
          <div className="divide-y divide-zinc-100">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="px-6 py-5 animate-pulse grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <div className="h-5 bg-zinc-200 rounded-md w-3/4"></div>
                  <div className="h-3 bg-zinc-100 rounded-md w-1/2"></div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <div className="h-6 bg-zinc-100 rounded-md w-16"></div>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <div className="h-6 bg-zinc-100 rounded-full w-24"></div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <div className="h-6 bg-zinc-100 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && tests.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">No tests found</h3>
            <p className="text-zinc-500 max-w-sm mb-6">There are no tests matching your criteria.</p>
            <button
              onClick={() => navigate(ROUTES.CREATE)}
              className="text-[#445A95] font-bold hover:text-blue-700 flex items-center gap-1.5"
            >
              <Plus size={16} /> Create test
            </button>
          </div>
        )}

        {/* List Items */}
        <div className="divide-y divide-zinc-100">
          {!loading && tests.map((test) => (
            <div 
              key={test.id} 
              onDoubleClick={() => navigate(ROUTES.EDIT(test.id))}
              className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center hover:bg-blue-50/30 transition-colors group relative"
            >
              {/* Col 1: Title & Date */}
              <div className="col-span-12 md:col-span-4 pr-4">
                <h3 className="text-[15px] font-bold text-zinc-900 truncate mb-1">
                  {test.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <span>ID: {test.id}</span>
                  <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                  <span>Created {test.created_at ? dayjs(test.created_at).format('MMM D, YYYY') : '—'}</span>
                </div>
              </div>

              {/* Col 2: Duration */}
              <div className="col-span-6 md:col-span-2 flex items-center gap-1.5 text-zinc-600 font-bold text-[13px]">
                <Clock size={14} className="text-zinc-400" />
                {test.time_limit} min
              </div>

              {/* Col 3: Difficulty */}
              <div className="col-span-6 md:col-span-1 flex items-center">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${test.difficulty_level ? 'bg-amber-100 text-amber-700' : 'text-zinc-400'}`}>
                  {test.difficulty_level || '-'}
                </span>
              </div>

              {/* Col 4: Type */}
              <div className="col-span-6 md:col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  test.is_full_test_only 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-[#445A95]/10 text-[#3A4D81]'
                }`}>
                  {test.is_full_test_only ? <LayoutGrid size={12} /> : <Edit3 size={12} />}
                  {test.is_full_test_only ? 'FULL TEST' : 'PRACTICE'}
                </span>
              </div>

              {/* Col 4: Status */}
              <div className="col-span-6 md:col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  test.is_published 
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' 
                    : 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-500/20'
                }`}>
                  {test.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                  {test.is_published ? 'PUBLISHED' : 'DRAFT'}
                </span>
              </div>

              {/* Col 5: Actions */}
              <div className="col-span-6 md:col-span-1 flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => navigate(ROUTES.EDIT(test.id))}
                  className="p-2 text-zinc-400 hover:text-[#445A95] hover:bg-[#F8FAFC] rounded-lg transition-colors focus:outline-none"
                  title="Edit Test"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: true, testId: test.id })}
                  className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
                  title="Delete Test"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info & Pagination */}
        {tests.length > 0 && (
          <div className="bg-zinc-50/50 px-6 py-4 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs font-bold text-zinc-500">
              Showing {(pagination.current - 1) * pagination.pageSize + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} tests
            </div>
            
            {/* Simple Pagination Controls */}
            {pagination.total > pagination.pageSize && (
              <div className="flex items-center gap-1 bg-white rounded-lg border border-zinc-200 p-1 shadow-sm">
                <button 
                  disabled={pagination.current <= 1}
                  onClick={() => handlePageChange(pagination.current - 1)}
                  className="px-3 py-1 rounded-md text-xs font-bold text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  Prev
                </button>
                <div className="px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-[#445A95]">
                  {pagination.current}
                </div>
                <button 
                  disabled={pagination.current * pagination.pageSize >= pagination.total}
                  onClick={() => handlePageChange(pagination.current + 1)}
                  className="px-3 py-1 rounded-md text-xs font-bold text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, testId: null })}
        onConfirm={async () => {
          if (deleteModal.testId) {
            await handleDelete(deleteModal.testId);
          }
          setDeleteModal({ isOpen: false, testId: null });
        }}
        title="Delete Writing Test"
        message="Are you sure you want to delete this Writing test? All parts, questions and data will be removed."
      />
    </div>
  );
};

export default WritingAptisManagerList;


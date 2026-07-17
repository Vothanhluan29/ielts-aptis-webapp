import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCcw,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  GraduationCap,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import dayjs from 'dayjs';
import { useExamAptisManager } from '../../../hooks/APTIS/exam/useExamAptisManager';
import ConfirmModal from '../../../../../components/common/ConfirmModal';

const ExamAptisManagerPage = () => {
  const navigate = useNavigate();
  const { tests, loading, fetchTests, handleDelete } = useExamAptisManager();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, testId: null });

  // Pagination State
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: tests.length
    }));
  }, [tests]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  const paginatedTests = tests.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const renderComponentBadge = (testObj, label, icon, colors) => {
    const Icon = icon;
    if (!testObj) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100/50 border border-zinc-200/50 border-dashed text-zinc-400">
          <Icon size={12} className="opacity-50" />
          <span className="text-[11px] font-medium opacity-60 line-through decoration-zinc-300">No {label}</span>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-[11px] ${colors}`}>
        <Icon size={12} />
        {label}
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
      
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-xl ring-1 ring-orange-500/20">
              <LayoutGrid size={24} />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight m-0">Aptis Full Tests</h1>
          </div>
          <p className="text-zinc-500 font-medium text-[15px] ml-[52px]">
            Manage complete 5-skill Aptis mock exams
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchTests}
            disabled={loading}
            className="flex items-center justify-center p-2.5 text-zinc-500 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:text-zinc-700 transition-all shadow-sm focus:outline-none disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button
            onClick={() => navigate(window.location.pathname.startsWith("/teacher") ? "/teacher/full-tests/create" : "/admin/aptis/full-tests/create")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-orange-600/20 focus:outline-none"
          >
            <Plus size={18} />
            Create New Test
          </button>
        </div>
      </div>

      {/* ── LIST VIEW ── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Header (Desktop only) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-4">Test Name</div>
          <div className="col-span-5">Structure</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Loading State */}
        {loading && tests.length === 0 && (
          <div className="divide-y divide-zinc-100">
            {[1, 2, 3].map(i => (
              <div key={i} className="px-6 py-5 animate-pulse grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <div className="h-5 bg-zinc-200 rounded-md w-3/4"></div>
                  <div className="h-3 bg-zinc-100 rounded-md w-1/2"></div>
                </div>
                <div className="col-span-12 md:col-span-5 flex gap-2">
                  <div className="h-6 bg-zinc-100 rounded-md w-16"></div>
                  <div className="h-6 bg-zinc-100 rounded-md w-16"></div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <div className="h-6 bg-zinc-100 rounded-full w-24"></div>
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
            <h3 className="text-lg font-bold text-zinc-900 mb-1">No full tests found</h3>
            <p className="text-zinc-500 max-w-sm mb-6">You haven't created any Aptis full tests yet. Click the button above to create one.</p>
            <button
              onClick={() => navigate(window.location.pathname.startsWith("/teacher") ? "/teacher/full-tests/create" : "/admin/aptis/full-tests/create")}
              className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1.5"
            >
              <Plus size={16} /> Create your first test
            </button>
          </div>
        )}

        {/* List Items */}
        <div className="divide-y divide-zinc-100">
          {!loading && paginatedTests.map((test) => (
            <div 
              key={test.id} 
              onDoubleClick={() => navigate((window.location.pathname.startsWith("/teacher") ? `/teacher/full-tests/edit/${test.id}` : `/admin/aptis/full-tests/edit/${test.id}`))}
              className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center hover:bg-orange-50/30 transition-colors group relative"
            >
              {/* Col 1: Title & Date */}
              <div className="col-span-12 md:col-span-4 pr-4">
                <h3 className="text-[15px] font-bold text-zinc-900 truncate mb-1">
                  {test.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <span>ID: {test.id}</span>
                  <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                  <span>Created {dayjs(test.created_at).format('MMM D, YYYY')}</span>
                </div>
              </div>

              {/* Col 2: Skills Structure */}
              <div className="col-span-12 md:col-span-5 flex flex-wrap gap-2">
                {renderComponentBadge(test.grammar_vocab_test, 'Grammar', GraduationCap, 'bg-pink-100 text-pink-700')}
                {renderComponentBadge(test.reading_test, 'Read', BookOpen, 'bg-blue-100 text-blue-700')}
                {renderComponentBadge(test.listening_test, 'Listen', Headphones, 'bg-teal-100 text-teal-700')}
                {renderComponentBadge(test.writing_test, 'Write', Edit3, 'bg-amber-100 text-amber-700')}
                {renderComponentBadge(test.speaking_test, 'Speak', Mic, 'bg-purple-100 text-purple-700')}
              </div>

              {/* Col 3: Status */}
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

              {/* Col 4: Actions */}
              <div className="col-span-6 md:col-span-1 flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => navigate((window.location.pathname.startsWith("/teacher") ? `/teacher/full-tests/edit/${test.id}` : `/admin/aptis/full-tests/edit/${test.id}`))}
                  className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none"
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
                <div className="px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-600">
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
        title="Delete Full Test"
        message="Are you sure you want to delete this full test? All associated data will be removed. This action cannot be undone."
      />
    </div>
  );
};

export default ExamAptisManagerPage;


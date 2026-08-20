import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Database,
  Plus, 
  Settings, 
  Trash2, 
  Edit2, 
  BookOpen,
  Search
} from 'lucide-react';
import { message, Select, Pagination } from 'antd';
import aptisGrammarVocabBankApi from '../../../../api/APTIS/grammar_vocab/aptisGrammarVocabBankApi';
import ConfirmModal from '../../../../../../components/common/ConfirmModal';

const QuestionBankManagePage = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/grammar_vocab/bank' : '/admin/aptis/grammar_vocab/bank';

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // this will trigger another effect run, but we can just let the next effect run fetch
      } else {
        fetchBankGroups();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, partFilter, difficultyFilter]);

  useEffect(() => {
    fetchBankGroups();
  }, [currentPage]);


  const fetchBankGroups = async () => {
    setLoading(true);
    try {
      const params = {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: searchTerm || undefined,
        part_type: partFilter || undefined,
        difficulty_level: difficultyFilter || undefined
      };
      const response = await aptisGrammarVocabBankApi.getBankGroups(params);
      setData(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      message.error('Failed to fetch bank groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await aptisGrammarVocabBankApi.deleteBankGroup(id);
      message.success('Deleted successfully');
      fetchBankGroups();
    } catch (error) {
      message.error('Failed to delete bank group');
    }
  };

  const getDifficultyColor = (level) => {
    if (level === 'Easy' || level === 'A1' || level === 'A2') return 'bg-emerald-100 text-emerald-700 ring-emerald-500/20';
    if (level === 'Medium' || level === 'B1' || level === 'B2') return 'bg-amber-100 text-amber-700 ring-amber-500/20';
    if (level === 'Hard' || level === 'C' || level === 'C1' || level === 'C2') return 'bg-rose-100 text-rose-700 ring-rose-500/20';
    return 'bg-zinc-100 text-zinc-700 ring-zinc-500/20';
  };

  const getPartLabel = (partType) => {
    if (partType === 'GRAMMAR') return 'Grammar';
    if (partType === 'VOCAB_WORD_DEFINITION') return 'Vocab: Word Definition';
    if (partType === 'VOCAB_WORD_PAIRS') return 'Vocab: Word Pairs';
    if (partType === 'VOCAB_WORD_USAGE') return 'Vocab: Word Usage';
    if (partType === 'VOCAB_WORD_MATCH') return 'Vocab: Word Match';
    if (partType === 'VOCAB_COLLOCATIONS') return 'Vocab: Collocations';
    return partType;
  };

  // Server-side pagination handled
  const paginatedData = data;
  const filteredData = { length: total };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#445A95]/10 text-[#445A95] rounded-xl ring-1 ring-[#445A95]/20">
              <Database size={24} />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight m-0">Aptis Grammar & Vocab Question Bank</h1>
          </div>
          <p className="text-zinc-500 font-medium text-[15px] ml-[52px]">
            Manage individual grammar and vocab groups and questions
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => navigate(`${basePath}/generate`)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 ring-1 ring-emerald-500/20 transition-all focus:outline-none"
          >
            <Settings size={18} />
            Random Test
          </button>
          
          <button
            onClick={() => navigate(`${basePath}/create`)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#445A95] text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-[#445A95]/20 focus:outline-none"
          >
            <Plus size={18} />
            New Part
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER ── */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search by instruction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#445A95]/20 focus:border-[#445A95] transition-all shadow-sm"
            style={{ height: '42px' }}
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            allowClear
            placeholder="Filter by Type"
            value={partFilter || undefined}
            onChange={(val) => setPartFilter(val)}
            className="w-full"
            size="large"
          >
            <Select.Option value="GRAMMAR">Grammar</Select.Option>
            <Select.Option value="VOCAB_WORD_DEFINITION">Vocab: Word Definition</Select.Option>
            <Select.Option value="VOCAB_WORD_PAIRS">Vocab: Word Pairs</Select.Option>
            <Select.Option value="VOCAB_WORD_USAGE">Vocab: Word Usage</Select.Option>
            <Select.Option value="VOCAB_WORD_MATCH">Vocab: Word Match</Select.Option>
            <Select.Option value="VOCAB_COLLOCATIONS">Vocab: Collocations</Select.Option>
          </Select>
        </div>
        <div className="w-full md:w-40">
          <Select
            allowClear
            placeholder="Difficulty"
            value={difficultyFilter || undefined}
            onChange={(val) => setDifficultyFilter(val)}
            className="w-full"
            size="large"
          >
            <Select.Option value="A1">A1</Select.Option>
            <Select.Option value="A2">A2</Select.Option>
            <Select.Option value="B1">B1</Select.Option>
            <Select.Option value="B2">B2</Select.Option>
            <Select.Option value="C">C</Select.Option>
          </Select>
        </div>
      </div>

      {/* ── LIST VIEW ── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header (Desktop only) */}
        <div className="hidden md:grid grid-cols-11 gap-4 px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <div className="col-span-3">Part Type</div>
          <div className="col-span-5">Instruction</div>
          <div className="col-span-1 text-center">Questions</div>
          <div className="col-span-1 text-center">Difficulty</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="divide-y divide-zinc-100">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-6 py-5 animate-pulse grid grid-cols-11 gap-4 items-center">
                <div className="col-span-3">
                  <div className="h-6 bg-zinc-200 rounded-full w-24"></div>
                </div>
                <div className="col-span-5">
                  <div className="h-4 bg-zinc-200 rounded-md w-3/4 mb-2"></div>
                  <div className="h-3 bg-zinc-100 rounded-md w-1/2"></div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <div className="h-6 bg-zinc-100 rounded-full w-8"></div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <div className="h-6 bg-zinc-100 rounded-full w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-zinc-50 text-zinc-400 rounded-full flex items-center justify-center mb-4 ring-1 ring-zinc-200">
              <Database size={28} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">No groups found</h3>
            <p className="text-zinc-500 max-w-sm mb-6">Start building your question bank by creating a new group.</p>
            <button
              onClick={() => navigate(`${basePath}/create`)}
              className="text-[#445A95] font-bold hover:text-blue-700 flex items-center gap-1.5"
            >
              <Plus size={16} /> Create group
            </button>
          </div>
        )}

        {/* List Items */}
        <div className="divide-y divide-zinc-100">
          {!loading && paginatedData.map((item) => (
            <div 
              key={item.id} 
              onDoubleClick={() => navigate(`${basePath}/edit/${item.id}`)}
              className="px-6 py-4 flex flex-col md:grid md:grid-cols-11 gap-4 md:items-center hover:bg-blue-50/30 transition-colors group relative"
            >
              {/* Part */}
              <div className="col-span-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  item.part_type === 'GRAMMAR' 
                    ? 'bg-[#EFF6FF] text-[#445A95] ring-1 ring-[#445A95]/20'
                    : 'bg-[#F8FAFC] text-[#6B7280] ring-1 ring-zinc-200'
                }`}>
                  <BookOpen size={12} />
                  {getPartLabel(item.part_type)}
                </span>
              </div>

              {/* Instruction */}
              <div className="col-span-5 pr-4">
                <h3 className="text-[14px] font-semibold text-zinc-800 line-clamp-2">
                  {item.instruction || <span className="text-zinc-400 italic">No instruction provided</span>}
                </h3>
              </div>

              {/* Questions Count */}
              <div className="col-span-1 flex md:justify-center items-center">
                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg">
                  {item.questions?.length || 0}
                </span>
              </div>

              {/* Difficulty */}
              <div className="col-span-1 flex md:justify-center items-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ring-1 ${getDifficultyColor(item.difficulty_level)}`}>
                  {item.difficulty_level || 'N/A'}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex md:justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => navigate(`${basePath}/edit/${item.id}`)}
                  className="p-2 text-zinc-400 hover:text-[#445A95] hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                  title="Edit Group"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: true, id: item.id })}
                  className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
                  title="Delete Group"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-center bg-zinc-50/50">
            <Pagination 
              current={currentPage} 
              total={total} 
              pageSize={pageSize} 
              onChange={(page) => setCurrentPage(page)} 
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={async () => {
          if (deleteModal.id) {
            await handleDelete(deleteModal.id);
          }
          setDeleteModal({ isOpen: false, id: null });
        }}
        title="Delete Question Bank Group"
        message="Are you sure you want to delete this group? All questions and associated media will be permanently removed."
      />
    </div>
  );
};

export default QuestionBankManagePage;

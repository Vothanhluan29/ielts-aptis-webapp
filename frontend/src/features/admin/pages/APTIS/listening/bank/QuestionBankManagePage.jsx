import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Database,
  Plus, 
  Settings, 
  Trash2, 
  Edit2, 
  Headphones,
  Search,
  BookOpen
} from 'lucide-react';
import { message, Select, Pagination } from 'antd';
import aptisListeningBankApi from '../../../../api/APTIS/listening/aptisListeningBankApi';
import ConfirmModal from '../../../../../../components/common/ConfirmModal';

const QuestionBankManagePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/teacher');
  const basePath = isTeacher ? '/teacher/listening/bank' : '/admin/aptis/listening/bank';

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, partFilter, difficultyFilter]);

  useEffect(() => {
    fetchBankGroups();
  }, []);

  const fetchBankGroups = async () => {
    setLoading(true);
    try {
      const response = await aptisListeningBankApi.getBankGroups();
      setData(response);
    } catch (error) {
      message.error('Failed to fetch bank groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await aptisListeningBankApi.deleteBankGroup(id);
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

  const filteredData = data.filter(item => {
    const matchesSearch = item.instruction?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPart = partFilter ? item.part_number === partFilter : true;
    const matchesDifficulty = difficultyFilter ? item.difficulty_level === difficultyFilter : true;
    return matchesSearch && matchesPart && matchesDifficulty;
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#445A95]/10 text-[#445A95] rounded-xl ring-1 ring-[#445A95]/20">
              <Database size={24} />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight m-0">Aptis Listening Question Bank</h1>
          </div>
          <p className="text-zinc-500 font-medium text-[15px] ml-[52px]">
            Manage individual listening parts and questions
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
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#445A95] text-white font-bold rounded-xl hover:bg-[#3A4D81] hover:-translate-y-0.5 transition-all shadow-sm shadow-[#445A95]/20 focus:outline-none"
          >
            <Plus size={18} />
            New Group
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
        <div className="w-full md:w-40">
          <Select
            allowClear
            placeholder="Filter by Part"
            value={partFilter || undefined}
            onChange={(val) => setPartFilter(val)}
            className="w-full"
            size="large"
          >
            <Select.Option value={1}>Part 1</Select.Option>
            <Select.Option value={2}>Part 2</Select.Option>
            <Select.Option value={3}>Part 3</Select.Option>
            <Select.Option value={4}>Part 4</Select.Option>
            <Select.Option value={5}>Part 5</Select.Option>
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
          <div className="col-span-2">Part</div>
          <div className="col-span-6">Instruction</div>
          <div className="col-span-1 text-center">Questions</div>
          <div className="col-span-1 text-center">Difficulty</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="divide-y divide-zinc-100">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-6 py-5 animate-pulse grid grid-cols-11 gap-4 items-center">
                <div className="col-span-2">
                  <div className="h-6 bg-zinc-200 rounded-full w-16"></div>
                </div>
                <div className="col-span-6">
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
        {!loading && filteredData.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-zinc-50 text-zinc-400 rounded-full flex items-center justify-center mb-4 ring-1 ring-zinc-200">
              <Database size={28} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">No groups found</h3>
            <p className="text-zinc-500 max-w-sm mb-6">Start building your question bank by creating a new group.</p>
            <button
              onClick={() => navigate(`${basePath}/create`)}
              className="text-[#445A95] font-bold hover:text-[#3A4D81] flex items-center gap-1.5"
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
              className="px-6 py-4 flex flex-col md:grid md:grid-cols-11 gap-4 md:items-center hover:bg-[#F8FAFC]/30 transition-colors group relative"
            >
              {/* Part */}
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F8FAFC] text-[#3A4D81] ring-1 ring-[#445A95]/20">
                  <Headphones size={12} />
                  Part {item.part_number}
                </span>
              </div>

              {/* Instruction */}
              <div className="col-span-6 pr-4">
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
                  className="p-2 text-zinc-400 hover:text-[#445A95] hover:bg-[#F8FAFC] rounded-lg transition-colors focus:outline-none"
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
        {!loading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex justify-center bg-zinc-50/50">
            <Pagination 
              current={currentPage} 
              total={filteredData.length} 
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

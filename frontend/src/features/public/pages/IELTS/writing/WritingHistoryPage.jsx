import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWritingHistory } from '../../../hooks/IELTS/writing/useWritingHistory';
import {
  ArrowLeft,
  Calendar,
  PenTool,
  ChevronRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  Clock,
  Award,
  BarChart2,
  Search,
  Filter,
  FileText,
} from 'lucide-react';

/* ─── Status Badge ──────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    GRADED: {
      label: 'Graded',
      icon: <CheckCircle size={11} />,
      cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    PENDING: {
      label: 'Waiting…',
      icon: <Clock size={11} />,
      cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    GRADING: {
      label: 'Grading…',
      icon: <Loader2 size={11} className="animate-spin" />,
      cls: 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse',
    },
    ERROR: {
      label: 'Error',
      icon: <AlertCircle size={11} />,
      cls: 'bg-red-50 text-red-700 border border-red-200',
    },
  };
  const cfg = map[status] ?? {
    label: status,
    icon: null,
    cls: 'bg-gray-100 text-gray-500 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

/* ─── Score Ring ────────────────────────────────────────────── */
const ScoreRing = ({ score }) => {
  if (!score) return <span className="text-gray-200 font-bold text-lg">—</span>;
  const pct = (score / 9) * 100;
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = score >= 7 ? '#059669' : score >= 5.5 ? '#d97706' : '#dc2626';

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 44 44" className="-rotate-90 w-full h-full">
          <circle cx="22" cy="22" r={r} fill="none" stroke="#f0f0f0" strokeWidth="4" />
          <circle
            cx="22" cy="22" r={r}
            fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-black text-sm" style={{ color }}>
          {score}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Band</span>
    </div>
  );
};

/* ─── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <div className="text-2xl font-black text-gray-800 leading-none">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

/* ─── Empty State ───────────────────────────────────────────── */
const EmptyState = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center py-28 gap-5">
    <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center">
      <PenTool size={38} className="text-pink-400" />
    </div>
    <div className="text-center">
      <p className="text-gray-700 font-bold text-base">No writing tests yet</p>
      <p className="text-gray-400 text-sm mt-1">Submit your first essay to see your AI-graded results.</p>
    </div>
    <button onClick={onStart} className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold rounded-xl shadow transition">
      Start Practice →
    </button>
  </div>
);

/* ─── Main Component ────────────────────────────────────────── */
const WritingHistoryPage = () => {
  const navigate = useNavigate();
  
  // ✅ Nhúng Logic từ Hook (Đã loại bỏ avgScore)
  const {
    history, loading, search, setSearch, filter, setFilter,
    filtered, best, gradedCount
  } = useWritingHistory();

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        background: 'linear-gradient(135deg, #fff0f6 0%, #fdf2f8 40%, #f0fdf4 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center shadow-md shadow-pink-200">
              <PenTool size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight">Writing History</h1>
              <p className="text-xs text-gray-400 mt-0.5">Your AI-graded essays</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/writing')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition shadow-sm"
          >
            <ArrowLeft size={15} /> Test library
          </button>
        </div>

        {/* ── Stats Row ── */}
        {!loading && history.length > 0 && (
          // Đổi thành grid-cols-2 vì đã bỏ thẻ trung bình
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={<BarChart2 size={20} className="text-pink-600" />}
              label="Essays submitted"
              value={history.length}
              sub={`${gradedCount} graded`}
              color="bg-pink-50"
            />
            <StatCard
              icon={<Award size={20} className="text-amber-500" />}
              label="Best score"
              value={best ?? '—'}
              sub="Personal best"
              color="bg-amber-50"
            />
          </div>
        )}

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          {!loading && history.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100 bg-gray-50/60">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <Filter size={13} className="text-gray-400 shrink-0" />
                {['ALL', 'GRADED', 'GRADING', 'ERROR'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      filter === f
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="text-pink-400 animate-spin" />
              <p className="text-gray-400 text-sm font-medium">Loading history…</p>
            </div>
          ) : history.length === 0 ? (
            <EmptyState onStart={() => navigate('/writing')} />
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">No matches found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold border-b border-gray-100 bg-gray-50/40">
                    <th className="px-6 py-3">Test Name</th>
                    <th className="px-4 py-3 w-40">Submitted</th>
                    <th className="px-4 py-3 w-32 text-center">Status</th>
                    <th className="px-4 py-3 w-28 text-center">Result</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/writing/result/${item.id}`)}
                      className="group border-b border-gray-50 last:border-none hover:bg-pink-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-sm group-hover:text-pink-700 transition-colors leading-tight">
                          {item.test?.title || item.test_title || `Writing Test #${item.test_id}`}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-gray-400">#{item.id}</span>
                          <span className="inline-block bg-pink-50 text-pink-500 border border-pink-100 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase">
                            IELTS Writing
                          </span>
                          {(item.task1_word_count > 0 || item.task2_word_count > 0) && (
                             <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                               <FileText size={10} /> {item.task1_word_count + item.task2_word_count} words
                             </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(item.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                          <Clock size={11} />
                          {new Date(item.submitted_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ScoreRing score={item.status === 'GRADED' ? item.band_score : null} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ChevronRight size={14} className="text-gray-400 group-hover:text-pink-600 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingHistoryPage;
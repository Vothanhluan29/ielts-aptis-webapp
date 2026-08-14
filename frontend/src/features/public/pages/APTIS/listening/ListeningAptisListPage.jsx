import React from 'react';
import { Skeleton, Pagination } from 'antd';
import { Headphones, Clock, CheckCircle, AlertCircle, History, RotateCcw, Play } from 'lucide-react';
import { useListeningAptisList } from '../../../hooks/APTIS/listening/useListeningAptisList';

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'GRADED', label: 'Completed' },
];

/* ── Status config ── */
const getStatusConfig = (status, testId, handlers) => {
  const { handleNavigateHistory, handleNavigateLobby, handleNavigateRetry } = handlers;

  switch (status) {
    case 'GRADED':
    case 'COMPLETED':
      return {
        dot: '#22C55E',
        badge: (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#F0FDF4', color: '#15803D',
            padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
            border: '1px solid #BBF7D0',
          }}>
            <CheckCircle size={11} /> Completed
          </span>
        ),
        mainBtnText: 'View History',
        mainBtnAction: handleNavigateHistory,
        mainBtnStyle: {
          background: '#fff', color: '#1E3A8A',
          border: '1.5px solid #BFDBFE', fontWeight: 700,
        },
        mainBtnIcon: <History size={15} />,
        showRetry: true,
      };

    default:
      return {
        dot: '#3B82F6',
        badge: (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#EFF6FF', color: '#1D4ED8',
            padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
            border: '1px solid #BFDBFE',
          }}>
            <AlertCircle size={11} /> Not Started
          </span>
        ),
        mainBtnText: 'Start Now',
        mainBtnAction: () => handleNavigateLobby(testId),
        mainBtnStyle: {
          background: '#1E3A8A', color: '#fff',
          border: 'none', fontWeight: 700,
          boxShadow: '0 2px 8px rgba(30,58,138,0.18)',
        },
        mainBtnIcon: <Play size={15} />,
        showRetry: false,
      };
  }
};

/* ── Test Card ── */
const TestCard = ({ test, handlers }) => {
  const config = getStatusConfig(test.status, test.id, handlers);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? '#BFDBFE' : '#E5E7EB'}`,
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered
          ? '0 4px 20px rgba(30,58,138,0.08)'
          : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Card body */}
      <div style={{ padding: '20px 20px 16px' }}>
        {/* Top row: badge + time */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Status dot */}
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: config.dot, flexShrink: 0,
              boxShadow: `0 0 0 2px ${config.dot}33`,
            }} />
            {config.badge}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {test.difficulty_level && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#B45309',
                background: '#FFFBEB', padding: '2px 8px', borderRadius: 6,
                border: '1px solid #FDE68A',
              }}>
                {test.difficulty_level}
              </span>
            )}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, color: '#6B7280',
              background: '#F9FAFB', padding: '2px 8px', borderRadius: 6,
              border: '1px solid #E5E7EB',
            }}>
              <Clock size={11} /> {test.time_limit || 35} min
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          margin: '0 0 6px', fontSize: 15, fontWeight: 700,
          color: hovered ? '#1E3A8A' : '#111827',
          lineHeight: 1.4, transition: 'color 0.2s',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
        }}>
          {test.title}
        </h3>

        {/* Description */}
        <p style={{
          margin: 0, fontSize: 13, color: '#6B7280',
          lineHeight: 1.55, fontWeight: 400,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {test.description || 'Listening test following the official APTIS format by British Council.'}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#F3F4F6', margin: '0 20px' }} />

      {/* Card footer — actions */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Main button */}
        <button
          onClick={config.mainBtnAction}
          style={{
            flex: 1, height: 38, borderRadius: 8,
            fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'opacity 0.15s',
            ...config.mainBtnStyle,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {config.mainBtnIcon} {config.mainBtnText}
        </button>

        {/* Retry button */}
        {config.showRetry && (
          <button
            onClick={() => handlers.handleNavigateRetry(test.id)}
            style={{
              height: 38, padding: '0 14px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: '#fff',
              fontSize: 13, fontWeight: 600, color: '#6B7280',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'border-color 0.15s, color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#1E3A8A';
              e.currentTarget.style.borderColor = '#BFDBFE';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#6B7280';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <RotateCcw size={13} /> Retry
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ── */
const ListeningAptisListPage = () => {
  const {
    loading,
    filterStatus,
    setFilterStatus,
    filteredTests,
    paginatedTests,
    currentPage,
    setCurrentPage,
    total,
    pageSize,
    handleNavigateHistory,
    handleNavigateLobby,
    handleNavigateRetry
  } = useListeningAptisList();

  const handlers = {
    handleNavigateHistory,
    handleNavigateLobby,
    handleNavigateRetry,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-blue-50/30 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">

        {/* ── HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          marginBottom: 32,
        }}>
          {/* Left: Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#1E3A8A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Headphones size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                Listening Practice
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                APTIS Listening Tests
              </p>
            </div>
          </div>

          {/* Right: Filter pills + History button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Filter bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#F3F4F6', borderRadius: 8, padding: 4,
            }}>
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: filterStatus === opt.value ? '#1E3A8A' : 'transparent',
                    color: filterStatus === opt.value ? '#fff' : '#6B7280',
                    boxShadow: filterStatus === opt.value ? '0 1px 4px rgba(30,58,138,0.2)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* History button */}
            <button
              onClick={handleNavigateHistory}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                border: '1.5px solid #E5E7EB', background: '#fff',
                fontSize: 12, fontWeight: 700, color: '#374151',
                cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#BFDBFE';
                e.currentTarget.style.color = '#1E3A8A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#374151';
              }}
            >
              <History size={14} /> History
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: 20,
                border: '1px solid #E5E7EB',
              }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '64px 24px', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: '#EFF4FF', border: '1px solid #BFDBFE',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Headphones size={30} color="#1E3A8A" />
            </div>
            <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
              No tests found.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
              Try a different filter or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedTests.map(test => (
                <TestCard key={test.id} test={test} handlers={handlers} />
              ))}
            </div>

            {total > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListeningAptisListPage;
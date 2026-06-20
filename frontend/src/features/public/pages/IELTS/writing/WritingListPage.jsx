import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import {
  PenTool, Clock, CheckCircle, AlertCircle, ArrowRight,
  History, RotateCcw, Play
} from 'lucide-react';
import { useWritingList } from '../../../hooks/IELTS/writing/useWritingList';

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'COMPLETED', label: 'Completed' },
];

const WritingListPage = () => {
  const navigate = useNavigate();
  const { filteredTests, loading, filter, setFilter } = useWritingList();
  const [searchTerm, setSearchTerm] = useState('');

  const finalTests = useMemo(() => {
    if (!filteredTests) return [];
    return filteredTests.filter(t =>
      t.title?.toLowerCase().includes((searchTerm || '').toLowerCase())
    );
  }, [filteredTests, searchTerm]);

  const getStatusConfig = (status, testId) => {
    const s = status?.toUpperCase() || 'NOT_STARTED';

    if (['GRADED', 'COMPLETED', 'FINISHED'].includes(s)) {
      return {
        badge: (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#dcfce7', color: '#16a34a',
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700
          }}>
            <CheckCircle size={12} /> Completed
          </span>
        ),
        mainBtnText: 'View History',
        mainBtnAction: () => navigate(`/writing/history`),
        mainBtnStyle: {
          background: 'transparent', color: '#e11d48',
          border: '1.5px solid #fda4af', fontWeight: 700
        },
        isDone: true,
        showRetry: true,
        accentColor: '#22c55e'
      };
    } else if (['SUBMITTED', 'GRADING', 'PENDING', 'ERROR'].includes(s)) {
      return {
        badge: (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#fef3c7', color: '#d97706',
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700
          }}>
            <Clock size={12} /> Pending Review
          </span>
        ),
        mainBtnText: 'Check Status',
        mainBtnAction: () => navigate(`/writing/history`),
        mainBtnStyle: {
          background: 'transparent', color: '#d97706',
          border: '1.5px solid #fcd34d', fontWeight: 700
        },
        isDone: true,
        showRetry: true,
        accentColor: '#f59e0b'
      };
    } else if (s === 'IN_PROGRESS') {
      return {
        badge: (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#ffe4e6', color: '#e11d48',
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700
          }}>
            <Clock size={12} /> In Progress
          </span>
        ),
        mainBtnText: 'Continue Test',
        mainBtnAction: () => navigate(`/writing/exam/${testId}`),
        mainBtnStyle: {
          background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
          color: '#fff', border: 'none', fontWeight: 700,
          boxShadow: '0 4px 14px rgba(244,63,94,0.35)'
        },
        isDone: false,
        showRetry: false,
        accentColor: '#f43f5e'
      };
    } else {
      return {
        badge: (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#fff1f2', color: '#e11d48',
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700
          }}>
            <AlertCircle size={12} /> Not Started
          </span>
        ),
        mainBtnText: 'Start Test',
        mainBtnAction: () => navigate(`/writing/exam/${testId}`),
        mainBtnStyle: {
          background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
          color: '#fff', border: 'none', fontWeight: 700,
          boxShadow: '0 4px 14px rgba(225,29,72,0.35)'
        },
        isDone: false,
        showRetry: false,
        accentColor: '#e11d48'
      };
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

      {/* ===== HEADER ===== */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(225,29,72,0.3)', flexShrink: 0
            }}>
              <PenTool size={28} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e1b4b', lineHeight: 1.3 }}>
                IELTS Writing Practice
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                Master Task 1 &amp; Task 2 with AI-powered scoring and structured feedback
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                background: '#fff', fontSize: 13, color: '#374151', outline: 'none',
                minWidth: 180, transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#fda4af'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />

            <div style={{
              display: 'flex', background: '#fff1f2', borderRadius: 12,
              padding: 4, gap: 4
            }}>
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  style={{
                    padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                    background: filter === opt.value ? '#e11d48' : 'transparent',
                    color: filter === opt.value ? '#fff' : '#6b7280',
                    boxShadow: filter === opt.value ? '0 2px 8px rgba(225,29,72,0.3)' : 'none'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/writing/history')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                background: '#fff', cursor: 'pointer', fontSize: 13,
                fontWeight: 600, color: '#374151', transition: 'all 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fda4af'; e.currentTarget.style.color = '#e11d48'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}
            >
              <History size={15} /> History
            </button>
          </div>
        </div>
        <div style={{ marginTop: 20, height: 1, background: 'linear-gradient(90deg, #ffe4e6 0%, transparent 100%)' }} />
      </div>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: 24,
              border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : finalTests.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 24px', textAlign: 'center'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: '#fff1f2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: 16
          }}>
            <PenTool size={32} color="#e11d48" />
          </div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#374151' }}>
            No writing tests found.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>
            Try a different filter or check back later.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {finalTests.map(test => {
            const config = getStatusConfig(test.status, test.id);

            return (
              <div
                key={test.id}
                style={{
                  background: '#fff', borderRadius: 16, overflow: 'hidden',
                  border: '1px solid #fff1f2',
                  borderLeft: `4px solid ${config.accentColor}`,
                  boxShadow: '0 2px 12px rgba(225,29,72,0.06)',
                  display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(225,29,72,0.14)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(225,29,72,0.06)';
                }}
              >
                <div style={{ padding: '20px 20px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    {config.badge}
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, fontWeight: 600, color: '#9ca3af',
                      background: '#f8fafc', padding: '3px 9px', borderRadius: 8
                    }}>
                      <Clock size={11} /> {test.time_limit || 60} Mins
                    </span>
                  </div>
                  <h3 style={{
                    margin: '0 0 6px', fontSize: 15, fontWeight: 800,
                    color: '#1e1b4b', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {test.title}
                  </h3>
                  <p style={{
                    margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {test.description || 'Practice Task 1 and Task 2 with real IELTS-style questions and structured writing prompts.'}
                  </p>
                </div>

                <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={config.mainBtnAction}
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: 10,
                      cursor: 'pointer', fontSize: 14, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.2s', ...config.mainBtnStyle
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {config.isDone
                      ? <><History size={15} /> {config.mainBtnText}</>
                      : <><Play size={15} /> {config.mainBtnText} <ArrowRight size={15} /></>
                    }
                  </button>

                  {config.showRetry && (
                    <button
                      onClick={() => navigate(`/writing/exam/${test.id}`)}
                      style={{
                        width: '100%', padding: '9px 16px', borderRadius: 10,
                        cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        background: 'transparent', color: '#6b7280',
                        border: '1.5px solid #e5e7eb', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
                    >
                      <RotateCcw size={13} /> Retry Test
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WritingListPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Pagination, Input } from 'antd';
import {
  Lightbulb,
  Search,
  BookOpen,
  Eye,
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
  { value: 'ALL', label: 'All Tips', icon: Sparkles },
  { value: 'GRAMMAR_VOCAB', label: 'Grammar & Vocab', icon: BookOpen },
  { value: 'LISTENING', label: 'Listening', icon: Headphones },
  { value: 'READING', label: 'Reading', icon: Book },
  { value: 'WRITING', label: 'Writing', icon: PenTool },
  { value: 'SPEAKING', label: 'Speaking', icon: Mic },
  { value: 'GENERAL', label: 'General Advice', icon: Award },
];

const getCategoryBadge = (cat) => {
  switch (cat?.toUpperCase()) {
    case 'GRAMMAR_VOCAB':
      return { label: 'Grammar & Vocab', bg: '#D1FAE5', color: '#047857', border: '#A7F3D0' };
    case 'LISTENING':
      return { label: 'Listening', bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' };
    case 'READING':
      return { label: 'Reading', bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' };
    case 'WRITING':
      return { label: 'Writing', bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF' };
    case 'SPEAKING':
      return { label: 'Speaking', bg: '#FFE4E6', color: '#BE123C', border: '#FECDD3' };
    default:
      return { label: 'General', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
  }
};

const TipCard = ({ item }) => {
  const navigate = useNavigate();
  const badge = getCategoryBadge(item.category);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={() => navigate(`/aptis/tips/${item.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? '#BFDBFE' : '#E5E7EB'}`,
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered
          ? '0 4px 20px rgba(30,58,138,0.08)'
          : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <div style={{ height: 160, width: '100%', position: 'relative', overflow: 'hidden' }}>
          <img
            src={item.thumbnail_url}
            alt={item.title}
            style={{ 
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.4s ease'
            }}
          />
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{
              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
              padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
            }}>
              {badge.label}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ 
          height: 160, width: '100%', background: '#EFF6FF', 
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{
              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
              padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
            }}>
              {badge.label}
            </span>
          </div>
          <Lightbulb size={48} color="#1E3A8A" opacity={0.2} />
        </div>
      )}

      {/* Card Content */}
      <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{
            margin: '0 0 8px', fontSize: 16, fontWeight: 700,
            color: hovered ? '#1E3A8A' : '#111827',
            lineHeight: 1.4, transition: 'color 0.2s',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {item.title}
          </h3>
          <p style={{
            margin: 0, fontSize: 13, color: '#6B7280',
            lineHeight: 1.55, fontWeight: 400,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          }}>
            {item.summary || item.content?.slice(0, 140) + '...'}
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: 20, paddingTop: 14, borderTop: '1px solid #F3F4F6', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: '#EFF6FF',
              color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700
            }}>
              {item.author?.full_name ? item.author.full_name.charAt(0) : 'T'}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4B5563' }}>
              {item.author?.full_name || 'Teacher'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={13} /> {item.views_count || 0}
            </span>
            <span style={{ 
              display: 'flex', alignItems: 'center', gap: 4, color: '#1E3A8A',
              transform: hovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 0.2s'
            }}>
              Read <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TipsStudentListPage = () => {
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
              <Lightbulb size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                Exam Tips & Guide
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                APTIS Skill Strategies
              </p>
            </div>
          </div>

          {/* Right: Search */}
          <div style={{ width: '100%', maxWidth: 300 }}>
            <Input
              prefix={<Search size={16} color="#9CA3AF" style={{ marginRight: 6 }} />}
              placeholder="Search tips, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              style={{
                height: 40, borderRadius: 8, border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: '#F3F4F6', borderRadius: 8, padding: 4,
          marginBottom: 32, overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {CATEGORY_CONFIG.map((opt) => {
            return (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: category === opt.value ? '#1E3A8A' : 'transparent',
                  color: category === opt.value ? '#fff' : '#6B7280',
                  boxShadow: category === opt.value ? '0 1px 4px rgba(30,58,138,0.2)' : 'none',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: 20,
                border: '1px solid #E5E7EB',
              }}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ))}
          </div>
        ) : tips.length === 0 ? (
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
              <Lightbulb size={30} color="#1E3A8A" />
            </div>
            <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
              No tips found
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
              Try a different filter or search keyword.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tips.map((item) => (
                <TipCard key={item.id} item={item} />
              ))}
            </div>

            {total > pageSize && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={(page, size) => setCurrentPage(page, size)}
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

export default TipsStudentListPage;

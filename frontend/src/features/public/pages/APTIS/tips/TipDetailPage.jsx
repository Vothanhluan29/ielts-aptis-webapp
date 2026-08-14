import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Result } from 'antd';
import {
  ArrowLeft,
  Calendar,
  Eye,
  Lightbulb,
  Clock
} from 'lucide-react';
import { tipsApi } from '../../../../../services/tipsApi';

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
      return { label: 'General Advice', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
  }
};

const TipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await tipsApi.getTipDetail(id);
        setTip(res);
      } catch (err) {
        console.error('Failed to load tip detail:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-slate-500 font-semibold text-sm">Loading tip details...</p>
        </div>
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Result
          status="404"
          title="Tip Article Not Found"
          subTitle="The article you are looking for does not exist or has been removed."
          extra={
            <Button
              type="primary"
              onClick={() => navigate('/aptis/tips')}
              style={{ background: '#1E3A8A', border: 'none', fontWeight: 700, borderRadius: 8, height: 40 }}
            >
              Back to Tips List
            </Button>
          }
        />
      </div>
    );
  }

  const badge = getCategoryBadge(tip.category);
  const formattedDate = new Date(tip.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate estimated reading time (approx 200 words per minute)
  const wordCount = (tip.content || '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-blue-50/30 font-sans py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ── TOP NAVIGATION ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={() => navigate('/aptis/tips')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 99,
              color: '#4B5563', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#1E3A8A';
              e.currentTarget.style.borderColor = '#BFDBFE';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#4B5563';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <ArrowLeft size={16} />
            Back to All Tips
          </button>

          <span style={{
            background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
            padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800,
          }}>
            {badge.label}
          </span>
        </div>

        {/* ── MAIN ARTICLE CARD ── */}
        <article style={{
          background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden'
        }}>
          
          {/* Thumbnail image if available */}
          {tip.thumbnail_url && (
            <div style={{ width: '100%', height: 320, borderBottom: '1px solid #E5E7EB' }}>
              <img
                src={tip.thumbnail_url}
                alt={tip.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ padding: '32px 40px' }}>
            
            {/* Header info */}
            <h1 style={{
              margin: '0 0 24px', fontSize: 32, fontWeight: 900, color: '#111827',
              lineHeight: 1.25, letterSpacing: '-0.02em'
            }}>
              {tip.title}
            </h1>

            {/* Author & Meta bar */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, paddingBottom: 24, marginBottom: 24, borderBottom: '1px solid #F3F4F6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF',
                  color: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, border: '1px solid #BFDBFE'
                }}>
                  {tip.author?.full_name ? tip.author.full_name.charAt(0) : 'T'}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1F2937' }}>
                    {tip.author?.full_name || 'APTIS Certified Instructor'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}>
                    APTIS Academic Team
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, fontWeight: 600,
                color: '#6B7280', background: '#F9FAFB', padding: '8px 16px', borderRadius: 12,
                border: '1px solid #F3F4F6'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="#1E3A8A" /> {formattedDate}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="#1E3A8A" /> {readTime} min read
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={14} color="#1E3A8A" /> {tip.views_count || 0} views
                </span>
              </div>
            </div>

            {/* Summary callout box */}
            {tip.summary && (
              <div style={{
                marginBottom: 32, padding: 20, background: '#EFF6FF',
                borderLeft: '4px solid #1E3A8A', borderRadius: '0 8px 8px 0',
                color: '#1E3A8A', fontSize: 15, lineHeight: 1.6, fontWeight: 500
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800,
                  fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em',
                  marginBottom: 6
                }}>
                  <Lightbulb size={16} /> Key Takeaway
                </div>
                {tip.summary}
              </div>
            )}

            {/* Article Content */}
            <div style={{
              color: '#374151', fontSize: 16, lineHeight: 1.75, whiteSpace: 'pre-line',
              fontWeight: 400
            }}>
              {tip.content}
            </div>

          </div>
        </article>

      </div>
    </div>
  );
};

export default TipDetailPage;

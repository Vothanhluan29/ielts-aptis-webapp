import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, Divider, Result } from 'antd';
import {
  ArrowLeft,
  Calendar,
  Eye,
  User,
  Lightbulb,
  Clock,
  Share2,
  Bookmark,
  BookOpen
} from 'lucide-react';
import { tipsApi } from '../../../../../services/tipsApi';

const getCategoryBadge = (cat) => {
  switch (cat?.toUpperCase()) {
    case 'GRAMMAR_VOCAB':
      return { label: 'Grammar & Vocab', color: 'emerald' };
    case 'LISTENING':
      return { label: 'Listening', color: 'blue' };
    case 'READING':
      return { label: 'Reading', color: 'orange' };
    case 'WRITING':
      return { label: 'Writing', color: 'purple' };
    case 'SPEAKING':
      return { label: 'Speaking', color: 'rose' };
    default:
      return { label: 'General Advice', color: 'gold' };
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-slate-500 font-semibold text-sm">Loading tip details...</p>
        </div>
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Result
          status="404"
          title="Tip Article Not Found"
          subTitle="The article you are looking for does not exist or has been removed."
          extra={
            <Button
              type="primary"
              onClick={() => navigate('/aptis/tips')}
              className="bg-indigo-600 font-bold rounded-xl h-10 px-6"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/20 font-sans py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* TOP NAVIGATION */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/aptis/tips')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-bold hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to All Tips
          </button>

          <Tag color={badge.color} className="font-extrabold px-3 py-1 text-xs rounded-full m-0 border-0">
            {badge.label}
          </Tag>
        </div>

        {/* MAIN ARTICLE CARD */}
        <article className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-2xl shadow-indigo-500/5 overflow-hidden">
          
          {/* Thumbnail image if available */}
          {tip.thumbnail_url && (
            <div className="w-full h-80 max-h-[400px] overflow-hidden">
              <img
                src={tip.thumbnail_url}
                alt={tip.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-12">
            
            {/* Header info */}
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight mb-6">
              {tip.title}
            </h1>

            {/* Author & Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-500/20">
                  {tip.author?.full_name ? tip.author.full_name.charAt(0) : 'T'}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800 m-0">
                    {tip.author?.full_name || 'APTIS Certified Instructor'}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 m-0 mt-0.5">
                    APTIS Academic Team
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-500" /> {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-500" /> {readTime} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={14} className="text-indigo-500" /> {tip.views_count || 0} views
                </span>
              </div>
            </div>

            {/* Summary callout box */}
            {tip.summary && (
              <div className="mb-8 p-5 bg-indigo-50/70 border-l-4 border-indigo-500 rounded-2xl text-indigo-900 font-semibold leading-relaxed text-base">
                <div className="flex items-center gap-2 font-bold text-indigo-700 mb-1 text-sm uppercase tracking-wider">
                  <Lightbulb size={16} /> Key Takeaway
                </div>
                {tip.summary}
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-indigo max-w-none text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-line font-normal space-y-4">
              {tip.content}
            </div>

          </div>
        </article>

      </div>
    </div>
  );
};

export default TipDetailPage;

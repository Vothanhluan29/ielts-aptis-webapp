import React from 'react';
import { Spin } from 'antd';
import { ClipboardList, ArrowLeft, Clock, Info } from 'lucide-react';

import { useExamAptisResult } from '../../../hooks/APTIS/exam/useExamAptisResult';
import { getAptisSkillCefr } from '../../../utils/aptisScoreMapping';

// Map CEFR string to index (0=A0, 5=C)
const CEFR_INDEX = { 'A0': 0, 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C': 5 };

const CefrBarChart = ({ bars, showFinal }) => {
  const svgW = 420;
  const svgH = 240;
  const pLeft = 36;
  const pTop = 16;
  const pBottom = 36;
  const pRight = 8;
  const chartW = svgW - pLeft - pRight;
  const chartH = svgH - pTop - pBottom;

  const levels = ['C', 'B2', 'B1', 'A2', 'A1', 'A0'];
  const getBarH = (cefr) => {
    const idx = CEFR_INDEX[cefr?.toUpperCase()] ?? 0;
    return (idx / 5) * chartH;
  };

  const slotW = chartW / bars.length;
  const barW = Math.min(46, slotW * 0.52);

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', overflow: 'visible' }}>
      {/* Grid lines + Y-axis labels */}
      {levels.map((lvl, i) => {
        const y = pTop + (i / (levels.length - 1)) * chartH;
        const isTop = lvl === 'C';
        return (
          <g key={lvl}>
            <line
              x1={pLeft} y1={y} x2={svgW - pRight} y2={y}
              stroke={isTop ? '#201760' : '#c8d0dc'} strokeWidth={isTop ? 1.5 : 1}
            />
            <text
              x={pLeft - 6} y={y}
              textAnchor="end" dominantBaseline="middle"
              fontSize={11} fontWeight="600" fill="#475569"
            >
              {lvl}
            </text>
          </g>
        );
      })}

      {/* Bottom axis line */}
      <line
        x1={pLeft} y1={pTop + chartH} x2={svgW - pRight} y2={pTop + chartH}
        stroke="#201760" strokeWidth={1.5}
      />

      {/* Bars + labels */}
      {bars.map((bar, i) => {
        const isPending = !showFinal && (bar.label === 'Writing' || bar.label === 'Speaking' || bar.label === 'Overall CEFR grade');
        const displayCefr = isPending ? '?' : bar.cefr;
        const barH = isPending ? 6 : getBarH(bar.cefr);
        const cx = pLeft + slotW * i + slotW / 2;
        const barX = cx - barW / 2;
        const barY = pTop + chartH - barH;

        // Split label into lines for multi-word labels
        const labelWords = bar.label.split(' ');
        const labelLines = labelWords.length > 2
          ? [labelWords.slice(0, 2).join(' '), labelWords.slice(2).join(' ')]
          : [bar.label];

        return (
          <g key={i}>
            <rect x={barX} y={barY} width={barW} height={barH} fill="#e31b23" />
            {/* CEFR letter above bar */}
            <text
              x={cx} y={barY - 5}
              textAnchor="middle" dominantBaseline="auto"
              fontSize={12} fontWeight="700" fill="#334155"
            >
              {displayCefr}
            </text>
            {/* X-axis label (multi-line) */}
            {labelLines.map((line, li) => (
              <text
                key={li}
                x={cx} y={pTop + chartH + 14 + li * 13}
                textAnchor="middle" dominantBaseline="auto"
                fontSize={10} fill="#475569"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

const ExamAptisResultPage = () => {
  const { loading, resultData, computedData, handleGoBack } = useExamAptisResult();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: 16 }}>
      <Spin size="large" />
      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Calculating your scores...</span>
    </div>
  );

  if (!resultData || !computedData) return null;

  const { showFinal, skills } = computedData;
  const overallCefr = resultData.overall_cefr_level || 'A0';

  const getScore = (key) => skills.find(s => s.key === key)?.score || 0;
  const listeningScore = getScore('LISTENING');
  const readingScore = getScore('READING');
  const speakingScore = getScore('SPEAKING');
  const writingScore = getScore('WRITING');
  const grammarScore = getScore('GRAMMAR');
  const finalScaleScore = resultData.overall_score || (listeningScore + readingScore + speakingScore + writingScore + grammarScore);

  const tableData = [
    { label: 'Listening', score: listeningScore, max: 50, pending: false },
    { label: 'Reading', score: readingScore, max: 50, pending: false },
    { label: 'Speaking', score: speakingScore, max: 50, pending: !showFinal },
    { label: 'Writing', score: writingScore, max: 50, pending: !showFinal },
    { label: 'Final scale score', score: finalScaleScore, max: null, pending: !showFinal },
    { label: 'Grammar and vocabulary', score: grammarScore, max: 50, pending: false },
  ];

  const chartBars = [
    { label: 'Listening', cefr: getAptisSkillCefr(listeningScore) },
    { label: 'Reading', cefr: getAptisSkillCefr(readingScore) },
    { label: 'Speaking', cefr: getAptisSkillCefr(speakingScore) },
    { label: 'Writing', cefr: getAptisSkillCefr(writingScore) },
    { label: 'Overall CEFR grade', cefr: overallCefr },
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', fontFamily: 'system-ui,sans-serif', background: '#f8fafc' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button onClick={handleGoBack} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            border: '1px solid #e2e8f0', background: '#fff',
            color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>
            <ArrowLeft size={14} /> Test List
          </button>
          <div style={{ width: 1, height: 20, background: '#cbd5e1', flexShrink: 0 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            background: '#eef2ff', border: '1px solid #a5b4fc',
            color: '#4f46e5', fontWeight: 700, fontSize: 13,
          }}>
            <ClipboardList size={14} /> FULL MOCK TEST
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            {resultData.full_test?.title || 'Aptis Assessment Result'}
          </span>
        </div>

        {/* Warning if Pending */}
        {!showFinal && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Clock size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>
              Some sections are awaiting teacher review. Your overall score will be updated once all skills are graded.
            </span>
          </div>
        )}

        {/* MAIN CERTIFICATE CARD */}
        <div style={{
          border: '5px solid #201760',
          borderRadius: 8,
          background: '#fff',
          padding: '24px 32px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        }}>
          {/* Header */}
          <div style={{ borderBottom: '1.5px solid #201760', paddingBottom: 12, marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e31b23' }}>
              Overall CEFR level: {showFinal ? overallCefr : '?'}
            </h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start' }}>

            {/* Left: Scale score table */}
            <div style={{ flex: '1 1 280px' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#201760', marginBottom: 14, marginTop: 0 }}>
                Scale score
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #201760', paddingBottom: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Skill name</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Skill score</span>
              </div>
              {tableData.map((row, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '9px 0', borderBottom: '1px solid #e2e8f0',
                  color: '#334155', fontSize: 14,
                }}>
                  <span>{row.label}</span>
                  <span style={{ fontWeight: row.max === null ? 700 : 400 }}>
                    {row.pending ? '—' : (row.max ? `${row.score}/${row.max}` : row.score)}
                  </span>
                </div>
              ))}
            </div>

            {/* Right: CEFR skill profile chart */}
            <div style={{ flex: '1 1 380px' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#201760', marginBottom: 4, marginTop: 0 }}>
                CEFR skill profile
              </h3>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 2 }}>CEFR grade</div>
              <CefrBarChart bars={chartBars} showFinal={showFinal} />
            </div>

          </div>
        </div>

        {/* What happens next */}
        {!showFinal && (
          <div style={{ marginTop: 24, padding: '20px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ background: '#eef2ff', padding: 12, borderRadius: '50%', flexShrink: 0 }}>
              <Info size={24} color="#4f46e5" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>What happens next?</div>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
                Our certified teachers have received your Writing and Speaking responses.
                Please check back later for your complete CEFR certification!
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExamAptisResultPage;

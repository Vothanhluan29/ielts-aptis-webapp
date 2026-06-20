import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';

const SKILL_THEMES = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', divider: 'bg-emerald-300' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    divider: 'bg-blue-200' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-600',  divider: 'bg-orange-300' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  divider: 'bg-purple-200' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  divider: 'bg-indigo-200' },
};

const ResultHeader = ({ onGoBack, skillName, skillIcon, skillColor = 'blue', testTitle }) => {
  const theme = SKILL_THEMES[skillColor] || SKILL_THEMES.blue;

  return (
    <div className="flex items-center gap-3 mb-6 px-6 pt-6 max-w-5xl mx-auto w-full">
      <button
        onClick={onGoBack}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 hover:shadow-sm transition-all text-sm cursor-pointer"
      >
        <ArrowLeftOutlined /> Back
      </button>
      <div className={`w-px h-5 ${theme.divider}`} />
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bg} border ${theme.border} ${theme.text} font-bold text-[13px]`}>
        {skillIcon} {skillName}
      </div>
      <span className="text-base font-bold text-slate-800 truncate">{testTitle}</span>
    </div>
  );
};

export default ResultHeader;

import React from 'react';

const ACTIVE_STYLES = {
  emerald: 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-100',
  blue:    'border-blue-500 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100',
  orange:  'border-orange-500 bg-orange-50 text-orange-800 shadow-sm shadow-orange-100',
  purple:  'border-purple-500 bg-purple-50 text-purple-800 shadow-sm shadow-purple-100',
  indigo:  'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm shadow-indigo-100',
};

/**
 * Pill-shaped horizontal tab bar for switching between Parts / Sections.
 * @param {Array} tabs - [{ id, label, count? }]
 * @param {string} activeId - Currently active tab ID
 * @param {function} onChange - Called with tab ID when clicked
 * @param {string} skillColor - Color theme key
 */
const PartTabBar = ({ tabs = [], activeId, onChange, skillColor = 'blue' }) => {
  const activeClass = ACTIVE_STYLES[skillColor] || ACTIVE_STYLES.blue;

  return (
    <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-200 border-2 cursor-pointer ${
              isActive
                ? activeClass
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 text-[11px] font-semibold ${isActive ? 'opacity-70' : 'text-slate-400'}`}>
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PartTabBar;

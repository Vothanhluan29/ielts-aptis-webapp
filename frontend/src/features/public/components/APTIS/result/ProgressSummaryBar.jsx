import React from 'react';

const COLOR_MAP = {
  emerald: { correct: 'bg-emerald-500', incorrect: 'bg-red-400', skipped: 'bg-slate-300' },
  blue:    { correct: 'bg-blue-500',    incorrect: 'bg-red-400', skipped: 'bg-slate-300' },
  orange:  { correct: 'bg-orange-500',  incorrect: 'bg-red-400', skipped: 'bg-slate-300' },
  purple:  { correct: 'bg-purple-500',  incorrect: 'bg-red-400', skipped: 'bg-slate-300' },
  indigo:  { correct: 'bg-indigo-500',  incorrect: 'bg-red-400', skipped: 'bg-slate-300' },
};

/**
 * Horizontal segmented bar showing correct / incorrect / skipped ratio at a glance.
 */
const ProgressSummaryBar = ({ correct = 0, incorrect = 0, skipped = 0, skillColor = 'blue' }) => {
  const total = correct + incorrect + skipped;
  if (total === 0) return null;

  const colors = COLOR_MAP[skillColor] || COLOR_MAP.blue;
  const pctCorrect = (correct / total) * 100;
  const pctIncorrect = (incorrect / total) * 100;
  const pctSkipped = (skipped / total) * 100;

  return (
    <div className="mb-5 px-1">
      {/* Bar */}
      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
        {pctCorrect > 0 && (
          <div className={`${colors.correct} rounded-l-full transition-all duration-700 ease-out`} style={{ width: `${pctCorrect}%` }} />
        )}
        {pctIncorrect > 0 && (
          <div className={`${colors.incorrect} transition-all duration-700 ease-out`} style={{ width: `${pctIncorrect}%` }} />
        )}
        {pctSkipped > 0 && (
          <div className={`${colors.skipped} rounded-r-full transition-all duration-700 ease-out`} style={{ width: `${pctSkipped}%` }} />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2.5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${colors.correct}`} />
          Correct: <strong className="text-slate-700">{correct}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${colors.incorrect}`} />
          Incorrect: <strong className="text-slate-700">{incorrect}</strong>
        </span>
        {skipped > 0 && (
          <span className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${colors.skipped}`} />
            Skipped: <strong className="text-slate-700">{skipped}</strong>
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressSummaryBar;

import React from 'react';

const MatchingDisplay = ({ question, currentAnswer, onAnswerChange }) => {
  if (!question) return null;

  let optionsEntries = [];
  if (question.options) {
    if (Array.isArray(question.options)) {
      optionsEntries = question.options.map((opt, index) => [
        String.fromCharCode(65 + index),
        opt
      ]);
    } else {
      optionsEntries = Object.entries(question.options).sort((a, b) =>
        a[0].localeCompare(b[0])
      );
    }
  }

  return (
    <div className="mb-6 p-5 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 transition-all hover:shadow-md hover:border-indigo-200 flex flex-col sm:flex-row gap-4 sm:items-center items-start">
      
      <div className="flex items-start gap-3 flex-1">
        <div className="w-8 h-8 shrink-0 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm rounded-lg shadow-sm mt-0.5">
          {question.question_number}
        </div>
        <div className="text-[15px] font-semibold text-slate-800 pt-1.5 m-0 leading-relaxed">
          {question.question_text || "Choose the correct matching option:"}
        </div>
      </div>

      <div className="w-full sm:w-72 shrink-0">
        <select
          value={currentAnswer || ""}
          onChange={(e) => onAnswerChange(question.question_number, e.target.value)}
          className={`w-full px-4 py-2.5 rounded-lg border-2 text-sm font-semibold outline-none transition-all cursor-pointer appearance-none ${currentAnswer ? "border-indigo-500 text-indigo-700 bg-indigo-50/50" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 focus:bg-white focus:border-indigo-500"}`}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            backgroundSize: "16px",
            paddingRight: "36px"
          }}
        >
          <option value="" disabled className="text-slate-400">
            Select an option...
          </option>

          {optionsEntries.map(([key, value]) => (
            <option key={key} value={key} className="text-slate-800 font-medium">
              {key} - {value.length > 40 ? value.substring(0, 40) + "..." : value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MatchingDisplay;